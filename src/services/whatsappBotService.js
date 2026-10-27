const subEventsConfig = require('./subEventsConfig');
const sheetsService = require('./sheetsService');
const stageCheckService = require('./stageCheckService');
const progressService = require('./progressService');
const geminiService = require('./geminiService');
const driveService = require('./driveService');

/**
 * Memproses pesan masuk dari WhatsApp (Personal Chat maupun Grup WA)
 * @param {Object} payload - Data webhook dari Fonnte
 * @returns {Promise<string|null>} - Teks balasan bot (atau null jika bukan command)
 */
async function handleIncomingMessage(payload) {
  if (!payload || !payload.message) return null;

  const rawMessage = payload.message.trim();
  const senderNumber = payload.sender || payload.member || '';
  const senderName = payload.name || 'Rekan Panitia';
  const isGroup = !!(payload.id && payload.id.includes('@g.us'));

  // Hanya proses jika diawali tanda ! atau /
  if (!rawMessage.startsWith('!') && !rawMessage.startsWith('/')) {
    // Jika di chat pribadi (bukan grup) dan user menyapa
    if (!isGroup && /^(halo|hai|p|ping|assalamualaikum|siang|pagi|malam|bot)/i.test(rawMessage)) {
      return getHelpMessage(senderName);
    }
    return null;
  }

  // Pisahkan perintah dan argumen
  const cleanCmd = rawMessage.substring(1).trim();
  const parts = cleanCmd.split(/\s+/);
  const command = parts[0].toLowerCase();
  const args = parts.slice(1).join(' ').trim();

  const currentSubId = subEventsConfig.getActiveSubEventId();
  const subEvent = subEventsConfig.getSubEvent(currentSubId);

  switch (command) {
    case 'help':
    case 'menu':
    case 'start':
      return getHelpMessage(senderName);

    case 'status':
      return getStatusMessage(currentSubId, subEvent);

    case 'rundown':
      return await getRundownMessage(currentSubId, subEvent);

    case 'pos':
    case 'posko':
      return getStationsMessage(currentSubId, subEvent);

    case 'ready':
    case 'checkin':
      return handleStationCheckin(currentSubId, args, senderName);

    case 'delay':
      return handleDelayCommand(args, senderName);

    case 'planb':
    case 'hujan':
    case 'darurat':
      return getContingencyPlanMessage();

    case 'kpi':
      return getKpiMessage(subEvent);

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
Berikut daftar perintah yang dapat digunakan di grup maupun chat pribadi:

📋 *INFORMASI & JADWAL*
• *!status* : Rekap kesiapan acara, progress & countdown H-75
• *!rundown* : Sesi rundown live yang sedang berlangsung & sesi berikutnya
• *!pos* : Status kesiapan seluruh pos lab & titik kumpul
• *!kpi* : Target peserta 1.450 dan keterlibatan 39 HMD

⚡ *OPERASIONAL & LAPANGAN (LO / KORLAP)*
• *!ready [kode_pos]* : Check-in kesiapan pos (contoh: *!ready dept1*)
• *!delay [menit]* : Lapor pergeseran rundown (contoh: *!delay 10*)
• *!planb* : Panduan rute kontinjensi cuaca hujan / rute selasar

🧠 *AI COPILOT GEMINI 3.5 FLASH*
• *!tanya [pertanyaan]* : Tanya apa saja seputar acara & berkas drive
  _(Contoh: !tanya berkas apa saja yang ada di drive?)_

────────────────────────────
_Ketik perintah di atas di grup ini kapan saja!_`
  );
}

/**
 * Status Ringkas Kesiapan
 */
function getStatusMessage(subId, subEvent) {
  const dateStatus = sheetsService.getEventDateStatus(subId);
  const progress = progressService.getProgress(subId) || {};
  const stations = stageCheckService.getAllStations(subId);
  const readyCount = stations.filter(s => s.ready).length;
  const delay = sheetsService.getDelay();

  const delayStr = delay > 0 ? `\n⚠️ *Pergeseran Waktu:* +${delay} Menit` : '\n⏱️ *Jadwal:* Sesuai Rundown (0 Menit Delay)';

  return (
`🎯 *STATUS KESIAPAN CENTRAL EVENT*
_Ini Lho ITS! 2027 • Laporan Komando_
────────────────────────────
📌 *Sub-Acara:* ${subEvent.icon || '🏛️'} *${subEvent.name}*
📅 *Hari-H Pelaksanaan:* 10 Januari 2027
⏳ *Hitung Mundur:* *H-${dateStatus.daysUntil || 75} Hari* Menuju Hari-H
📊 *Progress Staff Ahli:* *${progress.percentage || 0}%*
📝 *Status Lapangan:* ${progress.statusLabel || 'Persiapan Modul & Rute'}
📡 *Kesiapan Pos:* *${readyCount}/${stations.length} Pos Siap*
👥 *Target Peserta:* 1.450 / 1.500 Hadir
🏛️ *Himpunan:* 39 HMD ITS (100% Aktif)${delayStr}
────────────────────────────
Ketik *!rundown* untuk mengecek sesi aktif saat ini.`
  );
}

/**
 * Informasi Rundown Terkini
 */
async function getRundownMessage(subId, subEvent) {
  try {
    const sessionData = await sheetsService.getCurrentAndNextSession(null, subId);
    const delay = sheetsService.getDelay();
    const simTime = sheetsService.getSimulationTime();

    let output = 
`📋 *MASTER RUNDOWN LIVE*
_${subEvent.name} • Ini Lho ITS! 2027_
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
      output += `\nℹ️ *Status:* Belum ada sesi yang aktif pada jam ini (Fase Persiapan Operasional H-75).\n`;
    }

    if (sessionData.next) {
      const n = sessionData.next;
      output += 
`\n⏭️ *SESI BERIKUTNYA:*
• *Kegiatan:* ${n.session || n.title || 'Sesi Berikutnya'}
• *Waktu:* ${n.adjustedStart || n.start} - ${n.adjustedEnd || n.end} WIB
• *PIC:* ${n.pic || 'Koordinator Acara'}\n`;
    }

    output += `────────────────────────────\nKetik *!pos* untuk cek kesiapan pos lab.`;
    return output;
  } catch (e) {
    return `❌ Gagal mengambil data rundown: ${e.message}`;
  }
}

/**
 * Daftar Kesiapan Pos Lapangan
 */
function getStationsMessage(subId, subEvent) {
  const stations = stageCheckService.getAllStations(subId);
  const readyCount = stations.filter(s => s.ready).length;

  let listStr = stations.map((s, idx) => {
    const icon = s.ready ? '✅' : '⏳';
    return `${idx + 1}. ${icon} *${s.name}* (${s.id})\n   PIC: ${s.pic} | Status: ${s.ready ? 'SIAP' : 'Menunggu'}`;
  }).join('\n');

  return (
`📡 *CHECKLIST KESIAPAN POS LAPANGAN*
_${subEvent.name} • ${readyCount}/${stations.length} Pos Siap_
────────────────────────────
${listStr}
────────────────────────────
💡 *Cara Check-in Pos (Untuk LO / Penjaga Pos):*
Ketik: *!ready [id_pos]*
_Contoh: !ready dept1 atau !ready gate_`
  );
}

/**
 * Check-in Pos oleh LO
 */
function handleStationCheckin(subId, stationArg, username) {
  if (!stationArg) {
    return `⚠️ Harap masukkan ID Pos yang ingin di-check-in.\nContoh: *!ready dept1* atau *!ready gate*\nKetik *!pos* untuk melihat daftar ID Pos.`;
  }

  const cleanId = stationArg.toLowerCase().trim();
  const stations = stageCheckService.getAllStations(subId);
  const found = stations.find(s => s.id.toLowerCase() === cleanId || s.name.toLowerCase().includes(cleanId));

  if (!found) {
    return `❌ Pos dengan ID *"${stationArg}"* tidak ditemukan.\nKetik *!pos* untuk melihat daftar pos yang tersedia.`;
  }

  const updated = stageCheckService.toggleStationReady(found.id, username, subId);

  return (
`✅ *KONFIRMASI CHECK-IN POS LAPANGAN*
────────────────────────────
📍 *Pos:* *${updated.name}* (${updated.id})
📊 *Status Sekarang:* ${updated.ready ? '✅ SIAP & STANDBY' : '⏳ KEMBALI DALAM PERSIAPAN'}
👤 *Diverifikasi Oleh:* ${username}
⏰ *Waktu:* ${updated.updatedAt}
────────────────────────────
Status otomatis disinkronkan ke Master Command Dashboard!`
  );
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
 * SOP Kontinjensi Darurat Cuaca Hujan
 */
function getContingencyPlanMessage() {
  return (
`🚨 *SOP KONTINJENSI CUACA HUJAN (PLAN B)*
_Ini Lho ITS! 2027 • Protokol Evakuasi & Jalur Tertutup_
────────────────────────────
🌧️ *Jika Hujan Deras Turun Saat Safari:*
1. *Rute Selasar:* Seluruh LO kluster wajib mengarahkan rombongan melalui selasar beratap gedung fakultas.
2. *Titik Evakuasi Kluster:*
   • Kluster Sains: Selasar Menara Sains & Hall FSAD
   • Kluster Teknologi Industri: Selasar Departemen Mesin & Elektro FTIRS
   • Kluster Vokasi & Sipil: Hall Gedung Riset & Selasar FTSPK
3. *Logistik:* Tim K3 & Perlengkapan siaga di titik persimpangan dengan payung evakuasi.
4. *Penyesuaian Waktu:* Durasi per pos dipadatkan -5 menit untuk menghindari kepulangan malam.

_Command Center standby memantau keselamatan peserta._`
  );
}

/**
 * Target KPI
 */
function getKpiMessage(subEvent) {
  const kpi = subEvent.kpi || {};
  return (
`📊 *TARGET & KPI CENTRAL EVENT*
_${subEvent.name} • Ini Lho ITS! 2027_
────────────────────────────
👥 *Target Peserta:* ${kpi.targetPeserta || '1.450 / 1.500 Hadir'}
🏛️ *Keterlibatan HMD:* ${kpi.keterlibatan || '39 HMD (100%)'}
⭐ *Indeks Kepuasan:* ${kpi.kepuasan || 'Target 0.85 (Sangat Puas)'}
────────────────────────────
Semangat mengawal kesuksesan Central Event!`
  );
}

/**
 * Tanya Asisten AI Gemini 3.5 Flash
 */
async function handleAiQuery(question, username, subId) {
  if (!question) {
    return `🤖 Mau tanya apa ke AI Copilot?\nContoh: *!tanya bagaimana pembagian 6 kluster fakultas di safari?*`;
  }

  try {
    const progress = progressService.getProgress(subId) || {};
    const driveFiles = await driveService.fetchRealDriveItems();
    const dateStatus = sheetsService.getEventDateStatus(subId);

    const answer = await geminiService.askCopilot(question, {
      progress,
      realDriveFiles: driveFiles,
      dateStatus
    });

    return (
`🤖 *GEMINI 3.5 FLASH COPILOT*
────────────────────────────
💬 *Pertanyaan dari ${username}:*
_"${question}"_

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
