const config = require('../config');
const subEventsConfig = require('./subEventsConfig');

let globalDelayMinutes = 0;
let cachedRawCsv = '';
let lastFetchTime = 0;
let simulationTime = null;

function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const clean = String(timeStr).trim().replace('.', ':');
  const [h, m] = clean.split(':').map(Number);
  return (isNaN(h) ? 0 : h) * 60 + (isNaN(m) ? 0 : m);
}

function minutesToTime(minutes) {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function formatHHMM(rawTime) {
  if (!rawTime) return '';
  const parts = String(rawTime).trim().split(':');
  if (parts.length < 2) return rawTime;
  const h = String(parts[0]).padStart(2, '0');
  const m = String(parts[1]).padStart(2, '0');
  return `${h}:${m}`;
}

async function fetchRawCsv() {
  const now = Date.now();
  if (cachedRawCsv && now - lastFetchTime < 30000) {
    return cachedRawCsv;
  }

  try {
    const url = `https://docs.google.com/spreadsheets/d/${config.GOOGLE_SHEET_ID}/gviz/tq?tqx=out:csv&gid=0`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    cachedRawCsv = text;
    lastFetchTime = now;
    return text;
  } catch (err) {
    console.error('Error fetching CSV:', err.message);
    // Enforce 30s cache cooldown on error to prevent request flooding
    lastFetchTime = now;
    return cachedRawCsv || '';
  }
}

async function getRawSpreadsheetText() {
  return await fetchRawCsv();
}

/**
 * Mengambil rundown dengan prioritas:
 * 1. Custom / Edited rundown (jika staff pernah mengubah/menambah sesi)
 * 2. Live Google Sheets (jika Safari Faculty)
 * 3. Default Sub-Event template
 */
async function getRundown(subEventId = null) {
  const targetId = subEventId || subEventsConfig.getActiveSubEventId();
  const subEvent = subEventsConfig.getSubEvent(targetId);

  // Cek apakah ada custom rundown hasil editan staff
  const custom = subEventsConfig.getCustomRundown(targetId);
  if (custom && custom.length > 0) {
    return applyDelayToRundown(custom);
  }

  // Jika Safari Faculty dan belum diedit, ambil dari Google Sheets
  if (targetId === 'safari') {
    const csv = await fetchRawCsv();
    if (csv) {
      try {
        const rows = parseCSV(csv);
        const extracted = [];
        const timeRegex = /^\d{1,2}:\d{2}$/;

        for (let i = 0; i < rows.length; i++) {
          const r = rows[i];
          if (r[8] && r[9] && timeRegex.test(r[8].trim()) && timeRegex.test(r[9].trim())) {
            const title = (r[11] || r[10] || 'Kegiatan Safari').trim();
            const subTitle = (r[10] && r[11] && r[10] !== r[11]) ? ` (${r[10].trim()})` : '';
            extracted.push({
              id: extracted.length + 1,
              start: formatHHMM(r[8].trim()),
              end: formatHHMM(r[9].trim()),
              title: `${title}${subTitle}`,
              location: 'Area Kampus & Fakultas ITS',
              pic: 'Tim Safari Faculty & Central Event',
              notes: r[14] ? `Alur: ${r[14]}` : 'Koordinasi via HT Frekuensi 1',
              driveLink: config.DRIVE_LINKS.mainDriveFolder,
              status: 'Upcoming'
            });
          }
        }

        if (extracted.length > 0) {
          return applyDelayToRundown(extracted);
        }
      } catch (err) {
        console.error('Error parsing live Safari CSV:', err.message);
      }
    }
  }

  // Fallback ke template
  const baseRundown = subEvent.rundown || [];
  return applyDelayToRundown(baseRundown);
}

function applyDelayToRundown(items) {
  if (globalDelayMinutes === 0) return items;

  return items.map(item => {
    const startM = timeToMinutes(item.start) + globalDelayMinutes;
    const endM = timeToMinutes(item.end) + globalDelayMinutes;
    return {
      ...item,
      adjustedStart: minutesToTime(startM),
      adjustedEnd: minutesToTime(endM),
      isDelayed: true
    };
  });
}

function parseCSV(text) {
  const lines = text.split(/\r?\n/);
  return lines.map(line => {
    const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
    return (matches || []).map(val => val.replace(/^"|"$/g, '').replace(/""/g, '"'));
  });
}

function getEventDateStatus(subEventId = null) {
  const targetId = subEventId || subEventsConfig.getActiveSubEventId();
  const subEvent = subEventsConfig.getSubEvent(targetId);

  const eventDate = new Date(`${subEvent.dateIso}T00:00:00+07:00`);
  const now = new Date();
  const nowWib = new Date(now.getTime() + (7 * 60 * 60 * 1000));
  
  const curY = nowWib.getUTCFullYear();
  const curM = String(nowWib.getUTCMonth() + 1).padStart(2, '0');
  const curD = String(nowWib.getUTCDate()).padStart(2, '0');
  const currentDateFormatted = `${curY}-${curM}-${curD}`;

  const isEventDay = (currentDateFormatted === subEvent.dateIso);
  const diffTime = eventDate.getTime() - now.getTime();
  const daysUntil = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  return {
    subEventId: targetId,
    subEventName: subEvent.name,
    isEventDay,
    daysUntil,
    eventDateStr: subEvent.dateStr,
    venue: subEvent.venue,
    simulationTime,
    isSimulation: !!simulationTime
  };
}

async function getCurrentAndNextSession(customTimeStr = null, subEventId = null) {
  const targetId = subEventId || subEventsConfig.getActiveSubEventId();
  const rundown = await getRundown(targetId);
  const dateStatus = getEventDateStatus(targetId);

  const effectiveTime = customTimeStr || simulationTime;

  if (!dateStatus.isEventDay && !effectiveTime) {
    return {
      subEventId: targetId,
      subEventName: dateStatus.subEventName,
      isBeforeEvent: true,
      daysUntil: dateStatus.daysUntil,
      eventDateStr: dateStatus.eventDateStr,
      current: null,
      next: rundown[0] || null,
      globalDelayMinutes
    };
  }

  let currentMinutes;
  if (effectiveTime) {
    currentMinutes = timeToMinutes(effectiveTime);
  } else {
    const now = new Date();
    const wibHour = (now.getUTCHours() + 7) % 24;
    const wibMinute = now.getUTCMinutes();
    currentMinutes = wibHour * 60 + wibMinute;
  }

  let current = null;
  let next = null;

  for (let i = 0; i < rundown.length; i++) {
    const item = rundown[i];
    const sMin = timeToMinutes(item.adjustedStart || item.start);
    const eMin = timeToMinutes(item.adjustedEnd || item.end);

    if (currentMinutes >= sMin && currentMinutes < eMin) {
      current = item;
      next = rundown[i + 1] || null;
      break;
    } else if (currentMinutes < sMin) {
      next = item;
      break;
    }
  }

  return {
    subEventId: targetId,
    subEventName: dateStatus.subEventName,
    isBeforeEvent: false,
    isSimulation: !!effectiveTime,
    simulatedTime: effectiveTime,
    current,
    next,
    currentMinutes,
    globalDelayMinutes
  };
}

function setSimulationTime(timeStr) {
  simulationTime = timeStr ? formatHHMM(timeStr) : null;
  return simulationTime;
}

function getSimulationTime() {
  return simulationTime;
}

function setDelay(minutes) {
  globalDelayMinutes = Number(minutes) || 0;
  return globalDelayMinutes;
}

function getDelay() {
  return globalDelayMinutes;
}

module.exports = {
  getRundown,
  getRawSpreadsheetText,
  getCurrentAndNextSession,
  getEventDateStatus,
  setSimulationTime,
  getSimulationTime,
  setDelay,
  getDelay,
  timeToMinutes,
  minutesToTime
};
