const express = require('express');
const path = require('path');
const config = require('./config');
const bot = require('./bot');
const subEventsConfig = require('./services/subEventsConfig');
const sheetsService = require('./services/sheetsService');
const stageCheckService = require('./services/stageCheckService');
const driveService = require('./services/driveService');
const vipService = require('./services/vipService');
const geminiService = require('./services/geminiService');
const spreadsheetRegistry = require('./services/spreadsheetRegistry');
const progressService = require('./services/progressService');
const whatsappService = require('./services/whatsappService');
const whatsappBotService = require('./services/whatsappBotService');
const staffService = require('./services/staffService');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// 1. API Status Live untuk Web & PWA Dashboard
app.get('/api/status', async (req, res) => {
  try {
    const subEventId = req.query.subEventId || subEventsConfig.getActiveSubEventId();
    const subEvent = subEventsConfig.getSubEvent(subEventId);

    const rundown = await sheetsService.getRundown(subEventId);
    const sessionData = await sheetsService.getCurrentAndNextSession(null, subEventId);
    const dateStatus = sheetsService.getEventDateStatus(subEventId);
    const stations = stageCheckService.getAllStations(subEventId);
    const driveFiles = await driveService.fetchRealDriveItems();
    const progress = progressService.getProgress(subEventId);

    res.json({
      success: true,
      subEvent,
      rundown,
      currentSession: sessionData.current,
      nextSession: sessionData.next,
      simulatedTime: sheetsService.getSimulationTime(),
      isBeforeEvent: sessionData.isBeforeEvent,
      dateStatus,
      stations,
      driveFiles,
      progress,
      delayMinutes: sheetsService.getDelay()
    });
  } catch (err) {
    console.error('API /api/status error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 1.1 API Overview Multi-Event untuk Master Command Dashboard
app.get('/api/overview', async (req, res) => {
  try {
    const allSubs = subEventsConfig.getAllSubEvents();
    const eventsOverview = await Promise.all(allSubs.map(async (sub) => {
      const rundown = await sheetsService.getRundown(sub.id);
      const sessionData = await sheetsService.getCurrentAndNextSession(null, sub.id);
      const dateStatus = sheetsService.getEventDateStatus(sub.id);
      const stations = stageCheckService.getAllStations(sub.id);
      const readyStations = stations.filter(s => s.ready).length;
      const totalStations = stations.length;
      const readinessPct = totalStations > 0 ? Math.round((readyStations / totalStations) * 100) : 0;

      return {
        id: sub.id,
        name: sub.name,
        shortName: sub.shortName,
        tagline: sub.tagline,
        dateStr: sub.dateStr,
        venue: sub.venue,
        pic: sub.pic,
        icon: sub.icon,
        gradient: sub.gradient,
        isPrimary: !!sub.isPrimary,
        isLiveSheet: !!sub.isLiveSheet,
        kpi: sub.kpi || {},
        contingency: sub.contingency || '',
        daysUntil: dateStatus.daysUntil,
        statusText: dateStatus.statusText,
        totalSessions: rundown.length,
        currentSession: sessionData.current,
        nextSession: sessionData.next,
        stationsCount: totalStations,
        stationsReady: readyStations,
        readinessPct
      };
    }));

    const driveFiles = await driveService.fetchRealDriveItems();
    const progressList = progressService.getAllProgress();
    const delayMinutes = sheetsService.getDelay();
    const simulatedTime = sheetsService.getSimulationTime();

    res.json({
      success: true,
      events: eventsOverview,
      progress: progressList,
      driveFiles,
      delayMinutes,
      simulatedTime,
      totalEvents: eventsOverview.length
    });
  } catch (err) {
    console.error('API /api/overview error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Route Aliases untuk akses langsung ke masing-masing sub-event
app.get('/safari', (req, res) => res.sendFile(path.join(__dirname, '../public/safari.html')));
app.get('/startpoint', (req, res) => res.sendFile(path.join(__dirname, '../public/startpoint.html')));
app.get('/odl', (req, res) => res.sendFile(path.join(__dirname, '../public/odl.html')));
app.get('/technocraft', (req, res) => res.sendFile(path.join(__dirname, '../public/technocraft.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, '../public/index.html')));

// Google Drive In-App Explorer Endpoints (Non-Breakout)
app.get('/api/drive/folders', async (req, res) => {
  try {
    const folders = await driveService.fetchRealDriveItems();
    res.json({ success: true, folders });
  } catch (err) {
    console.error('API /api/drive/folders error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/drive/subfolder/:folderId', async (req, res) => {
  try {
    const { folderId } = req.params;
    const { name } = req.query;
    const result = await driveService.fetchSubfolderContents(folderId, name || '');
    res.json({ success: true, ...result });
  } catch (err) {
    console.error(`API /api/drive/subfolder/${req.params.folderId} error:`, err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Unggah Berkas Baru ke Google Drive / Storage Lokal In-App
app.post('/api/drive/upload', async (req, res) => {
  try {
    const { folderId, folderName, fileName, fileData, fileType } = req.body;
    if (!fileName || !fileData) {
      return res.status(400).json({ success: false, error: 'Nama berkas dan data berkas (base64) wajib diisi' });
    }
    const uploaded = await driveService.saveUploadedFile({
      folderId: folderId || '1a-JbvPXcU0o9gWDrQEJUGZaQXTM6LQQp',
      folderName: folderName || 'Umum',
      fileName,
      fileData,
      fileType
    });
    res.json({ success: true, file: uploaded });
  } catch (err) {
    console.error('API /api/drive/upload error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Multi-Spreadsheet Registry Endpoints (Bisa tambah/edit banyak sheet mandiri per sub-divisi)
app.get('/api/spreadsheets', (req, res) => {
  try {
    const { subEventId } = req.query;
    const sheets = subEventId 
      ? spreadsheetRegistry.getSpreadsheetsBySubEvent(subEventId)
      : spreadsheetRegistry.getAllSpreadsheets();
    res.json({ success: true, sheets });
  } catch (err) {
    console.error('API /api/spreadsheets error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/spreadsheets/:subEventId', (req, res) => {
  try {
    const { subEventId } = req.params;
    const sheets = spreadsheetRegistry.getSpreadsheetsBySubEvent(subEventId);
    res.json({ success: true, subEventId, sheets });
  } catch (err) {
    console.error(`API /api/spreadsheets/${req.params.subEventId} error:`, err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/spreadsheets/add', (req, res) => {
  try {
    const { name, sheetIdOrUrl, subEventId, uploadedFilePath, type } = req.body;
    const added = spreadsheetRegistry.addSpreadsheet({
      name,
      sheetIdOrUrl,
      subEventId,
      uploadedFilePath,
      type
    });
    res.json({ success: true, sheet: added });
  } catch (err) {
    console.error('API /api/spreadsheets/add error:', err);
    res.status(400).json({ success: false, error: err.message });
  }
});

app.post('/api/spreadsheets/delete', (req, res) => {
  try {
    const { id } = req.body;
    const deleted = spreadsheetRegistry.deleteSpreadsheet(id);
    res.json({ success: !!deleted, deleted });
  } catch (err) {
    console.error('API /api/spreadsheets/delete error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Drive Sub-Divisi Mandiri Endpoints
app.get('/api/drive/subevent/:subEventId', async (req, res) => {
  try {
    const { subEventId } = req.params;
    const result = await driveService.fetchSubEventDriveContents(subEventId);
    res.json({ success: true, ...result });
  } catch (err) {
    console.error(`API /api/drive/subevent/${req.params.subEventId} error:`, err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/drive/subevent/link', (req, res) => {
  try {
    const { subEventId, urlOrId } = req.body;
    if (!subEventId || !urlOrId) {
      return res.status(400).json({ success: false, error: 'subEventId dan urlOrId wajib diisi' });
    }
    const saved = driveService.saveSubEventDriveLink(subEventId, urlOrId);
    res.json({ success: true, drive: saved });
  } catch (err) {
    console.error('API /api/drive/subevent/link error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. API Mengubah Sub-Event Aktif
app.post('/api/subevent/active', (req, res) => {
  const { id } = req.body;
  const switched = subEventsConfig.setActiveSubEventId(id);
  res.json({ success: !!switched, activeSubEvent: switched });
});

// 3. API Toggle Pos Check-in dari Web/App
app.post('/api/toggle-pos', (req, res) => {
  const { id, subEventId, user = 'Command App' } = req.body;
  const updated = stageCheckService.toggleStationReady(id, user, subEventId);
  res.json({ success: !!updated, updated });
});

// 4. API Atur Mode Simulasi
app.post('/api/simulasi', (req, res) => {
  const { time } = req.body;
  sheetsService.setSimulationTime(time || null);
  res.json({ success: true, time: sheetsService.getSimulationTime() });
});

// ==========================================
// CRUD / EDITING ENDPOINTS FOR STAFF (HARDENED)
// ==========================================

// Save/Update Rundown Session
app.post('/api/rundown/save', async (req, res) => {
  try {
    const { subEventId, item } = req.body;
    if (!subEventId || !item || !item.title) {
      return res.status(400).json({ success: false, error: 'Parameter subEventId dan item.title wajib diisi' });
    }
    const currentRundown = await sheetsService.getRundown(subEventId);
    const result = subEventsConfig.saveRundownItem(subEventId, item, currentRundown);
    res.json({ success: true, result });
  } catch (err) {
    console.error('Error in /api/rundown/save:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete Rundown Session
app.post('/api/rundown/delete', async (req, res) => {
  try {
    const { subEventId, itemId } = req.body;
    if (!subEventId || itemId === undefined) {
      return res.status(400).json({ success: false, error: 'Parameter subEventId dan itemId wajib diisi' });
    }
    const currentRundown = await sheetsService.getRundown(subEventId);
    const deleted = subEventsConfig.deleteRundownItem(subEventId, itemId, currentRundown);
    res.json({ success: !!deleted, deleted });
  } catch (err) {
    console.error('Error in /api/rundown/delete:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Save/Update Pos Lapangan Station
app.post('/api/stations/save', (req, res) => {
  try {
    const { subEventId, item } = req.body;
    if (!subEventId || !item || !item.name) {
      return res.status(400).json({ success: false, error: 'Parameter subEventId dan nama pos wajib diisi' });
    }
    const result = stageCheckService.saveStation(subEventId, item);
    res.json({ success: true, result });
  } catch (err) {
    console.error('Error in /api/stations/save:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete Pos Lapangan Station
app.post('/api/stations/delete', (req, res) => {
  try {
    const { subEventId, stationId } = req.body;
    if (!subEventId || !stationId) {
      return res.status(400).json({ success: false, error: 'Parameter subEventId dan stationId wajib diisi' });
    }
    const deleted = stageCheckService.deleteStation(subEventId, stationId);
    res.json({ success: !!deleted, deleted });
  } catch (err) {
    console.error('Error in /api/stations/delete:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update Event Metadata (Venue, Tagline, KPI, Contingency)
app.post('/api/event/update', (req, res) => {
  try {
    const { subEventId, metadata } = req.body;
    if (!subEventId || !metadata) {
      return res.status(400).json({ success: false, error: 'Parameter subEventId dan metadata wajib diisi' });
    }
    const updated = subEventsConfig.updateSubEventMetadata(subEventId, metadata);
    res.json({ success: !!updated, updated });
  } catch (err) {
    console.error('Error in /api/event/update:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Reset Event to Default
app.post('/api/event/reset', (req, res) => {
  try {
    const { subEventId } = req.body;
    if (!subEventId) {
      return res.status(400).json({ success: false, error: 'Parameter subEventId wajib diisi' });
    }
    const resetSub = subEventsConfig.resetSubEventToDefault(subEventId);
    stageCheckService.resetStations(subEventId);
    res.json({ success: !!resetSub, subEvent: resetSub });
  } catch (err) {
    console.error('Error in /api/event/reset:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// TRACKER PROGRESS 0-100% (KHUSUS STAFF AHLI)
// ==========================================

app.get('/api/progress', (req, res) => {
  try {
    const list = progressService.getAllProgress();
    res.json({ success: true, progress: list });
  } catch (err) {
    console.error('API /api/progress error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/progress/:subEventId', (req, res) => {
  try {
    const { subEventId } = req.params;
    const item = progressService.getProgress(subEventId);
    res.json({ success: true, progress: item });
  } catch (err) {
    console.error(`API /api/progress/${req.params.subEventId} error:`, err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update Progress (Persentase 0-100% & Status Label - Hanya Staff Ahli)
app.post('/api/progress/update', (req, res) => {
  try {
    const { subEventId, percentage, statusLabel, updatedBy, milestones } = req.body;
    if (!subEventId) {
      return res.status(400).json({ success: false, error: 'subEventId wajib diisi' });
    }
    const updated = progressService.updateProgress(subEventId, {
      percentage,
      statusLabel,
      updatedBy: updatedBy || 'Staff Ahli',
      milestones
    });
    res.json({ success: true, progress: updated });
  } catch (err) {
    console.error('API /api/progress/update error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Toggle / Ubah Status Milestone Tugas
app.post('/api/progress/toggle-milestone', (req, res) => {
  try {
    const { subEventId, milestoneId, status, user } = req.body;
    if (!subEventId || !milestoneId) {
      return res.status(400).json({ success: false, error: 'subEventId dan milestoneId wajib diisi' });
    }
    const toggled = progressService.toggleMilestone(subEventId, milestoneId, status, user || 'Staff Ahli');
    const current = progressService.getProgress(subEventId);
    res.json({ success: !!toggled, milestone: toggled, progress: current });
  } catch (err) {
    console.error('API /api/progress/toggle-milestone error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update Detail & Persentase Fleksibel Milestone (0%, 25%, 50%, 75%, 100% atau custom)
app.post('/api/progress/update-milestone', (req, res) => {
  try {
    const { subEventId, milestoneId, data, user } = req.body;
    if (!subEventId || !milestoneId) {
      return res.status(400).json({ success: false, error: 'subEventId dan milestoneId wajib diisi' });
    }
    const updated = progressService.updateMilestone(subEventId, milestoneId, data || {}, user || 'Staff Ahli');
    const current = progressService.getProgress(subEventId);
    res.json({ success: !!updated, milestone: updated, progress: current });
  } catch (err) {
    console.error('API /api/progress/update-milestone error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Tambah Milestone Tugas Baru
app.post('/api/progress/add-milestone', (req, res) => {
  try {
    const { subEventId, milestone, user } = req.body;
    if (!subEventId || !milestone || !milestone.title) {
      return res.status(400).json({ success: false, error: 'subEventId dan judul milestone wajib diisi' });
    }
    const added = progressService.addMilestone(subEventId, milestone, user || 'Staff Ahli');
    const current = progressService.getProgress(subEventId);
    res.json({ success: true, milestone: added, progress: current });
  } catch (err) {
    console.error('API /api/progress/add-milestone error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Hapus Milestone Tugas
app.post('/api/progress/delete-milestone', (req, res) => {
  try {
    const { subEventId, milestoneId, user } = req.body;
    if (!subEventId || !milestoneId) {
      return res.status(400).json({ success: false, error: 'subEventId dan milestoneId wajib diisi' });
    }
    const deleted = progressService.deleteMilestone(subEventId, milestoneId, user || 'Staff Ahli');
    const current = progressService.getProgress(subEventId);
    res.json({ success: deleted, progress: current });
  } catch (err) {
    console.error('API /api/progress/delete-milestone error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. API Tanya Gemini AI (Default Model: 3.5 Flash)
app.post('/api/ask-ai', async (req, res) => {
  try {
    const { question, subEventId } = req.body;
    if (!question) return res.status(400).json({ error: 'Pertanyaan kosong' });

    const targetSub = subEventId || subEventsConfig.getActiveSubEventId();
    const subEvent = subEventsConfig.getSubEvent(targetSub);

    const progress = progressService.getProgress(targetSub);
    const rawSpreadsheetText = await sheetsService.getRawSpreadsheetText();
    const realDriveFiles = await driveService.fetchRealDriveItems();
    const dateStatus = sheetsService.getEventDateStatus(targetSub);

    const answer = await geminiService.askCopilot(question, {
      progress,
      rawSpreadsheetText,
      realDriveFiles,
      dateStatus: {
        ...dateStatus,
        subEventName: subEvent.name,
        venue: subEvent.venue
      }
    });

    res.json({ answer });
  } catch (err) {
    console.error('API /api/ask-ai error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 6. API Analisis Tugas Spreadsheet oleh Gemini 3.5 Flash (Verifikasi & Tambah Tugas ke Progress Cockpit)
app.post('/api/ai/analyze-sheet-tasks', async (req, res) => {
  try {
    const { subEventId = 'safari', sheetId } = req.body;
    const targetSub = subEventId || 'safari';

    // Ambil data spreadsheet live
    let rawSheetText = '';
    try {
      rawSheetText = await sheetsService.getRawSpreadsheetText();
    } catch (e) {
      console.warn('Sheets fetch warning:', e.message);
    }

    // Ambil daftar milestone saat ini
    const currentProgress = progressService.getProgress(targetSub) || {};
    const existingMilestones = currentProgress.milestones || [];

    // Ambil metadata spreadsheet jika ada
    const sheetsList = spreadsheetRegistry.getSpreadsheetsBySubEvent ? spreadsheetRegistry.getSpreadsheetsBySubEvent(targetSub) : [];
    const primarySheet = sheetsList.find(s => s.isConfigured || s.isDefault) || sheetsList[0] || {};

    const result = await geminiService.analyzeSpreadsheetTasks(targetSub, {
      rawSheetText,
      existingMilestones,
      sheetTitle: primarySheet.name || `Spreadsheet ${targetSub.toUpperCase()}`
    });

    res.json({
      success: true,
      subEventId: targetSub,
      sheetTitle: primarySheet.name || 'Master Spreadsheet',
      ...result
    });
  } catch (err) {
    console.error('API /api/ai/analyze-sheet-tasks error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. API WhatsApp Gateway (Fonnte Mission Dispatcher)
app.get('/api/whatsapp/status', async (req, res) => {
  try {
    const status = await whatsappService.getDeviceStatus();
    res.json(status);
  } catch (err) {
    console.error('API /api/whatsapp/status error:', err);
    res.status(500).json({ success: false, connected: false, error: err.message });
  }
});

app.post('/api/whatsapp/send', async (req, res) => {
  try {
    const { target, message } = req.body;
    if (!target || !message) {
      return res.status(400).json({ success: false, error: 'Target nomor dan isi pesan wajib diisi.' });
    }
    const result = await whatsappService.sendMessage(target, message);
    res.json(result);
  } catch (err) {
    console.error('API /api/whatsapp/send error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/whatsapp/broadcast-delay', async (req, res) => {
  try {
    const { target, subEventName, sessionTitle, delayMinutes, pic } = req.body;
    if (!target) {
      return res.status(400).json({ success: false, error: 'Target nomor / grup WhatsApp wajib diisi.' });
    }
    const result = await whatsappService.broadcastDelay({
      target,
      subEventName,
      sessionTitle,
      delayMinutes,
      pic
    });
    res.json(result);
  } catch (err) {
    console.error('API /api/whatsapp/broadcast-delay error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/whatsapp/broadcast-emergency', async (req, res) => {
  try {
    const { target, alertTitle, location, instruction } = req.body;
    if (!target) {
      return res.status(400).json({ success: false, error: 'Target nomor / grup WhatsApp wajib diisi.' });
    }
    const result = await whatsappService.broadcastEmergency({
      target,
      alertTitle,
      location,
      instruction
    });
    res.json(result);
  } catch (err) {
    console.error('API /api/whatsapp/broadcast-emergency error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/whatsapp/broadcast-station', async (req, res) => {
  try {
    const { target, stationName, status, pic } = req.body;
    if (!target) {
      return res.status(400).json({ success: false, error: 'Target nomor / grup WhatsApp wajib diisi.' });
    }
    const result = await whatsappService.broadcastStationStatus({
      target,
      stationName,
      status,
      pic
    });
    res.json(result);
  } catch (err) {
    console.error('API /api/whatsapp/broadcast-station error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7.1 Webhook Penerima Pesan WhatsApp Masuk (Group & Personal Chat Command Bot)
// Fonnte mewajibkan Webhook URL mengizinkan metode GET dan POST
app.get('/api/whatsapp/webhook', (req, res) => {
  res.status(200).send('Central Event WhatsApp Webhook is Live & Ready! 🚀');
});

app.post('/api/whatsapp/webhook', async (req, res) => {
  const startTime = Date.now();
  try {
    const payload = req.body || {};
    
    // Non-blocking log ke database Supabase Cloud (Fire and forget, zero latency penalty!)
    try {
      const db = require('./db');
      db.query('INSERT INTO webhook_logs (payload) VALUES ($1)', [JSON.stringify(payload)]).catch(() => {});
    } catch (_) {}

    // Eksekusi pemrosesan command bot (in-memory < 2ms)
    const reply = await whatsappBotService.handleIncomingMessage(payload);
    if (reply) {
      // Tentukan target tujuan: Di Fonnte, 'sender' berisi nomor HP atau Group ID (xxx@g.us)
      const target = (payload.id && payload.id.includes('@g.us')) ? payload.id : (payload.sender || payload.member);
      
      // Kirim via Fonnte API dan di-await
      if (target) {
        try {
          await whatsappService.sendMessage(target, reply);
        } catch (sendErr) {
          console.error('Webhook sendMessage error:', sendErr.message);
        }
      }

      console.log(`⚡ [FAST DISPATCH] WhatsApp command diproses dalam ${Date.now() - startTime}ms`);
      // Protokol auto-reply Fonnte: juga return JSON { reply, status: true }
      return res.json({ reply, status: true });
    }
    res.json({ status: true, message: 'Message acknowledged (no command triggered)' });
  } catch (err) {
    console.error('API /api/whatsapp/webhook error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7.2 API Database Staff Central Event (Multi-Event Hub)
app.get('/api/staff', (req, res) => {
  try {
    const subEventId = req.query.subEventId || 'safari';
    const data = staffService.getStaffBySubEvent(subEventId);
    res.json({ success: true, subEventId, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/staff/all', (req, res) => {
  try {
    const data = staffService.getAllStaff();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Endpoint debug untuk melihat pesan webhook yang masuk ke server secara live
app.get('/api/whatsapp/debug', async (req, res) => {
  try {
    const db = require('./db');
    const result = await db.query('SELECT * FROM webhook_logs ORDER BY id DESC LIMIT 15');
    res.json({
      success: true,
      count: result.rows.length,
      logs: result.rows
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Start Web Server (Stand-alone or Vercel Serverless)
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`🌐 Central Event Command App (PWA) aktif di http://localhost:${PORT}`);
    // Inisialisasi & sinkronisasi Supabase Cloud
    try {
      const db = require('./db');
      db.syncLocalToSupabase().then(() => {
        console.log('☁️ Terhubung & tersinkronisasi dengan Supabase Cloud PostgreSQL!');
      }).catch(err => {
        console.warn('⚠️ Supabase sync warning:', err.message);
      });
    } catch (e) {}
  });
}

module.exports = app;
