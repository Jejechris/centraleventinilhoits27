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
  if (!clean || clean === 'sf' || clean === 'safari') return 'safari';
  if (clean === 'sp' || clean === 'startpoint' || clean === 'start_point') return 'startpoint';
  if (clean === 'odl' || clean === 'onedaylecture') return 'odl';
  if (clean === 'tc' || clean === 'technocraft' || clean === 'techno') return 'technocraft';
  if (clean === 'all' || clean === 'semua') return 'all';
  return 'safari';
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
function formatStaffForWhatsApp(subKey = 'safari') {
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
• *!database tc* : Detail Staff Technocraft`;

    return summaryText;
  }

  const subData = data[normalized];
  if (!subData) {
    return `⚠️ Database staff untuk kode *"${subKey}"* belum tersedia.\nKetik *!database sf* untuk melihat staff Safari Faculty.`;
  }

  const staffList = subData.staffList || [];
  const coreStaff = staffList.filter(s => s.role.includes('Kadiv') || s.role.includes('Wakadiv') || s.role.includes('Staff Ahli'));
  const loStaff = staffList.filter(s => s.role.includes('LO'));
  const fieldStaff = staffList.filter(s => !coreStaff.includes(s) && !loStaff.includes(s));

  let out = 
`👥 *DATABASE STAFF: ${subData.name.toUpperCase()} (${subData.code})*
_Ini Lho ITS! 2027 • Divisi Acara Pusat_
────────────────────────────
📌 *Sub-Acara:* ${subData.name}
👥 *Total Terdata:* ${staffList.length} Personil
🎯 *Fokus:* ${subData.tagline || '-'}
────────────────────────────\n`;

  let counter = 1;

  if (coreStaff.length > 0) {
    out += `⭐ *PIMPINAN & STAFF AHLI:*\n`;
    coreStaff.forEach(s => {
      const phoneClean = s.phone ? (s.phone.startsWith('62') ? `+${s.phone}` : s.phone) : '-';
      out += `${counter++}. *${s.name}* (${s.role})\n`;
      out += `   • Posisi: ${s.position || '-'}\n`;
      out += `   • Asal: ${s.dept || '-'}\n`;
      out += `   • Kontak: ${phoneClean} [${s.status || 'Aktif'}]\n\n`;
    });
  }

  if (loStaff.length > 0) {
    out += `🧭 *TIM LO PENDAMPING KLUSTER:*\n`;
    loStaff.forEach(s => {
      out += `${counter++}. *${s.name}* — ${s.position}\n`;
      out += `   • Asal: ${s.dept || '-'}\n`;
      out += `   • Kluster: ${s.cluster || '-'}\n\n`;
    });
  }

  if (fieldStaff.length > 0) {
    out += `🛡️ *TIM OPERASIONAL & LAPANGAN:*\n`;
    fieldStaff.forEach(s => {
      out += `${counter++}. *${s.name}* (${s.role})\n`;
      out += `   • Posisi: ${s.position || '-'}\n`;
      out += `   • Asal: ${s.dept || '-'}\n\n`;
    });
  }

  out += `────────────────────────────
💡 *Akses Cepat Sub-Divisi Lain:*
Ketik: *!database sf* | *!database sp* | *!database odl* | *!database tc*`;

  return out;
}

module.exports = {
  getStaffBySubEvent,
  getAllStaff,
  formatStaffForWhatsApp,
  normalizeSubEventKey,
  saveStaffData
};
