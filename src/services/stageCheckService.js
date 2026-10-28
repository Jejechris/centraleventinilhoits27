const subEventsConfig = require('./subEventsConfig');

const stationsDb = {};

function initStations() {
  const allSub = subEventsConfig.getAllSubEvents();
  allSub.forEach(sub => {
    stationsDb[sub.id] = sub.stations ? JSON.parse(JSON.stringify(sub.stations)) : [];
  });
}
initStations();

function getAllStations(subEventId = null) {
  const targetId = subEventId || subEventsConfig.getActiveSubEventId();
  if (!stationsDb[targetId]) {
    const sub = subEventsConfig.getSubEvent(targetId);
    stationsDb[targetId] = sub.stations ? JSON.parse(JSON.stringify(sub.stations)) : [];
  }
  return stationsDb[targetId];
}

function toggleStationReady(id, username = 'Panitia', subEventId = null) {
  let targetId = subEventId;
  let station = null;

  if (targetId) {
    const list = getAllStations(targetId);
    station = list.find(s => String(s.id).toLowerCase() === String(id).toLowerCase() || s.name.toLowerCase().includes(String(id).toLowerCase()));
  }

  // Jika tidak ditemukan di subEventId yang diberikan, cari di seluruh 4 sub-acara
  if (!station) {
    const subs = subEventsConfig.SUB_EVENT_LIST || ['safari', 'startpoint', 'odl', 'technocraft'];
    for (const subId of subs) {
      const list = getAllStations(subId);
      const found = list.find(s => String(s.id).toLowerCase() === String(id).toLowerCase() || s.name.toLowerCase().includes(String(id).toLowerCase()));
      if (found) {
        station = found;
        targetId = subId;
        break;
      }
    }
  }

  if (!station) return null;

  station.ready = !station.ready;
  station.status = station.ready ? '✅ SIAP & STANDBY' : '⏳ DALAM PERSIAPAN';
  
  const now = new Date();
  const wibH = String((now.getUTCHours() + 7) % 24).padStart(2, '0');
  const wibM = String(now.getUTCMinutes()).padStart(2, '0');
  station.updatedAt = `${wibH}:${wibM} WIB (${username})`;

  const subEvent = subEventsConfig.getSubEvent(targetId);
  return { ...station, subEventId: targetId, subEventName: subEvent?.name || targetId };
}

function saveStation(subEventId, item) {
  const list = getAllStations(subEventId);
  if (item.id) {
    const idx = list.findIndex(s => String(s.id) === String(item.id));
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...item };
      return { action: 'updated', item: list[idx] };
    }
  }

  const newId = `pos_${Date.now()}`;
  const newStation = {
    id: newId,
    name: item.name || 'Pos Baru',
    pic: item.pic || 'PIC Lapangan',
    ready: false,
    updatedAt: '-'
  };
  list.push(newStation);
  return { action: 'created', item: newStation };
}

function deleteStation(subEventId, stationId) {
  const list = getAllStations(subEventId);
  const idx = list.findIndex(s => String(s.id) === String(stationId));
  if (idx !== -1) {
    return list.splice(idx, 1)[0];
  }
  return null;
}

function resetStations(subEventId) {
  const sub = subEventsConfig.getSubEvent(subEventId);
  stationsDb[subEventId] = sub.stations ? JSON.parse(JSON.stringify(sub.stations)) : [];
  return stationsDb[subEventId];
}

function getReadinessSummary(subEventId = null) {
  const targetId = subEventId || subEventsConfig.getActiveSubEventId();
  const list = getAllStations(targetId);
  const total = list.length;
  const readyCount = list.filter(s => s.ready).length;
  const percentage = total > 0 ? Math.round((readyCount / total) * 100) : 0;
  return { total, readyCount, percentage };
}

module.exports = {
  getAllStations,
  toggleStationReady,
  saveStation,
  deleteStation,
  resetStations,
  getReadinessSummary
};
