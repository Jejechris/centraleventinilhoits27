// State live tracker tamu penting & pemateri
const vipList = [
  {
    id: 'rektor',
    name: 'Rektor & Jajaran Pimpinan ITS',
    role: 'VVIP Opening',
    status: 'Belum Tiba',
    lo: '@Sarah (LO VVIP)',
    location: 'Holding Room Rektorat',
    updatedAt: '-'
  },
  {
    id: 'bem_its',
    name: 'Presiden BEM & Perwakilan Mahasiswa ITS',
    role: 'Sambutan Lembaga Mahasiswa',
    status: 'Standby Backstage',
    lo: '@Fian (Central Event)',
    location: 'Sayap Kanan Panggung',
    updatedAt: '-'
  },
  {
    id: 'speaker1',
    name: 'Keynote Speaker (Alumni Berprestasi)',
    role: 'Talkshow Sesi 1',
    status: 'Dalam Perjalanan (OTW)',
    lo: '@Dimas (LO Pembicara)',
    location: 'Menuju Kampus ITS Sukolilo',
    updatedAt: '-'
  },
  {
    id: 'guest_star',
    name: 'Guest Star Performance',
    role: 'Grand Closing Ceremony',
    status: 'Check-in Hotel',
    lo: '@Anisa (LO Artist)',
    location: 'Hotel Transit',
    updatedAt: '-'
  }
];

const STATUS_ICONS = {
  'Belum Tiba': '⚪',
  'Dalam Perjalanan (OTW)': '🚗',
  'Transit / Holding Room': '🏢',
  'Standby Backstage': '🎙️',
  'Sedang di Panggung (On Stage)': '🌟',
  'Selesai & Ramah Tamah': '✅'
};

const STATUS_OPTIONS = [
  'Dalam Perjalanan (OTW)',
  'Transit / Holding Room',
  'Standby Backstage',
  'Sedang di Panggung (On Stage)',
  'Selesai & Ramah Tamah'
];

function getAllVIP() {
  return vipList;
}

function updateVIPStatus(id, newStatus) {
  const vip = vipList.find(v => v.id === id);
  if (!vip) return null;

  vip.status = newStatus;
  const now = new Date();
  const wibH = String((now.getUTCHours() + 7) % 24).padStart(2, '0');
  const wibM = String(now.getUTCMinutes()).padStart(2, '0');
  vip.updatedAt = `${wibH}:${wibM} WIB`;

  return vip;
}

function getVipById(id) {
  return vipList.find(v => v.id === id);
}

module.exports = {
  getAllVIP,
  updateVIPStatus,
  getVipById,
  STATUS_ICONS,
  STATUS_OPTIONS
};
