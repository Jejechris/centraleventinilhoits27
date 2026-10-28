const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../../data/progress.json');

let progressData = {};

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
    console.error('Error writing progress.json:', err.message);
  }
}

// Initial load
loadLocal();

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
      item.subEventId,
      item.percentage || 0,
      item.statusLabel || '',
      JSON.stringify(item.milestones || []),
      item.updatedBy || 'Staff Ahli'
    ]);
  } catch (err) {
    console.warn(`Supabase progress sync warning (${subEventId}):`, err.message);
  }
}

async function initFromSupabase() {
  try {
    const db = require('../db');
    const res = await db.query('SELECT * FROM progress_trackers');
    if (res.rows && res.rows.length > 0) {
      for (const row of res.rows) {
        if (progressData[row.sub_event_id]) {
          progressData[row.sub_event_id].percentage = row.percentage;
          progressData[row.sub_event_id].statusLabel = row.status_label;
          progressData[row.sub_event_id].updatedBy = row.updated_by;
          progressData[row.sub_event_id].updatedAt = row.updated_at;
          if (row.milestones) {
            progressData[row.sub_event_id].milestones = typeof row.milestones === 'string'
              ? JSON.parse(row.milestones)
              : row.milestones;
          }
        }
      }
      saveLocal();
    } else {
      // Seed initial local data into Supabase
      for (const subId of Object.keys(progressData)) {
        await syncToSupabase(subId);
      }
    }
  } catch (err) {
    console.warn('Could not sync progress from Supabase on start:', err.message);
  }
}

function getAllProgress() {
  return Object.values(progressData);
}

function getProgress(subEventId) {
  return progressData[subEventId] || progressData['safari'];
}

function updateProgress(subEventId, { percentage, statusLabel, updatedBy, milestones }) {
  if (!progressData[subEventId]) {
    progressData[subEventId] = {
      subEventId,
      name: subEventId,
      icon: '📊',
      code: subEventId.toUpperCase(),
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
  syncToSupabase(subEventId).catch(() => {});
  return item;
}

function updateMilestone(subEventId, milestoneId, { title, category, progress, status, notes } = {}, user = 'Staff Ahli') {
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
    syncToSupabase(subEventId).catch(() => {});
    return m;
  }
  return null;
}

function toggleMilestone(subEventId, milestoneId, status, user = 'Staff Ahli') {
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

    // Auto-recalculate percentage if all milestones have weight/progress
    if (item.milestones.length > 0) {
      const sum = item.milestones.reduce((acc, curr) => acc + (curr.progress || 0), 0);
      item.percentage = Math.round(sum / item.milestones.length);
    }

    saveLocal();
    syncToSupabase(subEventId).catch(() => {});
    return m;
  }
  return null;
}

function addMilestone(subEventId, milestoneData, user = 'Staff Ahli') {
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

  item.milestones.push(newMilestone);
  item.updatedBy = user;
  item.updatedAt = new Date().toISOString();

  if (item.milestones.length > 0) {
    const sum = item.milestones.reduce((acc, curr) => acc + (curr.progress || 0), 0);
    item.percentage = Math.round(sum / item.milestones.length);
  }

  saveLocal();
  syncToSupabase(subEventId).catch(() => {});
  return newMilestone;
}

function deleteMilestone(subEventId, milestoneId, user = 'Staff Ahli') {
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
    syncToSupabase(subEventId).catch(() => {});
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
 * @returns {string} - Teks terformat siap kirim via WhatsApp
 */
function formatProgressForWhatsApp(subArg = 'sf') {
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
  getProgress,
  updateProgress,
  updateMilestone,
  toggleMilestone,
  addMilestone,
  deleteMilestone,
  initFromSupabase,
  syncToSupabase,
  formatProgressForWhatsApp,
  normalizeSubKey,
  renderProgressBar
};
