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
    abbr: 'sp',
    code: 'SP-02',
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
      targetPeserta: '1.500 Peserta Terkondisikan',
      keterlibatan: 'Seluruh LO Kluster & Korlap Lapangan',
      kepuasan: 'Target 0.90 (Sangat Tertib)'
    },
    contingency: 'Plan A: Lapangan Terbuka Plaza Utama. Plan B (Hujan): Relokasi registrasi & holding kluster ke Selasar Gedung Rektorat & Hall Utama.',
    rundown: [
      { id: 1, start: '06:00', end: '06:45', title: 'Briefing Panitia & Sterilisasi Plaza', location: 'Plaza Utama ITS', pic: 'Korlap & Central Event', notes: 'Koordinasi via HT Ch 1' },
      { id: 2, start: '06:45', end: '07:30', title: 'Open Gate & Registrasi Peserta', location: 'Gerbang & Plaza Utama', pic: 'Kestari & Crowd Control', notes: 'Verifikasi barcode tiket' },
      { id: 3, start: '07:30', end: '08:30', title: 'Opening Ceremony & Orasi Semangat', location: 'Panggung Plaza Utama', pic: 'Acara & Pimpinan ITS', notes: 'Sambutan Pimpinan' },
      { id: 4, start: '08:30', end: '09:15', title: 'Pengondisian & Pembagian Kluster', location: 'Holding Area Plaza', pic: 'LO Kluster & Pemandu', notes: 'Baris per fakultas' },
      { id: 5, start: '09:15', end: '09:45', title: 'Pelepasan Kontingen Menuju Sub-Acara', location: 'Gerbang Keberangkatan', pic: 'Korlap Lapangan', notes: 'Mobilisasi terarah' }
    ],
    stations: [
      { id: 'sp_gate', name: 'Gerbang Utama & Drop Zone', pic: 'Keamanan & Crowd Control', ready: false, updatedAt: '-' },
      { id: 'sp_reg', name: 'Meja Registrasi & Kit Peserta', pic: 'Kestari & Administrasi', ready: false, updatedAt: '-' },
      { id: 'sp_holding', name: 'Plaza Holding Kluster & Briefing', pic: 'Korlap & Pemandu', ready: false, updatedAt: '-' },
      { id: 'sp_transit', name: 'Titik Mobilisasi Keberangkatan', pic: 'Korlap Mobilisasi', ready: false, updatedAt: '-' },
      { id: 'sp_medis', name: 'Pos Medis & K3 Plaza', pic: 'Tim Medis & K3', ready: false, updatedAt: '-' }
    ]
  },
  odl: {
    id: 'odl',
    name: 'One Day Lecture',
    shortName: 'One Day Lecture',
    abbr: 'odl',
    code: 'ODL-03',
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
      targetPeserta: '600 Peserta Kuliah Interaktif',
      keterlibatan: '12 Dosen Tamu & LO Akademik',
      kepuasan: 'Target 0.88 (Sangat Interaktif)'
    },
    contingency: 'Plan A: Kuliah tatap muka 3 ruang teater Menara Sains. Plan B (Hujan/Kendala): Kelas dipusatkan di Auditorium Utama dengan relai hybrid.',
    rundown: [
      { id: 1, start: '07:30', end: '08:00', title: 'Open Gate & Presensi Kelas', location: 'Lobby Menara Sains', pic: 'Kestari & LO', notes: 'Check-in per kelas' },
      { id: 2, start: '08:00', end: '08:30', title: 'Matrikulasi & Pengantar Kuliah', location: 'Auditorium Menara Sains', pic: 'Dosen Koordinator', notes: 'Briefing akademik' },
      { id: 3, start: '08:30', end: '10:00', title: 'Sesi Kuliah Perdana (3 Kelas Paralel)', location: 'Teater 1, 2, dan 3', pic: 'Dosen ITS & LO', notes: 'Simulasi perkuliahan riil' },
      { id: 4, start: '10:00', end: '11:15', title: 'Bedah Kasus & Praktik Mini Riset', location: 'Ruang Diskusi Lantai 4', pic: 'Asisten Dosen & Tim', notes: 'Interaksi kelompok' },
      { id: 5, start: '11:15', end: '12:00', title: 'Pleno Diskusi & Evaluasi Kuliah', location: 'Auditorium Menara Sains', pic: 'Dosen & Central Event', notes: 'Penutupan sesi ODL' }
    ],
    stations: [
      { id: 'odl_reg', name: 'Presensi & Verifikasi Kelas Kuliah', pic: 'Kestari & Matmeth', ready: false, updatedAt: '-' },
      { id: 'odl_teater1', name: 'Ruang Teater #1 - Sains Terapan', pic: 'LO Kelas A & Dosen', ready: false, updatedAt: '-' },
      { id: 'odl_teater2', name: 'Ruang Teater #2 - Teknologi Informasi', pic: 'LO Kelas B & Dosen', ready: false, updatedAt: '-' },
      { id: 'odl_teater3', name: 'Ruang Teater #3 - Rekayasa & Bisnis', pic: 'LO Kelas C & Dosen', ready: false, updatedAt: '-' },
      { id: 'odl_medis', name: 'Pos Medis & Logistik Menara Sains', pic: 'Tim Medis & Logistik', ready: false, updatedAt: '-' }
    ]
  },
  technocraft: {
    id: 'technocraft',
    name: 'Technocraft Playhouse',
    shortName: 'Technocraft',
    abbr: 'tcp',
    code: 'TC-04',
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
      targetPeserta: '1.200 Pengunjung Wahana',
      keterlibatan: '15 Tim Robotika & Komunitas Riset ITS',
      kepuasan: 'Target 0.92 (Sangat Antusias)'
    },
    contingency: 'Plan A: Wahana Outdoor & Indoor Gedung Robotika. Plan B (Hujan): Relokasi seluruh stan hands-on ke Hall Utama Gedung Robotika.',
    rundown: [
      { id: 1, start: '08:00', end: '08:30', title: 'Open Gate & Pembagian Passport Wahana', location: 'Pintu Masuk Robotika', pic: 'Kestari Arena', notes: 'Distribusi tiket & gelang' },
      { id: 2, start: '08:30', end: '10:30', title: 'Eksplorasi Wahana Hands-on & Demo Robot', location: 'Arena Robotika Lantai 1', pic: 'Tim Robotika & LO', notes: '3 zona interaktif aktif' },
      { id: 3, start: '10:30', end: '11:45', title: 'Kompetisi Mini Inovasi Kreatif Peserta', location: 'Maker Space Area', pic: 'Juri & Fasilitator', notes: 'Challenging session' },
      { id: 4, start: '11:45', end: '12:30', title: 'Grand Show Stage & Penutupan', location: 'Main Stage Robotika', pic: 'Stage Manager & MC', notes: 'Awarding karya terfavorit' }
    ],
    stations: [
      { id: 'tcp_gate', name: 'Open Gate Arena & Passport Tiket', pic: 'Kestari Arena', ready: false, updatedAt: '-' },
      { id: 'tcp_robo', name: 'Arena Demonstrasi Robotika & AI', pic: 'Tim Robotika ITS', ready: false, updatedAt: '-' },
      { id: 'tcp_lab', name: 'Mini Lab Eksperimen Sains', pic: 'LO Wahana Sains', ready: false, updatedAt: '-' },
      { id: 'tcp_maker', name: 'Maker Space & Zona Coding', pic: 'LO Komputasi Kreatif', ready: false, updatedAt: '-' },
      { id: 'tcp_stage', name: 'Show Stage & Panggung Inovasi', pic: 'Stage Manager & MC', ready: false, updatedAt: '-' },
      { id: 'tcp_medis', name: 'Pos Medis & Keamanan Robotika', pic: 'Tim Medis & Korlap', ready: false, updatedAt: '-' }
    ]
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

const SUB_EVENT_LIST = ['safari', 'startpoint', 'odl', 'technocraft'];
const SUB_EVENT_ABBRS = {
  safari: 'sf',
  startpoint: 'sp',
  odl: 'odl',
  technocraft: 'tcp'
};

/**
 * Normalisasi kode sub-event untuk seluruh engine Central Event
 * Mendukung singkatan resmi: sf, sp, tcp, odl, all
 */
function normalizeSubKey(key = '') {
  const clean = String(key || '').toLowerCase().trim().replace(/[-_]/g, '');
  if (!clean || clean === 'sf' || clean === 'safari' || clean === 'safarifaculty') return 'safari';
  if (clean === 'sp' || clean === 'startpoint' || clean === 'start') return 'startpoint';
  if (clean === 'odl' || clean === 'onedaylecture') return 'odl';
  if (clean === 'tcp' || clean === 'tc' || clean === 'technocraft' || clean === 'techno' || clean === 'technocraftplayhouse') return 'technocraft';
  if (clean === 'all' || clean === 'semua') return 'all';
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
  resetSubEventToDefault,
  normalizeSubKey,
  SUB_EVENT_LIST,
  SUB_EVENT_ABBRS
};
