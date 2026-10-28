const fs = require('fs');
const path = require('path');
const config = require('../config');

let cachedDriveItems = [];
let lastDriveFetch = 0;
const subfolderCache = new Map();

const UPLOADS_DIR = path.join(__dirname, '../../public/uploads');
const UPLOADS_META_FILE = path.join(__dirname, '../../data/uploaded_files.json');

function ensureUploadsDir() {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
  const dataDir = path.dirname(UPLOADS_META_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

function loadUploadedFilesMeta() {
  ensureUploadsDir();
  if (!fs.existsSync(UPLOADS_META_FILE)) {
    return [];
  }
  try {
    const raw = fs.readFileSync(UPLOADS_META_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading uploaded files meta:', err.message);
    return [];
  }
}

function saveUploadedFilesMeta(list) {
  ensureUploadsDir();
  try {
    fs.writeFileSync(UPLOADS_META_FILE, JSON.stringify(list, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving uploaded files meta:', err.message);
  }
}

/**
 * Format bytes to readable size (KB, MB)
 */
function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Classify file type and icon by extension or mime
 */
function classifyFileType(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  if (['.xlsx', '.xls', '.csv', '.ods'].includes(ext)) {
    return { type: 'sheet', icon: '📊' };
  } else if (['.pdf'].includes(ext)) {
    return { type: 'pdf', icon: '📑' };
  } else if (['.pptx', '.ppt', '.key'].includes(ext)) {
    return { type: 'presentation', icon: '📽️' };
  } else if (['.docx', '.doc', '.txt', '.md'].includes(ext)) {
    return { type: 'document', icon: '📝' };
  } else if (['.png', '.jpg', '.jpeg', '.svg', '.webp'].includes(ext)) {
    return { type: 'image', icon: '🖼️' };
  }
  return { type: 'file', icon: '📄' };
}

/**
 * Helper to parse a row in Google Drive folder HTML
 */
function parseDriveRow(id, rowHtml) {
  const cells = [...rowHtml.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map(td => 
    td[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  );

  let rawName = cells[0] || '';
  let date = cells[1] || '';
  let size = cells[2] || '';

  // Clean rawName from Google labels & suffixes
  let name = rawName
    .replace(/^Google Sheets\s+/i, '')
    .replace(/^Microsoft Excel\s+/i, '')
    .replace(/^Microsoft Word\s+/i, '')
    .replace(/^Microsoft PowerPoint\s+/i, '')
    .replace(/^Google Docs\s+/i, '')
    .replace(/^PDF\s+/i, '')
    .replace(/—\s*Download/gi, '')
    .replace(/Download/gi, '')
    .replace(/Dibagikan/gi, '')
    .replace(/Shared/gi, '')
    .replace(/&amp;/g, '&')
    .trim();

  // If name is empty, extract text from rowHtml
  if (!name) {
    name = rowHtml.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').replace(/—\s*Download/gi, '').replace(/Download/gi, '').trim();
  }

  const isDashSize = !size || size.includes('—') || size === '-';
  const hasFileExt = /\.(xlsx|xls|pdf|docx|doc|pptx|ppt|png|jpg|mp4|zip|csv|txt)$/i.test(name);
  const isSheetName = /MASTERSHEET|Spreadsheet|Sheet/i.test(name) || /Google Sheets/i.test(rawName);

  const isFolder = isDashSize && !hasFileExt && !isSheetName;

  let { type, icon } = classifyFileType(name);
  if (isFolder) {
    type = 'folder';
    icon = '📁';
  } else if (isSheetName) {
    type = 'sheet';
    icon = '📊';
  }

  return {
    id,
    name,
    isFolder,
    type,
    icon,
    isConfigured: true,
    size: isFolder ? 'Folder' : (size || 'File'),
    date: date || 'Terbaru',
    previewUrl: isFolder ? null : (type === 'sheet' ? `https://docs.google.com/spreadsheets/d/${id}/htmlembed?widget=true` : `https://drive.google.com/file/d/${id}/preview`),
    editUrl: type === 'sheet' ? `https://docs.google.com/spreadsheets/d/${id}/edit?embedded=true` : null,
    externalUrl: isFolder ? `https://drive.google.com/drive/folders/${id}` : `https://drive.google.com/file/d/${id}/view`,
    url: isFolder ? `https://drive.google.com/drive/folders/${id}` : `https://drive.google.com/file/d/${id}/view`,
    isLocalUpload: false
  };
}

/**
 * Simpan file unggahan baru ke dalam storage lokal web & tautkan ke folder Google Drive
 */
async function saveUploadedFile({ folderId, folderName = '', fileName, fileData, fileType = '' }) {
  ensureUploadsDir();

  // Bersihkan nama file dari karakter liar
  const cleanBaseName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const uniqueName = Date.now() + '_' + cleanBaseName;
  const filePath = path.join(UPLOADS_DIR, uniqueName);

  // Decode base64
  let base64Content = fileData;
  if (fileData.includes('base64,')) {
    base64Content = fileData.split('base64,')[1];
  }
  const buffer = Buffer.from(base64Content, 'base64');
  fs.writeFileSync(filePath, buffer);

  const stats = fs.statSync(filePath);
  const { type, icon } = classifyFileType(cleanBaseName);
  const formattedSize = formatFileSize(stats.size);

  const fileEntry = {
    id: 'local_' + Date.now(),
    name: fileName,
    folderId,
    folderName,
    isFolder: false,
    type,
    icon,
    size: formattedSize,
    date: 'Hari ini',
    previewUrl: `/uploads/${uniqueName}`,
    editUrl: type === 'sheet' ? `/uploads/${uniqueName}` : null,
    externalUrl: `/uploads/${uniqueName}`,
    url: `/uploads/${uniqueName}`,
    fileName: uniqueName,
    filePath,
    isLocalUpload: true,
    uploadedAt: new Date().toISOString()
  };

  const allMeta = loadUploadedFilesMeta();
  allMeta.unshift(fileEntry);
  saveUploadedFilesMeta(allMeta);

  // Invalidate subfolder cache so the new file shows immediately
  if (subfolderCache.has(folderId)) {
    subfolderCache.delete(folderId);
  }

  return fileEntry;
}

/**
 * Mengambil daftar 7 folder utama secara live dari Google Drive Safari Faculty
 */
async function fetchRealDriveItems() {
  const now = Date.now();
  if (cachedDriveItems.length > 0 && now - lastDriveFetch < 60000) {
    return cachedDriveItems;
  }

  const folderUrl = config.DRIVE_LINKS.mainDriveFolder;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(folderUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();

    const trMatches = [...html.matchAll(/<tr[^>]*data-id="([^"]+)"[^>]*>([\s\S]*?)<\/tr>/gi)];
    const items = [];

    for (let match of trMatches) {
      const parsed = parseDriveRow(match[1], match[2]);
      if (parsed.name && parsed.id) {
        items.push({
          ...parsed,
          isFolder: true, // Root items are all folders
          icon: '📁',
          type: 'folder'
        });
      }
    }

    lastDriveFetch = now;
    if (items.length > 0) {
      cachedDriveItems = items;
      return items;
    }

    return cachedDriveItems.length > 0 ? cachedDriveItems : getVerifiedFallbackDriveItems();
  } catch (err) {
    console.error('Error fetching live Google Drive folder:', err.message);
    lastDriveFetch = now; // Enforce cooldown on error to prevent request spam
    return cachedDriveItems.length > 0 ? cachedDriveItems : getVerifiedFallbackDriveItems();
  }
}

/**
 * Mengambil isi file & subfolder di dalam sebuah folder Google Drive + Berkas Lokal yang diunggah
 */
async function fetchSubfolderContents(folderId, folderName = '') {
  // Check local uploads for this folder
  const allUploads = loadUploadedFilesMeta();
  const localItems = allUploads.filter(u => u.folderId === folderId);

  if (subfolderCache.has(folderId)) {
    const cached = subfolderCache.get(folderId);
    if (Date.now() - cached.timestamp < 60000) {
      // Merge cached Google files with current local uploads
      const combined = [...localItems, ...cached.googleItems];
      return {
        folderId,
        folderName: folderName || cached.folderName,
        fileCount: combined.length,
        files: combined,
        items: combined
      };
    }
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(`https://drive.google.com/drive/folders/${folderId}`, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();

    const trMatches = [...html.matchAll(/<tr[^>]*data-id="([^"]+)"[^>]*>([\s\S]*?)<\/tr>/gi)];
    const googleItems = [];

    for (let m of trMatches) {
      const parsed = parseDriveRow(m[1], m[2]);
      googleItems.push(parsed);
    }

    const combined = [...localItems, ...googleItems];

    const result = {
      folderId,
      folderName,
      fileCount: combined.length,
      files: combined,
      items: combined
    };

    subfolderCache.set(folderId, {
      timestamp: Date.now(),
      folderName,
      googleItems
    });

    return result;
  } catch (err) {
    console.error(`Error fetching subfolder ${folderId}:`, err.message);
    // Cache empty list with timestamp to avoid spamming
    subfolderCache.set(folderId, {
      timestamp: Date.now(),
      folderName,
      googleItems: []
    });
    const combined = [...localItems];
    return {
      folderId,
      folderName,
      fileCount: combined.length,
      files: combined,
      items: combined
    };
  }
}

function getVerifiedFallbackDriveItems() {
  return [
    { id: '1DSOx32F8u52IQHk9RCbnFnrkBheGFZJ4', name: '00. Kebutuhan Bolang SF 15 Okt', isFolder: true, type: 'folder', icon: '📁', size: 'Folder', date: '15 Okt', url: 'https://drive.google.com/drive/folders/1DSOx32F8u52IQHk9RCbnFnrkBheGFZJ4', externalUrl: 'https://drive.google.com/drive/folders/1DSOx32F8u52IQHk9RCbnFnrkBheGFZJ4' },
    { id: '1cweHx69AeISKV9LTEvNKewLXFh8CdxeQ', name: '01. Faculty Material 24 Okt', isFolder: true, type: 'folder', icon: '📁', size: 'Folder', date: '24 Okt', url: 'https://drive.google.com/drive/folders/1cweHx69AeISKV9LTEvNKewLXFh8CdxeQ', externalUrl: 'https://drive.google.com/drive/folders/1cweHx69AeISKV9LTEvNKewLXFh8CdxeQ' },
    { id: '1FavRxdUPcXqQK7Ues_h0vVPlg7SaMvQC', name: '02. Gathering HMD & BEM-F 15 Okt', isFolder: true, type: 'folder', icon: '📁', size: 'Folder', date: '15 Okt', url: 'https://drive.google.com/drive/folders/1FavRxdUPcXqQK7Ues_h0vVPlg7SaMvQC', externalUrl: 'https://drive.google.com/drive/folders/1FavRxdUPcXqQK7Ues_h0vVPlg7SaMvQC' },
    { id: '1s1KN-yoCYX8DIZOE0smtoEfuU4PEB7Hp', name: '03. Kebutuhan Surat 15 Okt', isFolder: true, type: 'folder', icon: '📁', size: 'Folder', date: '15 Okt', url: 'https://drive.google.com/drive/folders/1s1KN-yoCYX8DIZOE0smtoEfuU4PEB7Hp', externalUrl: 'https://drive.google.com/drive/folders/1s1KN-yoCYX8DIZOE0smtoEfuU4PEB7Hp' },
    { id: '1CPlTQQWYqHILgQ7CUzhSeldNB3jxw9wu', name: '04. PPT HMD 15 Okt', isFolder: true, type: 'folder', icon: '📁', size: 'Folder', date: '15 Okt', url: 'https://drive.google.com/drive/folders/1CPlTQQWYqHILgQ7CUzhSeldNB3jxw9wu', externalUrl: 'https://drive.google.com/drive/folders/1CPlTQQWYqHILgQ7CUzhSeldNB3jxw9wu' },
    { id: '19vJ0oy_56JV34RCRoIkZYbGE_QOMohHI', name: '05. Notulensi 15 Okt', isFolder: true, type: 'folder', icon: '📁', size: 'Folder', date: '15 Okt', url: 'https://drive.google.com/drive/folders/19vJ0oy_56JV34RCRoIkZYbGE_QOMohHI', externalUrl: 'https://drive.google.com/drive/folders/19vJ0oy_56JV34RCRoIkZYbGE_QOMohHI' },
    { id: '1T2y44ygz4gSRNpucllPdnuoHpKDwem1G', name: '06. Request 15 Okt', isFolder: true, type: 'folder', icon: '📁', size: 'Folder', date: '15 Okt', url: 'https://drive.google.com/drive/folders/1T2y44ygz4gSRNpucllPdnuoHpKDwem1G', externalUrl: 'https://drive.google.com/drive/folders/1T2y44ygz4gSRNpucllPdnuoHpKDwem1G' }
  ];
}

const DRIVE_FOLDERS_FILE = path.join(__dirname, '../../data/drive_folders.json');

const SUB_EVENT_DRIVE_DEFAULTS = {
  safari: {
    folderId: '1a-JbvPXcU0o9gWDrQEJUGZaQXTM6LQQp',
    name: '01. SF (Safari Faculty) Drive Repository',
    icon: '🏛️',
    isRealGoogleDrive: true,
    url: config.DRIVE_LINKS.mainDriveFolder
  },
  startpoint: {
    folderId: 'folder_startpoint',
    name: '02. SP (Start Point) Drive Repository',
    icon: '🚀',
    isRealGoogleDrive: false,
    url: null
  },
  odl: {
    folderId: 'folder_odl',
    name: '03. ODL (One Day Lecture) Drive Repository',
    icon: '🎓',
    isRealGoogleDrive: false,
    url: null
  },
  technocraft: {
    folderId: 'folder_technocraft',
    name: '04. TC (Technocraft) Drive Repository',
    icon: '⚡',
    isRealGoogleDrive: false,
    url: null
  }
};

function loadCustomDriveFolders() {
  if (!fs.existsSync(DRIVE_FOLDERS_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(DRIVE_FOLDERS_FILE, 'utf8'));
  } catch (e) {
    return {};
  }
}

function saveCustomDriveFolders(map) {
  const dir = path.dirname(DRIVE_FOLDERS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DRIVE_FOLDERS_FILE, JSON.stringify(map, null, 2), 'utf8');
}

function getSubEventDriveConfig(subEventId) {
  const customMap = loadCustomDriveFolders();
  const def = SUB_EVENT_DRIVE_DEFAULTS[subEventId] || {
    folderId: `folder_${subEventId}`,
    name: `Repositori ${subEventId.toUpperCase()}`,
    icon: '📁',
    isRealGoogleDrive: false,
    url: null
  };
  return { ...def, ...(customMap[subEventId] || {}) };
}

async function fetchSubEventDriveContents(subEventId) {
  const driveCfg = getSubEventDriveConfig(subEventId);
  const allUploads = loadUploadedFilesMeta();
  const localItems = allUploads.filter(u => u.folderId === driveCfg.folderId || u.subEventId === subEventId);

  if (driveCfg.isRealGoogleDrive && driveCfg.folderId && !driveCfg.folderId.startsWith('folder_')) {
    const result = await fetchSubfolderContents(driveCfg.folderId, driveCfg.name);
    return {
      subEventId,
      folderId: driveCfg.folderId,
      folderName: driveCfg.name,
      icon: driveCfg.icon,
      isConfigured: true,
      fileCount: result.fileCount,
      files: result.files,
      items: result.items
    };
  }

  const combined = [...localItems];
  return {
    subEventId,
    folderId: driveCfg.folderId,
    folderName: driveCfg.name,
    icon: driveCfg.icon,
    isConfigured: combined.length > 0 || !!driveCfg.url,
    fileCount: combined.length,
    files: combined,
    items: combined
  };
}

function extractDriveFolderId(input) {
  if (!input || typeof input !== 'string') return null;
  const str = input.trim();
  
  // 1. Folders pattern (/folders/<id>)
  const folderMatch = str.match(/\/folders\/([a-zA-Z0-9-_]{20,})/);
  if (folderMatch) return folderMatch[1];

  // 2. File pattern (/file/d/<id>)
  const fileMatch = str.match(/\/file\/d\/([a-zA-Z0-9-_]{20,})/);
  if (fileMatch) return fileMatch[1];

  // 3. Query param id pattern (?id=<id> or &id=<id>)
  const paramMatch = str.match(/[?&]id=([a-zA-Z0-9-_]{20,})/);
  if (paramMatch) return paramMatch[1];

  // 4. Raw Google ID string (20 to 60 alphanumeric + dash/underscore characters)
  if (/^[a-zA-Z0-9-_]{20,60}$/.test(str)) {
    return str;
  }

  return null;
}

function saveSubEventDriveLink(subEventId, urlOrId) {
  if (!urlOrId) return false;
  const cleanId = extractDriveFolderId(urlOrId);
  if (!cleanId) {
    throw new Error('ID atau Link Google Drive tidak valid. Pastikan link berformat drive.google.com/drive/folders/...');
  }

  const map = loadCustomDriveFolders();
  map[subEventId] = {
    folderId: cleanId,
    url: `https://drive.google.com/drive/folders/${cleanId}`,
    isRealGoogleDrive: true
  };
  saveCustomDriveFolders(map);

  // Invalidate cache
  subfolderCache.delete(cleanId);

  // Async sync to Supabase Cloud
  try {
    const db = require('../db');
    db.query(`
      INSERT INTO drive_folders (sub_event_id, folder_id, url, is_real_google_drive, updated_at)
      VALUES ($1, $2, $3, $4, NOW())
      ON CONFLICT (sub_event_id) DO UPDATE SET
        folder_id = EXCLUDED.folder_id,
        url = EXCLUDED.url,
        is_real_google_drive = EXCLUDED.is_real_google_drive,
        updated_at = NOW();
    `, [subEventId, cleanId, map[subEventId].url, true]).catch(e => console.warn('Supabase drive sync err:', e.message));
  } catch (e) {}

  return map[subEventId];
}

module.exports = {
  fetchRealDriveItems,
  fetchSubfolderContents,
  fetchSubEventDriveContents,
  saveSubEventDriveLink,
  extractDriveFolderId,
  getSubEventDriveConfig,
  saveUploadedFile,
  loadUploadedFilesMeta,
  classifyFileType
};
