/**
 * INI LHO ITS! 2027 — TACTICAL SIDEBAR & TOPBAR CONSOLE
 * Enterprise Dashboard Architecture with Collapsible Mobile Drawer, Breadcrumbs & Telemetry Controls
 */

const Sidebar = {
  activePage: 'dashboard', // dashboard | safari | startpoint | odl | technocraft
  isMobileOpen: false,

  init(activePage = 'dashboard') {
    this.activePage = activePage;
    this.render();
    this.bindEvents();
  },

  getActiveSubEvent() {
    if (this.activePage === 'dashboard' || !this.activePage) return 'safari';
    return this.activePage;
  },

  render() {
    const sidebarEl = document.getElementById('sidebarNav');
    const topbarEl = document.getElementById('topBar');
    if (!sidebarEl || !topbarEl) return;

    // Sub-event definitions
    const navItems = [
      { id: 'dashboard', label: 'Mission Overview', href: '/index.html', icon: '⚡', code: 'DECK', badge: 'Overview' },
      { id: 'safari', label: 'Safari Faculty', href: '/safari.html', icon: '🏛️', code: 'SF-01', star: true, badge: 'Flagship' },
      { id: 'startpoint', label: 'Start Point', href: '/startpoint.html', icon: '🚀', code: 'SP-02', badge: 'Gating' },
      { id: 'odl', label: 'One Day Lecture', href: '/odl.html', icon: '🎓', code: 'ODL-03', badge: 'Academic' },
      { id: 'technocraft', label: 'Technocraft', href: '/technocraft.html', icon: '⚡', code: 'TC-04', badge: 'Arena' }
    ];

    const currentItem = navItems.find(i => i.id === this.activePage) || navItems[0];
    const profile = typeof Onboarding !== 'undefined' ? Onboarding.getProfile() : { roleType: 'core', assignedEvent: 'all' };
    const isCore = typeof Onboarding !== 'undefined' ? Onboarding.isCoreStaff() : true;

    // Generate Navigation Links with Role Isolation
    const navLinksHtml = navItems.map(item => {
      const isActive = this.activePage === item.id;
      const isDashboard = item.id === 'dashboard';
      const isMySubEvent = !isDashboard && profile.assignedEvent === item.id;
      const isRestricted = !isCore && !isDashboard && !isMySubEvent;

      let activeClass = '';
      if (isActive) {
        activeClass = 'bg-blue-600/15 text-white border-blue-500/50 shadow-sm shadow-blue-500/10 font-extrabold';
      } else if (isRestricted) {
        activeClass = 'text-slate-600 hover:text-slate-400 hover:bg-white/[0.02] border-transparent opacity-60';
      } else {
        activeClass = 'text-slate-400 hover:text-white hover:bg-white/5 border-transparent';
      }

      let tagHtml = '';
      if (isMySubEvent) {
        tagHtml = '<span class="text-[8px] font-mono text-emerald-400 font-extrabold px-1 rounded bg-emerald-500/10 border border-emerald-500/30">TUGAS SAYA</span>';
      } else if (item.star && isCore) {
        tagHtml = '<span class="text-[8px] font-mono text-amber-400 font-extrabold px-1 rounded bg-amber-400/10 border border-amber-400/20">★</span>';
      } else if (isRestricted) {
        tagHtml = '<span class="text-[9px] text-slate-600" title="Akses Terbatas: Khusus Staff Terkait / Staff Ahli">🔒</span>';
      }

      return `
        <a href="${item.href}" class="sidebar-nav-link ${isActive ? 'active' : ''} flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition border ${activeClass} group">
          <div class="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
            <span class="text-sm leading-none flex-shrink-0">${item.icon}</span>
            <span class="truncate font-semibold tracking-tight">${item.label}</span>
            ${tagHtml}
          </div>
          <div class="flex items-center gap-1.5 flex-shrink-0">
            ${isActive ? '<span class="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse mr-1"></span>' : ''}
            <span class="text-[9px] font-mono font-bold text-slate-500 group-hover:text-slate-400">${item.code}</span>
          </div>
        </a>
      `;
    }).join('');

    // RENDER SIDEBAR (Desktop Fixed + Mobile Off-canvas Drawer)
    sidebarEl.className = "fixed inset-y-0 left-0 z-50 w-72 backdrop-blur-2xl border-r flex flex-col justify-between transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] " + (this.isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0");

    sidebarEl.innerHTML = `
      <!-- TOP: Brand Identity & Telemetry Status -->
      <div class="p-5 border-b border-white/5">
        <div class="flex items-center justify-between">
          <a href="/index.html" class="flex items-center gap-3 group">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-500 p-[1.5px] shadow-lg shadow-blue-500/20 flex items-center justify-center transition-transform group-hover:scale-105">
              <div class="w-full h-full bg-[#07090E] rounded-[10px] flex items-center justify-center font-mono font-black text-white text-xs tracking-tighter brand-glyph">
                ILI
              </div>
            </div>
            <div>
              <div class="flex items-center gap-1.5">
                <span class="text-[9px] font-mono font-extrabold tracking-widest text-slate-400 uppercase">CE·OPS 2027</span>
              </div>
              <div class="text-xs font-black text-white group-hover:text-blue-400 transition tracking-tight">
                CENTRAL EVENT DECK
              </div>
            </div>
          </a>

          <!-- Mobile Close Button -->
          <button id="mobileSidebarClose" onclick="Sidebar.toggleMobile(false)" class="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 text-xs">
            ✕
          </button>
        </div>

        <!-- Telemetry Status Ribbon -->
        <div class="mt-4 p-2.5 rounded-xl bay-recessed border-white/5 flex items-center justify-between text-[10px] font-mono">
          <div class="flex items-center gap-2">
            <span class="text-slate-300 font-bold">SYSTEM ACTIVE</span>
          </div>
          <span class="text-amber-400 font-bold" id="sidebarCountdownBadge">H-81 DAYS</span>
        </div>
      </div>

      <!-- MIDDLE: Navigation Menu & Sections -->
      <div class="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-5">
        
        <!-- Section 1: Core Command Decks -->
        <div>
          <div class="text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase px-2 mb-2 flex items-center justify-between">
            <span>CORE COMMAND DECKS</span>
            <span class="text-[9px] text-blue-400">4 PILAR</span>
          </div>
          <nav class="space-y-1">
            ${navLinksHtml}
          </nav>
        </div>

        <!-- Section 2: Operational Utilities & Shortcuts -->
        <div>
          <div class="text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase px-2 mb-2">
            OPERATIONAL TOOLS
          </div>
          <div class="space-y-1.5">
            <button onclick="WorkspaceModal.openDrive()" class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-white/5 transition border border-transparent group">
              <div class="flex items-center gap-2.5">
                <span class="text-sm">📁</span>
                <span class="font-medium">Google Drive Repo</span>
              </div>
              <span class="text-[9px] font-mono text-slate-500 font-bold group-hover:text-blue-400">IN-APP ↗</span>
            </button>

            <button onclick="WorkspaceModal.openSheet()" class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-white/5 transition border border-transparent group">
              <div class="flex items-center gap-2.5">
                <span class="text-sm">📊</span>
                <span class="font-medium">Google Sheets Live</span>
              </div>
              <span class="text-[9px] font-mono text-emerald-400 font-bold group-hover:text-emerald-300">EDIT LIVE ↗</span>
            </button>

            <a href="https://t.me/bolo_ce_bot" target="_blank" class="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-white/5 transition border border-transparent">
              <div class="flex items-center gap-2.5">
                <span class="text-sm">🤖</span>
                <span class="font-medium">Telegram Bot</span>
              </div>
              <span class="text-[9px] font-mono text-blue-400 font-bold">@bolo_ce_bot ↗</span>
            </a>
          </div>
        </div>

        <!-- Section 3: Readiness Mini-Widget -->
        <div class="p-3.5 rounded-2xl bay-recessed border-white/5">
          <div class="text-[9px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>PROGRESS KESIAPAN</span>
            <span class="text-emerald-400 font-extrabold" id="sidebarReadinessPct">--%</span>
          </div>
          <div class="w-full bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div id="sidebarReadinessBar" class="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500" style="width: 0%"></div>
          </div>
          <div class="text-[9px] font-mono text-slate-500 mt-2 flex items-center justify-between">
            <span>KONTROL STAFF AHLI</span>
            <span id="sidebarReadinessCount" class="font-bold text-amber-400">0-100%</span>
          </div>
        </div>

      </div>

      <!-- BOTTOM: Staff Profile & Tactical Controls -->
      <div class="p-4 border-t border-white/5 sidebar-bottom-tray space-y-3">
        
        <!-- User Profile Capsule -->
        <button onclick="Onboarding.openModal(true)" class="w-full flex items-center justify-between p-2.5 rounded-xl bay-recessed hover:border-blue-500/40 transition group text-left cursor-pointer">
          <div class="flex items-center gap-3 min-w-0 flex-1 mr-2">
            <div class="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-500/40 text-blue-400 font-mono font-bold flex items-center justify-center text-xs flex-shrink-0">
              👤
            </div>
            <div class="min-w-0 flex-1">
              <div id="headerStaffName" class="font-extrabold text-white text-xs truncate leading-snug">Panitia CE</div>
              <div id="headerStaffRole" class="text-[9px] font-mono text-slate-400 truncate mt-0.5 leading-tight">Staff Ahli Central Event</div>
            </div>
          </div>
          <span class="text-[9px] font-mono font-bold text-slate-500 group-hover:text-blue-400 flex-shrink-0 px-2 py-0.5 rounded bay-recessed border border-white/5">EDIT ⚙️</span>
        </button>

        <!-- Quick Control Buttons Grid -->
        <div class="grid grid-cols-3 gap-2 pt-1">
          <button id="sidebarThemeBtn" onclick="toggleTheme()" title="Mode Gelap / Terang" class="btn-ghost py-1.5 px-2 justify-center text-[11px] rounded-lg">
            <span id="themeToggleIcon">🌙</span>
            <span id="themeToggleLabel" class="text-[9px] font-mono font-bold ml-1">DARK</span>
          </button>
          
          <button id="sidebarAudioBtn" onclick="toggleAudioAlarm()" title="Sinyal Suara" class="btn-ghost py-1.5 px-2 justify-center text-[11px] rounded-lg">
            <span id="audioToggleIcon">🔊</span>
          </button>

          <button onclick="installPWA()" id="pwaInstallBtn" class="btn-ghost py-1.5 px-2 justify-center text-[10px] font-mono font-bold rounded-lg text-amber-400 border-amber-500/30">
            <span>📥 APP</span>
          </button>
        </div>

      </div>
    `;

    // RENDER TOP BAR (Inside Main Content Area)
    topbarEl.className = "sticky top-0 z-40 backdrop-blur-xl border-b transition-colors duration-200 !p-0";

    const targetSubEvent = this.activePage === 'dashboard' ? 'safari' : this.activePage;

    topbarEl.innerHTML = `
      <div class="px-4 sm:px-6 py-2.5">
        <div class="max-w-7xl mx-auto flex items-center justify-between gap-3">
          
          <!-- Left: Hamburger Trigger (Mobile) + Breadcrumb Context -->
          <div class="flex items-center gap-3">
            <!-- Mobile Drawer Toggle -->
            <button id="mobileSidebarTrigger" onclick="Sidebar.toggleMobile(true)" class="lg:hidden p-2 rounded-xl bay-recessed text-slate-300 hover:text-white border-white/10">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>

            <!-- Breadcrumb & Context -->
            <div>
              <div class="flex items-center gap-1.5 leading-none">
                <span class="text-[9px] font-mono font-bold text-slate-500 tracking-wider uppercase">CENTRAL EVENT 2027</span>
                <span class="text-slate-600 text-[10px]">/</span>
                <span class="text-[10px] font-mono font-bold text-blue-400 tracking-wide uppercase">${currentItem.code}</span>
              </div>
              <h1 class="text-sm sm:text-base font-extrabold text-white font-display tracking-tight flex items-center gap-2 mt-1 leading-snug">
                <span>${currentItem.icon}</span>
                <span>${currentItem.label}</span>
                ${currentItem.star ? '<span class="text-[8px] font-mono text-amber-400 font-extrabold px-1.5 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20">★ FLAGSHIP</span>' : ''}
              </h1>
            </div>
          </div>

          <!-- Right: Telemetry Actions & Direct In-App Triggers -->
          <div class="flex items-center gap-2 sm:gap-2.5">
            
            <!-- Direct Buttons for Spreadsheet & Drive In-App -->
            <button onclick="WorkspaceModal.openSheet('${targetSubEvent}')" title="Buka Spreadsheet In-App (Full Edit)" class="btn-tactical py-1.5 px-3 text-xs flex items-center gap-1.5 font-bold shadow-sm">
              <span>📊</span>
              <span class="font-mono text-[11px]">Buka Sheet</span>
            </button>

            <button onclick="WorkspaceModal.openDriveForSubEvent('${targetSubEvent}')" title="Jelajah Google Drive In-App" class="btn-ghost py-1.5 px-3 text-xs text-blue-400 border-blue-500/30 hover:border-blue-500 flex items-center gap-1.5 font-bold">
              <span>📁</span>
              <span class="font-mono text-[11px]">Google Drive</span>
            </button>

            <!-- Mode Edit Button -->
            <button id="editModeBtn" onclick="Sidebar.handleEditModeClick()" class="btn-ghost py-1.5 px-2.5 text-xs hidden sm:inline-flex">
              <span id="editModeIcon">✏️</span>
              <span id="editModeLabel" class="font-mono font-bold text-[10px]">EDIT</span>
            </button>

            <!-- Live Clock WIB -->
            <div id="liveClock" class="bay-recessed px-3 py-1.5 font-mono text-xs font-bold text-blue-400 hidden lg:block tracking-tight">
              --:--:-- WIB
            </div>
          </div>

        </div>
      </div>

      <!-- Persistent Sub-Header Preparation Bar -->
      <div class="border-t border-white/5 bg-black/20 px-4 sm:px-6 py-1.5">
        <div class="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
          <div class="flex items-center gap-2">
            <span class="eyebrow-pill amber text-[8px] font-mono font-extrabold tracking-wider">TAHAP PERSIAPAN</span>
            <span class="text-[10px] font-mono text-slate-300 hidden sm:inline">Kurasi berkas, progress tracker, & sheet aktif: <b>${currentItem.label}</b></span>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="WorkspaceModal.openSheet('${targetSubEvent}')" class="text-[11px] font-mono font-bold text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1">
              <span>📊 Spreadsheet ${currentItem.code}</span>
            </button>
            <span class="text-slate-600">•</span>
            <button onclick="WorkspaceModal.openDriveForSubEvent('${targetSubEvent}')" class="text-[11px] font-mono font-bold text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1">
              <span>📁 Drive ${currentItem.code}</span>
            </button>
            <span class="text-slate-600 hidden sm:inline">•</span>
            <button onclick="WorkspaceModal.openUploadModal()" class="text-[11px] font-mono font-bold text-slate-400 hover:text-white hover:underline hidden sm:inline-flex items-center gap-1">
              <span>📤 Unggah File</span>
            </button>
          </div>
        </div>
      </div>
    `;

    // Render Backdrop overlay for mobile drawer
    let backdrop = document.getElementById('sidebarBackdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'sidebarBackdrop';
      backdrop.onclick = () => Sidebar.toggleMobile(false);
      document.body.appendChild(backdrop);
    }
    backdrop.className = "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-300 " + (this.isMobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none");

    // Sync theme, audio, and user credentials
    ThemeManager.applyTheme(ThemeManager.theme);
    ThemeManager.updateAudioButton();
    Onboarding.updateHeader(profile);
  },

  toggleMobile(forceState) {
    this.isMobileOpen = forceState !== undefined ? forceState : !this.isMobileOpen;
    const sidebarEl = document.getElementById('sidebarNav');
    const backdrop = document.getElementById('sidebarBackdrop');

    if (sidebarEl) {
      if (this.isMobileOpen) {
        sidebarEl.classList.remove('-translate-x-full');
        sidebarEl.classList.add('translate-x-0');
      } else {
        sidebarEl.classList.remove('translate-x-0');
        sidebarEl.classList.add('-translate-x-full');
      }
    }

    if (backdrop) {
      backdrop.className = "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-300 " + (this.isMobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none");
    }
  },

  bindEvents() {
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 1024 && this.isMobileOpen) {
        this.toggleMobile(false);
      }
    });
  },

  handleEditModeClick() {
    if (typeof EventHub !== 'undefined' && typeof EventHub.toggleEditMode === 'function') {
      EventHub.toggleEditMode();
    } else {
      showToast('Buka Hub Acara (Safari, Start Point, dll) untuk mengedit Tracker Progress 0-100%!', 'info');
    }
  },

  updateAccessRestrictions() {
    this.render();
  }
};

window.toggleEditMode = function() {
  Sidebar.handleEditModeClick();
};

// PWA Installer Listener
let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const btn = document.getElementById('pwaInstallBtn');
  if (btn) btn.classList.remove('hidden');
});

function installPWA() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        document.getElementById('pwaInstallBtn')?.classList.add('hidden');
      }
      deferredPrompt = null;
    });
  }
}
