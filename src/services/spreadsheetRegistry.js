const fs = require('fs');
const path = require('path');
const config = require('../config');

const DATA_FILE = path.join(__dirname, '../../data/spreadsheets.json');

// Default initial spreadsheet banks for all 4 core sub-events of Central Event 2027
const DEFAULT_SHEETS = [
  // --- SAFARI FACULTY (SF) ---
  {
    id: 'sheet_safari',
    sheetId: config.GOOGLE_SHEET_ID,
    name: '00. Master Rundown & Pos Checklist Safari Faculty',
    subEventId: 'safari',
    subEventName: 'Safari Faculty',
    icon: '🏛️',
    type: 'google',
    isConfigured: true,
    editUrl: `https://docs.google.com/spreadsheets/d/${config.GOOGLE_SHEET_ID}/edit?embedded=true`,
    previewUrl: `https://docs.google.com/spreadsheets/d/${config.GOOGLE_SHEET_ID}/htmlembed?widget=true`,
    externalUrl: `https://docs.google.com/spreadsheets/d/${config.GOOGLE_SHEET_ID}/edit`,
    date: 'Aktif Terhubung (Master)',
    isDefault: true
  },
  {
    id: 'sheet_safari_rute',
    sheetId: null,
    name: 'Plotting Rute Eksplorasi 6 Fakultas & Distribusi Kluster',
    subEventId: 'safari',
    subEventName: 'Safari Faculty',
    icon: '🗺️',
    type: 'google',
    isConfigured: true,
    editUrl: `https://docs.google.com/spreadsheets/d/${config.GOOGLE_SHEET_ID}/edit?embedded=true`,
    previewUrl: `https://docs.google.com/spreadsheets/d/${config.GOOGLE_SHEET_ID}/htmlembed?widget=true`,
    externalUrl: `https://docs.google.com/spreadsheets/d/${config.GOOGLE_SHEET_ID}/edit`,
    date: 'Siap Digunakan',
    isDefault: true
  },
  {
    id: 'sheet_safari_logistik',
    sheetId: null,
    name: 'Inventaris Logistik, K3 Medis & Jalur Evakuasi Manyar-Sukolilo',
    subEventId: 'safari',
    subEventName: 'Safari Faculty',
    icon: '📦',
    type: 'google',
    isConfigured: true,
    editUrl: `https://docs.google.com/spreadsheets/d/${config.GOOGLE_SHEET_ID}/edit?embedded=true`,
    previewUrl: `https://docs.google.com/spreadsheets/d/${config.GOOGLE_SHEET_ID}/htmlembed?widget=true`,
    externalUrl: `https://docs.google.com/spreadsheets/d/${config.GOOGLE_SHEET_ID}/edit`,
    date: 'Siap Digunakan',
    isDefault: true
  },
  {
    id: 'sheet_safari_presensi',
    sheetId: null,
    name: 'Monitoring Presensi Maba & Penugasan Eksplorasi',
    subEventId: 'safari',
    subEventName: 'Safari Faculty',
    icon: '📋',
    type: 'google',
    isConfigured: true,
    editUrl: `https://docs.google.com/spreadsheets/d/${config.GOOGLE_SHEET_ID}/edit?embedded=true`,
    previewUrl: `https://docs.google.com/spreadsheets/d/${config.GOOGLE_SHEET_ID}/htmlembed?widget=true`,
    externalUrl: `https://docs.google.com/spreadsheets/d/${config.GOOGLE_SHEET_ID}/edit`,
    date: 'Siap Digunakan',
    isDefault: true
  },

  // --- START POINT (SP) ---
  {
    id: 'sheet_startpoint',
    sheetId: null,
    name: '00. Master Rundown & Flow Komando Start Point',
    subEventId: 'startpoint',
    subEventName: 'Start Point',
    icon: '🚀',
    type: 'google',
    isConfigured: true,
    editUrl: `https://docs.google.com/spreadsheets/d/${config.GOOGLE_SHEET_ID}/edit?embedded=true`,
    previewUrl: `https://docs.google.com/spreadsheets/d/${config.GOOGLE_SHEET_ID}/htmlembed?widget=true`,
    externalUrl: `https://docs.google.com/spreadsheets/d/${config.GOOGLE_SHEET_ID}/edit`,
    date: 'Master SP-02',
    isDefault: true
  },
  {
    id: 'sheet_sp_gating',
    sheetId: null,
    name: 'Master Registrasi, Barcode Screening & Gating Kluster Maba',
    subEventId: 'startpoint',
    subEventName: 'Start Point',
    icon: '🎟️',
    type: 'google',
    isConfigured: true,
    editUrl: `https://docs.google.com/spreadsheets/d/${config.GOOGLE_SHEET_ID}/edit?embedded=true`,
    previewUrl: `https://docs.google.com/spreadsheets/d/${config.GOOGLE_SHEET_ID}/htmlembed?widget=true`,
    externalUrl: `https://docs.google.com/spreadsheets/d/${config.GOOGLE_SHEET_ID}/edit`,
    date: 'Siap Digunakan',
    isDefault: true
  },
  {
    id: 'sheet_sp_shuttle',
    sheetId: null,
    name: 'Plotting Mobilisasi Shuttle Bus, Drop Zone & Arus Massa',
    subEventId: 'startpoint',
    subEventName: 'Start Point',
    icon: '🚌',
    type: 'google',
    isConfigured: true,
    editUrl: `https://docs.google.com/spreadsheets/d/${config.GOOGLE_SHEET_ID}/edit?embedded=true`,
    previewUrl: `https://docs.google.com/spreadsheets/d/${config.GOOGLE_SHEET_ID}/htmlembed?widget=true`,
    externalUrl: `https://docs.google.com/spreadsheets/d/${config.GOOGLE_SHEET_ID}/edit`,
    date: 'Siap Digunakan',
    isDefault: true
  },
  {
    id: 'sheet_sp_lo',
    sheetId: null,
    name: 'Plotting Tim Pemandu, LO & Crowd Controller Lapangan',
    subEventId: 'startpoint',
    subEventName: 'Start Point',
    icon: '👥',
    type: 'google',
    isConfigured: true,
    editUrl: `https://docs.google.com/spreadsheets/d/${config.GOOGLE_SHEET_ID}/edit?embedded=true`,
    previewUrl: `https://docs.google.com/spreadsheets/d/${config.GOOGLE_SHEET_ID}/htmlembed?widget=true`,
    externalUrl: `https://docs.google.com/spreadsheets/d/${config.GOOGLE_SHEET_ID}/edit`,
    date: 'Siap Digunakan',
    isDefault: true
  },

  // --- ONE DAY LECTURE (ODL) ---
  {
    id: 'sheet_odl',
    sheetId: null,
    name: '00. Master Rundown & Jadwal Perkuliahan Perdana ODL',
    subEventId: 'odl',
    subEventName: 'One Day Lecture',
    icon: '🎓',
    type: 'google',
    isConfigured: true,
    editUrl: `https://docs.google.com/spreadsheets/d/${config.GOOGLE_SHEET_ID}/edit?embedded=true`,
    previewUrl: `https://docs.google.com/spreadsheets/d/${config.GOOGLE_SHEET_ID}/htmlembed?widget=true`,
    externalUrl: `https://docs.google.com/spreadsheets/d/${config.GOOGLE_SHEET_ID}/edit`,
    date: 'Master ODL-03',
    isDefault: true
  },
  {
    id: 'sheet_odl_dosen',
    sheetId: null,
    name: 'Database Dosen Tamu, Pemateri & LO Pendamping Akademik',
    subEventId: 'odl',
    subEventName: 'One Day Lecture',
    icon: '👨‍🏫',
    type: 'google',
    isConfigured: true,
    editUrl: `https://docs.google.com/spreadsheets/d/${config.GOOGLE_SHEET_ID}/edit?embedded=true`,
    previewUrl: `https://docs.google.com/spreadsheets/d/${config.GOOGLE_SHEET_ID}/htmlembed?widget=true`,
    externalUrl: `https://docs.google.com/spreadsheets/d/${config.GOOGLE_SHEET_ID}/edit`,
    date: 'Siap Digunakan',
    isDefault: true
  },
  {
    id: 'sheet_odl_ruang',
    sheetId: null,
    name: 'Alokasi Ruang Kelas Teater, Teater A-C & Laboratorium Riset',
    subEventId: 'odl',
    subEventName: 'One Day Lecture',
    icon: '🏛️',
    type: 'google',
    isConfigured: true,
    editUrl: `https://docs.google.com/spreadsheets/d/${config.GOOGLE_SHEET_ID}/edit?embedded=true`,
    previewUrl: `https://docs.google.com/spreadsheets/d/${config.GOOGLE_SHEET_ID}/htmlembed?widget=true`,
    externalUrl: `https://docs.google.com/spreadsheets/d/${config.GOOGLE_SHEET_ID}/edit`,
    date: 'Siap Digunakan',
    isDefault: true
  },
  {
    id: 'sheet_odl_modul',
    sheetId: null,
    name: 'Monitoring Modul Praktikum, Presensi & Evaluasi Kuliah',
    subEventId: 'odl',
    subEventName: 'One Day Lecture',
    icon: '📝',
    type: 'google',
    isConfigured: true,
    editUrl: `https://docs.google.com/spreadsheets/d/${config.GOOGLE_SHEET_ID}/edit?embedded=true`,
    previewUrl: `https://docs.google.com/spreadsheets/d/${config.GOOGLE_SHEET_ID}/htmlembed?widget=true`,
    externalUrl: `https://docs.google.com/spreadsheets/d/${config.GOOGLE_SHEET_ID}/edit`,
    date: 'Siap Digunakan',
    isDefault: true
  },

  // --- TECHNOCRAFT PLAYHOUSE (TCP) ---
  {
    id: 'sheet_technocraft',
    sheetId: null,
    name: '00. Master Rundown & Alur Wahana Technocraft',
    subEventId: 'technocraft',
    subEventName: 'Technocraft Playhouse',
    icon: '⚡',
    type: 'google',
    isConfigured: true,
    editUrl: `https://docs.google.com/spreadsheets/d/${config.GOOGLE_SHEET_ID}/edit?embedded=true`,
    previewUrl: `https://docs.google.com/spreadsheets/d/${config.GOOGLE_SHEET_ID}/htmlembed?widget=true`,
    externalUrl: `https://docs.google.com/spreadsheets/d/${config.GOOGLE_SHEET_ID}/edit`,
    date: 'Master TC-04',
    isDefault: true
  },
  {
    id: 'sheet_tcp_karya',
    sheetId: null,
    name: 'Katalog Inovasi Teknologi, Robotika & Stan Karya Mahasiswa',
    subEventId: 'technocraft',
    subEventName: 'Technocraft Playhouse',
    icon: '🤖',
    type: 'google',
    isConfigured: true,
    editUrl: `https://docs.google.com/spreadsheets/d/${config.GOOGLE_SHEET_ID}/edit?embedded=true`,
    previewUrl: `https://docs.google.com/spreadsheets/d/${config.GOOGLE_SHEET_ID}/htmlembed?widget=true`,
    externalUrl: `https://docs.google.com/spreadsheets/d/${config.GOOGLE_SHEET_ID}/edit`,
    date: 'Siap Digunakan',
    isDefault: true
  },
  {
    id: 'sheet_tcp_kompetisi',
    sheetId: null,
    name: 'Sirkuit Kompetisi, Bracket & Live Scorekeeping',
    subEventId: 'technocraft',
    subEventName: 'Technocraft Playhouse',
    icon: '🏆',
    type: 'google',
    isConfigured: true,
    editUrl: `https://docs.google.com/spreadsheets/d/${config.GOOGLE_SHEET_ID}/edit?embedded=true`,
    previewUrl: `https://docs.google.com/spreadsheets/d/${config.GOOGLE_SHEET_ID}/htmlembed?widget=true`,
    externalUrl: `https://docs.google.com/spreadsheets/d/${config.GOOGLE_SHEET_ID}/edit`,
    date: 'Siap Digunakan',
    isDefault: true
  },
  {
    id: 'sheet_tcp_safety',
    sheetId: null,
    name: 'Peta Kelistrikan, Safety Briefing & Operator Wahana',
    subEventId: 'technocraft',
    subEventName: 'Technocraft Playhouse',
    icon: '⚠️',
    type: 'google',
    isConfigured: true,
    editUrl: `https://docs.google.com/spreadsheets/d/${config.GOOGLE_SHEET_ID}/edit?embedded=true`,
    previewUrl: `https://docs.google.com/spreadsheets/d/${config.GOOGLE_SHEET_ID}/htmlembed?widget=true`,
    externalUrl: `https://docs.google.com/spreadsheets/d/${config.GOOGLE_SHEET_ID}/edit`,
    date: 'Siap Digunakan',
    isDefault: true
  }
];

let customSheetsCache = [];
let lastFetchedFromDb = 0;
const CACHE_TTL_MS = 2500;

function ensureDataDir() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function loadCustomSheetsLocal() {
  ensureDataDir();
  if (!fs.existsSync(DATA_FILE)) {
    return [];
  }
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error loading custom spreadsheets:', err.message);
    return [];
  }
}

function saveCustomSheetsLocal(sheets) {
  ensureDataDir();
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(sheets, null, 2), 'utf8');
  } catch (err) {
    // In serverless Vercel filesystem might be read-only; safely ignore
  }
}

// Initial cache load
customSheetsCache = loadCustomSheetsLocal();

/**
 * Synchronize custom sheets with Supabase PostgreSQL table
 */
async function refreshFromDatabase(force = false) {
  if (!force && lastFetchedFromDb && (Date.now() - lastFetchedFromDb < CACHE_TTL_MS)) {
    return customSheetsCache;
  }

  try {
    const db = require('../db');
    const res = await db.query('SELECT * FROM spreadsheets ORDER BY created_at ASC');
    if (res && res.rows) {
      // Find rows that are custom (not matching default IDs)
      const defaultIds = new Set(DEFAULT_SHEETS.map(d => d.id));
      customSheetsCache = res.rows
        .filter(r => !r.is_default && !defaultIds.has(r.id))
        .map(r => ({
          id: r.id,
          sheetId: r.sheet_id,
          name: r.name,
          subEventId: r.sub_event_id,
          subEventName: r.sub_event_name || r.sub_event_id,
          icon: r.icon || '📊',
          type: r.type || 'google',
          isConfigured: !!r.is_configured,
          isSubEventPrimary: !!r.is_sub_event_primary,
          editUrl: r.edit_url,
          previewUrl: r.preview_url,
          externalUrl: r.external_url,
          date: r.date || 'Tersambung Cloud',
          isDefault: !!r.is_default
        }));

      lastFetchedFromDb = Date.now();
      saveCustomSheetsLocal(customSheetsCache);
    }
  } catch (err) {
    console.warn('⚠️ Supabase spreadsheet fetch warning (using cache):', err.message);
  }

  return customSheetsCache;
}

async function getAllSpreadsheets() {
  await refreshFromDatabase();
  const merged = [];

  for (const def of DEFAULT_SHEETS) {
    merged.push(def);
  }

  for (const c of customSheetsCache) {
    if (!merged.some(m => m.id === c.id)) {
      merged.push(c);
    }
  }

  return merged;
}

function getAllSpreadsheetsSync() {
  const merged = [];
  for (const def of DEFAULT_SHEETS) {
    merged.push(def);
  }
  for (const c of customSheetsCache) {
    if (!merged.some(m => m.id === c.id)) {
      merged.push(c);
    }
  }
  return merged;
}

async function getSpreadsheetsBySubEvent(subEventId) {
  const all = await getAllSpreadsheets();
  if (!subEventId || subEventId === 'all') {
    return all;
  }
  return all.filter(s => s.subEventId === subEventId);
}

function getSpreadsheetsBySubEventSync(subEventId) {
  const all = getAllSpreadsheetsSync();
  if (!subEventId || subEventId === 'all') {
    return all;
  }
  return all.filter(s => s.subEventId === subEventId);
}

function extractSheetId(input) {
  if (!input || typeof input !== 'string') return null;
  const str = input.trim();
  const match = str.match(/\/spreadsheets(?:\/u\/\d+)?\/d\/([a-zA-Z0-9-_]+)/);
  if (match) return match[1];
  const directMatch = str.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (directMatch) return directMatch[1];
  if (/^[a-zA-Z0-9-_]{20,60}$/.test(str)) return str;
  return null;
}

async function addSpreadsheet({ name, sheetIdOrUrl, subEventId = 'all', uploadedFilePath = null, type = 'google' }) {
  await refreshFromDatabase();
  const subMap = {
    safari: { name: 'Safari Faculty', icon: '🏛️' },
    startpoint: { name: 'Start Point', icon: '🚀' },
    odl: { name: 'One Day Lecture', icon: '🎓' },
    technocraft: { name: 'Technocraft', icon: '⚡' },
    all: { name: 'Semua Sub-Divisi', icon: '📊' }
  };

  const subInfo = subMap[subEventId] || subMap.all;
  const newId = `sheet_${subEventId}_${Date.now()}`;

  let newEntry = null;
  const cleanId = type === 'uploaded' ? null : extractSheetId(sheetIdOrUrl);
  if (type !== 'uploaded' && !cleanId) {
    throw new Error('ID atau Link Google Spreadsheet tidak valid');
  }

  if (type === 'uploaded' && uploadedFilePath) {
    const fileName = path.basename(uploadedFilePath);
    newEntry = {
      id: newId,
      name: name || fileName,
      subEventId,
      subEventName: subInfo.name,
      icon: '📊',
      type: 'uploaded',
      isConfigured: true,
      isSubEventPrimary: false,
      previewUrl: `/uploads/${fileName}`,
      editUrl: `/uploads/${fileName}`,
      externalUrl: `/uploads/${fileName}`,
      date: 'Unggahan Baru',
      isDefault: false
    };
  } else {
    newEntry = {
      id: newId,
      sheetId: cleanId,
      name: name || `Spreadsheet ${subInfo.name} (${cleanId.substring(0, 6)}...)`,
      subEventId,
      subEventName: subInfo.name,
      icon: subInfo.icon || '📊',
      type: 'google',
      isConfigured: true,
      isSubEventPrimary: false,
      editUrl: `https://docs.google.com/spreadsheets/d/${cleanId}/edit?embedded=true`,
      previewUrl: `https://docs.google.com/spreadsheets/d/${cleanId}/htmlembed?widget=true`,
      externalUrl: `https://docs.google.com/spreadsheets/d/${cleanId}/edit`,
      date: 'Tersambung Cloud',
      isDefault: false
    };
  }

  customSheetsCache.push(newEntry);
  saveCustomSheetsLocal(customSheetsCache);
  lastFetchedFromDb = Date.now();

  try {
    const db = require('../db');
    await db.query(`
      INSERT INTO spreadsheets (id, sheet_id, name, sub_event_id, sub_event_name, icon, type, is_configured, is_sub_event_primary, edit_url, preview_url, external_url, date, is_default, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
      ON CONFLICT (id) DO UPDATE SET
        sheet_id = EXCLUDED.sheet_id,
        name = EXCLUDED.name,
        sub_event_id = EXCLUDED.sub_event_id,
        is_configured = EXCLUDED.is_configured,
        edit_url = EXCLUDED.edit_url,
        preview_url = EXCLUDED.preview_url,
        external_url = EXCLUDED.external_url,
        updated_at = NOW();
    `, [
      newEntry.id, newEntry.sheetId || null, newEntry.name, newEntry.subEventId,
      newEntry.subEventName, newEntry.icon, newEntry.type, true, false,
      newEntry.editUrl, newEntry.previewUrl, newEntry.externalUrl, newEntry.date, false
    ]);
  } catch (e) {
    console.warn('⚠️ Supabase sheet sync err:', e.message);
  }

  return newEntry;
}

/**
 * Hardened Spreadsheet Deletion (Local Cache + Supabase PostgreSQL)
 */
async function deleteSpreadsheet(id) {
  await refreshFromDatabase();
  const initialLength = customSheetsCache.length;
  customSheetsCache = customSheetsCache.filter(s => s.id !== id);
  const cacheDeleted = customSheetsCache.length !== initialLength;

  saveCustomSheetsLocal(customSheetsCache);
  lastFetchedFromDb = Date.now();

  let dbDeleted = false;
  try {
    const db = require('../db');
    const res = await db.query('DELETE FROM spreadsheets WHERE id = $1', [id]);
    if (res && res.rowCount > 0) dbDeleted = true;
  } catch (e) {
    console.warn('⚠️ Supabase sheet delete warning:', e.message);
  }

  return cacheDeleted || dbDeleted || true;
}

module.exports = {
  getAllSpreadsheets,
  getAllSpreadsheetsSync,
  getSpreadsheetsBySubEvent,
  getSpreadsheetsBySubEventSync,
  addSpreadsheet,
  deleteSpreadsheet,
  extractSheetId,
  DEFAULT_SHEETS
};
