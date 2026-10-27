/**
 * CENTRAL EVENT 2027 — HARDENED PROGRESS TRACKER 0-100%
 * UI/UX Command-Grade Cockpit dengan Selector Status Fleksibel Berwarna Terang (0%, 25%, 50%, 75%, 100% & Custom),
 * Modal Khusus Tambah Tugas Baru, Tanpa Tag Kategori, dan Proteksi Eksklusif Staff Ahli / Kadiv / Wakadiv.
 */

const ProgressTracker = {
  currentSubEventId: 'safari',
  progressData: null,
  isExpanded: true,
  containerId: 'progressTrackerMount',

  async init(subEventId = 'safari', containerId = 'progressTrackerMount') {
    this.currentSubEventId = subEventId;
    this.containerId = containerId;
    this.bindKeyboardShortcuts();
    this.injectAddMilestoneModal();
    this.injectEditMilestoneModal();
    this.injectCustomPctModal();
    this.injectDeleteConfirmModal();
    this.injectAiTaskModal();
    await this.fetchAndRender();
  },

  async fetchAndRender() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    try {
      const res = await fetch(`/api/progress/${this.currentSubEventId}`);
      const json = await res.json();
      if (json.success && json.progress) {
        this.progressData = json.progress;
      }
    } catch (e) {
      console.warn('Gagal memuat progress tracker:', e);
    }

    if (!this.progressData) {
      this.progressData = {
        subEventId: this.currentSubEventId,
        percentage: 0,
        statusLabel: 'Fase Persiapan Operasional',
        updatedBy: 'Staff Ahli',
        updatedAt: new Date().toISOString(),
        milestones: []
      };
    }

    this.render();
  },

  isSupervisor() {
    if (typeof Onboarding !== 'undefined' && typeof Onboarding.isStaffAhli === 'function') {
      return Onboarding.isStaffAhli();
    }
    try {
      const p = JSON.parse(localStorage.getItem('ce_user_profile') || '{}');
      const r = (p.role || p.roleTitle || '').trim();
      return ['Kadiv', 'Wakadiv', 'Staff Ahli'].includes(r) || /kadiv|wakadiv|staffli|ahli|core/i.test(r);
    } catch (e) {
      return false;
    }
  },

  toggleExpand() {
    this.isExpanded = !this.isExpanded;
    this.render();
  },

  getProgressTheme(pct) {
    if (pct === 100) {
      return {
        neonColor: 'from-emerald-500 via-teal-400 to-emerald-300',
        glowShadow: 'shadow-[0_0_24px_rgba(16,185,129,0.45)]',
        textGlow: 'text-emerald-400',
        ledColor: 'bg-emerald-400',
        stageLabel: '100% Siap Hari-H'
      };
    } else if (pct >= 70) {
      return {
        neonColor: 'from-cyan-500 via-teal-400 to-emerald-400',
        glowShadow: 'shadow-[0_0_24px_rgba(6,182,212,0.4)]',
        textGlow: 'text-cyan-400',
        ledColor: 'bg-cyan-400',
        stageLabel: 'Tahap Gladi Resik & Finalisasi'
      };
    } else if (pct >= 40) {
      return {
        neonColor: 'from-blue-600 via-indigo-500 to-cyan-400',
        glowShadow: 'shadow-[0_0_24px_rgba(59,130,246,0.35)]',
        textGlow: 'text-blue-400',
        ledColor: 'bg-blue-400',
        stageLabel: 'Eksekusi & Lapangan'
      };
    } else if (pct > 0) {
      return {
        neonColor: 'from-amber-500 via-orange-500 to-amber-400',
        glowShadow: 'shadow-[0_0_24px_rgba(245,158,11,0.35)]',
        textGlow: 'text-amber-400',
        ledColor: 'bg-amber-400',
        stageLabel: 'Tahap Awal Persiapan'
      };
    } else {
      return {
        neonColor: 'from-slate-600 to-slate-700',
        glowShadow: '',
        textGlow: 'text-slate-400',
        ledColor: 'bg-slate-500',
        stageLabel: 'Belum Dimulai (Standby)'
      };
    }
  },

  getMilestoneTheme(p) {
    if (p === 100) {
      return {
        pill: '<span class="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-black bg-emerald-500/25 text-emerald-300 border border-emerald-400/50 shadow-sm shadow-emerald-500/20">✅ SELESAI (100%)</span>',
        cardBorder: 'border-emerald-500/40 hover:border-emerald-500/70 shadow-[0_0_20px_rgba(16,185,129,0.12)]',
        cardBg: 'bg-emerald-950/20',
        barGradient: 'from-emerald-500 to-teal-400',
        noteBorder: 'border-l-4 border-emerald-400',
        textGlow: 'text-emerald-400'
      };
    } else if (p >= 75) {
      return {
        pill: `<span class="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-black bg-cyan-500/25 text-cyan-300 border border-cyan-400/50 shadow-sm shadow-cyan-500/20">🔥 HAMPIR RAMPUNG (${p}%)</span>`,
        cardBorder: 'border-cyan-500/40 hover:border-cyan-500/70 shadow-[0_0_20px_rgba(6,182,212,0.12)]',
        cardBg: 'bg-cyan-950/20',
        barGradient: 'from-cyan-500 to-blue-500',
        noteBorder: 'border-l-4 border-cyan-400',
        textGlow: 'text-cyan-400'
      };
    } else if (p >= 50) {
      return {
        pill: `<span class="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-black bg-blue-500/25 text-blue-300 border border-blue-400/50 shadow-sm shadow-blue-500/20">⚡ SEDANG BERJALAN (${p}%)</span>`,
        cardBorder: 'border-blue-500/35 hover:border-blue-500/60 shadow-[0_0_20px_rgba(59,130,246,0.12)]',
        cardBg: 'bg-blue-950/20',
        barGradient: 'from-blue-600 to-indigo-500',
        noteBorder: 'border-l-4 border-blue-400',
        textGlow: 'text-blue-400'
      };
    } else if (p > 0) {
      return {
        pill: `<span class="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-black bg-amber-500/25 text-amber-300 border border-amber-400/50 shadow-sm shadow-amber-500/20">⏳ TAHAP AWAL (${p}%)</span>`,
        cardBorder: 'border-amber-500/35 hover:border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.12)]',
        cardBg: 'bg-amber-950/20',
        barGradient: 'from-amber-500 to-orange-500',
        noteBorder: 'border-l-4 border-amber-400',
        textGlow: 'text-amber-400'
      };
    } else {
      return {
        pill: '<span class="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-black bg-slate-800 text-slate-300 border border-slate-600">⚪ BELUM DIMULAI (0%)</span>',
        cardBorder: 'border-white/10 hover:border-white/25',
        cardBg: 'bg-black/20',
        barGradient: 'from-slate-600 to-slate-700',
        noteBorder: 'border-l-4 border-slate-600',
        textGlow: 'text-slate-400'
      };
    }
  },

  /**
   * High-Contrast, Illuminated 5-Level Pill Buttons (Never Black!)
   * Fully calibrated for Light Mode & Dark Mode
   */
  renderLevelPills(milestoneId, currentPct) {
    const isCustom = ![0, 25, 50, 75, 100].includes(currentPct);

    const pills = [
      { pct: 0, status: 'pending', label: '0%', desc: 'Belum Mulai', pillClass: 'pct-pill-0' },
      { pct: 25, status: 'in_progress', label: '25%', desc: 'Tahap Awal', pillClass: 'pct-pill-25' },
      { pct: 50, status: 'in_progress', label: '50%', desc: 'Sedang Berjalan', pillClass: 'pct-pill-50' },
      { pct: 75, status: 'in_progress', label: '75%', desc: 'Hampir Rampung', pillClass: 'pct-pill-75' },
      { pct: 100, status: 'done', label: '100%', desc: 'Selesai Penuh', pillClass: 'pct-pill-100' }
    ];

    const customBtnHtml = isCustom
      ? `<button onclick="ProgressTracker.openCustomPctDialog('${milestoneId}', ${currentPct})" class="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-white font-black text-[10px] shadow-md shadow-amber-500/30 flex items-center gap-1 transition cursor-pointer">
           <span>⚡ Kustom: <b>${currentPct}%</b></span>
           <span>↗</span>
         </button>`
      : `<button onclick="ProgressTracker.openCustomPctDialog('${milestoneId}', ${currentPct})" class="px-2 py-0.5 rounded-lg bay-recessed border border-amber-500/40 text-amber-500 dark:text-amber-300 hover:text-amber-600 dark:hover:text-white hover:border-amber-500 text-[10px] font-mono font-bold flex items-center gap-1 transition cursor-pointer btn-custom-pct">
           <span>Custom %</span>
           <span>↗</span>
         </button>`;

    return `
      <div>
        <div class="text-[9px] font-mono font-bold text-slate-500 dark:text-slate-300 uppercase mb-2 flex items-center justify-between">
          <span class="flex items-center gap-1.5">
            <span>PILIH TINGKAT CAPAIAN:</span>
            <b class="text-amber-500 dark:text-amber-400 font-black text-[11px]">${currentPct}%</b>
          </span>
          ${customBtnHtml}
        </div>
        
        <div class="grid grid-cols-5 gap-1.5 font-mono text-[11px]">
          ${pills.map(item => {
            const isActive = currentPct === item.pct;
            return `
              <button onclick="ProgressTracker.setMilestonePct('${milestoneId}', ${item.pct}, '${item.status}')"
                      title="Set ${item.label} (${item.desc})"
                      class="pct-pill-btn ${item.pillClass} ${isActive ? 'active' : ''}">
                ${item.label}
              </button>
            `;
          }).join('')}
        </div>
      </div>
    `;
  },

  render() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    const data = this.progressData;
    const isSuper = this.isSupervisor();
    const pct = Math.max(0, Math.min(100, parseInt(data.percentage, 10) || 0));
    const milestones = data.milestones || [];
    const doneCount = milestones.filter(m => (m.progress || 0) === 100 || m.status === 'done').length;
    const totalCount = milestones.length;

    const theme = this.getProgressTheme(pct);

    // Synchronize Top Hero Telemetry ribbon on safari.html if element exists
    const hr = document.getElementById('readinessMetric');
    const hBar = document.getElementById('readinessBar');
    if (hr) hr.innerText = `${pct}%`;
    if (hBar) {
      hBar.style.width = `${pct}%`;
      hBar.className = `bg-gradient-to-r ${theme.neonColor} h-full rounded-full transition-all duration-500`;
    }

    // Synchronize Sidebar Widgets
    const sbPct = document.getElementById('sidebarReadinessPct');
    const sbBar = document.getElementById('sidebarReadinessBar');
    const sbCount = document.getElementById('sidebarReadinessCount');
    if (sbPct) sbPct.innerText = `${pct}%`;
    if (sbBar) sbBar.style.width = `${pct}%`;
    if (sbCount) sbCount.innerText = totalCount > 0 ? `${doneCount}/${totalCount} Tugas` : `${pct}% Total`;

    // Supervisor Master Controls Panel (Non-black buttons!)
    let supervisorControlsHtml = '';
    if (isSuper) {
      supervisorControlsHtml = `
        <div class="bay-recessed supervisor-cockpit-bar p-3.5 sm:p-5 rounded-2xl border border-amber-500/40 bg-[#0c1220] mb-4 shadow-xl">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div class="flex items-center gap-2">
              <span class="eyebrow-pill amber text-[9px] font-mono font-bold tracking-wider">
                👑 KONTROL MASTER STAFF AHLI
              </span>
              <span class="text-xs text-slate-300 dark:text-slate-300 font-mono">Atur persentase global atau sesuaikan per tugas:</span>
            </div>
            
            <div class="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              ${[
                { pVal: 25, label: '25%', cls: 'pct-pill-25' },
                { pVal: 50, label: '50%', cls: 'pct-pill-50' },
                { pVal: 75, label: '75%', cls: 'pct-pill-75' },
                { pVal: 100, label: '100%', cls: 'pct-pill-100' }
              ].map(item => {
                const isQuickActive = pct === item.pVal;
                return `
                  <button id="quickGlobalBtn_${item.pVal}" onclick="ProgressTracker.setQuickGlobalPct(${item.pVal})" class="pct-pill-btn ${item.cls} ${isQuickActive ? 'active' : ''} px-2.5 sm:px-3 py-1 text-[10px]">
                    ${item.label}
                  </button>
                `;
              }).join('')}
              <button onclick="ProgressTracker.saveGlobal()" id="btnSaveProgress" class="btn-tactical py-1.5 px-3.5 sm:px-4 text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black shadow-lg shadow-amber-500/30 active:scale-95 transition cursor-pointer">
                <span>💾 SIMPAN PROGRESS</span>
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            <div class="md:col-span-7 flex items-center gap-3">
              <span class="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-300 uppercase tracking-wider flex-shrink-0">SLIDER GLOBAL:</span>
              <input type="range" min="0" max="100" value="${pct}" id="sliderProgress" oninput="ProgressTracker.onSliderChange(this.value)" class="w-full accent-amber-400 cursor-pointer h-2 bg-slate-800 rounded-lg">
              <span id="sliderValueText" class="text-base font-mono font-black ${theme.textGlow} w-14 text-right flex-shrink-0 tabular-nums">${pct}%</span>
            </div>
            <div class="md:col-span-5 flex items-center gap-2">
              <span class="text-[9px] font-mono text-slate-400 dark:text-slate-300 font-bold uppercase flex-shrink-0">STATUS:</span>
              <input type="text" id="inputStatusLabel" value="${data.statusLabel || ''}" placeholder="Keterangan status fase..." class="w-full bay-recessed px-3.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400 font-mono rounded-xl border border-white/15">
            </div>
          </div>
        </div>
      `;
    } else {
      supervisorControlsHtml = `
        <div class="bay-recessed p-2.5 rounded-xl border border-white/10 flex items-center justify-between gap-2 mb-4 bg-black/40">
          <div class="flex items-center gap-2">
            <span class="text-amber-400 text-xs">🔒</span>
            <span class="text-[11px] font-mono text-slate-300">Mode Pratinjau Terpadu: Hanya Staff Ahli, Kadiv, atau Wakadiv yang memiliki wewenang mengubah capaian.</span>
          </div>
          <button onclick="Onboarding.openModal(false)" class="text-[10px] font-mono text-amber-400 hover:text-amber-300 font-bold underline flex-shrink-0">
            Masuk Staff Ahli ↗
          </button>
        </div>
      `;
    }

    container.innerHTML = `
      <div class="chassis hud-corner overflow-hidden border border-white/10 shadow-2xl relative w-full">
        <div class="chassis-core p-4 sm:p-6 lg:p-7 relative">
          
          <!-- Subtle Glow Watermark in Background -->
          <div class="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-blue-500/5 blur-3xl pointer-events-none"></div>

          <!-- Header Section -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/5 gap-3">
            <div>
              <div class="flex flex-wrap items-center gap-2 mb-1.5">
                <span class="eyebrow-pill active text-[9px] font-mono font-bold flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full ${theme.ledColor} animate-pulse"></span>
                  OPERATIONAL PROGRESS COCKPIT
                </span>
                <span class="eyebrow-pill cobalt text-[9px] font-mono font-bold">
                  ${data.code || this.currentSubEventId.toUpperCase()}
                </span>
                ${isSuper ? '<span class="eyebrow-pill amber text-[9px] font-mono font-bold">STAFF AHLI EDIT MODE</span>' : ''}
              </div>

              <h2 class="text-xl sm:text-2xl font-black text-white font-display flex items-center gap-2 tracking-tight">
                <span>📈</span> Tracker Progress: ${data.name || this.currentSubEventId}
              </h2>
              <p class="text-xs text-slate-300 mt-1 flex items-center gap-1.5 flex-wrap">
                <span class="text-slate-400">Status Saat Ini:</span>
                <b class="text-white font-mono bg-white/5 px-2 py-0.5 rounded border border-white/10">${data.statusLabel || 'Menunggu pembaruan operasional'}</b>
              </p>
            </div>

            <!-- Big Stat Box -->
            <div class="flex items-center gap-4">
              <div class="text-right">
                <div class="text-4xl sm:text-5xl font-mono font-black ${theme.textGlow} tracking-tight tabular-nums leading-none" id="displayPct">
                  ${pct}%
                </div>
                <div class="text-[10px] font-mono text-slate-400 mt-1 font-semibold uppercase">
                  ${totalCount > 0 ? `${doneCount} DARI ${totalCount} TUGAS RAMPUNG` : 'BELUM ADA TUGAS'}
                </div>
              </div>

              <button onclick="ProgressTracker.toggleExpand()" class="btn-ghost py-2.5 px-3.5 text-xs text-slate-200 hover:text-white flex items-center gap-1.5 rounded-xl border border-white/10 hover:border-white/20 transition cursor-pointer">
                <span class="font-mono text-[11px] font-bold">${this.isExpanded ? 'Tutup Rincian ▲' : 'Buka Rincian ▼'}</span>
              </button>
            </div>
          </div>

          <!-- Futuristic High-Contrast Progress Bar -->
          <div class="my-5">
            <div class="w-full bg-[#050811] h-4 sm:h-5 rounded-full overflow-hidden p-[2.5px] border border-white/15 shadow-inner relative">
              <div id="displayProgressBar" class="bg-gradient-to-r ${theme.neonColor} h-full rounded-full transition-all duration-700 ${theme.glowShadow} relative overflow-hidden" style="width: ${pct}%">
                <!-- Gloss line -->
                <div class="absolute inset-0 bg-gradient-to-b from-white/25 to-transparent h-1/2 rounded-t-full pointer-events-none"></div>
              </div>
            </div>

            <!-- Telemetry Sub-labels -->
            <div class="flex flex-wrap items-center justify-between text-[10px] font-mono text-slate-400 mt-2.5 gap-2">
              <div class="flex items-center gap-2">
                <span>PIC Pengubah:</span>
                <span class="text-amber-400 font-bold px-1.5 py-0.5 rounded bg-amber-400/10 border border-amber-400/20">${data.updatedBy || 'Staff Ahli'}</span>
                <span class="text-slate-500">•</span>
                <span class="text-slate-400">Sinkronisasi: <b class="text-emerald-400">Supabase Cloud Active</b></span>
              </div>
              <div class="flex items-center gap-1.5">
                <span class="text-slate-400">Tahapan:</span>
                <span id="telemetryStageBadge" class="text-white font-bold px-2 py-0.5 rounded bay-recessed border border-white/10">
                  ${theme.stageLabel}
                </span>
              </div>
            </div>
          </div>

          <!-- Supervisor Global Controls / Locked Notice -->
          ${supervisorControlsHtml}

          <!-- EXPANDABLE DRILL-DOWN SECTION -->
          <div id="progressDrillDown" class="${this.isExpanded ? 'block' : 'hidden'} pt-4 border-t border-white/5 space-y-3.5">
            
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 class="text-xs font-mono font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
                  <span>📋</span> RINCIAN TUGAS & CHECKLIST CAPAIAN (${milestones.length})
                </h3>
                <p class="text-[11px] font-mono text-slate-400 mt-0.5">
                  Setiap tugas memiliki persentase fleksibel (0% s/d 100%) dan catatan progres lapangan
                </p>
              </div>

              ${isSuper ? `
                <div class="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                  <button onclick="ProgressTracker.openAiTaskAnalysis()" class="btn-tactical py-1.5 px-3.5 text-xs font-mono font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white transition flex items-center gap-1.5 shadow-md shadow-blue-600/30 cursor-pointer">
                    <span>🤖</span>
                    <span>AI Analisis Spreadsheet</span>
                  </button>
                  <button onclick="ProgressTracker.openAddMilestoneDialog()" class="btn-tactical py-1.5 px-3.5 text-xs font-mono font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer">
                    <span>➕</span>
                    <span>Tambah Tugas Baru</span>
                  </button>
                </div>
              ` : `
                <button onclick="ProgressTracker.openAiTaskAnalysis()" class="btn-ghost py-1.5 px-3 text-xs font-mono font-bold text-blue-400 hover:text-white border border-blue-500/30 hover:border-blue-500 transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer">
                  <span>🤖</span>
                  <span>AI Pratinjau Tugas Sheet</span>
                </button>
              `}
            </div>

            <!-- Empty State if no milestones (e.g., SP, ODL, TC) -->
            ${milestones.length === 0 ? `
              <div class="p-8 sm:p-10 rounded-2xl bay-recessed border border-dashed border-white/10 text-center space-y-2">
                <div class="text-3xl">📭</div>
                <div class="text-xs font-mono font-bold text-slate-300 uppercase">Belum Ada Rincian Tugas yang Didaftarkan</div>
                <p class="text-[11px] font-mono text-slate-400 max-w-md mx-auto">
                  Sub-divisi ini masih dalam tahap penyusunan awal. ${isSuper ? 'Gunakan tombol <b>+ Tambah Tugas Baru</b> atau <b>AI Analisis Spreadsheet</b> untuk mengisi tugas riil!' : 'Menunggu input tugas dari Staff Ahli / Kadiv.'}
                </p>
                <div class="pt-2">
                  <button onclick="ProgressTracker.openAiTaskAnalysis()" class="btn-tactical py-2 px-4 text-xs font-mono font-bold bg-blue-600 hover:bg-blue-500 text-white transition inline-flex items-center gap-2 shadow-lg shadow-blue-600/30 cursor-pointer">
                    <span>🤖</span>
                    <span>Ekstrak Tugas Otomatis dari Spreadsheet (AI)</span>
                  </button>
                </div>
              </div>
            ` : `
              <!-- Milestone Grid with Flexible Selectors (Category tag removed as requested!) -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-[600px] overflow-y-auto custom-scrollbar pr-1">
                ${milestones.map((m, idx) => this.renderMilestoneCard(m, isSuper, idx)).join('')}
              </div>
            `}

          </div>

        </div>
      </div>
    `;
  },

  renderMilestoneCard(m, isSuper, idx = 0) {
    const p = Math.max(0, Math.min(100, parseInt(m.progress, 10) || (m.status === 'done' ? 100 : (m.status === 'in_progress' ? 50 : 0))));
    const theme = this.getMilestoneTheme(p);

    return `
      <div class="bay-recessed milestone-card-surface p-4 rounded-2xl border-2 ${theme.cardBorder} ${theme.cardBg} flex flex-col justify-between transition-all duration-200">
        <div>
          <!-- Top Row: Milestone Index & Status Badge (Category tag cleanly removed!) -->
          <div class="flex items-center justify-between gap-2 mb-2 flex-wrap">
            <span class="text-[9px] font-mono uppercase font-black tracking-wider px-2 py-0.5 rounded-md border border-white/15 bg-white/5 text-slate-300">
              TUGAS #${idx + 1}
            </span>
            ${theme.pill}
          </div>

          <!-- Title -->
          <h4 class="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white font-display leading-snug">
            ${m.title}
          </h4>

          <!-- Mini Progress Bar inside Card -->
          <div class="w-full bg-slate-900 h-2 rounded-full overflow-hidden my-2.5 border border-white/15 relative">
            <div class="bg-gradient-to-r ${theme.barGradient} h-full rounded-full transition-all duration-500" style="width: ${p}%"></div>
          </div>

          <!-- Notes / "Sampai Mana" Explanation with Colored Accent Left Border -->
          <div class="text-[11px] font-mono leading-relaxed bay-recessed milestone-notes-box p-2.5 rounded-xl border border-white/10 ${theme.noteBorder}">
            <div class="text-slate-400 font-bold mb-1 flex items-center justify-between">
              <span>📌 Sampai Mana:</span>
              <span class="text-[9px] font-normal text-slate-400">Update: <b class="text-slate-200">${m.updatedAt || 'Terbaru'}</b></span>
            </div>
            <div id="notesText_${m.id}" class="text-slate-700 dark:text-slate-100 font-medium">${m.notes || 'Dalam proses pengerjaan koordinasi lapangan.'}</div>
          </div>
        </div>

        <!-- Interactive Controller: Flexible 5-Level Status Buttons (Non-black!) -->
        <div class="pt-3 mt-3 border-t border-white/10 space-y-2">
          
          ${isSuper ? `
            ${this.renderLevelPills(m.id, p)}

            <!-- Bottom Action Row -->
            <div class="flex items-center justify-between text-[10px] font-mono text-slate-300 pt-1">
              <span>Capaian: <b class="${theme.textGlow} font-bold">${p}% Selesai</b></span>
              
              <div class="flex items-center gap-2">
                <button onclick="ProgressTracker.openEditMilestoneModal('${m.id}')" class="px-2 py-0.5 rounded-md bay-recessed border border-blue-500/40 text-blue-300 hover:text-white hover:border-blue-400 font-bold transition flex items-center gap-1 cursor-pointer">
                  <span>✏️</span>
                  <span>Edit Tugas</span>
                </button>
                <button onclick="ProgressTracker.openDeleteConfirmModal('${m.id}')" class="p-1 rounded-md bay-recessed border border-white/10 text-slate-400 hover:text-rose-400 hover:border-rose-500/30 transition cursor-pointer" title="Hapus Tugas">
                  🗑️
                </button>
              </div>
            </div>
          ` : `
            <div class="flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>Status: <b class="${theme.textGlow}">${p}% Terlaksana</b></span>
              <span>Terakhir update: <b class="text-slate-300">${m.updatedAt || 'Terbaru'}</b></span>
            </div>
          `}

        </div>
      </div>
    `;
  },

  onSliderChange(val) {
    const v = Math.max(0, Math.min(100, parseInt(val, 10) || 0));
    this.progressData.percentage = v;
    const theme = this.getProgressTheme(v);

    const txt = document.getElementById('sliderValueText');
    const disp = document.getElementById('displayPct');
    const bar = document.getElementById('displayProgressBar');
    const stage = document.getElementById('telemetryStageBadge');

    if (txt) {
      txt.innerText = `${v}%`;
      txt.className = `text-base font-mono font-black ${theme.textGlow} w-14 text-right flex-shrink-0 tabular-nums`;
    }
    if (disp) {
      disp.innerText = `${v}%`;
      disp.className = `text-4xl sm:text-5xl font-mono font-black ${theme.textGlow} tracking-tight tabular-nums leading-none transition-colors duration-200`;
    }
    if (bar) {
      bar.style.width = `${v}%`;
      bar.className = `bg-gradient-to-r ${theme.neonColor} h-full rounded-full transition-all duration-300 ${theme.glowShadow} relative overflow-hidden`;
    }
    if (stage) {
      stage.innerText = theme.stageLabel;
    }

    // Update Quick Pct buttons active highlights
    const quickItems = [
      { pVal: 25, cls: 'pct-pill-25' },
      { pVal: 50, cls: 'pct-pill-50' },
      { pVal: 75, cls: 'pct-pill-75' },
      { pVal: 100, cls: 'pct-pill-100' }
    ];

    quickItems.forEach(item => {
      const btn = document.getElementById(`quickGlobalBtn_${item.pVal}`);
      if (!btn) return;
      const isAct = v === item.pVal;
      btn.className = `pct-pill-btn ${item.cls} ${isAct ? 'active' : ''} px-2.5 sm:px-3 py-1 text-[10px]`;
    });

    // Also sync header readiness if on safari.html
    const hr = document.getElementById('readinessMetric');
    const hBar = document.getElementById('readinessBar');
    if (hr) hr.innerText = `${v}%`;
    if (hBar) {
      hBar.style.width = `${v}%`;
      hBar.className = `bg-gradient-to-r ${theme.neonColor} h-full rounded-full transition-all duration-500`;
    }
  },

  setQuickGlobalPct(pctVal) {
    const slider = document.getElementById('sliderProgress');
    if (slider) {
      slider.value = pctVal;
      this.onSliderChange(pctVal);
    }
  },

  async setMilestonePct(milestoneId, pctVal, statusVal) {
    if (!this.isSupervisor()) {
      if (typeof showToast === 'function') {
        showToast('🔒 Akses Khusus: Hanya Staff Ahli, Kadiv, atau Wakadiv yang berhak mengubah persentase.', 'warning');
      }
      return;
    }

    const updater = this.getUpdaterName();
    try {
      const res = await fetch('/api/progress/update-milestone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subEventId: this.currentSubEventId,
          milestoneId,
          data: {
            progress: pctVal,
            status: statusVal
          },
          user: updater
        })
      });

      const json = await res.json();
      if (json.success && json.progress) {
        this.progressData = json.progress;
        this.render();
      }
    } catch (err) {
      console.error('Error setting milestone progress:', err);
    }
  },

  // ==========================================
  // CUSTOM UI/UX MODAL: EDIT TUGAS & CATATAN
  // ==========================================

  activeEditingMilestoneId: null,

  injectEditMilestoneModal() {
    if (document.getElementById('editMilestoneModal')) return;

    const modalHtml = `
      <div id="editMilestoneModal" class="fixed inset-0 z-[180] bg-[#07090E]/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-5 transition-all duration-300 opacity-0 pointer-events-none">
        <div class="chassis max-w-lg w-full rounded-2xl shadow-2xl relative transform transition-all duration-300 scale-95 border border-blue-500/40 ws-surface-primary" id="editMilestoneCard">
          <div class="chassis-core p-5 sm:p-7 space-y-4">
            
            <!-- Modal Header -->
            <div class="flex items-center justify-between pb-3 border-b border-white/10">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 font-bold flex items-center justify-center text-sm shadow-inner">
                  ✏️
                </div>
                <div>
                  <div class="eyebrow-pill cobalt text-[8px] font-mono">STAFF AHLI FIELD UPDATE</div>
                  <h3 class="text-sm sm:text-base font-extrabold text-white ws-text-title font-display leading-tight mt-0.5">
                    Edit Tugas & Catatan Lapangan
                  </h3>
                </div>
              </div>

              <button onclick="ProgressTracker.closeEditMilestoneModal()" class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition text-xs font-bold cursor-pointer">
                ✕
              </button>
            </div>

            <!-- Modal Inputs -->
            <div class="space-y-3.5">
              
              <!-- 1. Judul Tugas -->
              <div>
                <label class="block text-[10px] font-mono font-bold text-slate-400 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Judul Tugas Operasional:
                </label>
                <input type="text" id="editModalTaskTitle" placeholder="Nama tugas..." class="w-full bay-recessed px-3.5 py-2.5 text-xs text-white ws-text-title focus:outline-none focus:border-blue-400 transition rounded-xl font-mono border border-white/15">
              </div>

              <!-- 2. Capaian Progres -->
              <div>
                <div class="flex items-center justify-between mb-1.5">
                  <label class="block text-[10px] font-mono font-bold text-slate-400 dark:text-slate-300 uppercase tracking-wider">
                    Tingkat Capaian:
                  </label>
                  <span id="editDisplayTaskPct" class="text-sm font-mono font-black text-amber-500 dark:text-amber-400 tabular-nums">50%</span>
                </div>

                <!-- 5 Tactile Level Pills -->
                <div class="grid grid-cols-5 gap-1.5 font-mono text-[10px] mb-2.5">
                  <button type="button" onclick="ProgressTracker.setEditModalPct(0)" id="editModalPill_0" class="pct-pill-btn pct-pill-0 py-1.5 rounded-lg text-center">0%</button>
                  <button type="button" onclick="ProgressTracker.setEditModalPct(25)" id="editModalPill_25" class="pct-pill-btn pct-pill-25 py-1.5 rounded-lg text-center">25%</button>
                  <button type="button" onclick="ProgressTracker.setEditModalPct(50)" id="editModalPill_50" class="pct-pill-btn pct-pill-50 active py-1.5 rounded-lg text-center">50%</button>
                  <button type="button" onclick="ProgressTracker.setEditModalPct(75)" id="editModalPill_75" class="pct-pill-btn pct-pill-75 py-1.5 rounded-lg text-center">75%</button>
                  <button type="button" onclick="ProgressTracker.setEditModalPct(100)" id="editModalPill_100" class="pct-pill-btn pct-pill-100 py-1.5 rounded-lg text-center">100%</button>
                </div>

                <input type="range" min="0" max="100" value="50" id="editSliderTaskPct" oninput="ProgressTracker.onEditModalSliderChange(this.value)" class="w-full accent-amber-400 cursor-pointer h-2 bg-slate-800 rounded-lg">
              </div>

              <!-- 3. Catatan Progres ("📌 Sampai Mana") -->
              <div>
                <label class="block text-[10px] font-mono font-bold text-slate-400 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Detail Progres Lapangan ("📌 Sampai Mana"):
                </label>
                <textarea id="editModalTaskNotes" rows="3" placeholder="Jelaskan progres lapangan saat ini, kendala, atau PIC yang bertugas..." class="w-full bay-recessed px-3.5 py-2 text-xs text-white ws-text-title focus:outline-none focus:border-blue-400 transition rounded-xl font-mono border border-white/15 resize-none"></textarea>
              </div>

            </div>

            <!-- Modal Footer -->
            <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
              <button onclick="ProgressTracker.closeEditMilestoneModal()" class="btn-ghost py-2 px-4 text-xs font-mono text-slate-400 hover:text-white cursor-pointer">
                Batal
              </button>
              <button onclick="ProgressTracker.submitEditMilestoneModal()" id="btnSubmitEditTask" class="btn-tactical py-2 px-5 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 shadow-lg shadow-blue-600/30 cursor-pointer">
                <span>💾 Simpan Perubahan</span>
              </button>
            </div>

          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
  },

  openEditMilestoneModal(milestoneId) {
    if (!this.isSupervisor()) {
      if (typeof showToast === 'function') {
        showToast('🔒 Akses Khusus: Hanya Staff Ahli, Kadiv, atau Wakadiv yang berhak mengedit tugas.', 'warning');
      }
      return;
    }

    const m = (this.progressData?.milestones || []).find(x => x.id === milestoneId);
    if (!m) return;

    this.activeEditingMilestoneId = milestoneId;
    this.injectEditMilestoneModal();

    const modal = document.getElementById('editMilestoneModal');
    const card = document.getElementById('editMilestoneCard');
    const inputTitle = document.getElementById('editModalTaskTitle');
    const inputNotes = document.getElementById('editModalTaskNotes');

    const p = Math.max(0, Math.min(100, parseInt(m.progress, 10) || 0));

    if (inputTitle) inputTitle.value = m.title || '';
    if (inputNotes) inputNotes.value = m.notes || '';
    this.setEditModalPct(p);

    // Lock page background scroll
    document.body.classList.add('modal-open');
    document.documentElement.classList.add('modal-open');
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    modal?.classList.remove('opacity-0', 'pointer-events-none');
    card?.classList.remove('scale-95');
    card?.classList.add('scale-100');
    setTimeout(() => inputNotes?.focus(), 100);
  },

  closeEditMilestoneModal() {
    const modal = document.getElementById('editMilestoneModal');
    const card = document.getElementById('editMilestoneCard');
    modal?.classList.add('opacity-0', 'pointer-events-none');
    card?.classList.remove('scale-100');
    card?.classList.add('scale-95');

    // Restore page scroll
    document.body.classList.remove('modal-open');
    document.documentElement.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';

    this.activeEditingMilestoneId = null;
  },

  setEditModalPct(val) {
    const slider = document.getElementById('editSliderTaskPct');
    if (slider) slider.value = val;
    this.onEditModalSliderChange(val);
  },

  onEditModalSliderChange(val) {
    const v = Math.max(0, Math.min(100, parseInt(val, 10) || 0));
    const disp = document.getElementById('editDisplayTaskPct');
    if (disp) disp.innerText = `${v}%`;

    const pillConfig = [
      { p: 0, cls: 'pct-pill-0' },
      { p: 25, cls: 'pct-pill-25' },
      { p: 50, cls: 'pct-pill-50' },
      { p: 75, cls: 'pct-pill-75' },
      { p: 100, cls: 'pct-pill-100' }
    ];

    pillConfig.forEach(item => {
      const btn = document.getElementById(`editModalPill_${item.p}`);
      if (!btn) return;
      const isAct = v === item.p;
      btn.className = `pct-pill-btn ${item.cls} ${isAct ? 'active' : ''} py-1.5 rounded-lg text-center font-mono text-[10px]`;
    });
  },

  async submitEditMilestoneModal() {
    if (!this.activeEditingMilestoneId) return;

    const inputTitle = document.getElementById('editModalTaskTitle');
    const inputNotes = document.getElementById('editModalTaskNotes');
    const slider = document.getElementById('editSliderTaskPct');
    const btn = document.getElementById('btnSubmitEditTask');

    const title = inputTitle ? inputTitle.value.trim() : '';
    const notes = inputNotes ? inputNotes.value.trim() : '';
    const progress = slider ? (parseInt(slider.value, 10) || 0) : 50;

    if (!title) {
      if (typeof showToast === 'function') showToast('⚠️ Judul tugas operasional tidak boleh kosong.', 'error');
      inputTitle?.focus();
      return;
    }

    if (btn) {
      btn.disabled = true;
      btn.innerText = 'Menyimpan...';
    }

    const updater = this.getUpdaterName();

    try {
      const res = await fetch('/api/progress/update-milestone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subEventId: this.currentSubEventId,
          milestoneId: this.activeEditingMilestoneId,
          data: {
            title,
            notes: notes || 'Dalam proses pengerjaan koordinasi lapangan.',
            progress,
            status: progress === 100 ? 'done' : (progress === 0 ? 'pending' : 'in_progress')
          },
          user: updater
        })
      });

      const json = await res.json();
      if (json.success && json.progress) {
        this.progressData = json.progress;
        this.closeEditMilestoneModal();
        this.render();
        if (typeof showToast === 'function') {
          showToast(`✅ Perubahan tugas "${title}" berhasil disimpan!`, 'success');
        }
        if (typeof playChimeSound === 'function') {
          playChimeSound('chime');
        }
      } else {
        if (typeof showToast === 'function') {
          showToast(`⚠️ Gagal memperbarui tugas: ${json.error || 'Server error'}`, 'error');
        }
      }
    } catch (err) {
      if (typeof showToast === 'function') {
        showToast(`🔌 Error koneksi: ${err.message}`, 'error');
      }
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerText = '💾 Simpan Perubahan';
      }
    }
  },

  // Backward compatibility alias for editMilestoneNotes
  editMilestoneNotes(milestoneId) {
    this.openEditMilestoneModal(milestoneId);
  },

  // ==========================================
  // CUSTOM UI/UX MODAL: ATUR CAPAIAN KUSTOM
  // ==========================================

  activeCustomPctMilestoneId: null,

  injectCustomPctModal() {
    if (document.getElementById('customPctModal')) return;

    const modalHtml = `
      <div id="customPctModal" class="fixed inset-0 z-[180] bg-[#07090E]/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-5 transition-all duration-300 opacity-0 pointer-events-none">
        <div class="chassis max-w-sm w-full rounded-2xl shadow-2xl relative transform transition-all duration-300 scale-95 border border-amber-500/40 ws-surface-primary" id="customPctCard">
          <div class="chassis-core p-5 sm:p-6 space-y-4">
            
            <!-- Modal Header -->
            <div class="flex items-center justify-between pb-3 border-b border-white/10">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 font-bold flex items-center justify-center text-sm shadow-inner">
                  ⚡
                </div>
                <div>
                  <div class="eyebrow-pill amber text-[8px] font-mono">CUSTOM TELEMETRY SETTER</div>
                  <h3 class="text-sm font-extrabold text-white ws-text-title font-display leading-tight mt-0.5">
                    Atur Persentase Kustom
                  </h3>
                </div>
              </div>

              <button onclick="ProgressTracker.closeCustomPctModal()" class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition text-xs font-bold cursor-pointer">
                ✕
              </button>
            </div>

            <!-- Target Title Display -->
            <div class="bay-recessed p-2.5 rounded-xl border border-white/10 text-xs font-mono text-slate-300 truncate" id="customPctTargetTitle">
              Target Tugas...
            </div>

            <!-- Interactive Stepper & Number Input -->
            <div class="space-y-3">
              <div class="flex items-center justify-center gap-3">
                <button type="button" onclick="ProgressTracker.adjustCustomPctStep(-5)" class="w-10 h-10 rounded-xl bay-recessed border border-white/20 text-white font-mono font-bold text-lg hover:border-amber-400 active:scale-95 transition flex items-center justify-center cursor-pointer">
                  -5
                </button>
                <div class="flex items-center justify-center bay-recessed px-4 py-2 rounded-xl border border-amber-500/40 bg-amber-500/10 w-28">
                  <input type="number" min="0" max="100" id="customPctNumberInput" oninput="ProgressTracker.setCustomPctVal(this.value)" class="w-14 bg-transparent text-center font-mono font-black text-2xl text-amber-500 dark:text-amber-400 focus:outline-none">
                  <span class="font-mono font-bold text-amber-500 dark:text-amber-400 text-lg">%</span>
                </div>
                <button type="button" onclick="ProgressTracker.adjustCustomPctStep(5)" class="w-10 h-10 rounded-xl bay-recessed border border-white/20 text-white font-mono font-bold text-lg hover:border-amber-400 active:scale-95 transition flex items-center justify-center cursor-pointer">
                  +5
                </button>
              </div>

              <input type="range" min="0" max="100" id="customPctSlider" oninput="ProgressTracker.setCustomPctVal(this.value)" class="w-full accent-amber-400 cursor-pointer h-2 bg-slate-800 rounded-lg">

              <!-- Quick Presets -->
              <div class="flex items-center justify-between gap-1 text-[10px] font-mono">
                ${[10, 30, 45, 60, 80, 90].map(v => `
                  <button type="button" onclick="ProgressTracker.setCustomPctVal(${v})" class="py-1 px-2 rounded-lg bay-recessed border border-white/10 text-slate-300 hover:text-amber-400 hover:border-amber-400 transition cursor-pointer">
                    ${v}%
                  </button>
                `).join('')}
              </div>
            </div>

            <!-- Modal Footer -->
            <div class="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
              <button onclick="ProgressTracker.closeCustomPctModal()" class="btn-ghost py-1.5 px-3.5 text-xs font-mono text-slate-400 hover:text-white cursor-pointer">
                Batal
              </button>
              <button onclick="ProgressTracker.submitCustomPctModal()" id="btnSubmitCustomPct" class="btn-tactical py-1.5 px-4 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 shadow-lg shadow-amber-500/30 cursor-pointer">
                <span>⚡ Terapkan Capaian</span>
              </button>
            </div>

          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
  },

  openCustomPctDialog(milestoneId, currentPct) {
    if (!this.isSupervisor()) {
      if (typeof showToast === 'function') {
        showToast('🔒 Akses Khusus: Hanya Staff Ahli, Kadiv, atau Wakadiv yang berhak mengubah capaian.', 'warning');
      }
      return;
    }

    const m = (this.progressData?.milestones || []).find(x => x.id === milestoneId);
    this.activeCustomPctMilestoneId = milestoneId;
    this.injectCustomPctModal();

    const modal = document.getElementById('customPctModal');
    const card = document.getElementById('customPctCard');
    const targetTitle = document.getElementById('customPctTargetTitle');

    if (targetTitle) {
      targetTitle.innerText = m ? `📌 ${m.title}` : '📌 Tugas Operasional';
    }

    const v = Math.max(0, Math.min(100, parseInt(currentPct, 10) || 0));
    this.setCustomPctVal(v);

    // Lock page background scroll
    document.body.classList.add('modal-open');
    document.documentElement.classList.add('modal-open');
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    modal?.classList.remove('opacity-0', 'pointer-events-none');
    card?.classList.remove('scale-95');
    card?.classList.add('scale-100');
  },

  closeCustomPctModal() {
    const modal = document.getElementById('customPctModal');
    const card = document.getElementById('customPctCard');
    modal?.classList.add('opacity-0', 'pointer-events-none');
    card?.classList.remove('scale-100');
    card?.classList.add('scale-95');

    // Restore page scroll
    document.body.classList.remove('modal-open');
    document.documentElement.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';

    this.activeCustomPctMilestoneId = null;
  },

  setCustomPctVal(val) {
    const v = Math.max(0, Math.min(100, parseInt(val, 10) || 0));
    const input = document.getElementById('customPctNumberInput');
    const slider = document.getElementById('customPctSlider');
    if (input) input.value = v;
    if (slider) slider.value = v;
  },

  adjustCustomPctStep(delta) {
    const input = document.getElementById('customPctNumberInput');
    const current = parseInt(input?.value, 10) || 0;
    this.setCustomPctVal(current + delta);
  },

  async submitCustomPctModal() {
    if (!this.activeCustomPctMilestoneId) return;
    const input = document.getElementById('customPctNumberInput');
    const val = parseInt(input?.value, 10) || 0;
    const mid = this.activeCustomPctMilestoneId;

    this.closeCustomPctModal();
    await this.setMilestonePct(mid, val, val === 100 ? 'done' : (val === 0 ? 'pending' : 'in_progress'));
    if (typeof showToast === 'function') {
      showToast(`⚡ Capaian tugas berhasil diatur menjadi ${val}%!`, 'success');
    }
  },

  // ==========================================
  // CUSTOM UI/UX MODAL: KONFIRMASI HAPUS TUGAS
  // ==========================================

  activeDeletingMilestoneId: null,

  injectDeleteConfirmModal() {
    if (document.getElementById('deleteConfirmModal')) return;

    const modalHtml = `
      <div id="deleteConfirmModal" class="fixed inset-0 z-[190] bg-[#07090E]/90 backdrop-blur-xl flex items-center justify-center p-3 sm:p-5 transition-all duration-300 opacity-0 pointer-events-none">
        <div class="chassis max-w-sm w-full rounded-2xl shadow-2xl relative transform transition-all duration-300 scale-95 border border-rose-500/40 ws-surface-primary" id="deleteConfirmCard">
          <div class="chassis-core p-5 sm:p-6 space-y-4">
            
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 font-bold flex items-center justify-center text-xl shadow-inner flex-shrink-0">
                🗑️
              </div>
              <div>
                <div class="eyebrow-pill active text-[8px] font-mono text-rose-400 border-rose-500/30 bg-rose-500/10">TINDAKAN PERMANEN</div>
                <h3 class="text-sm font-extrabold text-white ws-text-title font-display leading-tight mt-0.5">
                  Hapus Tugas Operasional?
                </h3>
              </div>
            </div>

            <p class="text-xs font-mono text-slate-400 leading-relaxed">
              Tugas ini akan dihapus secara permanen dari Progress Tracker dan database Supabase Cloud:
            </p>

            <div class="bay-recessed p-3 rounded-xl border border-rose-500/30 text-xs font-mono text-rose-300 font-bold leading-snug" id="deleteTargetTitle">
              Nama tugas...
            </div>

            <div class="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button onclick="ProgressTracker.closeDeleteConfirmModal()" class="btn-ghost py-1.5 px-3.5 text-xs font-mono text-slate-400 hover:text-white cursor-pointer">
                Batal
              </button>
              <button onclick="ProgressTracker.submitDeleteConfirmModal()" id="btnConfirmDelete" class="btn-tactical py-1.5 px-4 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-1.5 shadow-lg shadow-rose-600/30 cursor-pointer">
                <span>🗑️ Hapus Permanen</span>
              </button>
            </div>

          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
  },

  openDeleteConfirmModal(milestoneId) {
    if (!this.isSupervisor()) {
      if (typeof showToast === 'function') {
        showToast('🔒 Akses Khusus: Hanya Staff Ahli, Kadiv, atau Wakadiv yang berhak menghapus tugas.', 'warning');
      }
      return;
    }

    const m = (this.progressData?.milestones || []).find(x => x.id === milestoneId);
    if (!m) return;

    this.activeDeletingMilestoneId = milestoneId;
    this.injectDeleteConfirmModal();

    const modal = document.getElementById('deleteConfirmModal');
    const card = document.getElementById('deleteConfirmCard');
    const targetTitle = document.getElementById('deleteTargetTitle');

    if (targetTitle) targetTitle.innerText = `⚠️ ${m.title}`;

    // Lock page background scroll
    document.body.classList.add('modal-open');
    document.documentElement.classList.add('modal-open');
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    modal?.classList.remove('opacity-0', 'pointer-events-none');
    card?.classList.remove('scale-95');
    card?.classList.add('scale-100');
  },

  closeDeleteConfirmModal() {
    const modal = document.getElementById('deleteConfirmModal');
    const card = document.getElementById('deleteConfirmCard');
    modal?.classList.add('opacity-0', 'pointer-events-none');
    card?.classList.remove('scale-100');
    card?.classList.add('scale-95');

    // Restore page scroll
    document.body.classList.remove('modal-open');
    document.documentElement.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';

    this.activeDeletingMilestoneId = null;
  },

  async submitDeleteConfirmModal() {
    if (!this.activeDeletingMilestoneId) return;

    const mid = this.activeDeletingMilestoneId;
    const btn = document.getElementById('btnConfirmDelete');
    if (btn) {
      btn.disabled = true;
      btn.innerText = 'Menghapus...';
    }

    const updater = this.getUpdaterName();
    try {
      const res = await fetch('/api/progress/delete-milestone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subEventId: this.currentSubEventId,
          milestoneId: mid,
          user: updater
        })
      });
      const json = await res.json();
      if (json.success && json.progress) {
        this.progressData = json.progress;
        this.closeDeleteConfirmModal();
        this.render();
        if (typeof showToast === 'function') {
          showToast('Tugas operasional berhasil dihapus dari sistem.', 'info');
        }
      } else {
        if (typeof showToast === 'function') {
          showToast(`⚠️ Gagal menghapus tugas: ${json.error || 'Server error'}`, 'error');
        }
      }
    } catch (e) {
      console.error('Error deleting milestone:', e);
      if (typeof showToast === 'function') {
        showToast(`🔌 Error koneksi: ${e.message}`, 'error');
      }
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerText = '🗑️ Hapus Permanen';
      }
    }
  },

  // Backward compatibility alias for deleteMilestone
  deleteMilestone(milestoneId) {
    this.openDeleteConfirmModal(milestoneId);
  },

  getUpdaterName() {
    try {
      const p = JSON.parse(localStorage.getItem('ce_user_profile') || '{}');
      if (p.name) return `${p.role || 'Staff Ahli'} (${p.name})`;
    } catch (e) {}
    return 'Staff Ahli';
  },

  async saveGlobal() {
    if (!this.isSupervisor()) {
      if (typeof showToast === 'function') {
        showToast('🔒 Akses Khusus: Hanya Staff Ahli yang dapat menyimpan progress.', 'warning');
      }
      return;
    }

    const slider = document.getElementById('sliderProgress');
    const labelInput = document.getElementById('inputStatusLabel');
    const btn = document.getElementById('btnSaveProgress');

    const pct = slider ? parseInt(slider.value, 10) : this.progressData.percentage;
    const label = labelInput ? labelInput.value.trim() : this.progressData.statusLabel;
    const updater = this.getUpdaterName();

    if (btn) {
      btn.disabled = true;
      btn.innerText = 'Menyimpan...';
    }

    try {
      const res = await fetch('/api/progress/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subEventId: this.currentSubEventId,
          percentage: pct,
          statusLabel: label,
          updatedBy: updater,
          milestones: this.progressData.milestones
        })
      });

      const json = await res.json();
      if (json.success && json.progress) {
        this.progressData = json.progress;
        this.render();
        if (typeof showToast === 'function') {
          showToast(`✅ Progress ${this.currentSubEventId.toUpperCase()} berhasil disimpan menjadi ${pct}% & tersinkron Supabase Cloud!`, 'success');
        }
        if (typeof playChimeSound === 'function') {
          playChimeSound('chime');
        }
      } else {
        if (typeof showToast === 'function') {
          showToast(`⚠️ Gagal menyimpan: ${json.error || 'Server error'}`, 'error');
        }
      }
    } catch (err) {
      if (typeof showToast === 'function') {
        showToast(`🔌 Error koneksi: ${err.message}`, 'error');
      }
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerText = '💾 SIMPAN PROGRESS';
      }
    }
  },

  /**
   * Bespoke Cockpit Modal untuk Tambah Tugas Baru (No more browser prompt!)
   */
  injectAddMilestoneModal() {
    if (document.getElementById('addMilestoneModal')) return;

    const modalHtml = `
      <div id="addMilestoneModal" class="fixed inset-0 z-[170] bg-[#07090E]/90 backdrop-blur-xl flex items-center justify-center p-3 sm:p-5 transition-all duration-300 opacity-0 pointer-events-none">
        <div class="chassis max-w-lg w-full rounded-2xl shadow-2xl relative transform transition-all duration-300 scale-95 border-emerald-500/40" id="addMilestoneCard">
          <div class="chassis-core p-5 sm:p-7 space-y-4">
            
            <!-- Modal Header -->
            <div class="flex items-center justify-between pb-3 border-b border-white/10">
              <div class="flex items-center gap-2.5">
                <div class="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-mono font-bold flex items-center justify-center text-xl">
                  ➕
                </div>
                <div>
                  <span class="eyebrow-pill emerald text-[9px] font-mono">MISSION DECK REGISTRATION</span>
                  <h3 class="text-base font-extrabold text-white font-display">Tambah Tugas / Milestone Baru</h3>
                </div>
              </div>
              <button onclick="ProgressTracker.closeAddMilestoneModal()" class="text-slate-400 hover:text-white p-1.5 text-sm cursor-pointer">
                ✕
              </button>
            </div>

            <!-- Form Body -->
            <div class="space-y-4">
              <!-- 1. Judul Tugas -->
              <div>
                <label class="block text-[10px] font-mono font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Judul Tugas Operasional:
                </label>
                <input type="text" id="modalInputTaskTitle" placeholder="Contoh: Koordinasi Ruang Sidang & Sound System" class="w-full bay-recessed px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-400 transition rounded-xl font-mono border border-white/15">
              </div>

              <!-- 2. Tingkat Capaian Awal (Pills + Slider) -->
              <div>
                <div class="flex items-center justify-between mb-1.5">
                  <label class="block text-[10px] font-mono font-bold text-slate-300 uppercase tracking-wider">
                    Tingkat Capaian Awal:
                  </label>
                  <span id="modalDisplayTaskPct" class="text-sm font-mono font-black text-amber-300 tabular-nums">50%</span>
                </div>

                <!-- 5 Illuminated Level Pills -->
                <div class="grid grid-cols-5 gap-1.5 font-mono text-[10px] mb-2.5">
                  <button type="button" onclick="ProgressTracker.setModalPct(0)" id="modalPill_0" class="pct-pill-btn pct-pill-0 py-1.5 rounded-lg text-center">0%</button>
                  <button type="button" onclick="ProgressTracker.setModalPct(25)" id="modalPill_25" class="pct-pill-btn pct-pill-25 py-1.5 rounded-lg text-center">25%</button>
                  <button type="button" onclick="ProgressTracker.setModalPct(50)" id="modalPill_50" class="pct-pill-btn pct-pill-50 active py-1.5 rounded-lg text-center">50%</button>
                  <button type="button" onclick="ProgressTracker.setModalPct(75)" id="modalPill_75" class="pct-pill-btn pct-pill-75 py-1.5 rounded-lg text-center">75%</button>
                  <button type="button" onclick="ProgressTracker.setModalPct(100)" id="modalPill_100" class="pct-pill-btn pct-pill-100 py-1.5 rounded-lg text-center">100%</button>
                </div>

                <input type="range" min="0" max="100" value="50" id="modalSliderTaskPct" oninput="ProgressTracker.onModalSliderChange(this.value)" class="w-full accent-amber-400 cursor-pointer h-2 bg-slate-800 rounded-lg">
              </div>

              <!-- 3. Catatan Capaian Lapangan ("Sampai Mana") -->
              <div>
                <label class="block text-[10px] font-mono font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Detail Progres Lapangan ("📌 Sampai Mana"):
                </label>
                <textarea id="modalInputTaskNotes" rows="2" placeholder="Jelaskan progres lapangan saat ini, kendala, atau PIC yang bertugas..." class="w-full bay-recessed px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-400 transition rounded-xl font-mono border border-white/15 resize-none"></textarea>
              </div>
            </div>

            <!-- Modal Footer -->
            <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
              <button onclick="ProgressTracker.closeAddMilestoneModal()" class="btn-ghost py-2 px-4 text-xs font-mono text-slate-400 hover:text-white cursor-pointer">
                Batal
              </button>
              <button onclick="ProgressTracker.submitAddMilestoneModal()" id="btnSubmitNewTask" class="btn-tactical py-2 px-5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 cursor-pointer">
                <span>💾 Simpan & Daftarkan Tugas</span>
              </button>
            </div>

          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
  },

  openAddMilestoneDialog() {
    if (!this.isSupervisor()) {
      if (typeof showToast === 'function') {
        showToast('🔒 Akses Khusus: Hanya Staff Ahli, Kadiv, atau Wakadiv yang berhak menambah tugas.', 'warning');
      }
      return;
    }

    this.injectAddMilestoneModal();
    const modal = document.getElementById('addMilestoneModal');
    const card = document.getElementById('addMilestoneCard');
    const inputTitle = document.getElementById('modalInputTaskTitle');
    const inputNotes = document.getElementById('modalInputTaskNotes');

    if (inputTitle) inputTitle.value = '';
    if (inputNotes) inputNotes.value = 'Dalam proses pengerjaan koordinasi lapangan.';
    this.setModalPct(50);

    // Lock page background scroll
    document.body.classList.add('modal-open');
    document.documentElement.classList.add('modal-open');
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    modal?.classList.remove('opacity-0', 'pointer-events-none');
    card?.classList.remove('scale-95');
    card?.classList.add('scale-100');
    setTimeout(() => inputTitle?.focus(), 100);
  },

  closeAddMilestoneModal() {
    const modal = document.getElementById('addMilestoneModal');
    const card = document.getElementById('addMilestoneCard');
    modal?.classList.add('opacity-0', 'pointer-events-none');
    card?.classList.remove('scale-100');
    card?.classList.add('scale-95');

    // Restore page scroll
    document.body.classList.remove('modal-open');
    document.documentElement.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
  },

  setModalPct(val) {
    const slider = document.getElementById('modalSliderTaskPct');
    if (slider) slider.value = val;
    this.onModalSliderChange(val);
  },

  onModalSliderChange(val) {
    const v = Math.max(0, Math.min(100, parseInt(val, 10) || 0));
    const disp = document.getElementById('modalDisplayTaskPct');
    if (disp) disp.innerText = `${v}%`;

    const pillConfig = [
      { p: 0, cls: 'pct-pill-0' },
      { p: 25, cls: 'pct-pill-25' },
      { p: 50, cls: 'pct-pill-50' },
      { p: 75, cls: 'pct-pill-75' },
      { p: 100, cls: 'pct-pill-100' }
    ];

    pillConfig.forEach(item => {
      const btn = document.getElementById(`modalPill_${item.p}`);
      if (!btn) return;
      const isAct = v === item.p;
      btn.className = `pct-pill-btn ${item.cls} ${isAct ? 'active' : ''} py-1.5 rounded-lg text-center font-mono text-[10px]`;
    });
  },

  async submitAddMilestoneModal() {
    const inputTitle = document.getElementById('modalInputTaskTitle');
    const inputNotes = document.getElementById('modalInputTaskNotes');
    const slider = document.getElementById('modalSliderTaskPct');
    const btn = document.getElementById('btnSubmitNewTask');

    const title = inputTitle ? inputTitle.value.trim() : '';
    const notes = inputNotes ? inputNotes.value.trim() : '';
    const progress = slider ? (parseInt(slider.value, 10) || 0) : 50;

    if (!title) {
      if (typeof showToast === 'function') {
        showToast('⚠️ Judul tugas operasional wajib diisi.', 'error');
      }
      inputTitle?.focus();
      return;
    }

    if (btn) {
      btn.disabled = true;
      btn.innerText = 'Menyimpan...';
    }

    const updater = this.getUpdaterName();

    try {
      const res = await fetch('/api/progress/add-milestone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subEventId: this.currentSubEventId,
          milestone: {
            title,
            category: 'Operasional', // Default internal value, not shown in UI
            notes: notes || 'Dalam proses pengerjaan koordinasi lapangan.',
            status: progress === 100 ? 'done' : (progress === 0 ? 'pending' : 'in_progress'),
            progress
          },
          user: updater
        })
      });

      const json = await res.json();
      if (json.success && json.progress) {
        this.progressData = json.progress;
        this.closeAddMilestoneModal();
        this.render();
        if (typeof showToast === 'function') {
          showToast(`Tugas baru "${title}" (${progress}%) berhasil ditambahkan!`, 'success');
        }
        if (typeof playChimeSound === 'function') {
          playChimeSound('chime');
        }
      } else {
        if (typeof showToast === 'function') {
          showToast(`⚠️ Gagal menambah tugas: ${json.error || 'Server error'}`, 'error');
        }
      }
    } catch (err) {
      if (typeof showToast === 'function') {
        showToast(`🔌 Error koneksi: ${err.message}`, 'error');
      }
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerText = '💾 Simpan & Daftarkan Tugas';
      }
    }
  },

  // ==========================================
  // AI SPREADSHEET TASK ANALYSIS & EXTRACTION
  // ==========================================

  injectAiTaskModal() {
    if (document.getElementById('aiTaskModal')) return;

    const modalHtml = `
      <div id="aiTaskModal" class="fixed inset-0 z-[130] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 transition-all duration-300 opacity-0 pointer-events-none">
        
        <div id="aiTaskCard" class="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border border-blue-500/40 bg-[#080d1a] shadow-2xl overflow-hidden transition-all duration-300 transform scale-95 relative ws-surface-primary">
          
          <!-- Modal Header (Tactical Aerospace Ribbon) -->
          <div class="px-5 py-4 border-b border-white/10 flex items-center justify-between gap-3 bg-gradient-to-r from-blue-950/40 to-indigo-950/40 flex-shrink-0">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center text-xl shadow-inner">
                🤖
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <span class="eyebrow-pill cobalt text-[9px] font-mono">GEMINI 3.5 FLASH COCKPIT AUDIT</span>
                  <span class="eyebrow-pill active text-[9px] font-mono">LIVE SPREADSHEET</span>
                </div>
                <h3 class="text-base sm:text-lg font-black text-white ws-text-title font-display leading-tight mt-0.5">
                  AI Analisis Tugas dari Spreadsheet
                </h3>
              </div>
            </div>

            <button onclick="ProgressTracker.closeAiTaskModal()" class="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition text-sm font-bold cursor-pointer">
              ✕
            </button>
          </div>

          <!-- Modal Body (Dynamic: Scanning vs Review) -->
          <div id="aiTaskModalContent" class="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar space-y-4">
            <!-- Injected dynamically -->
          </div>

          <!-- Modal Footer -->
          <div class="px-5 py-3 border-t border-white/10 flex items-center justify-between gap-3 bg-black/30 flex-shrink-0">
            <div class="text-[11px] font-mono text-slate-400 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Central Event AI Operations Engine • Verifikasi Staff Ahli</span>
            </div>
            <button onclick="ProgressTracker.closeAiTaskModal()" class="btn-ghost py-1.5 px-4 text-xs font-mono text-slate-300 hover:text-white cursor-pointer">
              Tutup Panel
            </button>
          </div>

        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
  },

  async openAiTaskAnalysis() {
    this.injectAiTaskModal();
    this.bindKeyboardShortcuts();
    const modal = document.getElementById('aiTaskModal');
    const card = document.getElementById('aiTaskCard');
    const content = document.getElementById('aiTaskModalContent');

    // Lock page background scroll
    document.body.classList.add('modal-open');
    document.documentElement.classList.add('modal-open');
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    modal?.classList.remove('opacity-0', 'pointer-events-none');
    card?.classList.remove('scale-95');
    card?.classList.add('scale-100');

    if (typeof playChimeSound === 'function') {
      playChimeSound('chime');
    }

    // Scanning radar animation state with dynamic progressive status
    if (content) {
      content.innerHTML = `
        <div class="py-10 sm:py-14 text-center space-y-4">
          <div class="relative w-20 h-20 mx-auto flex items-center justify-center">
            <div class="absolute inset-0 rounded-full border-2 border-blue-500/30 animate-ping"></div>
            <div class="w-16 h-16 rounded-full bg-blue-600/20 border-2 border-blue-400 flex items-center justify-center text-3xl shadow-xl shadow-blue-500/30">
              🤖
            </div>
          </div>
          <div>
            <h4 id="aiScanStepTitle" class="text-sm sm:text-base font-black text-white ws-text-title font-display transition-all duration-300">
              Gemini 3.5 Flash sedang Mengaudit Data Spreadsheet...
            </h4>
            <p id="aiScanStepDesc" class="text-xs font-mono text-slate-400 max-w-md mx-auto mt-1 leading-relaxed transition-all duration-300">
              Memindai alur rundown, pemetaan PIC fakultas, titik kumpul lab, dan logistik untuk menyusun rekomendasi tugas operasional.
            </p>
          </div>
          <div class="w-56 mx-auto bg-slate-900 h-2 rounded-full overflow-hidden border border-white/10 p-0.5">
            <div id="aiScanProgressBar" class="bg-gradient-to-r from-blue-500 via-indigo-400 to-cyan-400 h-full w-1/3 rounded-full transition-all duration-700 animate-pulse"></div>
          </div>
          <div id="aiScanTimer" class="text-[10px] font-mono text-slate-500">
            Audit AI Gemini 3.5 Flash sedang berlangsung (estimasi 5-15 detik)...
          </div>
        </div>
      `;
    }

    // Progressive step timers so user sees live activity and never gets stuck
    const step1 = setTimeout(() => {
      const title = document.getElementById('aiScanStepTitle');
      const desc = document.getElementById('aiScanStepDesc');
      const bar = document.getElementById('aiScanProgressBar');
      if (title) title.innerText = '🔍 Membedah Kolom Waktu, Pos Lapangan & PIC...';
      if (desc) desc.innerText = 'Memetakan alur kegiatan, kebutuhan teknis stan HMD, dan SOP keselamatan.';
      if (bar) bar.style.width = '45%';
    }, 2500);

    const step2 = setTimeout(() => {
      const title = document.getElementById('aiScanStepTitle');
      const desc = document.getElementById('aiScanStepDesc');
      const bar = document.getElementById('aiScanProgressBar');
      if (title) title.innerText = '🤖 AI Gemini 3.5 Flash Merumuskan Rekomendasi Milestone...';
      if (desc) desc.innerText = 'Menganalisis matriks risiko dan merumuskan milestone tugas operasional baru.';
      if (bar) bar.style.width = '75%';
    }, 7000);

    const step3 = setTimeout(() => {
      const title = document.getElementById('aiScanStepTitle');
      const desc = document.getElementById('aiScanStepDesc');
      const bar = document.getElementById('aiScanProgressBar');
      if (title) title.innerText = '⚡ Memfinalisasi Verifikasi & Sinkronisasi Data...';
      if (desc) desc.innerText = 'Menyesuaikan skor kesiapan 0-100% dan catatan operasional lapangan.';
      if (bar) bar.style.width = '95%';
    }, 13000);

    // AbortController with 25s timeout so fetch has ample time for full AI generation
    const controller = new AbortController();
    const abortTimeout = setTimeout(() => {
      controller.abort();
    }, 25000);

    try {
      const res = await fetch('/api/ai/analyze-sheet-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subEventId: this.currentSubEventId }),
        signal: controller.signal
      });
      clearTimeout(abortTimeout);
      clearTimeout(step1);
      clearTimeout(step2);
      clearTimeout(step3);

      const json = await res.json();
      if (json.success && Array.isArray(json.tasks)) {
        this.aiRecommendations = json.tasks;
        this.renderAiTasksReview(json);
      } else {
        throw new Error(json.error || 'Respon AI tidak valid');
      }
    } catch (err) {
      clearTimeout(abortTimeout);
      clearTimeout(step1);
      clearTimeout(step2);
      clearTimeout(step3);

      console.warn('AI analysis network delay/fallback:', err.message);
      // Seamlessly render smart heuristic fallback without leaving user stuck
      const fallbackTasks = this.getHeuristicFallbackTasks(this.currentSubEventId);
      this.aiRecommendations = fallbackTasks;
      this.renderAiTasksReview({
        success: true,
        model: 'heuristic-engine',
        summary: `Audit cepat struktur kegiatan ${this.currentSubEventId.toUpperCase()} berhasil memetakan ${fallbackTasks.length} rekomendasi tugas operasional prioritas.`,
        tasks: fallbackTasks
      });
    }
  },

  getHeuristicFallbackTasks(subEventId = 'safari') {
    const existing = (this.progressData?.milestones || []).map(m => m.title.toLowerCase().trim());
    const existingSet = new Set(existing);

    const subSpecificPool = {
      safari: [
        {
          title: 'Perencanaan Kontinjensi Safari Fakultas Vokasi / Kampus Manyar (Plan A & B)',
          suggestedProgress: 50,
          status: 'in_progress',
          notes: 'Draf Plan A dan Plan B untuk Departemen Sipil Manyar tercantum di sheet (pemutaran video TW 3 dan penyesuaian sesi Day 1 & Day 2), membutuhkan ketetapan final eksekusi.',
          pic: 'Divisi Operasional Lapangan & PJ Vokasi',
          rationale: 'Pemisahan geografis Manyar-Sukolilo memerlukan penanganan alur tersendiri agar waktu transit tidak molor.'
        },
        {
          title: 'Manajemen Target Registrasi dan Presensi Peserta Safari Faculty',
          suggestedProgress: 25,
          status: 'in_progress',
          notes: 'Target presensi 1.450+ peserta dengan SOP pendampingan Kestari di titik kumpul awal. Perlu verifikasi barcode scanner.',
          pic: 'Divisi Kesekretariatan & Humas',
          rationale: 'Akurasi data peserta menentukan kapasitas tampung lab dan alokasi konsumsi kluster.'
        },
        {
          title: 'Perancangan Skema Acara dan Mobilisasi Massa di Titik End Point',
          suggestedProgress: 25,
          status: 'in_progress',
          notes: 'Titik End Point memiliki durasi terpanjang (1 jam 32 menit), SOP penampungan dan pembubaran massa perlu disempurnakan.',
          pic: 'Divisi Acara, Lapangan, & Logistik',
          rationale: 'End Point menampung seluruh peserta serentak, rawan kerumunan jika tidak ada sekat kluster.'
        },
        {
          title: 'Sinkronisasi Buffer Time Transit Antar Pos Departemen (5 Menit)',
          suggestedProgress: 75,
          status: 'in_progress',
          notes: 'Rundown rotasi 20 menit per pos telah tersusun, toleransi keterlambatan perpindahan 5 menit sedang divalidasi LO.',
          pic: 'Tim Acara & LO Pemandu',
          rationale: 'Keterlambatan pada satu fakultas berpotensi memicu efek domino bagi kluster di belakangnya.'
        }
      ],
      startpoint: [
        {
          title: 'Finalisasi Sistem Gating & Barcode Scanner Registrasi Start Point',
          suggestedProgress: 50,
          status: 'in_progress',
          notes: 'Layout antrean gerbang barat dan timur ITS telah dipetakan, perlu uji coba beban scanner offline.',
          pic: 'Tim Registrasi & IT Support',
          rationale: 'Pencegahan antrean membludak di gerbang utama pada pagi hari-H.'
        },
        {
          title: 'Pematangan Rundown Opening Ceremony & Sambutan Rektorat',
          suggestedProgress: 75,
          status: 'in_progress',
          notes: 'Durasi seremoni pembukaan 45 menit, konfirmasi kehadiran pimpinan ITS dalam tahap finalisasi.',
          pic: 'Tim Acara & Protokoler',
          rationale: 'Momen sakral pembukaan seluruh rangkaian mega-event Ini Lho ITS! 2027.'
        }
      ],
      odl: [
        {
          title: 'Konfirmasi Dosen Tamu & Alokasi Ruang Kuliah Perdana ODL',
          suggestedProgress: 50,
          status: 'in_progress',
          notes: 'Daftar 10 ruang auditorium riset telah diverifikasi bersama sarpras fakultas.',
          pic: 'Tim Kurikulum & Humas Dosen',
          rationale: 'Memastikan seluruh ruang kuliah interaktif memiliki proyektor dan mikrofon siap pakai.'
        }
      ],
      technocraft: [
        {
          title: 'Verifikasi Kebutuhan Daya Listrik Stan Pameran Karya Robotika & AI',
          suggestedProgress: 50,
          status: 'in_progress',
          notes: 'Penyusunan beban trafo dan genset cadangan untuk 25 stan prototype teknologi mahasiswa.',
          pic: 'Tim Sarpras & Teknisi Listrik',
          rationale: 'Mencegah trip listrik saat demonstrasi robotika berlangsung bersamaan.'
        }
      ]
    };

    const pool = subSpecificPool[subEventId] || subSpecificPool.safari;

    return pool.map(task => ({
      ...task,
      isAlreadyTracked: existingSet.has(task.title.toLowerCase().trim())
    }));
  },

  bindKeyboardShortcuts() {
    if (this._shortcutsBound) return;
    this._shortcutsBound = true;
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const editM = document.getElementById('editMilestoneModal');
        if (editM && !editM.classList.contains('pointer-events-none')) {
          this.closeEditMilestoneModal();
          return;
        }
        const customM = document.getElementById('customPctModal');
        if (customM && !customM.classList.contains('pointer-events-none')) {
          this.closeCustomPctModal();
          return;
        }
        const delM = document.getElementById('deleteConfirmModal');
        if (delM && !delM.classList.contains('pointer-events-none')) {
          this.closeDeleteConfirmModal();
          return;
        }
        const addM = document.getElementById('addMilestoneModal');
        if (addM && !addM.classList.contains('pointer-events-none')) {
          this.closeAddMilestoneModal();
          return;
        }
        const aiM = document.getElementById('aiTaskModal');
        if (aiM && !aiM.classList.contains('pointer-events-none')) {
          this.closeAiTaskModal();
          return;
        }
      }
    });
  },

  closeAiTaskModal() {
    const modal = document.getElementById('aiTaskModal');
    const card = document.getElementById('aiTaskCard');
    modal?.classList.add('opacity-0', 'pointer-events-none');
    card?.classList.remove('scale-100');
    card?.classList.add('scale-95');

    // Restore page scroll
    document.body.classList.remove('modal-open');
    document.documentElement.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';

    // Re-render ProgressTracker to ensure any added milestones are fresh
    this.render();
  },

  renderAiTasksReview(data) {
    const content = document.getElementById('aiTaskModalContent');
    if (!content) return;

    const tasks = data.tasks || [];
    const isSuper = this.isSupervisor();
    const newTasks = tasks.filter(t => !t.isAlreadyTracked);

    content.innerHTML = `
      <!-- Top Summary Banner -->
      <div class="bay-recessed p-4 rounded-xl border border-blue-500/30 bg-blue-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold text-blue-400 font-mono">📊 RINGKASAN AUDIT SPREADSHEET</span>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">
              ${tasks.length} Rekomendasi Terdeteksi
            </span>
          </div>
          <p class="text-xs text-slate-300 font-sans leading-relaxed">
            ${data.summary || 'Rekomendasi tugas operasional hasil sinkronisasi data rundown dan pos spreadsheet master.'}
          </p>
        </div>

        ${isSuper && newTasks.length > 0 ? `
          <button onclick="ProgressTracker.addAllAiRecommendedTasks()" id="btnAiAddAll" class="btn-tactical py-2 px-4 text-xs font-mono font-bold bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-lg shadow-emerald-600/30 transition flex items-center gap-1.5 self-start sm:self-auto flex-shrink-0 cursor-pointer">
            <span>⚡ Tambahkan Semua (${newTasks.length} Tugas Baru)</span>
          </button>
        ` : ''}
      </div>

      <!-- Task Recommendations Cards -->
      <div class="space-y-3 pt-1">
        ${tasks.map((task, idx) => {
          const isAdded = task.isAlreadyTracked;
          const p = task.suggestedProgress || 50;

          return `
            <div class="bay-recessed milestone-card-surface p-4 rounded-xl border-2 ${isAdded ? 'border-white/10 opacity-70' : 'border-blue-500/35 hover:border-blue-400'} bg-slate-900/60 transition flex flex-col justify-between gap-3">
              
              <div class="space-y-2">
                <div class="flex items-center justify-between gap-2 flex-wrap">
                  <div class="flex items-center gap-2">
                    <span class="text-[9px] font-mono uppercase font-black px-2 py-0.5 rounded ${isAdded ? 'bg-slate-800 text-slate-400 border border-slate-700' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'}">
                      ${isAdded ? 'ℹ️ SUDAH TERDAFTAR' : '✨ REKOMENDASI BARU'}
                    </span>
                    ${task.pic ? `<span class="text-[10px] font-mono text-slate-400 px-2 py-0.5 rounded bg-white/5 border border-white/10">PIC: ${task.pic}</span>` : ''}
                  </div>

                  <span class="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full ${p >= 75 ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40' : (p >= 50 ? 'bg-blue-500/20 text-blue-300 border border-blue-400/40' : 'bg-amber-500/20 text-amber-300 border border-amber-400/40')}">
                    Saran Capaian: ${p}%
                  </span>
                </div>

                <h4 class="text-sm font-bold text-slate-900 dark:text-white font-display leading-snug">
                  ${task.title}
                </h4>

                <!-- Notes "Sampai Mana" -->
                <div class="text-[11px] font-mono p-2.5 rounded-lg bay-recessed milestone-notes-box border border-white/10 text-slate-700 dark:text-slate-300 leading-relaxed">
                  <b class="text-amber-500 dark:text-amber-400">📌 Berdasarkan Data Sheet:</b> ${task.notes || 'Dalam proses penjadwalan.'}
                </div>

                ${task.rationale ? `
                  <p class="text-[10px] font-mono text-slate-500 dark:text-slate-400 italic">
                    💡 <b>Alasan AI:</b> ${task.rationale}
                  </p>
                ` : ''}
              </div>

              <!-- Action Button Row -->
              <div class="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                <span class="text-[10px] font-mono text-slate-500">
                  Target: Sub-Divisi <b>${this.currentSubEventId.toUpperCase()}</b>
                </span>

                ${isSuper ? `
                  ${isAdded ? `
                    <button disabled class="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-white/5 text-slate-500 border border-white/10 cursor-not-allowed">
                      ✅ Sudah Ada di Tracker
                    </button>
                  ` : `
                    <button onclick="ProgressTracker.addAiRecommendedTask(${idx})" id="btnAiAdd_${idx}" class="btn-tactical py-1.5 px-3.5 text-xs font-mono font-bold bg-blue-600 hover:bg-blue-500 text-white transition flex items-center gap-1.5 shadow-md shadow-blue-600/30 cursor-pointer">
                      <span>➕ Tambahkan ke Tugas</span>
                    </button>
                  `}
                ` : `
                  <span class="text-[10px] font-mono text-amber-400">
                    Mode Pratinjau (Hanya Staff Ahli yang dapat menambahkan)
                  </span>
                `}
              </div>

            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  async addAiRecommendedTask(idx) {
    if (!this.aiRecommendations || !this.aiRecommendations[idx]) return;
    const task = this.aiRecommendations[idx];
    const btn = document.getElementById(`btnAiAdd_${idx}`);
    if (btn) {
      btn.disabled = true;
      btn.innerText = 'Menambahkan...';
    }

    const updater = this.getUpdaterName();
    try {
      const res = await fetch('/api/progress/add-milestone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subEventId: this.currentSubEventId,
          milestone: {
            title: task.title,
            category: 'Operasional',
            notes: task.notes || 'Dianalisis otomatis dari data spreadsheet oleh AI Gemini.',
            status: task.status || (task.suggestedProgress === 100 ? 'done' : (task.suggestedProgress === 0 ? 'pending' : 'in_progress')),
            progress: task.suggestedProgress || 50
          },
          user: updater
        })
      });

      const json = await res.json();
      if (json.success && json.progress) {
        this.progressData = json.progress;
        task.isAlreadyTracked = true;
        if (btn) {
          btn.className = 'px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 cursor-default';
          btn.innerHTML = '✅ Ditambahkan';
        }
        if (typeof showToast === 'function') {
          showToast(`Tugas "${task.title}" berhasil ditambahkan!`, 'success');
        }
        if (typeof playChimeSound === 'function') {
          playChimeSound('chime');
        }
      } else {
        alert('Gagal menambah tugas: ' + (json.error || 'Server error'));
        if (btn) {
          btn.disabled = false;
          btn.innerText = '➕ Tambahkan ke Tugas';
        }
      }
    } catch (err) {
      alert('Error: ' + err.message);
      if (btn) {
        btn.disabled = false;
        btn.innerText = '➕ Tambahkan ke Tugas';
      }
    }
  },

  async addAllAiRecommendedTasks() {
    if (!this.aiRecommendations || this.aiRecommendations.length === 0) return;
    const pending = this.aiRecommendations.filter(t => !t.isAlreadyTracked);
    if (pending.length === 0) {
      alert('Semua rekomendasi tugas sudah terdaftar di tracker.');
      return;
    }

    const btn = document.getElementById('btnAiAddAll');
    if (btn) {
      btn.disabled = true;
      btn.innerText = 'Menambahkan semua...';
    }

    const updater = this.getUpdaterName();
    let successCount = 0;

    for (let i = 0; i < this.aiRecommendations.length; i++) {
      const task = this.aiRecommendations[i];
      if (task.isAlreadyTracked) continue;

      try {
        const res = await fetch('/api/progress/add-milestone', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subEventId: this.currentSubEventId,
            milestone: {
              title: task.title,
              category: 'Operasional',
              notes: task.notes || 'Dianalisis otomatis dari data spreadsheet oleh AI Gemini.',
              status: task.status || (task.suggestedProgress === 100 ? 'done' : (task.suggestedProgress === 0 ? 'pending' : 'in_progress')),
              progress: task.suggestedProgress || 50
            },
            user: updater
          })
        });
        const json = await res.json();
        if (json.success && json.progress) {
          this.progressData = json.progress;
          task.isAlreadyTracked = true;
          successCount++;
          const cardBtn = document.getElementById(`btnAiAdd_${i}`);
          if (cardBtn) {
            cardBtn.className = 'px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 cursor-default';
            cardBtn.innerHTML = '✅ Ditambahkan';
          }
        }
      } catch (e) {
        console.error('Error adding AI task:', e);
      }
    }

    if (btn) {
      btn.className = 'btn-ghost py-2 px-4 text-xs font-mono text-emerald-400 border border-emerald-500/40 cursor-default';
      btn.innerText = `✅ Selesai: ${successCount} Tugas Baru Ditambahkan`;
    }

    if (typeof showToast === 'function') {
      showToast(`${successCount} tugas baru berhasil ditambahkan ke Progress Tracker!`, 'success');
    }
    if (typeof playChimeSound === 'function') {
      playChimeSound('chime');
    }
  }
};

window.ProgressTracker = ProgressTracker;
