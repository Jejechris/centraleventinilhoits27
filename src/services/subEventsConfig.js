const config = require('../config');

// 4 Inti Acara Resmi Divisi Central Event Ini Lho ITS! 2027
const defaultSubEvents = {
  safari: {
    id: 'safari',
    name: 'Safari Faculty',
    shortName: 'Safari Faculty',
    tagline: 'Eksplorasi Kampus, 6 Departemen & Laboratorium Riset Unggulan',
    dateStr: '10 Januari 2027',
    dateIso: '2027-01-10',
    venue: 'Seluruh Fakultas & Departemen Kampus ITS Sukolilo',
    pic: 'Koordinator Safari & Central Event',
    icon: '🏛️',
    gradient: 'from-blue-600 to-indigo-600',
    isLiveSheet: true,
    isPrimary: true,
    sheetId: config.GOOGLE_SHEET_ID,
    driveFolder: config.DRIVE_LINKS.mainDriveFolder,
    kpi: {
      targetPeserta: '1.450 / 1.500 Hadir',
      keterlibatan: '39 HMD (100%)',
      kepuasan: 'Target 0.85 (Sangat Puas)'
    },
    contingency: 'Plan A: Kelompok Sipil Manyar di TW 3 (Video + HMD). Plan B: Manyar di Day 1.',
    stations: [
      { id: 'gate', name: 'Titik Kumpul & Open Gate', pic: 'Kestari & Crowd Control', ready: false, updatedAt: '-' },
      { id: 'dept1', name: 'SF Departemen #1', pic: 'HMD & LO Dept 1', ready: false, updatedAt: '-' },
      { id: 'dept2', name: 'SF Departemen #2', pic: 'HMD & LO Dept 2', ready: false, updatedAt: '-' },
      { id: 'dept3', name: 'SF Departemen #3', pic: 'HMD & LO Dept 3', ready: false, updatedAt: '-' },
      { id: 'dept4', name: 'SF Departemen #4', pic: 'HMD & LO Dept 4', ready: false, updatedAt: '-' },
      { id: 'dept5', name: 'SF Departemen #5', pic: 'HMD & LO Dept 5', ready: false, updatedAt: '-' },
      { id: 'dept6', name: 'SF Departemen #6', pic: 'HMD & LO Dept 6', ready: false, updatedAt: '-' },
      { id: 'endpoint', name: 'Titik End Point Venue', pic: 'Central Event & Kestari', ready: false, updatedAt: '-' },
      { id: 'medis', name: 'Tim Medis & Keamanan K3', pic: 'K3 & Korlap', ready: false, updatedAt: '-' }
    ]
  },
  startpoint: {
    id: 'startpoint',
    name: 'Start Point',
    shortName: 'Start Point',
    tagline: 'Pusat Registrasi Akbar, Pengondisian Kluster & Mobilisasi Awal',
    dateStr: '03 Januari 2027',
    dateIso: '2027-01-03',
    venue: 'Plaza Utama & Gerbang Kampus ITS',
    pic: 'Koordinator Lapangan & Crowd Control',
    icon: '🚀',
    gradient: 'from-amber-500 to-orange-600',
    isLiveSheet: false,
    isPrimary: false,
    kpi: {
      targetPeserta: 'Menunggu Finalisasi',
      keterlibatan: '-',
      kepuasan: '-'
    },
    contingency: 'Menunggu input SOP resmi dari panitia pelaksana.',
    rundown: [],
    stations: []
  },
  odl: {
    id: 'odl',
    name: 'One Day Lecture',
    shortName: 'One Day Lecture',
    tagline: 'Simulasi Perkuliahan Nyata Interaktif Bersama Dosen ITS',
    dateStr: '16 Januari 2027',
    dateIso: '2027-01-16',
    venue: 'Gedung Menara Sains & Riset Terpadu ITS',
    pic: 'Koordinator Matmeth & Akademik',
    icon: '🎓',
    gradient: 'from-emerald-500 to-teal-600',
    isLiveSheet: false,
    isPrimary: false,
    kpi: {
      targetPeserta: 'Menunggu Finalisasi',
      keterlibatan: '-',
      kepuasan: '-'
    },
    contingency: 'Menunggu input SOP resmi dari panitia pelaksana.',
    rundown: [],
    stations: []
  },
  technocraft: {
    id: 'technocraft',
    name: 'Technocraft Playhouse',
    shortName: 'Technocraft',
    tagline: 'Wahana Eksperimen Sains, Robotika & Inovasi Teknologi Kreatif',
    dateStr: '23 Januari 2027',
    dateIso: '2027-01-23',
    venue: 'Gedung Robotika & Arena Technocraft ITS',
    pic: 'Koordinator Wahana & Show Stage',
    icon: '⚡',
    gradient: 'from-purple-600 to-pink-600',
    isLiveSheet: false,
    isPrimary: false,
    kpi: {
      targetPeserta: 'Menunggu Finalisasi',
      keterlibatan: '-',
      kepuasan: '-'
    },
    contingency: 'Menunggu input SOP resmi dari panitia pelaksana.',
    rundown: [],
    stations: []
  }
};

// In-memory editable copy of subEvents
let dynamicSubEvents = JSON.parse(JSON.stringify(defaultSubEvents));
let customRundowns = {}; // Stores custom/edited rundowns per subEventId
let activeSubEventId = 'safari';

function getActiveSubEventId() {
  return activeSubEventId;
}

function setActiveSubEventId(id) {
  if (dynamicSubEvents[id]) {
    activeSubEventId = id;
    return dynamicSubEvents[id];
  }
  return null;
}

function getSubEvent(id) {
  return dynamicSubEvents[id] || dynamicSubEvents['safari'];
}

function getAllSubEvents() {
  return Object.values(dynamicSubEvents);
}

// ==========================================
// CRUD / EDITING FUNCTIONS FOR STAFF
// ==========================================

function updateSubEventMetadata(subEventId, { venue, tagline, kpi, contingency }) {
  const sub = dynamicSubEvents[subEventId];
  if (!sub) return null;
  if (venue) sub.venue = venue;
  if (tagline) sub.tagline = tagline;
  if (contingency) sub.contingency = contingency;
  if (kpi) sub.kpi = { ...sub.kpi, ...kpi };
  return sub;
}

function getCustomRundown(subEventId) {
  return customRundowns[subEventId] || null;
}

function setCustomRundown(subEventId, list) {
  customRundowns[subEventId] = list;
  return customRundowns[subEventId];
}

function saveRundownItem(subEventId, item, baseRundown = []) {
  if (!customRundowns[subEventId]) {
    customRundowns[subEventId] = [...baseRundown];
  }
  const list = customRundowns[subEventId];
  
  if (item.id) {
    // Update existing item
    const idx = list.findIndex(r => String(r.id) === String(item.id));
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...item };
      return { action: 'updated', item: list[idx] };
    }
  }

  // Add new item
  const newId = Date.now();
  const newItem = {
    id: newId,
    start: item.start || '08:00',
    end: item.end || '08:30',
    title: item.title || 'Mata Acara Baru',
    location: item.location || 'Area Acara',
    pic: item.pic || 'Central Event Staff',
    notes: item.notes || '-'
  };
  list.push(newItem);
  return { action: 'created', item: newItem };
}

function deleteRundownItem(subEventId, itemId, baseRundown = []) {
  if (!customRundowns[subEventId]) {
    customRundowns[subEventId] = [...baseRundown];
  }
  const list = customRundowns[subEventId];
  const idx = list.findIndex(r => String(r.id) === String(itemId));
  if (idx !== -1) {
    const deleted = list.splice(idx, 1)[0];
    return deleted;
  }
  return null;
}

function resetSubEventToDefault(subEventId) {
  if (defaultSubEvents[subEventId]) {
    dynamicSubEvents[subEventId] = JSON.parse(JSON.stringify(defaultSubEvents[subEventId]));
    delete customRundowns[subEventId];
    return dynamicSubEvents[subEventId];
  }
  return null;
}

module.exports = {
  subEvents: dynamicSubEvents,
  getActiveSubEventId,
  setActiveSubEventId,
  getSubEvent,
  getAllSubEvents,
  updateSubEventMetadata,
  getCustomRundown,
  setCustomRundown,
  saveRundownItem,
  deleteRundownItem,
  resetSubEventToDefault
};
