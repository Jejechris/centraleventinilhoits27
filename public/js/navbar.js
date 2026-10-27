/**
 * INI LHO ITS! 2027 — TACTICAL FLOATING MISSION DOCK
 * Floating Island Navigation with Aerospace Telemetry Indicators & Staff Profile Capsule
 */

const Navbar = {
  activePage: 'dashboard',

  init(activePage = 'dashboard') {
    this.activePage = activePage;
    this.render();
  },

  render() {
    const header = document.getElementById('mainHeader');
    if (!header) return;

    // Detached Floating Island Nav (Anti-Generic Mandate: Never glued to edges)
    header.className = "sticky top-3 sm:top-4 z-40 px-3 sm:px-6 w-full pointer-events-none";

    const navItems = [
      { id: 'dashboard', label: 'Mission Deck', href: '/index.html', icon: '⚡', code: 'DECK' },
      { id: 'safari', label: 'Safari Faculty', href: '/safari.html', icon: '🏛️', code: 'SF-01', star: true },
      { id: 'startpoint', label: 'Start Point', href: '/startpoint.html', icon: '🚀', code: 'SP-02' },
      { id: 'odl', label: 'One Day Lecture', href: '/odl.html', icon: '🎓', code: 'ODL-03' },
      { id: 'technocraft', label: 'Technocraft', href: '/technocraft.html', icon: '⚡', code: 'TC-04' }
    ];

    const pillsHtml = navItems.map(item => {
      const isActive = this.activePage === item.id;
      const activeClass = isActive ? 'active' : '';
      const starTag = item.star ? `<span class="hidden xl:inline text-[9px] font-mono text-amber-400 font-extrabold tracking-tighter ml-0.5">★PRI</span>` : '';

      return `
        <a href="${item.href}" class="dock-pill ${activeClass}">
          <span class="text-xs leading-none">${item.icon}</span>
          <span class="hidden md:inline font-bold">${item.label}</span>
          <span class="text-[9px] font-mono opacity-60 hidden lg:inline tracking-tight">${item.code}</span>
          ${starTag}
        </a>
      `;
    }).join('');

    header.innerHTML = `
      <div class="max-w-7xl mx-auto floating-dock flex items-center justify-between gap-2 sm:gap-3 pointer-events-auto">
        
        <!-- Left: Mission Call-Sign & Sub-Event Segmented Switcher -->
        <div class="flex items-center gap-2 sm:gap-3 overflow-hidden">
          
          <!-- Tactical Brand Glyph -->
          <a href="/index.html" class="flex items-center gap-2.5 group pl-1.5 py-0.5">
            <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-500 p-[1px] shadow-sm flex items-center justify-center transition-transform group-hover:scale-105">
              <div class="w-full h-full bg-[#07090E] rounded-full flex items-center justify-center font-mono font-black text-white text-[10px] tracking-tighter">
                ILI
              </div>
            </div>
            <div class="hidden sm:block">
              <div class="flex items-center gap-1.5">
                <span class="text-[9px] font-mono font-extrabold tracking-widest text-slate-400 uppercase">CE·OPS 2027</span>
              </div>
              <div class="text-[11px] font-extrabold text-white group-hover:text-blue-400 transition tracking-tight">
                CENTRAL EVENT
              </div>
            </div>
          </a>

          <div class="h-5 w-[1px] bg-white/10 hidden md:block"></div>

          <!-- Segmented Mission Hub Pills -->
          <nav class="flex items-center gap-1 overflow-x-auto custom-scrollbar py-0.5 max-w-[280px] sm:max-w-md lg:max-w-none">
            ${pillsHtml}
          </nav>
        </div>

        <!-- Right: Action Center & Mission Telemetry -->
        <div class="flex items-center gap-1.5 sm:gap-2">
          
          <!-- Staff Profile Capsule -->
          <button onclick="Onboarding.openModal(true)" title="Identitas & Penugasan Staf" class="btn-ghost py-1 px-2.5 group flex items-center gap-2 cursor-pointer">
            <span class="text-xs">👤</span>
            <div class="text-left hidden sm:block">
              <span id="headerStaffName" class="font-extrabold text-white block leading-none text-[11px]">Panitia CE</span>
              <span id="headerStaffRole" class="text-[9px] font-mono text-slate-400 block mt-0.5 leading-none">STAFF AHLI</span>
            </div>
          </button>

          <!-- Edit Mode Toggle Switch -->
          <button id="editModeBtn" onclick="toggleEditMode()" class="btn-ghost py-1 px-2.5">
            <span id="editModeIcon" class="text-xs">✏️</span>
            <span id="editModeLabel" class="hidden xl:inline text-[10px] font-mono font-bold">EDIT: OFF</span>
          </button>

          <!-- Theme Toggle Switcher -->
          <button onclick="toggleTheme()" title="Beralih Tema Gelap / Terang" class="btn-ghost py-1 px-2.5">
            <span id="themeToggleIcon" class="text-xs">🌙</span>
            <span id="themeToggleLabel" class="hidden 2xl:inline text-[10px] font-mono font-bold">DARK</span>
          </button>

          <!-- Audio Alert Beacon -->
          <button onclick="toggleAudioAlarm()" title="Beacon Audio & Sinyal" class="btn-ghost py-1 px-2">
            <span id="audioToggleIcon" class="text-xs">🔊</span>
          </button>

          <!-- Real-Time WIB Telemetry Clock -->
          <div id="liveClock" class="bay-recessed px-2.5 py-1 font-mono text-[11px] font-extrabold text-blue-400 hidden lg:block tracking-tight">
            --:--:-- WIB
          </div>

          <!-- PWA Standalone Capsule -->
          <button id="pwaInstallBtn" onclick="installPWA()" class="hidden sm:inline-flex btn-tactical py-1 px-2.5">
            <span>APP</span>
            <div class="btn-icon-bay">↓</div>
          </button>
        </div>
      </div>
    `;

    // Re-sync states
    ThemeManager.applyTheme(ThemeManager.theme);
    ThemeManager.updateAudioButton();
    const profile = Onboarding.getProfile();
    Onboarding.updateHeader(profile);
  }
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
