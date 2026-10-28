const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../../data/progress.json');

let progressData = {};
let lastFetchedFromDb = 0;
const CACHE_TTL_MS = 2500; // 2.5 detik cache TTL untuk performa tinggi & respons instan

function loadLocal() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      progressData = JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading progress.json:', err.message);
  }
}

function saveLocal() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(progressData, null, 2), 'utf8');
  } catch (err) {
    // Di serverless Vercel filesystem bisa read-only; abaikan error tulis lokal
  }
}

// Initial fallback load dari berkas lokal
loadLocal();

/**
 * Sinkronisasi data satu sub-divisi ke tabel progress_trackers di Supabase Cloud (UPSERT)
 */
async function syncToSupabase(subEventId) {
  try {
    const db = require('../db');
    const item = progressData[subEventId];
    if (!item) return;

    await db.query(`
      INSERT INTO progress_trackers (sub_event_id, percentage, status_label, milestones, updated_by, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      ON CONFLICT (sub_event_id) DO UPDATE SET
        percentage = EXCLUDED.percentage,
        status_label = EXCLUDED.status_label,
        milestones = EXCLUDED.milestones,
        updated_by = EXCLUDED.updated_by,
        updated_at = NOW();
    `, [
      item.subEventId || subEventId,
      typeof item.percentage === 'number' ? item.percentage : (parseInt(item.percentage, 10) || 0),
      item.statusLabel || '',
      JSON.stringify(item.milestones || []),
      item.updatedBy || 'Staff Ahli'
    ]);

    lastFetchedFromDb = Date.now();
  } catch (err) {
    console.warn(`⚠️ Supabase progress sync warning (${subEventId}):`, err.message);
  }
}

/**
 * Mengambil status terbaru dari Supabase PostgreSQL secara aktif
 */
async function refreshFromDatabase(force = false) {
  if (!force && lastFetchedFromDb && (Date.now() - lastFetchedFromDb < CACHE_TTL_MS)) {
    return progressData;
  }

  try {
    const db = require('../db');
    const res = await db.query('SELECT * FROM progress_trackers');
    if (res && res.rows && res.rows.length > 0) {
      for (const row of res.rows) {
        const subId = row.sub_event_id;
        if (!progressData[subId]) {
          const meta = SUB_EVENT_META[subId] || { name: subId, icon: '📊', code: subId.toUpperCase() };
          progressData[subId] = {
            subEventId: subId,
            name: meta.name || subId,
            icon: meta.icon || '📊',
            code: meta.code || subId.toUpperCase(),
            percentage: 0,
            statusLabel: '',
            updatedBy: 'Sistem Central Event',
            updatedAt: new Date().toISOString(),
            milestones: []
          };
        }
        progressData[subId].percentage = typeof row.percentage === 'number' ? row.percentage : (parseInt(row.percentage, 10) || 0);
        progressData[subId].statusLabel = row.status_label || '';
        progressData[subId].updatedBy = row.updated_by || 'Staff Ahli';
        progressData[subId].updatedAt = row.updated_at || new Date().toISOString();
        if (row.milestones) {
          progressData[subId].milestones = typeof row.milestones === 'string'
            ? JSON.parse(row.milestones)
            : row.milestones;
        }
      }
      lastFetchedFromDb = Date.now();
      saveLocal();
    } else {
      // Seed awal jika tabel Supabase kosong
      for (const subId of Object.keys(progressData)) {
        await syncToSupabase(subId);
      }
      lastFetchedFromDb = Date.now();
    }
  } catch (err) {
    console.warn('⚠️ Supabase progress fetch warning (menggunakan cache):', err.message);
  }

  return progressData;
}

async function initFromSupabase() {
  return await refreshFromDatabase(true);
}

async function getAllProgress() {
  await refreshFromDatabase();
  return Object.values(progressData);
}

function getAllProgressSync() {
  return Object.values(progressData);
}

async function getProgress(subEventId) {
  await refreshFromDatabase();
  return progressData[subEventId] || progressData['safari'];
}

function getProgressSync(subEventId) {
  return progressData[subEventId] || progressData['safari'];
}

async function updateProgress(subEventId, { percentage, statusLabel, updatedBy, milestones }) {
  if (!progressData[subEventId]) {
    const meta = SUB_EVENT_META[subEventId] || { name: subEventId, icon: '📊', code: subEventId.toUpperCase() };
    progressData[subEventId] = {
      subEventId,
      name: meta.name || subEventId,
      icon: meta.icon || '📊',
      code: meta.code || subEventId.toUpperCase(),
      percentage: 0,
      statusLabel: '',
      updatedBy: updatedBy || 'Staff Ahli',
      updatedAt: new Date().toISOString(),
      milestones: []
    };
  }

  const item = progressData[subEventId];
  if (percentage !== undefined && percentage !== null) {
    item.percentage = Math.max(0, Math.min(100, parseInt(percentage, 10) || 0));
  }
  if (statusLabel !== undefined) {
    item.statusLabel = statusLabel;
  }
  if (updatedBy) {
    item.updatedBy = updatedBy;
  }
  if (milestones && Array.isArray(milestones)) {
    item.milestones = milestones;
  }
  item.updatedAt = new Date().toISOString();

  saveLocal();
  await syncToSupabase(subEventId);
  return item;
}

async function updateMilestone(subEventId, milestoneId, { title, category, progress, status, notes } = {}, user = 'Staff Ahli') {
  await refreshFromDatabase();
  const item = progressData[subEventId];
  if (!item || !item.milestones) return null;

  const m = item.milestones.find(x => x.id === milestoneId);
  if (m) {
    if (title !== undefined) m.title = title;
    if (category !== undefined) m.category = category;
    if (notes !== undefined) m.notes = notes;
    if (progress !== undefined) {
      m.progress = Math.max(0, Math.min(100, parseInt(progress, 10) || 0));
      if (m.progress === 100) m.status = 'done';
      else if (m.progress === 0) m.status = 'pending';
      else m.status = 'in_progress';
    } else if (status !== undefined) {
      m.status = status;
      if (status === 'done') m.progress = 100;
      else if (status === 'pending') m.progress = 0;
      else if (!m.progress || m.progress === 100 || m.progress === 0) m.progress = 50;
    }
    m.updatedAt = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    item.updatedBy = user;
    item.updatedAt = new Date().toISOString();

    if (item.milestones.length > 0) {
      const sum = item.milestones.reduce((acc, curr) => acc + (curr.progress || 0), 0);
      item.percentage = Math.round(sum / item.milestones.length);
    }

    saveLocal();
    await syncToSupabase(subEventId);
    return m;
  }
  return null;
}

async function toggleMilestone(subEventId, milestoneId, status, user = 'Staff Ahli') {
  await refreshFromDatabase();
  const item = progressData[subEventId];
  if (!item || !item.milestones) return null;

  const m = item.milestones.find(x => x.id === milestoneId);
  if (m) {
    m.status = status || (m.status === 'done' ? 'in_progress' : (m.status === 'in_progress' ? 'pending' : 'done'));
    if (m.status === 'done') m.progress = 100;
    else if (m.status === 'in_progress') m.progress = 50;
    else m.progress = 0;
    m.updatedAt = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    item.updatedBy = user;
    item.updatedAt = new Date().toISOString();

    if (item.milestones.length > 0) {
      const sum = item.milestones.reduce((acc, curr) => acc + (curr.progress || 0), 0);
      item.percentage = Math.round(sum / item.milestones.length);
    }

    saveLocal();
    await syncToSupabase(subEventId);
    return m;
  }
  return null;
}

async function addMilestone(subEventId, milestoneData, user = 'Staff Ahli') {
  await refreshFromDatabase();
  const item = progressData[subEventId];
  if (!item) return null;

  const newId = `${subEventId}_m_${Date.now()}`;
  const newMilestone = {
    id: newId,
    title: milestoneData.title || 'Tugas Baru',
    category: milestoneData.category || 'Operasional',
    status: milestoneData.status || 'in_progress',
    progress: parseInt(milestoneData.progress, 10) || (milestoneData.status === 'done' ? 100 : 50),
    notes: milestoneData.notes || '',
    updatedAt: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
  };

  if (!item.milestones) item.milestones = [];
  item.milestones.push(newMilestone);
  item.updatedBy = user;
  item.updatedAt = new Date().toISOString();

  if (item.milestones.length > 0) {
    const sum = item.milestones.reduce((acc, curr) => acc + (curr.progress || 0), 0);
    item.percentage = Math.round(sum / item.milestones.length);
  }

  saveLocal();
  await syncToSupabase(subEventId);
  return newMilestone;
}

async function deleteMilestone(subEventId, milestoneId, user = 'Staff Ahli') {
  await refreshFromDatabase();
  const item = progressData[subEventId];
  if (!item || !item.milestones) return false;

  const idx = item.milestones.findIndex(x => x.id === milestoneId);
  if (idx !== -1) {
    item.milestones.splice(idx, 1);
    item.updatedBy = user;
    item.updatedAt = new Date().toISOString();

    if (item.milestones.length > 0) {
      const sum = item.milestones.reduce((acc, curr) => acc + (curr.progress || 0), 0);
      item.percentage = Math.round(sum / item.milestones.length);
    }

    saveLocal();
    await syncToSupabase(subEventId);
    return true;
  }
  return false;
}

const SUB_EVENT_META = {
  safari: {
    id: 'safari',
    abbr: 'sf',
    code: 'SF',
    name: 'Safari Faculty',
    icon: '🏛️'
  },
  startpoint: {
    id: 'startpoint',
    abbr: 'sp',
    code: 'SP',
    name: 'Start Point',
    icon: '🚀'
  },
  odl: {
    id: 'odl',
    abbr: 'odl',
    code: 'ODL',
    name: 'One Day Lecture',
    icon: '🎓'
  },
  technocraft: {
    id: 'technocraft',
    abbr: 'tcp',
    code: 'TCP',
    name: 'Technocraft Playhouse',
    icon: '⚡'
  }
};

/**
 * Normalisasi kode sub-event untuk perintah !progress
 * Mendukung singkatan resmi: sf, tcp, odl, sp, all
 */
function normalizeSubKey(key = '') {
  const clean = String(key || '').toLowerCase().trim().replace(/[-_]/g, '');
  if (!clean) return 'sf';
  if (clean === 'all' || clean === 'semua') return 'all';
  if (clean === 'sf' || clean === 'safari' || clean === 'safarifaculty') return 'safari';
  if (clean === 'sp' || clean === 'startpoint' || clean === 'start') return 'startpoint';
  if (clean === 'odl' || clean === 'onedaylecture') return 'odl';
  if (clean === 'tcp' || clean === 'tc' || clean === 'technocraft' || clean === 'techno' || clean === 'technocraftplayhouse') return 'technocraft';
  return null;
}

/**
 * Render visual progress bar 10 karakter (contoh: [███████░░░])
 */
function renderProgressBar(percentage) {
  const safePct = Math.max(0, Math.min(100, Math.round(percentage || 0)));
  const totalBlocks = 10;
  const filledBlocks = Math.round((safePct / 100) * totalBlocks);
  const emptyBlocks = totalBlocks - filledBlocks;
  return '█'.repeat(filledBlocks) + '░'.repeat(emptyBlocks);
}

/**
 * Format balasan WhatsApp untuk !progress all maupun per sub-event
 * @param {string} subArg - 'all', 'sf', 'tcp', 'odl', 'sp'
 * @returns {Promise<string>} - Teks terformat siap kirim via WhatsApp
 */
async function formatProgressForWhatsApp(subArg = 'sf') {
  await refreshFromDatabase();
  const normalized = normalizeSubKey(subArg);

  if (!normalized) {
    return (
`⚠️ Sub-event *"${subArg}"* tidak ditemukan.

Gunakan singkatan resmi sub-divisi berikut:
• *!progress all* : Rekapitulasi seluruh sub-acara
• *!progress sf* : Safari Faculty
• *!progress tcp* : Technocraft Playhouse
• *!progress odl* : One Day Lecture
• *!progress sp* : Start Point`
    );
  }

  if (normalized === 'all') {
    const subOrder = ['safari', 'startpoint', 'odl', 'technocraft'];
    let totalPct = 0;
    const lines = [];

    lines.push('📊 *PROGRESS SUB-DIVISI CENTRAL EVENT*');
    lines.push('_Ini Lho ITS! 2027 • Rekapitulasi Progres_');
    lines.push('────────────────────────────');

    subOrder.forEach(subId => {
      const meta = SUB_EVENT_META[subId];
      const item = progressData[subId] || { percentage: 0, statusLabel: 'Belum Dikonfigurasi' };
      const pct = item.percentage || 0;
      totalPct += pct;
      const bar = renderProgressBar(pct);
      const label = item.statusLabel || 'Persiapan konsep & modul';

      lines.push(`${meta.icon} *${meta.name} (${meta.code})*`);
      lines.push(`[${bar}] *${pct}%*`);
      lines.push(`Status: ${label}\n`);
    });

    const avgPct = Math.round(totalPct / subOrder.length);
    lines.push('────────────────────────────');
    lines.push(`📈 *Rata-rata Kesiapan:* *${avgPct}%*`);
    lines.push('💡 _Ketik *!progress sf* atau *!progress tcp* untuk rincian milestone._');

    return lines.join('\n');
  }

  // Single sub-event details
  const meta = SUB_EVENT_META[normalized] || SUB_EVENT_META.safari;
  const item = progressData[normalized] || {
    percentage: 0,
    statusLabel: 'Belum Dikonfigurasi (Menunggu Input Staff Ahli)',
    updatedBy: 'Sistem Central Event',
    milestones: []
  };

  const pct = item.percentage || 0;
  const bar = renderProgressBar(pct);
  const milestones = item.milestones || [];
  const completedCount = milestones.filter(m => m.status === 'done' || (m.progress || 0) >= 100).length;

  const lines = [];
  lines.push(`📊 *PROGRESS PROYEK: ${meta.name.toUpperCase()}*`);
  lines.push(`_Sub-Divisi ${meta.name} (${meta.code}) • Ini Lho ITS! 2027_`);
  lines.push('────────────────────────────');
  lines.push(`🎯 *Total Progres:* [${bar}] *${pct}%*`);
  lines.push(`📝 *Status Terkini:*`);
  lines.push(`${item.statusLabel || 'Menunggu pembaruan status'}`);
  lines.push(`👤 *PIC/Update:* ${item.updatedBy || 'Staff Ahli'}`);
  lines.push('');

  if (milestones.length === 0) {
    lines.push('📋 *Rincian Milestone:*');
    lines.push('_Belum ada milestone yang ditambahkan._');
  } else {
    lines.push(`📋 *Rincian Milestone (${completedCount}/${milestones.length} Selesai):*`);
    milestones.forEach(m => {
      let icon = '⏳';
      const mProg = m.progress !== undefined ? m.progress : (m.status === 'done' ? 100 : (m.status === 'in_progress' ? 50 : 0));
      if (m.status === 'done' || mProg >= 100) {
        icon = '✅';
      } else if (m.status === 'in_progress' || mProg > 0) {
        icon = '🔄';
      }
      lines.push(`${icon} ${m.title} (${mProg}%)`);
    });
  }

  const otherSubList = ['all', 'sf', 'tcp', 'odl', 'sp']
    .filter(k => k !== meta.abbr)
    .map(k => `!progress ${k}`)
    .join(' | ');

  lines.push('────────────────────────────');
  lines.push('💡 *Perintah Lainnya:*');
  lines.push(`Ketik: ${otherSubList}`);

  return lines.join('\n');
}

module.exports = {
  getAllProgress,
  getAllProgressSync,
  getProgress,
  getProgressSync,
  updateProgress,
  updateMilestone,
  toggleMilestone,
  addMilestone,
  deleteMilestone,
  initFromSupabase,
  syncToSupabase,
  refreshFromDatabase,
  formatProgressForWhatsApp,
  normalizeSubKey,
  renderProgressBar
};
