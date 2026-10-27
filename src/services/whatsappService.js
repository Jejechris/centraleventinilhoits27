const config = require('../config');

const FONNTE_API_URL = 'https://api.fonnte.com';

function getToken() {
  return process.env.FONNTE_TOKEN || config.FONNTE_TOKEN || '';
}

/**
 * Cek status perangkat WhatsApp di Fonnte
 */
async function getDeviceStatus() {
  const token = getToken();
  if (!token) {
    return {
      success: false,
      connected: false,
      error: 'FONNTE_TOKEN belum dipasang di file .env'
    };
  }

  try {
    const res = await fetch(`${FONNTE_API_URL}/device`, {
      method: 'POST',
      headers: {
        'Authorization': token
      }
    });

    const data = await res.json();
    const isConnected = data.device_status === 'connect';

    return {
      success: true,
      connected: isConnected,
      deviceNumber: data.device || '-',
      deviceName: data.name || 'Central Event ILITS 2027',
      quota: data.quota || '0',
      messagesSent: data.messages || 0,
      expired: data.expired || '-',
      raw: data
    };
  } catch (err) {
    console.error('Error checking Fonnte device status:', err.message);
    return {
      success: false,
      connected: false,
      error: err.message
    };
  }
}

/**
 * Kirim pesan WhatsApp ke nomor tujuan atau ID grup
 * @param {string} target - Nomor HP (contoh: 08123456789 atau 628123456789) atau Group ID
 * @param {string} message - Isi pesan teks (mendukung format *bold*, _italic_, dll)
 */
async function sendMessage(target, message) {
  const token = getToken();
  if (!token) {
    throw new Error('FONNTE_TOKEN belum dikonfigurasi di file .env');
  }

  if (!target || !message) {
    throw new Error('Nomor tujuan (target) dan isi pesan (message) wajib diisi.');
  }

  // Sanitasi nomor HP: jika bukan grup WA (@g.us), bersihkan format
  let cleanTarget = target.toString().trim();
  const isGroup = cleanTarget.includes('@g.us');
  if (!isGroup) {
    cleanTarget = cleanTarget.replace(/[\s\-\+]/g, '');
  }

  try {
    const payload = {
      target: cleanTarget,
      message: message
    };
    if (!isGroup) {
      payload.countryCode = '62';
    }

    const res = await fetch(`${FONNTE_API_URL}/send`, {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (data.status === true || data.status === 'true' || data.id) {
      return {
        success: true,
        target: cleanTarget,
        messageId: data.id || (data.target && data.target[0]) || 'sent',
        data
      };
    } else {
      throw new Error(data.reason || data.detail || 'Gagal mengirim pesan WhatsApp via Fonnte.');
    }
  } catch (err) {
    console.error(`WhatsApp send error to ${cleanTarget}:`, err.message);
    throw err;
  }
}

/**
 * Template Broadcast: Pemberitahuan Delay / Pergeseran Rundown
 */
async function broadcastDelay({ target, subEventName = 'Safari Faculty', sessionTitle = 'Sesi Lapangan', delayMinutes = 10, pic = 'Korlap & LO' }) {
  const message = 
`⚠️ *[CENTRAL EVENT ALERT: PERGESERAN WAKTU]*
_Ini Lho ITS! 2027 • Komando Acara Pusat_
────────────────────────────
📌 *Sub-Acara:* ${subEventName}
⏱️ *Pergeseran:* +${delayMinutes} Menit
📋 *Sesi Terkait:* ${sessionTitle}
👤 *PIC:* ${pic}
────────────────────────────
📢 *Instruksi Lapangan:*
Harap seluruh LO Kluster dan Penjaga Pos Departemen menyesuaikan waktu pemaparan materi agar rotasi kluster berikutnya tetap sinkron dan tidak memotong alokasi waktu ISHOMA.

_Pesan otomatis dari Central Event Command Center_`;

  return await sendMessage(target, message);
}

/**
 * Template Broadcast: Kontinjensi Darurat (Plan B / Cuaca Hujan)
 */
async function broadcastEmergency({ target, alertTitle = 'SKENARIO DARURAT (PLAN B)', location = 'Seluruh Venue ITS Sukolilo', instruction = 'Alihkan rombongan ke rute selasar tertutup.' }) {
  const message = 
`🚨 *[CENTRAL EVENT: PROTOKOL DARURAT]*
_Ini Lho ITS! 2027 • Komando Acara Pusat_
────────────────────────────
⚡ *Status:* ${alertTitle}
📍 *Area:* ${location}
⏰ *Waktu:* ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
────────────────────────────
🛡️ *Instruksi Segera:*
${instruction}

Segera konfirmasi kesiapan pos dan keselamatan peserta rombongan masing-masing ke Command Center!

_Pesan prioritas tinggi dari Central Event Command Center_`;

  return await sendMessage(target, message);
}

/**
 * Template Laporan Cepat: Kesiapan Pos Departemen
 */
async function broadcastStationStatus({ target, stationName = 'Pos Departemen', status = 'READY', pic = '-' }) {
  const icon = status === 'READY' ? '✅' : '⚠️';
  const message = 
`${icon} *[CENTRAL EVENT: UPDATE POS]*
_Ini Lho ITS! 2027 • Kesiapan Venue_
────────────────────────────
📍 *Pos/Fakultas:* ${stationName}
📊 *Status:* *${status}*
👤 *PIC Pos:* ${pic}
⏰ *Waktu Verifikasi:* ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
────────────────────────────
Pos telah terverifikasi di Master Command Dashboard.`;

  return await sendMessage(target, message);
}

module.exports = {
  getDeviceStatus,
  sendMessage,
  broadcastDelay,
  broadcastEmergency,
  broadcastStationStatus
};
