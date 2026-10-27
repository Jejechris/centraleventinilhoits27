const fs = require('fs');
const path = require('path');
const config = require('../config');

const DATA_FILE = path.join(__dirname, '../../data/spreadsheets.json');

// Default initial spreadsheets for the 4 core sub-divisi of Central Event
// Safari has a verified live Google Sheet ID.
// Start Point, ODL, and Technocraft start as unconfigured until staff links or uploads them.
const DEFAULT_SHEETS = [
  {
    id: 'sheet_safari',
    sheetId: config.GOOGLE_SHEET_ID,
    name: '00. Master Rundown & Pos Checklist Safari Faculty',
    subEventId: 'safari',
    subEventName: 'Safari Faculty',
    icon: '🏛️',
    type: 'google',
    isConfigured: true,
    editUrl: `https://docs.google.com/spreadsheets/d/${config.GOOGLE_SHEET_ID}/edit?embedded=true&rm=minimal`,
    previewUrl: `https://docs.google.com/spreadsheets/d/${config.GOOGLE_SHEET_ID}/htmlembed?widget=true`,
    externalUrl: `https://docs.google.com/spreadsheets/d/${config.GOOGLE_SHEET_ID}/edit`,
    date: 'Aktif Terhubung',
    isDefault: true
  },
  {
    id: 'sheet_startpoint',
    sheetId: null,
    name: 'Master Registrasi, Kluster & Gating Start Point',
    subEventId: 'startpoint',
    subEventName: 'Start Point',
    icon: '🚀',
    type: 'google',
    isConfigured: false,
    editUrl: null,
    previewUrl: null,
    externalUrl: null,
    date: 'Belum Terhubung',
    isDefault: false
  },
  {
    id: 'sheet_odl',
    sheetId: null,
    name: 'Master Jadwal Kuliah & Lab Riset One Day Lecture',
    subEventId: 'odl',
    subEventName: 'One Day Lecture',
    icon: '🎓',
    type: 'google',
    isConfigured: false,
    editUrl: null,
    previewUrl: null,
    externalUrl: null,
    date: 'Belum Terhubung',
    isDefault: false
  },
  {
    id: 'sheet_technocraft',
    sheetId: null,
    name: 'Master Wahana, Alur Robotika & Demo Technocraft',
    subEventId: 'technocraft',
    subEventName: 'Technocraft',
    icon: '⚡',
    type: 'google',
    isConfigured: false,
    editUrl: null,
    previewUrl: null,
    externalUrl: null,
    date: 'Belum Terhubung',
    isDefault: false
  }
];

function ensureDataDir() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function loadCustomSheets() {
  ensureDataDir();
  if (!fs.existsSync(DATA_FILE)) {
    return [];
  }
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading custom spreadsheets:', err.message);
    return [];
  }
}

function saveCustomSheets(sheets) {
  ensureDataDir();
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(sheets, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving custom spreadsheets:', err.message);
  }
}

function getAllSpreadsheets() {
  const custom = loadCustomSheets();
  const merged = [];

  // Merge default sheets with any custom overrides
  for (const def of DEFAULT_SHEETS) {
    const customMatch = custom.find(c => c.subEventId === def.subEventId && (c.id === def.id || c.isSubEventPrimary));
    if (customMatch) {
      merged.push({ ...def, ...customMatch, isConfigured: true });
    } else {
      merged.push(def);
    }
  }

  // Add additional custom sheets that are not replacing default primaries
  for (const c of custom) {
    if (!merged.some(m => m.id === c.id)) {
      merged.push(c);
    }
  }

  return merged;
}

function getSpreadsheetsBySubEvent(subEventId) {
  const all = getAllSpreadsheets();
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

function addSpreadsheet({ name, sheetIdOrUrl, subEventId = 'all', uploadedFilePath = null, type = 'google' }) {
  const custom = loadCustomSheets();
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

  // Check if this sub-event already has a configured primary sheet
  const existingSheets = getSpreadsheetsBySubEvent(subEventId);
  const hasConfiguredPrimary = existingSheets.some(s => s.isConfigured && (s.isDefault || s.isSubEventPrimary));
  const isPrimary = !hasConfiguredPrimary;

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
      isSubEventPrimary: isPrimary,
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
      isSubEventPrimary: isPrimary,
      editUrl: `https://docs.google.com/spreadsheets/d/${cleanId}/edit?embedded=true&rm=minimal`,
      previewUrl: `https://docs.google.com/spreadsheets/d/${cleanId}/htmlembed?widget=true`,
      externalUrl: `https://docs.google.com/spreadsheets/d/${cleanId}/edit`,
      date: 'Tersambung Cloud',
      isDefault: false
    };
  }

  // If replacing unconfigured primary, filter old unconfigured placeholder; otherwise keep all sheets
  const filtered = custom.filter(c => !(c.subEventId === subEventId && !c.isConfigured));
  filtered.push(newEntry);
  saveCustomSheets(filtered);

  // Async sync to Supabase Cloud
  try {
    const db = require('../db');
    db.query(`
      INSERT INTO spreadsheets (id, sheet_id, name, sub_event_id, sub_event_name, icon, type, is_configured, is_sub_event_primary, edit_url, preview_url, external_url, date, is_default, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
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
      newEntry.subEventName, newEntry.icon, newEntry.type, true, true,
      newEntry.editUrl, newEntry.previewUrl, newEntry.externalUrl, newEntry.date, false
    ]).catch(e => console.warn('Supabase sheet sync err:', e.message));
  } catch (e) {}

  return newEntry;
}

function deleteSpreadsheet(id) {
  let custom = loadCustomSheets();
  const initialLength = custom.length;
  custom = custom.filter(s => s.id !== id);
  if (custom.length !== initialLength) {
    saveCustomSheets(custom);
    try {
      const db = require('../db');
      db.query('DELETE FROM spreadsheets WHERE id = $1', [id]).catch(() => {});
    } catch (e) {}
    return true;
  }
  return false;
}

module.exports = {
  getAllSpreadsheets,
  getSpreadsheetsBySubEvent,
  addSpreadsheet,
  deleteSpreadsheet,
  extractSheetId
};
