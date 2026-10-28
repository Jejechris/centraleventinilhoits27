const subEventsConfig = require('./subEventsConfig');
const sheetsService = require('./sheetsService');
const progressService = require('./progressService');
const geminiService = require('./geminiService');
const driveService = require('./driveService');
const staffService = require('./staffService');

const SUB_META = {
  safari: { id: 'safari', abbr: 'sf', code: 'SF', name: 'Safari Faculty', icon: '🏛️', dateStr: '10 Januari 2027' },
  startpoint: { id: 'startpoint', abbr: 'sp', code: 'SP', name: 'Start Point', icon: '🚀', dateStr: '08 Januari 2027' },
  odl: { id: 'odl', abbr: 'odl', code: 'ODL', name: 'One Day Lecture', icon: '🎓', dateStr: '08 Januari 2027' },
  technocraft: { id: 'technocraft', abbr: 'tcp', code: 'TCP', name: 'Technocraft Playhouse', icon: '⚡', dateStr: '08 Januari 2027' }
};

/**
 * Memproses pesan masuk dari WhatsApp (Personal Chat maupun Grup WA)
 * @param {Object} payload - Data webhook dari Fonnte
 * @returns {Promise<string|null>} - Teks balasan bot (atau null jika bukan command)
 */
async function handleIncomingMessage(payload) {
  if (!payload || !payload.message) return null;

  const rawMessage = payload.message.trim();
  const senderName = payload.name || 'Rekan Panitia';
  const isGroup = !!(
    (payload.id && payload.id.includes('@g.us')) || 
    (payload.sender && payload.sender.includes('@g.us'))
  );

  let cleanMsg = rawMessage;
  const hasPrefix = cleanMsg.startsWith('!') || cleanMsg.startsWith('/') || cleanMsg.startsWith('#');

  if (hasPrefix) {
    cleanMsg = cleanMsg.substring(1).trim();
  } else {
    // Jika tidak pakai tanda ! di chat pribadi
    if (!isGroup && /^(halo|hai|p|ping|assalamualaikum|siang|pagi|malam|bot)/i.test(cleanMsg)) {
      return getHelpMessage(senderName);
    }
    // Jika di grup atau chat pribadi ketik kata kunci langsung
    if (!/^(status|rundown|menu|help|planb|hujan|kpi|delay|database|db|staff|panitia|progress|prog|tanya|ai)\b/i.test(cleanMsg)) {
      return null;
    }
  }

  // Pisahkan perintah dan argumen
  const parts = cleanMsg.split(/\s+/);
  const command = parts[0].toLowerCase();
  const args = parts.slice(1).join(' ').trim();

  const currentSubId = subEventsConfig.getActiveSubEventId();

  switch (command) {
    case 'help':
    case 'menu':
    case 'start':
      return getHelpMessage(senderName);

    case 'status':
      return getStatusMessage(args);

    case 'progress':
    case 'prog':
      return progressService.formatProgressForWhatsApp(args || 'sf');

    case 'rundown':
      return await getRundownMessage(args);

    case 'delay':
      return handleDelayCommand(args, senderName);

    case 'planb':
    case 'hujan':
    case 'darurat':
      return getContingencyPlanMessage(args);

    case 'kpi':
      return getKpiMessage(args);

    case 'database':
    case 'db':
    case 'staff':
    case 'panitia':
      return staffService.formatStaffForWhatsApp(args || 'sf');

    case 'tanya':
    case 'ai':
      return await handleAiQuery(args, senderName, currentSubId);

    default:
      return `⚠️ Perintah *!${command}* tidak dikenali.\nKetik *!menu* untuk melihat daftar perintah resmi Central Event.`;
  }
}

/**
 * Menu Panduan Perintah
 */
function getHelpMessage(name) {
  return (
`🤖 *CENTRAL EVENT WHATSAPP BOT*
_Ini Lho ITS! 2027 • Komando Acara Pusat_
────────────────────────────
Halo *${name}*! 👋
Central Event terbagi menjadi *4 Sub-Divisi Utama*:
🏛️ *SF*  : Safari Faculty (10 Jan 2027)
🚀 *SP*  : Start Point (08 Jan 2027)
⚡ *TCP* : Technocraft Playhouse (08 Jan 2027)
🎓 *ODL* : One Day Lecture (08 Jan 2027)

Setiap perintah teknis mendukung parameter *[all/sf/sp/tcp/odl]*:

📋 *INFORMASI & OPERASIONAL*
• *!status [all/sf/sp/tcp/odl]* : Status kesiapan acara & countdown
• *!progress [all/sf/sp/tcp/odl]* : Tracker progress & milestone kerja
• *!rundown [all/sf/sp/tcp/odl]* : Sesi live rundown & jadwal agenda
• *!kpi [all/sf/sp/tcp/odl]* : Target peserta & keterlibatan HMD
• *!planb [all/sf/sp/tcp/odl]* : SOP kontinjensi darurat cuaca hujan

👥 *DATABASE & MANAJEMEN WAKTU*
• *!database [all/sf/sp/tcp/odl]* : Database personil panitia & LO
• *!delay [menit]* : Lapor pergeseran rundown (contoh: *!delay 10*)

🧠 *AI COPILOT GEMINI 3.5 FLASH*
• *!tanya [pertanyaan]* : Tanya apa saja seputar acara, pimpinan, & berkas drive

────────────────────────────
_Ketik perintah di atas di grup atau chat pribadi kapan saja!_`
  );
}

/**
 * Status Ringkas Kesiapan (Mendukung 4 Sub-Divisi & All)
 */
function getStatusMessage(args = '') {
  const subKey = subEventsConfig.normalizeSubKey(args);

  if (subKey === 'all') {
    const subs = ['safari', 'startpoint', 'odl', 'technocraft'];
    const delay = sheetsService.getDelay();
    const delayStr = delay > 0 ? `+${delay} Menit Delay` : 'Tepat Waktu (0 Delay)';

    let text = 
`🎯 *STATUS KESIAPAN 4 SUB-DIVISI CENTRAL EVENT*
_Ini Lho ITS! 2027 • Laporan Komando Pusat_
────────────────────────────\n`;

    subs.forEach(id => {
      const meta = SUB_META[id];
      const sub = subEventsConfig.getSubEvent(id) || {};
      const dateStatus = sheetsService.getEventDateStatus(id);
      const progress = progressService.getProgress(id) || {};

      text += `${meta.icon} *${meta.name} (${meta.code})*\n`;
      text += `• Pelaksanaan: ${sub.dateStr || meta.dateStr} (H-${dateStatus.daysUntil ?? '--'} Hari)\n`;
      text += `• Progres: *${progress.percentage || 0}%*\n`;
      text += `• Target: ${sub.kpi?.targetPeserta || '-'}\n\n`;
    });

    text += `────────────────────────────
⏱️ *Status Jadwal:* ${delayStr}
💡 Ketik: *!status sf* | *!status sp* | *!status tcp* | *!status odl*`;
    return text;
  }

  const targetId = subKey || 'safari';
  const meta = SUB_META[targetId] || SUB_META.safari;
  const subEvent = subEventsConfig.getSubEvent(targetId);
  const dateStatus = sheetsService.getEventDateStatus(targetId);
  const progress = progressService.getProgress(targetId) || {};
  const delay = sheetsService.getDelay();
  const delayStr = delay > 0 ? `\n⚠️ *Pergeseran Waktu:* +${delay} Menit` : '\n⏱️ *Jadwal:* Sesuai Rundown (0 Menit Delay)';

  return (
`🎯 *STATUS KESIAPAN: ${meta.name.toUpperCase()}*
_Sub-Divisi ${meta.name} (${meta.code}) • Ini Lho ITS! 2027_
────────────────────────────
📅 *Hari-H Pelaksanaan:* ${subEvent.dateStr || meta.dateStr}
⏳ *Hitung Mundur:* *H-${dateStatus.daysUntil ?? '--'} Hari* Menuju Hari-H
📊 *Progress Staff Ahli:* *${progress.percentage || 0}%*
📝 *Status Lapangan:* ${progress.statusLabel || 'Persiapan konsep & modul'}
👥 *Target Peserta:* ${subEvent.kpi?.targetPeserta || 'Terkondisikan'}
🏛️ *Keterlibatan:* ${subEvent.kpi?.keterlibatan || 'Panitia & LO'}${delayStr}
────────────────────────────
💡 *Cek Sub-Divisi Lainnya:*
Ketik: *!status all* | *!status sp* | *!status tcp* | *!status odl*`
  );
}

/**
 * Informasi Rundown Terkini (Mendukung 4 Sub-Divisi & All)
 */
async function getRundownMessage(args = '') {
  try {
    const subKey = subEventsConfig.normalizeSubKey(args);

    if (subKey === 'all') {
      const subs = ['safari', 'startpoint', 'odl', 'technocraft'];
      let out = 
`📋 *JADWAL PELAKSANAAN 4 SUB-DIVISI CENTRAL EVENT*
_Ini Lho ITS! 2027 • Master Agenda_
────────────────────────────\n`;
      for (const id of subs) {
        const meta = SUB_META[id];
        const sub = subEventsConfig.getSubEvent(id);
        const rundown = await sheetsService.getRundown(id);
        out += `${meta.icon} *${meta.name} (${meta.code})* — ${sub.dateStr}\n`;
        out += `📍 Venue: ${sub.venue}\n`;
        out += `⏱️ Total Sesi: ${rundown.length} Agenda Terjadwal\n\n`;
      }
      out += `────────────────────────────
💡 Ketik: *!rundown sf* | *!rundown sp* | *!rundown tcp* | *!rundown odl*`;
      return out;
    }

    const targetId = subKey || 'safari';
    const meta = SUB_META[targetId] || SUB_META.safari;
    const sessionData = await sheetsService.getCurrentAndNextSession(null, targetId);
    const rundown = await sheetsService.getRundown(targetId);
    const delay = sheetsService.getDelay();
    const simTime = sheetsService.getSimulationTime();

    let output = 
`📋 *MASTER RUNDOWN: ${meta.name.toUpperCase()}*
_Sub-Divisi ${meta.name} (${meta.code}) • Ini Lho ITS! 2027_
────────────────────────────\n`;

    if (simTime) {
      output += `🎮 *Mode Simulasi Aktif:* ${simTime} WIB\n`;
    }
    if (delay > 0) {
      output += `⚠️ *Delay Terdeteksi:* +${delay} Menit dari jadwal asli\n`;
    }

    if (sessionData.current) {
      const c = sessionData.current;
      output += 
`\n🟢 *SESI BERLANGSUNG SEKARANG:*
• *Kegiatan:* ${c.session || c.title || 'Sesi Aktif'}
• *Waktu:* ${c.adjustedStart || c.start} - ${c.adjustedEnd || c.end} WIB
• *PIC:* ${c.pic || 'Koordinator Acara'}\n`;
    } else {
      output += `\nℹ️ *Status Sesi:* Belum ada sesi berlangsung saat ini.\n`;
    }

    if (sessionData.next) {
      const n = sessionData.next;
      output += 
`\n⏭️ *SESI BERIKUTNYA:*
• *Kegiatan:* ${n.session || n.title || 'Sesi Berikutnya'}
• *Waktu:* ${n.adjustedStart || n.start} - ${n.adjustedEnd || n.end} WIB
• *PIC:* ${n.pic || 'Koordinator Acara'}\n`;
    }

    if (rundown.length > 0) {
      output += `\n📑 *Ringkasan Agenda (${rundown.length} Sesi):*\n`;
      const preview = rundown.slice(0, 5);
      preview.forEach((r, idx) => {
        output += `${idx + 1}. [${r.adjustedStart || r.start}-${r.adjustedEnd || r.end}] ${r.title}\n`;
      });
      if (rundown.length > 5) {
        output += `_...dan ${rundown.length - 5} sesi lainnya di web dashboard._\n`;
      }
    }

    output += `────────────────────────────
💡 Ketik: *!rundown all* | *!rundown sp* | *!rundown tcp* | *!rundown odl*`;
    return output;
  } catch (e) {
    return `❌ Gagal mengambil data rundown: ${e.message}`;
  }
}

/**
 * Lapor Delay Waktu Rundown
 */
function handleDelayCommand(delayArg, username) {
  if (!delayArg) {
    const current = sheetsService.getDelay();
    return `⏱️ Pergeseran waktu (delay) saat ini adalah: *+${current} Menit*.\nUntuk mengubah, ketik: *!delay [jumlah_menit]* (Contoh: *!delay 10* atau *!delay 0* untuk reset).`;
  }

  const minutes = parseInt(delayArg, 10);
  if (isNaN(minutes)) {
    return `⚠️ Format menit tidak valid. Masukkan angka bulat.\nContoh: *!delay 10* atau *!delay 0*`;
  }

  sheetsService.setDelay(minutes);

  return (
`⚠️ *PEMBERITAHUAN PERGESERAN WAKTU (DELAY)*
────────────────────────────
⏱️ *Status Delay Baru:* *${minutes > 0 ? `+${minutes} Menit` : '0 Menit (Tepat Waktu)'}*
👤 *Diperbarui Oleh:* ${username}
⏰ *Waktu Lapor:* ${new Date().toLocaleTimeString('id-ID')} WIB
────────────────────────────
Seluruh durasi sesi di web dashboard otomatis disesuaikan!`
  );
}

/**
 * SOP Kontinjensi Darurat Cuaca Hujan (Mendukung 4 Sub-Divisi & All)
 */
function getContingencyPlanMessage(args = '') {
  const subKey = subEventsConfig.normalizeSubKey(args);

  if (subKey === 'all' || !args) {
    const subs = ['safari', 'startpoint', 'odl', 'technocraft'];
    let text = 
`🚨 *SOP KONTINJENSI CUACA HUJAN (PLAN B) 4 SUB-DIVISI*
_Ini Lho ITS! 2027 • Protokol Evakuasi & Jalur Tertutup_
────────────────────────────\n`;

    subs.forEach(id => {
      const meta = SUB_META[id];
      const sub = subEventsConfig.getSubEvent(id) || {};
      text += `${meta.icon} *${meta.name} (${meta.code}):*\n`;
      text += `${sub.contingency || 'Mengikuti SOP umum panitia Central Event.'}\n\n`;
    });

    text += `────────────────────────────
⚠️ *Instruksi Lapangan:* Seluruh LO Kluster koordinasi via HT Ch 1 & pantau titik persimpangan beratap.
💡 Ketik: *!planb sf* | *!planb sp* | *!planb tcp* | *!planb odl*`;
    return text;
  }

  const targetId = subKey || 'safari';
  const meta = SUB_META[targetId] || SUB_META.safari;
  const subEvent = subEventsConfig.getSubEvent(targetId) || {};

  return (
`🚨 *SOP KONTINJENSI PLAN B: ${meta.name.toUpperCase()}*
_Sub-Divisi ${meta.name} (${meta.code}) • Protokol Evakuasi_
────────────────────────────
🌧️ *Protokol Darurat & Hujan:*
${subEvent.contingency || 'Mengikuti SOP umum panitia Central Event.'}

📋 *Instruksi Utama:*
1. *Rute Evakuasi:* Arahkan peserta ke selasar dan hall tertutup terdekat.
2. *Logistik K3:* Tim Medis & Logistik siaga membawa payung evakuasi & P3K.
3. *Komunikasi:* Seluruh PIC standby pada jalur komunikasi HT utama.
────────────────────────────
💡 *Cek Sub-Divisi Lain:*
Ketik: *!planb all* | *!planb sp* | *!planb tcp* | *!planb odl*`
  );
}

/**
 * Target KPI (Mendukung 4 Sub-Divisi & All)
 */
function getKpiMessage(args = '') {
  const subKey = subEventsConfig.normalizeSubKey(args);

  if (subKey === 'all' || !args) {
    const subs = ['safari', 'startpoint', 'odl', 'technocraft'];
    let text = 
`📊 *TARGET & KPI 4 SUB-DIVISI CENTRAL EVENT*
_Ini Lho ITS! 2027 • Scorecard Operasional_
────────────────────────────\n`;

    subs.forEach(id => {
      const meta = SUB_META[id];
      const sub = subEventsConfig.getSubEvent(id) || {};
      const kpi = sub.kpi || {};
      text += `${meta.icon} *${meta.name} (${meta.code})*\n`;
      text += `• Target Peserta: ${kpi.targetPeserta || '-'}\n`;
      text += `• Keterlibatan: ${kpi.keterlibatan || '-'}\n`;
      text += `• Indeks Kepuasan: ${kpi.kepuasan || '-'}\n\n`;
    });

    text += `────────────────────────────
💡 Ketik: *!kpi sf* | *!kpi sp* | *!kpi tcp* | *!kpi odl*`;
    return text;
  }

  const targetId = subKey || 'safari';
  const meta = SUB_META[targetId] || SUB_META.safari;
  const subEvent = subEventsConfig.getSubEvent(targetId) || {};
  const kpi = subEvent.kpi || {};

  return (
`📊 *TARGET & KPI: ${meta.name.toUpperCase()}*
_Sub-Divisi ${meta.name} (${meta.code}) • Ini Lho ITS! 2027_
────────────────────────────
👥 *Target Peserta:* ${kpi.targetPeserta || 'Terkondisikan'}
🏛️ *Keterlibatan:* ${kpi.keterlibatan || 'Panitia & LO'}
⭐ *Indeks Kepuasan:* ${kpi.kepuasan || 'Target 0.85 (Sangat Puas)'}
────────────────────────────
💡 *Cek Sub-Divisi Lain:*
Ketik: *!kpi all* | *!kpi sp* | *!kpi tcp* | *!kpi odl*`
  );
}

/**
 * Tanya Asisten AI Gemini 3.5 Flash
 */
async function handleAiQuery(question, username, subId) {
  if (!question) {
    return `🤖 Mau tanya apa ke AI Copilot?\nContoh: *!tanya siapa saja kasubdiv dan staffli central event?*`;
  }

  try {
    const progress = progressService.getProgress(subId) || {};
    const driveFiles = await driveService.fetchRealDriveItems();
    const dateStatus = sheetsService.getEventDateStatus(subId);

    const answer = await geminiService.askCopilot(question, {
      progress,
      realDriveFiles: driveFiles,
      dateStatus,
      subEventId: subId
    });

    return (
`🤖 *GEMINI 3.5 FLASH COPILOT*
────────────────────────────
💬 *Pertanyaan dari ${username}:*
_${question}_

💡 *Jawaban:*
${answer}
────────────────────────────
_Asisten AI Resmi Central Event ILI 2027_`
    );
  } catch (err) {
    return `❌ AI Copilot sedang sibuk: ${err.message}`;
  }
}

module.exports = {
  handleIncomingMessage
};
