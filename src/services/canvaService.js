const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../../data/canva.json');
const DELETED_CANVA_FILE = path.join(__dirname, '../../data/deleted_canva.json');

function loadDeletedCanvaIds() {
  try {
    if (fs.existsSync(DELETED_CANVA_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(DELETED_CANVA_FILE, 'utf8'));
      return new Set(Array.isArray(parsed) ? parsed : []);
    }
  } catch (_) {}
  return new Set(['canva_sf_01', 'canva_sf_02', 'canva_sf_03', 'canva_sf_04']);
}

function saveDeletedCanvaIds(set) {
  try {
    ensureDataDir();
    fs.writeFileSync(DELETED_CANVA_FILE, JSON.stringify(Array.from(set), null, 2), 'utf8');
  } catch (_) {}
}

const deletedCanvaIds = loadDeletedCanvaIds();

let canvaCache = [];
let lastFetchedFromDb = 0;
const CACHE_TTL_MS = 2500;

const DEFAULT_CANVA_LINKS = [
  // --- START POINT (SP) ---
  {
    id: 'canva_sp_01',
    name: 'Backdrop Stage Akbar & Gate Utama Start Point',
    subEventId: 'startpoint',
    subEventName: 'Start Point',
    category: 'Banner & Backdrop',
    url: 'https://www.canva.com/design/DAF-backdrop-sp/view?embed',
    embedUrl: 'https://www.canva.com/design/DAF-backdrop-sp/view?embed',
    icon: '🎪',
    description: 'Desain megah latar panggung opening ceremony & gerbang penyambutan maba.',
    date: 'Master Canva',
    isDefault: true
  },
  {
    id: 'canva_sp_02',
    name: 'Signage Screening Barcode, Gating & Drop Zone',
    subEventId: 'startpoint',
    subEventName: 'Start Point',
    category: 'Signage & Peta Rute',
    url: 'https://www.canva.com/design/DAF-signage-sp/view?embed',
    embedUrl: 'https://www.canva.com/design/DAF-signage-sp/view?embed',
    icon: '🚧',
    description: 'Penanda jalur masuk barcode scanner, pos drop zone shuttle bus & pos medis.',
    date: 'Master Canva',
    isDefault: true
  },
  {
    id: 'canva_sp_03',
    name: 'Desain Wristband & Gelang Kluster Peserta SP',
    subEventId: 'startpoint',
    subEventName: 'Start Point',
    category: 'Merchandise & Identitas',
    url: 'https://www.canva.com/design/DAF-wristband-sp/view?embed',
    embedUrl: 'https://www.canva.com/design/DAF-wristband-sp/view?embed',
    icon: '🎟️',
    description: 'Format cetak gelang penanda warna per kluster untuk gating massa.',
    date: 'Master Canva',
    isDefault: true
  },
  {
    id: 'canva_sp_04',
    name: 'Cue Card MC Opening & Protokol Lapangan SP',
    subEventId: 'startpoint',
    subEventName: 'Start Point',
    category: 'Cue Card & Rundown Visual',
    url: 'https://www.canva.com/design/DAF-cuecard-sp/view?embed',
    embedUrl: 'https://www.canva.com/design/DAF-cuecard-sp/view?embed',
    icon: '📑',
    description: 'Panduan tata suara dan orkestrasi pergerakan massa maba.',
    date: 'Master Canva',
    isDefault: true
  },

  // --- ONE DAY LECTURE (ODL) ---
  {
    id: 'canva_odl_01',
    name: 'Template Slide Kuliah Perdana Dosen & Pakar',
    subEventId: 'odl',
    subEventName: 'One Day Lecture',
    category: 'PPT & Presentasi',
    url: 'https://www.canva.com/design/DAF-slide-odl/view?embed',
    embedUrl: 'https://www.canva.com/design/DAF-slide-odl/view?embed',
    icon: '🎓',
    description: 'Format seragam deck presentasi materi kuliah interaktif guru besar ITS.',
    date: 'Master Canva',
    isDefault: true
  },
  {
    id: 'canva_odl_02',
    name: 'Backdrop Ruang Teater & Kelas Interaktif ODL',
    subEventId: 'odl',
    subEventName: 'One Day Lecture',
    category: 'Banner & Backdrop',
    url: 'https://www.canva.com/design/DAF-backdrop-odl/view?embed',
    embedUrl: 'https://www.canva.com/design/DAF-backdrop-odl/view?embed',
    icon: '🏛️',
    description: 'Layar visual proyektor utama & banner panggung auditorium kuliah.',
    date: 'Master Canva',
    isDefault: true
  },
  {
    id: 'canva_odl_03',
    name: 'E-Sertifikat Peserta & Piagam Dosen Tamu',
    subEventId: 'odl',
    subEventName: 'One Day Lecture',
    category: 'Sertifikat & Dokumen',
    url: 'https://www.canva.com/design/DAF-cert-odl/view?embed',
    embedUrl: 'https://www.canva.com/design/DAF-cert-odl/view?embed',
    icon: '📜',
    description: 'Template apresiasi akademik untuk pemateri dan peserta kuliah simulasi.',
    date: 'Master Canva',
    isDefault: true
  },
  {
    id: 'canva_odl_04',
    name: 'Name Tag & Vandel Pembicara Akademik',
    subEventId: 'odl',
    subEventName: 'One Day Lecture',
    category: 'ID Card & Tanda Pengenal',
    url: 'https://www.canva.com/design/DAF-nametag-odl/view?embed',
    embedUrl: 'https://www.canva.com/design/DAF-nametag-odl/view?embed',
    icon: '🪪',
    description: 'Tanda pengenal khusus narasumber, moderator, dan LO akademik.',
    date: 'Master Canva',
    isDefault: true
  },

  // --- TECHNOCRAFT PLAYHOUSE (TCP) ---
  {
    id: 'canva_tcp_01',
    name: 'Papan Info Spesifikasi Wahana Robotika & AI',
    subEventId: 'technocraft',
    subEventName: 'Technocraft Playhouse',
    category: 'Signage & Peta Rute',
    url: 'https://www.canva.com/design/DAF-robot-tcp/view?embed',
    embedUrl: 'https://www.canva.com/design/DAF-robot-tcp/view?embed',
    icon: '🤖',
    description: 'Spesifikasi teknis, cara kerja inovasi teknologi, & instruksi keselamatan.',
    date: 'Master Canva',
    isDefault: true
  },
  {
    id: 'canva_tcp_02',
    name: 'Banner Zona Eksibisi & Demo Inovasi Mahasiswa',
    subEventId: 'technocraft',
    subEventName: 'Technocraft Playhouse',
    category: 'Banner & Backdrop',
    url: 'https://www.canva.com/design/DAF-expo-tcp/view?embed',
    embedUrl: 'https://www.canva.com/design/DAF-expo-tcp/view?embed',
    icon: '⚡',
    description: 'Desain visual penanda stan tim riset robotika & maker space ITS.',
    date: 'Master Canva',
    isDefault: true
  },
  {
    id: 'canva_tcp_03',
    name: 'Scoreboard Live & Bagan Bracket Kompetisi',
    subEventId: 'technocraft',
    subEventName: 'Technocraft Playhouse',
    category: 'Media & Scoreboard',
    url: 'https://www.canva.com/design/DAF-score-tcp/view?embed',
    embedUrl: 'https://www.canva.com/design/DAF-score-tcp/view?embed',
    icon: '🏆',
    description: 'Template grafik skor live untuk tantangan coding & battle robotika.',
    date: 'Master Canva',
    isDefault: true
  },
  {
    id: 'canva_tcp_04',
    name: 'Stiker, Stamp Paspor Wahana & Signage Alur',
    subEventId: 'technocraft',
    subEventName: 'Technocraft Playhouse',
    category: 'Merchandise & Identitas',
    url: 'https://www.canva.com/design/DAF-paspor-tcp/view?embed',
    embedUrl: 'https://www.canva.com/design/DAF-paspor-tcp/view?embed',
    icon: '🎯',
    description: 'Desain kartu paspor stempel tantangan bagi maba yang mencoba wahana.',
    date: 'Master Canva',
    isDefault: true
  },

  // --- UMUM & MEDIA KREATIF PUSAT ---
  {
    id: 'canva_all_01',
    name: 'Master Feed & Story Instagram Central Event 2027',
    subEventId: 'all',
    subEventName: 'Umum & Medkraf',
    category: 'Media Sosial',
    url: 'https://www.canva.com/design/DAF-medkraf-feed/view?embed',
    embedUrl: 'https://www.canva.com/design/DAF-medkraf-feed/view?embed',
    icon: '📱',
    description: 'Template carousel resmi, countdown harian, dan pengumuman panitia.',
    date: 'Master Canva',
    isDefault: true
  },
  {
    id: 'canva_all_02',
    name: 'Poster Publikasi Resmi & Virtual Background Zoom',
    subEventId: 'all',
    subEventName: 'Umum & Medkraf',
    category: 'Publikasi & Dokumentasi',
    url: 'https://www.canva.com/design/DAF-poster-central/view?embed',
    embedUrl: 'https://www.canva.com/design/DAF-poster-central/view?embed',
    icon: '🖼️',
    description: 'Virtual background rapat koordinasi, presensi daring, dan publikasi poster.',
    date: 'Master Canva',
    isDefault: true
  }
];

function ensureDataDir() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function loadLocalCanva() {
  ensureDataDir();
  if (!fs.existsSync(DATA_FILE)) {
    saveLocalCanva(DEFAULT_CANVA_LINKS);
    return DEFAULT_CANVA_LINKS;
  }
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_CANVA_LINKS;
  } catch (err) {
    console.error('Error loading canva.json:', err.message);
    return DEFAULT_CANVA_LINKS;
  }
}

function saveLocalCanva(items) {
  ensureDataDir();
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 2), 'utf8');
  } catch (err) {
    // In serverless Vercel filesystem might be read-only; safely ignore
  }
}

// Initial load
canvaCache = loadLocalCanva();

/**
 * Sync from Supabase PostgreSQL
 */
async function refreshFromDatabase(force = false) {
  if (!force && lastFetchedFromDb && (Date.now() - lastFetchedFromDb < CACHE_TTL_MS)) {
    return canvaCache;
  }

  try {
    const db = require('../db');
    const res = await db.query('SELECT * FROM canva_links ORDER BY created_at ASC');
    if (res && res.rows && res.rows.length > 0) {
      canvaCache = res.rows.filter(r => !deletedCanvaIds.has(r.id)).map(row => ({
        id: row.id,
        name: row.name,
        subEventId: row.sub_event_id,
        subEventName: row.sub_event_name || row.sub_event_id,
        category: row.category || 'Desain & Media',
        url: row.url,
        embedUrl: row.embed_url || row.url,
        icon: row.icon || '🎨',
        description: row.description || '',
        date: row.date || 'Tersambung Cloud',
        isDefault: !!row.is_default
      }));
      lastFetchedFromDb = Date.now();
      saveLocalCanva(canvaCache);
    } else {
      // Seed default items to Supabase
      const local = loadLocalCanva();
      for (const item of local) {
        await db.query(`
          INSERT INTO canva_links (id, name, sub_event_id, sub_event_name, category, url, embed_url, icon, description, date, is_default, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            sub_event_id = EXCLUDED.sub_event_id,
            sub_event_name = EXCLUDED.sub_event_name,
            category = EXCLUDED.category,
            url = EXCLUDED.url,
            embed_url = EXCLUDED.embed_url,
            icon = EXCLUDED.icon,
            description = EXCLUDED.description,
            date = EXCLUDED.date,
            is_default = EXCLUDED.is_default,
            updated_at = NOW();
        `, [
          item.id, item.name, item.subEventId, item.subEventName, item.category,
          item.url, item.embedUrl, item.icon, item.description, item.date, item.isDefault
        ]).catch(() => {});
      }
      canvaCache = local;
      lastFetchedFromDb = Date.now();
    }
  } catch (err) {
    console.warn('⚠️ Supabase canva fetch warning (using cache):', err.message);
  }

  return canvaCache;
}

async function getAllCanvaLinks() {
  await refreshFromDatabase();
  return canvaCache;
}

function getAllCanvaLinksSync() {
  return canvaCache;
}

async function getCanvaLinksBySubEvent(subEventId = 'all') {
  await refreshFromDatabase();
  if (!subEventId || subEventId === 'all') {
    return canvaCache.filter(item => !deletedCanvaIds.has(item.id));
  }
  return canvaCache.filter(item => item.subEventId === subEventId && !deletedCanvaIds.has(item.id));
}

/**
 * Format Canva URL to embed view if feasible
 */
function cleanCanvaUrl(input) {
  if (!input || typeof input !== 'string') return '';
  let url = input.trim();
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  return url;
}

function generateEmbedUrl(url) {
  if (!url) return '';
  if (url.includes('canva.com/design/') && !url.includes('/view?embed') && !url.includes('/watch?embed')) {
    // Transform edit or view link to clean embed link
    const base = url.split('?')[0].replace(/\/edit$/, '/view');
    return `${base}?embed`;
  }
  return url;
}

async function addCanvaLink({ name, url, subEventId = 'all', category = 'Desain & Media', description = '', icon = '🎨' }) {
  await refreshFromDatabase();
  const subMap = {
    safari: { name: 'Safari Faculty', icon: '🏛️' },
    startpoint: { name: 'Start Point', icon: '🚀' },
    odl: { name: 'One Day Lecture', icon: '🎓' },
    technocraft: { name: 'Technocraft', icon: '⚡' },
    all: { name: 'Umum & Medkraf', icon: '🎨' }
  };

  const subInfo = subMap[subEventId] || subMap.all;
  const newId = `canva_${subEventId}_${Date.now()}`;
  const cleanedUrl = cleanCanvaUrl(url);
  const embedUrl = generateEmbedUrl(cleanedUrl);

  const newEntry = {
    id: newId,
    name: name || `Desain Canva ${subInfo.name}`,
    subEventId,
    subEventName: subInfo.name,
    category: category || 'Desain & Media',
    url: cleanedUrl,
    embedUrl,
    icon: icon || '🎨',
    description: description || 'Tautan desain Canva tim Central Event.',
    date: 'Tersambung Cloud',
    isDefault: false
  };

  canvaCache.push(newEntry);
  saveLocalCanva(canvaCache);
  lastFetchedFromDb = Date.now();

  try {
    const db = require('../db');
    await db.query(`
      INSERT INTO canva_links (id, name, sub_event_id, sub_event_name, category, url, embed_url, icon, description, date, is_default, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        sub_event_id = EXCLUDED.sub_event_id,
        sub_event_name = EXCLUDED.sub_event_name,
        category = EXCLUDED.category,
        url = EXCLUDED.url,
        embed_url = EXCLUDED.embed_url,
        icon = EXCLUDED.icon,
        description = EXCLUDED.description,
        date = EXCLUDED.date,
        is_default = EXCLUDED.is_default,
        updated_at = NOW();
    `, [
      newEntry.id, newEntry.name, newEntry.subEventId, newEntry.subEventName,
      newEntry.category, newEntry.url, newEntry.embedUrl, newEntry.icon,
      newEntry.description, newEntry.date, false
    ]);
  } catch (err) {
    console.warn('⚠️ Supabase canva sync err:', err.message);
  }

  return newEntry;
}

async function deleteCanvaLink(id) {
  await refreshFromDatabase();
  const initialLength = canvaCache.length;
  canvaCache = canvaCache.filter(item => item.id !== id);
  const deletedFromCache = canvaCache.length !== initialLength;

  saveLocalCanva(canvaCache);
  lastFetchedFromDb = Date.now();

  let dbDeleted = false;
  try {
    const db = require('../db');
    const res = await db.query('DELETE FROM canva_links WHERE id = $1', [id]);
    if (res && res.rowCount > 0) dbDeleted = true;
  } catch (err) {
    console.warn('⚠️ Supabase canva delete error:', err.message);
  }

  return deletedFromCache || dbDeleted;
}

/**
 * Format Canva links for WhatsApp Bot reply
 */
async function formatCanvaForWhatsApp(subArg = 'all') {
  await refreshFromDatabase();
  const subEventsConfig = require('./subEventsConfig');
  const normalized = subEventsConfig.normalizeSubKey(subArg);

  const subMap = {
    safari: { name: 'Safari Faculty', code: 'SF' },
    startpoint: { name: 'Start Point', code: 'SP' },
    odl: { name: 'One Day Lecture', code: 'ODL' },
    technocraft: { name: 'Technocraft', code: 'TCP' },
    all: { name: 'Seluruh Sub-Divisi', code: 'ALL' }
  };

  const targetSub = normalized || 'all';
  const targetInfo = subMap[targetSub] || subMap.all;

  let links = [];
  if (targetSub === 'all') {
    links = canvaCache;
  } else {
    links = canvaCache.filter(l => l.subEventId === targetSub || l.subEventId === 'all');
  }

  let text = `🎨 *BANK DESAIN CANVA CENTRAL EVENT 2027*\n`;
  text += `_Katalog Aset Visual & Desain Resmi (${targetInfo.name})_\n`;
  text += `────────────────────────────\n\n`;

  if (links.length === 0) {
    text += `_Belum ada tautan desain Canva yang terdaftar untuk sub-divisi ini._\n\n`;
  } else {
    // Group by sub-divisi
    const grouped = {};
    links.forEach(l => {
      const g = l.subEventName || l.subEventId || 'Umum';
      if (!grouped[g]) grouped[g] = [];
      grouped[g].push(l);
    });

    for (const [groupName, items] of Object.entries(grouped)) {
      text += `📌 *${groupName.toUpperCase()}* (${items.length} Aset):\n`;
      items.forEach((item, idx) => {
        text += `${idx + 1}. *${item.name}* [${item.category}]\n`;
        text += `   🔗 ${item.url}\n`;
      });
      text += `\n`;
    }
  }

  text += `────────────────────────────\n`;
  text += `💡 *Perintah Lainnya:*\n`;
  text += `Ketik: *!canva all* | *!canva sf* | *!canva sp* | *!canva tcp* | *!canva odl*`;

  return text;
}


/**
 * Update / Rename Canva Link (Supabase PostgreSQL + Local Cache)
 */
async function updateCanvaLink({ id, name, url, category, description, subEventId, icon }) {
  await refreshFromDatabase();
  const index = canvaCache.findIndex(c => c.id === id);
  if (index === -1) {
    throw new Error(`Tautan Canva dengan ID "${id}" tidak ditemukan`);
  }

  const item = canvaCache[index];

  if (name && typeof name === 'string' && name.trim()) {
    item.name = name.trim();
  }

  if (url && typeof url === 'string' && url.trim()) {
    const cleaned = cleanCanvaUrl(url.trim());
    item.url = cleaned;
    item.embedUrl = generateEmbedUrl(cleaned);
  }

  if (category && typeof category === 'string' && category.trim()) {
    item.category = category.trim();
  }

  if (description !== undefined && typeof description === 'string') {
    item.description = description.trim();
  }

  if (icon && typeof icon === 'string') {
    item.icon = icon;
  }

  if (subEventId) {
    const subMap = {
      safari: { name: 'Safari Faculty', icon: '🏛️' },
      startpoint: { name: 'Start Point', icon: '🚀' },
      odl: { name: 'One Day Lecture', icon: '🎓' },
      technocraft: { name: 'Technocraft', icon: '⚡' },
      all: { name: 'Umum & Medkraf', icon: '🎨' }
    };
    const subInfo = subMap[subEventId] || subMap.all;
    item.subEventId = subEventId;
    item.subEventName = subInfo.name;
  }

  item.date = 'Diperbarui';
  canvaCache[index] = item;
  saveLocalCanva(canvaCache);
  lastFetchedFromDb = Date.now();

  try {
    const db = require('../db');
    await db.query(`
      UPDATE canva_links SET
        name = $1,
        url = $2,
        embed_url = $3,
        category = $4,
        description = $5,
        sub_event_id = $6,
        sub_event_name = $7,
        icon = $8,
        date = $9,
        updated_at = NOW()
      WHERE id = $10
    `, [
      item.name,
      item.url,
      item.embedUrl,
      item.category,
      item.description,
      item.subEventId,
      item.subEventName,
      item.icon,
      item.date,
      item.id
    ]);
  } catch (err) {
    console.warn('⚠️ Supabase canva update error:', err.message);
  }

  return item;
}

module.exports = {
  updateCanvaLink,
  getAllCanvaLinks,
  getAllCanvaLinksSync,
  getCanvaLinksBySubEvent,
  addCanvaLink,
  deleteCanvaLink,
  formatCanvaForWhatsApp,
  cleanCanvaUrl,
  generateEmbedUrl,
  DEFAULT_CANVA_LINKS
};
