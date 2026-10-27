const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../../data/progress.json');

let progressData = {};

function loadLocal() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      progressData = JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading progress.json:', err.message);
  }
}

function saveLocal() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(progressData, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing progress.json:', err.message);
  }
}

// Initial load
loadLocal();

async function syncToSupabase(subEventId) {
  try {
    const db = require('../db');
    const item = progressData[subEventId];
    if (!item) return;

    await db.query(`
      INSERT INTO progress_trackers (sub_event_id, percentage, status_label, milestones, updated_by, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      ON CONFLICT (sub_event_id) DO UPDATE SET
        percentage = EXCLUDED.percentage,
        status_label = EXCLUDED.status_label,
        milestones = EXCLUDED.milestones,
        updated_by = EXCLUDED.updated_by,
        updated_at = NOW();
    `, [
      item.subEventId,
      item.percentage || 0,
      item.statusLabel || '',
      JSON.stringify(item.milestones || []),
      item.updatedBy || 'Staff Ahli'
    ]);
  } catch (err) {
    console.warn(`Supabase progress sync warning (${subEventId}):`, err.message);
  }
}

async function initFromSupabase() {
  try {
    const db = require('../db');
    const res = await db.query('SELECT * FROM progress_trackers');
    if (res.rows && res.rows.length > 0) {
      for (const row of res.rows) {
        if (progressData[row.sub_event_id]) {
          progressData[row.sub_event_id].percentage = row.percentage;
          progressData[row.sub_event_id].statusLabel = row.status_label;
          progressData[row.sub_event_id].updatedBy = row.updated_by;
          progressData[row.sub_event_id].updatedAt = row.updated_at;
          if (row.milestones) {
            progressData[row.sub_event_id].milestones = typeof row.milestones === 'string'
              ? JSON.parse(row.milestones)
              : row.milestones;
          }
        }
      }
      saveLocal();
    } else {
      // Seed initial local data into Supabase
      for (const subId of Object.keys(progressData)) {
        await syncToSupabase(subId);
      }
    }
  } catch (err) {
    console.warn('Could not sync progress from Supabase on start:', err.message);
  }
}

function getAllProgress() {
  return Object.values(progressData);
}

function getProgress(subEventId) {
  return progressData[subEventId] || progressData['safari'];
}

function updateProgress(subEventId, { percentage, statusLabel, updatedBy, milestones }) {
  if (!progressData[subEventId]) {
    progressData[subEventId] = {
      subEventId,
      name: subEventId,
      icon: '📊',
      code: subEventId.toUpperCase(),
      percentage: 0,
      statusLabel: '',
      updatedBy: updatedBy || 'Staff Ahli',
      updatedAt: new Date().toISOString(),
      milestones: []
    };
  }

  const item = progressData[subEventId];
  if (percentage !== undefined && percentage !== null) {
    item.percentage = Math.max(0, Math.min(100, parseInt(percentage, 10) || 0));
  }
  if (statusLabel !== undefined) {
    item.statusLabel = statusLabel;
  }
  if (updatedBy) {
    item.updatedBy = updatedBy;
  }
  if (milestones && Array.isArray(milestones)) {
    item.milestones = milestones;
  }
  item.updatedAt = new Date().toISOString();

  saveLocal();
  syncToSupabase(subEventId).catch(() => {});
  return item;
}

function updateMilestone(subEventId, milestoneId, { title, category, progress, status, notes } = {}, user = 'Staff Ahli') {
  const item = progressData[subEventId];
  if (!item || !item.milestones) return null;

  const m = item.milestones.find(x => x.id === milestoneId);
  if (m) {
    if (title !== undefined) m.title = title;
    if (category !== undefined) m.category = category;
    if (notes !== undefined) m.notes = notes;
    if (progress !== undefined) {
      m.progress = Math.max(0, Math.min(100, parseInt(progress, 10) || 0));
      if (m.progress === 100) m.status = 'done';
      else if (m.progress === 0) m.status = 'pending';
      else m.status = 'in_progress';
    } else if (status !== undefined) {
      m.status = status;
      if (status === 'done') m.progress = 100;
      else if (status === 'pending') m.progress = 0;
      else if (!m.progress || m.progress === 100 || m.progress === 0) m.progress = 50;
    }
    m.updatedAt = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    item.updatedBy = user;
    item.updatedAt = new Date().toISOString();

    if (item.milestones.length > 0) {
      const sum = item.milestones.reduce((acc, curr) => acc + (curr.progress || 0), 0);
      item.percentage = Math.round(sum / item.milestones.length);
    }

    saveLocal();
    syncToSupabase(subEventId).catch(() => {});
    return m;
  }
  return null;
}

function toggleMilestone(subEventId, milestoneId, status, user = 'Staff Ahli') {
  const item = progressData[subEventId];
  if (!item || !item.milestones) return null;

  const m = item.milestones.find(x => x.id === milestoneId);
  if (m) {
    m.status = status || (m.status === 'done' ? 'in_progress' : (m.status === 'in_progress' ? 'pending' : 'done'));
    if (m.status === 'done') m.progress = 100;
    else if (m.status === 'in_progress') m.progress = 50;
    else m.progress = 0;
    m.updatedAt = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    item.updatedBy = user;
    item.updatedAt = new Date().toISOString();

    // Auto-recalculate percentage if all milestones have weight/progress
    if (item.milestones.length > 0) {
      const sum = item.milestones.reduce((acc, curr) => acc + (curr.progress || 0), 0);
      item.percentage = Math.round(sum / item.milestones.length);
    }

    saveLocal();
    syncToSupabase(subEventId).catch(() => {});
    return m;
  }
  return null;
}

function addMilestone(subEventId, milestoneData, user = 'Staff Ahli') {
  const item = progressData[subEventId];
  if (!item) return null;

  const newId = `${subEventId}_m_${Date.now()}`;
  const newMilestone = {
    id: newId,
    title: milestoneData.title || 'Tugas Baru',
    category: milestoneData.category || 'Operasional',
    status: milestoneData.status || 'in_progress',
    progress: parseInt(milestoneData.progress, 10) || (milestoneData.status === 'done' ? 100 : 50),
    notes: milestoneData.notes || '',
    updatedAt: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
  };

  item.milestones.push(newMilestone);
  item.updatedBy = user;
  item.updatedAt = new Date().toISOString();

  if (item.milestones.length > 0) {
    const sum = item.milestones.reduce((acc, curr) => acc + (curr.progress || 0), 0);
    item.percentage = Math.round(sum / item.milestones.length);
  }

  saveLocal();
  syncToSupabase(subEventId).catch(() => {});
  return newMilestone;
}

function deleteMilestone(subEventId, milestoneId, user = 'Staff Ahli') {
  const item = progressData[subEventId];
  if (!item || !item.milestones) return false;

  const idx = item.milestones.findIndex(x => x.id === milestoneId);
  if (idx !== -1) {
    item.milestones.splice(idx, 1);
    item.updatedBy = user;
    item.updatedAt = new Date().toISOString();

    if (item.milestones.length > 0) {
      const sum = item.milestones.reduce((acc, curr) => acc + (curr.progress || 0), 0);
      item.percentage = Math.round(sum / item.milestones.length);
    }

    saveLocal();
    syncToSupabase(subEventId).catch(() => {});
    return true;
  }
  return false;
}

module.exports = {
  getAllProgress,
  getProgress,
  updateProgress,
  updateMilestone,
  toggleMilestone,
  addMilestone,
  deleteMilestone,
  initFromSupabase,
  syncToSupabase
};
