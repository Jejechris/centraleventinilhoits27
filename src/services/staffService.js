const fs = require('fs');
const path = require('path');

const STAFF_FILE = path.join(__dirname, '../../data/staff.json');

// In-memory cache for sub-millisecond response latency
let staffCache = null;

function loadStaffData() {
  if (staffCache) return staffCache;
  try {
    if (fs.existsSync(STAFF_FILE)) {
      const raw = fs.readFileSync(STAFF_FILE, 'utf8');
      staffCache = JSON.parse(raw);
    } else {
      staffCache = {};
    }
  } catch (err) {
    console.error('Error loading staff.json:', err.message);
    staffCache = {};
  }
  return staffCache;
}

function saveStaffData(data) {
  try {
    staffCache = data;
    fs.writeFileSync(STAFF_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error saving staff.json:', err.message);
    return false;
  }
}

/**
 * Normalisasi kode sub-event
 * sf, safari -> safari
 * sp, startpoint -> startpoint
 * odl -> odl
 * tc, technocraft -> technocraft
 */
function normalizeSubEventKey(key = '') {
  const clean = String(key || '').toLowerCase().trim();
  if (!clean || clean === 'all' || clean === 'semua') return 'all';
  if (clean === 'sf' || clean === 'safari') return 'safari';
  if (clean === 'sp' || clean === 'startpoint' || clean === 'start_point') return 'startpoint';
  if (clean === 'odl' || clean === 'onedaylecture') return 'odl';
  if (clean === 'tcp' || clean === 'tc' || clean === 'technocraft' || clean === 'techno') return 'technocraft';
  return 'all';
}

function getStaffBySubEvent(subKey) {
  const data = loadStaffData();
  const normalized = normalizeSubEventKey(subKey);
  return data[normalized] || null;
}

function getAllStaff() {
  return loadStaffData();
}

/**
 * Format database staff untuk balasan WhatsApp yang estetik, rapi, dan cepat
 */
function formatStaffForWhatsApp(subKey = 'all') {
  const data = loadStaffData();
  const normalized = normalizeSubEventKey(subKey);

  if (normalized === 'all') {
    let summaryText = 
`👥 *DATABASE MASTER STAFF CENTRAL EVENT*
_Ini Lho ITS! 2027 • Rekapitulasi Personil_
────────────────────────────\n`;

    const subKeys = ['safari', 'startpoint', 'odl', 'technocraft'];
    let totalAll = 0;

    subKeys.forEach(k => {
      const item = data[k];
      if (item) {
        const count = (item.staffList || []).length;
        totalAll += count;
        summaryText += `📌 *${item.name} (${item.code}):* ${count} Personil\n`;
      }
    });

    summaryText += `\n📊 *Total Personil Terdata:* ${totalAll} Staff
────────────────────────────
Ketik:
• *!database sf* : Detail Staff Safari Faculty
• *!database sp* : Detail Staff Start Point
• *!database odl* : Detail Staff One Day Lecture
• *!database tcp* : Detail Staff Technocraft Playhouse`;

    return summaryText;
  }

  const subData = data[normalized];
  if (!subData) {
    return `⚠️ Database staff untuk kode *"${subKey}"* belum tersedia.\nKetik *!database sf* untuk melihat staff Safari Faculty.`;
  }

  const staffList = subData.staffList || [];
  const leaders = staffList.filter(s => s.isLeader || s.role === 'Kasubdiv' || s.role === 'Wakasubdiv' || s.role === 'Sekretaris');
  const staffli = staffList.filter(s => !leaders.includes(s) && (s.isStaffli || s.role.includes('Staff Ahli')));
  const regularStaff = staffList.filter(s => !leaders.includes(s) && !staffli.includes(s));

  let out = 
`👥 *DATABASE STAFF: ${subData.name.toUpperCase()}*
────────────────────────────\n`;

  let counter = 1;

  if (leaders.length > 0) {
    out += `*Pimpinan Sub-Divisi:*\n`;
    leaders.forEach(s => {
      out += `${counter++}. *${s.name}* (${s.role})\n`;
    });
  }

  if (staffli.length > 0) {
    out += `\n*Staffli:*\n`;
    staffli.forEach(s => {
      out += `${counter++}. *${s.name}*\n`;
    });
  }

  if (regularStaff.length > 0) {
    out += `\n*Staff:*\n`;
    regularStaff.forEach(s => {
      out += `${counter++}. *${s.name}*\n`;
    });
  }

  out += `────────────────────────────
💡 Ketik: !database odl | !database sp | !database tcp`;

  return out;
}

module.exports = {
  getStaffBySubEvent,
  getAllStaff,
  formatStaffForWhatsApp,
  normalizeSubEventKey,
  saveStaffData
};
