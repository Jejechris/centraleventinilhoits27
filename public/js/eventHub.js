/**
 * CENTRAL EVENT 2027 — EVENT HUB CONTROLLER
 * Powering dedicated command pages for Safari Faculty, Start Point, One Day Lecture, and Technocraft Playhouse.
 */

const EventHub = {
  subEventId: 'safari',
  editMode: false,
  rawRundownCache: [],
  rawStationsCache: [],
  currentSession: null,
  currentEventData: null,
  previousSessionId: null,

  isFetching: false,

  init(subEventId = 'safari') {
    this.subEventId = subEventId;
    this.loadStatus();
    setInterval(() => {
      // Only poll when tab is active and not already fetching to conserve resources
      if (!document.hidden && !this.isFetching) {
        this.loadStatus();
      }
    }, 8000);

    // Instant sync saat user kembali ke tab / membuka device
    window.addEventListener('focus', () => {
      if (!this.isFetching) this.loadStatus();
    });
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && !this.isFetching) this.loadStatus();
    });
  },

  async loadStatus() {
    if (this.isFetching) return;
    this.isFetching = true;
    try {
      const data = await CE_API.getStatus(this.subEventId);
      if (!data || !data.subEvent) return;

      this.currentEventData = data.subEvent;
      this.rawRundownCache = data.rundown || [];
      this.rawStationsCache = data.stations || [];
      this.currentSession = data.currentSession;

      // Update Hero & Meta
      this.setText('heroEventTitle', `${data.subEvent.name} Command Hub`);
      this.setText('heroEventTagline', data.subEvent.tagline);
      this.setText('heroVenue', data.subEvent.venue);
      this.setText('heroDateStr', data.dateStatus?.eventDateStr || data.subEvent.dateStr);
      this.setText('countdownBadge', `H-${data.dateStatus?.daysUntil ?? '--'}`);
      this.setText('rundownTitleLabel', `Master Rundown ${data.subEvent.name}`);

      // Update KPI
      if (data.subEvent.kpi) {
        this.setText('kpiPeserta', data.subEvent.kpi.targetPeserta || '-');
        this.setText('kpiKeterlibatan', data.subEvent.kpi.keterlibatan || '-');
      }

      // Update Contingency
      this.setText('contingencyText', data.subEvent.contingency || 'Mengikuti SOP umum panitia Central Event.');

      // Sound Alarm on session shift
      if (data.currentSession && data.currentSession.id !== this.previousSessionId) {
        if (this.previousSessionId !== null) {
          playChimeSound('alert');
          showToast(`Sesi beralih: ${data.currentSession.title}`, 'info');
        }
        this.previousSessionId = data.currentSession.id;
      }

      // Render Sub-Components
      this.renderRundown(data.rundown, data.currentSession);
      this.renderStations(data.stations);
      if (document.getElementById('driveContainer')) {
        this.renderDrive(data.driveFiles);
      }

      // Real Progress Tracker Synchronization (0-100% Khusus Staff Ahli)
      const prog = data.progress || { percentage: 0 };
      const pct = Math.max(0, Math.min(100, parseInt(prog.percentage, 10) || 0));
      this.setHtml('readinessMetric', `${pct}%`);
      const bar = document.getElementById('readinessBar');
      if (bar) {
        bar.style.width = `${pct}%`;
        if (pct >= 70) {
          bar.className = 'bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500';
        } else if (pct >= 40) {
          bar.className = 'bg-gradient-to-r from-blue-600 to-indigo-500 h-full rounded-full transition-all duration-500';
        } else if (pct > 0) {
          bar.className = 'bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all duration-500';
        } else {
          bar.className = 'bg-slate-700 h-full rounded-full transition-all duration-500';
        }
      }

      // Update Sidebar Widgets with True Progress Tracker data
      const sbPct = document.getElementById('sidebarReadinessPct');
      const sbBar = document.getElementById('sidebarReadinessBar');
      const sbCount = document.getElementById('sidebarReadinessCount');
      const sbBadge = document.getElementById('sidebarCountdownBadge');
      if (sbPct) sbPct.innerText = `${pct}%`;
      if (sbBar) sbBar.style.width = `${pct}%`;
      if (sbCount) {
        const milestones = prog.milestones || [];
        const done = milestones.filter(m => (m.progress || 0) === 100 || m.status === 'done').length;
        sbCount.innerText = milestones.length > 0 ? `${done}/${milestones.length} Tugas` : `${pct}% Total`;
      }
      if (sbBadge && data.dateStatus?.daysUntil !== undefined) sbBadge.innerText = `H-${data.dateStatus.daysUntil} DAYS`;

      // Realtime Bidirectional Synchronization dengan ProgressTracker Cockpit
      if (typeof ProgressTracker !== 'undefined' && typeof ProgressTracker.syncExternalData === 'function') {
        ProgressTracker.syncExternalData(prog);
      }

    } catch (err) {
      console.error(`Error loading status for ${this.subEventId}:`, err);
    } finally {
      this.isFetching = false;
    }
  },

  setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.innerText = text;
  },

  setHtml(id, html) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
  },

  toggleEditMode() {
    this.editMode = !this.editMode;
    const label = document.getElementById('editModeLabel');
    const btn = document.getElementById('editModeBtn');
    if (label) label.innerText = this.editMode ? 'Mode Edit: ON' : 'Mode Edit: OFF';
    if (btn) {
      btn.classList.toggle('border-blue-500', this.editMode);
      btn.classList.toggle('text-blue-400', this.editMode);
      btn.classList.toggle('bg-blue-950/40', this.editMode);
    }

    ['addRundownBtn', 'addStationBtn', 'editEventMetaBtn', 'resetEventBtn', 'editContingencyBtn'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.toggle('hidden', !this.editMode);
    });

    playChimeSound('chime');
    showToast(this.editMode ? 'Mode Edit Diaktifkan. Klik tombol ✏️ / ➕ untuk mengedit.' : 'Mode Edit Dimatikan.', 'info');

    this.renderRundown(this.rawRundownCache, this.currentSession);
    this.renderStations(this.rawStationsCache);
  },

  renderRundown(items, activeSession) {
    const container = document.getElementById('timelineContainer');
    if (!container) return;

    if (!items || items.length === 0) {
      container.innerHTML = '<div class="text-center py-12 text-slate-500 text-xs font-mono">Belum ada sesi rundown terkonfigurasi.</div>';
      return;
    }

    container.innerHTML = items.map((item, idx) => {
      const isCurrent = activeSession && String(activeSession.id) === String(item.id);
      let borderClass = 'bay-recessed border-white/5 hover:border-white/20';
      let activeIndicator = '';

      if (isCurrent) {
        borderClass = 'bay-recessed border-emerald-500/80 bg-emerald-950/20 ring-1 ring-emerald-500/50 shadow-lg shadow-emerald-500/10';
        activeIndicator = `
          <div class="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[9px] font-mono font-bold text-emerald-300 flex-shrink-0">
            <span>SESI AKTIF</span>
          </div>`;
      }

      const editButtons = this.editMode ? `
        <div class="flex items-center gap-1.5 ml-2 flex-shrink-0">
          <button onclick="EventHub.openRundownModal(${item.id})" class="px-2.5 py-1 rounded-md bg-blue-500/20 text-blue-300 text-[10px] font-mono font-bold hover:bg-blue-500/30 transition">EDIT</button>
          <button onclick="EventHub.deleteRundownItem(${item.id})" class="px-2.5 py-1 rounded-md bg-rose-500/20 text-rose-300 text-[10px] font-mono font-bold hover:bg-rose-500/30 transition">DEL</button>
        </div>
      ` : '';

      return `
        <div class="${borderClass} p-3.5 sm:p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group relative">
          <div class="flex items-start gap-3 min-w-0 flex-1">
            <div class="text-[10px] font-mono text-slate-500 font-bold w-6 pt-0.5 flex-shrink-0">#${String(idx + 1).padStart(2, '0')}</div>
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-2">
                <span class="text-xs sm:text-sm font-extrabold text-white group-hover:text-blue-400 transition tracking-tight leading-snug">${item.title}</span>
                ${activeIndicator}
              </div>
              <div class="text-[11px] text-slate-400 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span class="inline-flex items-center gap-1">📍 <span class="font-medium text-slate-300">${item.location || '-'}</span></span>
                <span class="text-slate-600 hidden sm:inline">•</span>
                <span class="inline-flex items-center gap-1">👤 <span class="text-slate-400">PIC:</span> <span class="font-medium text-slate-300">${item.pic || '-'}</span></span>
                ${item.notes && item.notes !== '-' ? `<span class="w-full text-slate-400 italic mt-1 text-[10px] bg-black/15 p-1 px-2 rounded-md">Note: ${item.notes}</span>` : ''}
              </div>
            </div>
          </div>
          <div class="flex items-center justify-between sm:justify-end gap-2 whitespace-nowrap flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
            <span class="text-xs font-mono font-extrabold text-amber-400 bay-recessed px-3 py-1.5 border border-amber-400/20 tracking-tight">
              ${item.start} - ${item.end}
            </span>
            ${editButtons}
          </div>
        </div>
      `;
    }).join('');
  },

  renderStations(stations) {
    const container = document.getElementById('posContainer');
    if (!container) return;

    if (!stations || stations.length === 0) {
      container.innerHTML = '<div class="text-slate-500 text-[11px] font-mono text-center py-4">Belum ada pos lapangan terdaftar.</div>';
      return;
    }

    container.innerHTML = stations.map(s => {
      const deleteBtn = this.editMode ? `
        <button onclick="EventHub.deleteStationItem('${s.id}')" class="p-1.5 rounded-md text-rose-400 hover:bg-rose-500/20 text-[10px] font-mono flex-shrink-0">DEL</button>
      ` : '';

      const readyClass = s.ready 
        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30' 
        : 'bay-recessed text-slate-400 hover:text-white border-white/5';

      return `
        <div class="flex items-center justify-between p-3 rounded-xl bay-recessed border border-white/5 hover:border-white/15 text-xs transition gap-3">
          <div class="flex items-center gap-3 min-w-0 flex-1">
            <span class="${s.ready ? 'w-2 h-2 rounded-full bg-emerald-500' : 'w-2 h-2 rounded-full bg-slate-600'} flex-shrink-0"></span>
            <div class="min-w-0 flex-1">
              <div class="font-extrabold text-white text-xs truncate tracking-tight leading-snug">${s.name}</div>
              <div class="text-[10px] font-mono text-slate-400 truncate mt-0.5">PIC: <span class="text-slate-300 font-semibold">${s.pic || '-'}</span> ${s.updatedAt ? `• <span class="text-slate-500">${s.updatedAt}</span>` : ''}</div>
            </div>
          </div>
          <div class="flex items-center gap-1.5 whitespace-nowrap flex-shrink-0">
            <button onclick="EventHub.togglePos('${s.id}')" class="px-3 py-1.5 rounded-lg text-[10px] font-mono font-extrabold border transition-all active:scale-95 ${readyClass}">
              ${s.ready ? 'STANDBY' : 'VERIFIKASI'}
            </button>
            ${deleteBtn}
          </div>
        </div>
      `;
    }).join('');
  },

  renderDrive(files) {
    const container = document.getElementById('driveContainer');
    if (!container || !files || files.length === 0) return;

    container.innerHTML = files.map(f => {
      const escapedName = (f.name || '').replace(/'/g, "\\'");
      return `
        <button onclick="WorkspaceModal.openDriveFolder('${f.id}', '${escapedName}')" class="p-3 rounded-xl bay-recessed border border-white/5 hover:border-blue-500/40 hover:bg-blue-500/5 transition flex items-center justify-between gap-2.5 group text-left w-full">
          <div class="flex items-center gap-2.5 min-w-0 flex-1">
            <span class="text-base flex-shrink-0 leading-none">📁</span>
            <div class="min-w-0 flex-1">
              <div class="font-extrabold text-slate-200 text-xs truncate group-hover:text-blue-400 transition leading-snug">${f.name}</div>
              <div class="text-[9px] font-mono text-slate-500 tracking-wider mt-0.5">FOLDER RESMI • IN-APP</div>
            </div>
          </div>
          <span class="text-slate-500 group-hover:text-blue-400 text-xs font-mono font-bold flex-shrink-0">BUKA →</span>
        </button>
      `;
    }).join('');
  },

  async togglePos(id) {
    try {
      await CE_API.togglePos(id, this.subEventId);
      playChimeSound('chime');
      this.loadStatus();
    } catch (err) {
      showToast('Gagal toggle pos: ' + err.message, 'error');
    }
  },

  // Rundown Modal CRUD
  openRundownModal(itemId = null) {
    const item = itemId ? this.rawRundownCache.find(r => String(r.id) === String(itemId)) : null;
    const modal = document.getElementById('rundownModal');
    if (!modal) return;

    this.setText('rundownModalTitle', item ? '✏️ Edit Sesi Rundown' : '➕ Tambah Sesi Rundown');
    document.getElementById('editRundownId').value = item ? item.id : '';
    document.getElementById('inputRundownStart').value = item ? item.start : '08:00';
    document.getElementById('inputRundownEnd').value = item ? item.end : '08:30';
    document.getElementById('inputRundownTitle').value = item ? item.title : '';
    document.getElementById('inputRundownLocation').value = item ? item.location : 'Area Utama';
    document.getElementById('inputRundownPic').value = item ? item.pic : 'Central Event';
    document.getElementById('inputRundownNotes').value = item ? item.notes : '-';

    modal.classList.remove('opacity-0', 'pointer-events-none');
  },

  closeRundownModal() {
    document.getElementById('rundownModal')?.classList.add('opacity-0', 'pointer-events-none');
  },

  async saveRundownForm() {
    const id = document.getElementById('editRundownId')?.value;
    const start = document.getElementById('inputRundownStart')?.value.trim();
    const end = document.getElementById('inputRundownEnd')?.value.trim();
    const title = document.getElementById('inputRundownTitle')?.value.trim();
    const location = document.getElementById('inputRundownLocation')?.value.trim();
    const pic = document.getElementById('inputRundownPic')?.value.trim();
    const notes = document.getElementById('inputRundownNotes')?.value.trim();

    if (!title || !start || !end) {
      return alert('Jam mulai, selesai, dan mata acara wajib diisi!');
    }

    try {
      const item = { id: id ? Number(id) || id : undefined, start, end, title, location, pic, notes };
      await CE_API.saveRundownItem(this.subEventId, item);
      playChimeSound('success');
      showToast('Sesi rundown berhasil disimpan!', 'success');
      this.closeRundownModal();
      this.loadStatus();
    } catch (err) {
      showToast('Gagal menyimpan sesi: ' + err.message, 'error');
    }
  },

  async deleteRundownItem(id) {
    if (!confirm('Hapus sesi ini dari rundown?')) return;
    try {
      await CE_API.deleteRundownItem(this.subEventId, id);
      playChimeSound('delete');
      showToast('Sesi rundown dihapus.', 'info');
      this.loadStatus();
    } catch (err) {
      showToast('Gagal menghapus: ' + err.message, 'error');
    }
  },

  // Station Modal CRUD
  openStationModal() {
    document.getElementById('inputStationName').value = '';
    document.getElementById('inputStationPic').value = '';
    document.getElementById('stationModal')?.classList.remove('opacity-0', 'pointer-events-none');
  },

  closeStationModal() {
    document.getElementById('stationModal')?.classList.add('opacity-0', 'pointer-events-none');
  },

  async saveStationForm() {
    const name = document.getElementById('inputStationName')?.value.trim();
    const pic = document.getElementById('inputStationPic')?.value.trim();
    if (!name) return alert('Nama pos wajib diisi!');

    try {
      await CE_API.saveStation(this.subEventId, { name, pic });
      playChimeSound('success');
      showToast('Pos lapangan berhasil ditambahkan!', 'success');
      this.closeStationModal();
      this.loadStatus();
    } catch (err) {
      showToast('Gagal menambah pos: ' + err.message, 'error');
    }
  },

  async deleteStationItem(id) {
    if (!confirm('Hapus pos lapangan ini?')) return;
    try {
      await CE_API.deleteStation(this.subEventId, id);
      playChimeSound('delete');
      showToast('Pos lapangan dihapus.', 'info');
      this.loadStatus();
    } catch (err) {
      showToast('Gagal menghapus: ' + err.message, 'error');
    }
  },

  // Event Meta CRUD
  openEventMetaModal() {
    if (!this.currentEventData) return;
    document.getElementById('inputMetaVenue').value = this.currentEventData.venue || '';
    document.getElementById('inputMetaKpiPeserta').value = this.currentEventData.kpi?.targetPeserta || '';
    document.getElementById('inputMetaContingency').value = this.currentEventData.contingency || '';
    document.getElementById('eventMetaModal')?.classList.remove('opacity-0', 'pointer-events-none');
  },

  closeEventMetaModal() {
    document.getElementById('eventMetaModal')?.classList.add('opacity-0', 'pointer-events-none');
  },

  async saveEventMetaForm() {
    const venue = document.getElementById('inputMetaVenue')?.value.trim();
    const targetPeserta = document.getElementById('inputMetaKpiPeserta')?.value.trim();
    const contingency = document.getElementById('inputMetaContingency')?.value.trim();

    try {
      await CE_API.updateEventMeta(this.subEventId, {
        venue,
        contingency,
        kpi: { targetPeserta }
      });
      playChimeSound('success');
      showToast('Metadata event berhasil diperbarui!', 'success');
      this.closeEventMetaModal();
      this.loadStatus();
    } catch (err) {
      showToast('Gagal update meta: ' + err.message, 'error');
    }
  },

  async resetEventToDefault() {
    if (!confirm('Kembalikan data sesi dan pos ke template default Google Sheets?')) return;
    try {
      await CE_API.resetEvent(this.subEventId);
      playChimeSound('delete');
      showToast('Data dikembalikan ke template awal.', 'info');
      this.loadStatus();
    } catch (err) {
      showToast('Gagal reset template: ' + err.message, 'error');
    }
  },

  // AI Copilot for Sub-Event
  async askAi() {
    const input = document.getElementById('aiQuestionInput');
    const question = input?.value.trim();
    if (!question) return;

    const chatBox = document.getElementById('aiChatBox');
    const btn = document.getElementById('aiSendBtn');

    chatBox.innerHTML += `<div class="mt-2 text-blue-400 font-bold">👤 Kamu: ${question}</div>`;
    chatBox.innerHTML += `<div id="aiLoading" class="mt-1 text-slate-400 italic">🤖 Gemini sedang memikirkan jawaban...</div>`;
    input.value = '';
    if (btn) btn.disabled = true;

    try {
      const data = await CE_API.askAi(question, this.subEventId);
      document.getElementById('aiLoading')?.remove();
      chatBox.innerHTML += `<div class="mt-2 text-slate-200 bg-[#030712]/80 p-3 rounded-xl border border-slate-800 text-[11px] whitespace-pre-wrap leading-relaxed">${data.answer}</div>`;
      chatBox.scrollTop = chatBox.scrollHeight;
    } catch (err) {
      document.getElementById('aiLoading')?.remove();
      chatBox.innerHTML += `<div class="mt-1 text-rose-400">⚠️ Terjadi kesalahan: ${err.message}</div>`;
    } finally {
      if (btn) btn.disabled = false;
    }
  },

  // Gladi Simulation
  openSimulationDrawer() {
    document.getElementById('simDrawer')?.classList.remove('opacity-0', 'pointer-events-none');
  },

  closeSimulationDrawer() {
    document.getElementById('simDrawer')?.classList.add('opacity-0', 'pointer-events-none');
  },

  async setSim(time) {
    try {
      await CE_API.setSimulasi(time);
      playChimeSound('alert');
      showToast(`Mode simulasi aktif: ${time} WIB`, 'info');
      this.closeSimulationDrawer();
      this.loadStatus();
    } catch (err) {
      showToast('Gagal set simulasi: ' + err.message, 'error');
    }
  },

  async resetSim() {
    try {
      await CE_API.setSimulasi(null);
      playChimeSound('chime');
      showToast('Simulasi dimatikan. Kembali ke jam real-time.', 'info');
      this.closeSimulationDrawer();
      this.loadStatus();
    } catch (err) {
      showToast('Gagal reset simulasi: ' + err.message, 'error');
    }
  }
};

// Expose globally
window.EventHub = EventHub;

// Global shorthand proxies
function toggleEditMode() { EventHub.toggleEditMode(); }
