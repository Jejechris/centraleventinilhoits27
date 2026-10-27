/**
 * CENTRAL EVENT 2027 — ROLE & ACCESS GATE MODULE
 * 4 Peran Utama: Kadiv, Wakadiv, Staff Ahli, Staff
 * - Kadiv, Wakadiv, Staff Ahli: Akses Penuh 4 Sub-Divisi & Hak Edit Tracker Progress 0-100%
 * - Staff: Ditugaskan pada 1 Sub-Divisi tertentu (Mode Baca Progress)
 */

const Onboarding = {
  selectedRole: 'Staff Ahli', // 'Kadiv' | 'Wakadiv' | 'Staff Ahli' | 'Staff'
  selectedEvent: 'all', // 'all' for Kadiv/Wakadiv/Staff Ahli, or 'safari' | 'startpoint' | 'odl' | 'technocraft'
  currentPageEventId: null,

  subEventMap: {
    safari: { name: 'Safari Faculty', code: 'SF-01', icon: '🏛️', url: '/safari.html' },
    startpoint: { name: 'Start Point', code: 'SP-02', icon: '🚀', url: '/startpoint.html' },
    odl: { name: 'One Day Lecture', code: 'ODL-03', icon: '🎓', url: '/odl.html' },
    technocraft: { name: 'Technocraft Playhouse', code: 'TC-04', icon: '⚡', url: '/technocraft.html' },
    all: { name: 'Semua Sub-Divisi (Akses Penuh)', code: 'CE-ALL', icon: '👑', url: '/index.html' }
  },

  init() {
    this.renderModal();
    this.checkProfile();
  },

  getProfile() {
    try {
      const raw = localStorage.getItem('ce_user_profile');
      if (raw) {
        let p = JSON.parse(raw);
        if (typeof p !== 'object' || p === null) p = {};

        const validRoles = ['Kadiv', 'Wakadiv', 'Staff Ahli', 'Staff'];
        
        // Strict normalization: Map any legacy or unlisted roles into exactly one of the 4 valid roles
        if (!validRoles.includes(p.role)) {
          const checkStr = `${p.role || ''} ${p.roleTitle || ''} ${p.roleType || ''} ${p.assignedEvent || ''}`.toLowerCase();
          if (/wakadiv/i.test(checkStr)) {
            p.role = 'Wakadiv';
          } else if (/kadiv/i.test(checkStr)) {
            p.role = 'Kadiv';
          } else if (/ahli|staffli|core|koordinator|lead|ketua/i.test(checkStr) || p.assignedEvent === 'all') {
            p.role = 'Staff Ahli';
          } else {
            p.role = 'Staff';
          }
        }

        // Standardize properties
        p.roleTitle = p.role;
        p.roleType = p.role === 'Staff' ? 'subevent' : 'core';

        if (p.role !== 'Staff') {
          p.assignedEvent = 'all';
          p.event = 'all';
        } else {
          // If Staff, assign to specific valid sub-event
          const validEvents = ['safari', 'startpoint', 'odl', 'technocraft'];
          if (!validEvents.includes(p.assignedEvent)) {
            p.assignedEvent = 'safari';
            p.event = 'safari';
          }
        }

        // Persist normalized profile immediately
        try {
          localStorage.setItem('ce_user_profile', JSON.stringify(p));
        } catch (e) {}

        return p;
      }
    } catch (e) {
      console.warn('Error reading staff profile:', e);
    }

    const defaultProfile = {
      name: 'Panitia CE',
      role: 'Staff Ahli',
      roleTitle: 'Staff Ahli',
      roleType: 'core',
      assignedEvent: 'all',
      event: 'all'
    };
    try {
      localStorage.setItem('ce_user_profile', JSON.stringify(defaultProfile));
    } catch (e) {}
    return defaultProfile;
  },

  // Supervisor Check (Kadiv, Wakadiv, Staff Ahli)
  isStaffAhli() {
    const p = this.getProfile();
    return ['Kadiv', 'Wakadiv', 'Staff Ahli'].includes(p.role) || p.assignedEvent === 'all' || p.roleType === 'core';
  },

  isCoreStaff() {
    return this.isStaffAhli();
  },

  canAccess(targetSubEventId) {
    if (!targetSubEventId || targetSubEventId === 'dashboard' || targetSubEventId === 'all') {
      return true;
    }
    const p = this.getProfile();
    // Kadiv, Wakadiv, Staff Ahli, or anyone with assignedEvent === 'all' has full access to ALL sub-events!
    if (this.isStaffAhli() || p.assignedEvent === 'all' || p.roleType === 'core') {
      return true;
    }
    // Specific Staff assignment
    return p.assignedEvent === targetSubEventId;
  },

  checkProfile() {
    const raw = localStorage.getItem('ce_user_profile');
    if (!raw) {
      this.openModal(false);
    } else {
      const profile = this.getProfile();
      this.updateHeader(profile);
    }
  },

  updateHeader(profile) {
    const nameEl = document.getElementById('headerStaffName');
    const roleEl = document.getElementById('headerStaffRole');
    
    if (nameEl) nameEl.innerText = profile.name || 'Panitia CE';
    if (roleEl) {
      if (profile.role === 'Kadiv') {
        roleEl.innerHTML = `<span class="text-amber-400 font-bold">👑 KADIV</span> • Akses Penuh`;
      } else if (profile.role === 'Wakadiv') {
        roleEl.innerHTML = `<span class="text-amber-400 font-bold">🛡️ WAKADIV</span> • Akses Penuh`;
      } else if (profile.role === 'Staff Ahli') {
        roleEl.innerHTML = `<span class="text-amber-400 font-bold">⚡ STAFF AHLI</span> • Akses Penuh`;
      } else {
        const sub = this.subEventMap[profile.assignedEvent] || { name: 'Sub-Divisi', code: 'SF-01' };
        roleEl.innerHTML = `<span class="text-blue-400 font-bold">👤 STAFF</span> • ${sub.name}`;
      }
    }
  },

  renderModal() {
    if (document.getElementById('onboardingGate')) return;

    const modalHtml = `
    <div id="onboardingGate" class="fixed inset-0 z-[200] bg-[#07090E]/95 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-5 transition-all duration-300 opacity-0 pointer-events-none">
      <div class="chassis max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden relative transform transition-all duration-300 scale-95 rounded-2xl shadow-2xl" id="onboardingCard">
        <div class="chassis-core p-5 sm:p-7 overflow-y-auto custom-scrollbar flex-1">
          
          <button onclick="Onboarding.closeModal()" id="closeOnboardingBtn" class="hidden absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition z-10" title="Tutup">
            ✕
          </button>

          <!-- Top Brand Eyebrow -->
          <div class="text-center max-w-md mx-auto mb-5">
            <div class="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-500 p-[1.5px] shadow-lg shadow-blue-500/30 flex items-center justify-center mb-2.5">
              <div class="w-full h-full bg-[#07090E] rounded-[14px] flex items-center justify-center font-mono font-black text-white text-sm brand-glyph">
                ILI
              </div>
            </div>
            <span class="eyebrow-pill active mb-1 text-[9px] font-mono">
              STAFF CREDENTIALS & ACCESS GATE
            </span>
            <h2 class="text-lg sm:text-xl font-black text-white tracking-tight font-display mt-1">Identitas & Penugasan Panitia</h2>
            <p class="text-xs text-slate-400 mt-1">Pilih spesifikasi jabatan Anda untuk mengaktifkan instrumen yang tepat:</p>
          </div>

          <div class="space-y-4">
            
            <!-- 1. Nama Staf -->
            <div>
              <label class="block text-[10px] font-mono font-bold text-slate-300 mb-1 uppercase tracking-wider">Nama Lengkap / Panggilan:</label>
              <input type="text" id="inputStaffName" placeholder="Contoh: Senna" class="w-full bay-recessed px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 transition rounded-xl font-mono">
            </div>

            <!-- 2. Pilih Jabatan (4 Opsi: Kadiv, Wakadiv, Staff Ahli, Staff) -->
            <div>
              <label class="block text-[10px] font-mono font-bold text-slate-300 mb-1.5 uppercase tracking-wider">Spesifikasi Jabatan:</label>
              
              <div class="grid grid-cols-2 gap-2.5">
                
                <!-- Kadiv -->
                <div onclick="Onboarding.selectRoleOption('Kadiv')" id="roleCard_Kadiv" class="p-3 rounded-xl bay-recessed border border-white/10 cursor-pointer transition hover:scale-[1.01] flex flex-col justify-between">
                  <div class="flex items-center justify-between gap-1 mb-1">
                    <span class="text-xl">👑</span>
                    <span class="eyebrow-pill amber text-[8px] font-mono font-bold">AKSES PENUH</span>
                  </div>
                  <div>
                    <h4 class="text-xs font-black text-white font-display">Kadiv</h4>
                    <p class="text-[9px] text-slate-400 mt-0.5 leading-snug">Kepala Divisi Central Event</p>
                  </div>
                </div>

                <!-- Wakadiv -->
                <div onclick="Onboarding.selectRoleOption('Wakadiv')" id="roleCard_Wakadiv" class="p-3 rounded-xl bay-recessed border border-white/10 cursor-pointer transition hover:scale-[1.01] flex flex-col justify-between">
                  <div class="flex items-center justify-between gap-1 mb-1">
                    <span class="text-xl">🛡️</span>
                    <span class="eyebrow-pill amber text-[8px] font-mono font-bold">AKSES PENUH</span>
                  </div>
                  <div>
                    <h4 class="text-xs font-black text-white font-display">Wakadiv</h4>
                    <p class="text-[9px] text-slate-400 mt-0.5 leading-snug">Wakil Kepala Divisi</p>
                  </div>
                </div>

                <!-- Staff Ahli -->
                <div onclick="Onboarding.selectRoleOption('Staff Ahli')" id="roleCard_StaffAhli" class="p-3 rounded-xl bay-recessed border-2 border-amber-500 bg-amber-950/20 cursor-pointer transition hover:scale-[1.01] flex flex-col justify-between">
                  <div class="flex items-center justify-between gap-1 mb-1">
                    <span class="text-xl">⚡</span>
                    <span class="eyebrow-pill amber text-[8px] font-mono font-bold">EDIT 0-100%</span>
                  </div>
                  <div>
                    <h4 class="text-xs font-black text-white font-display">Staff Ahli</h4>
                    <p class="text-[9px] text-slate-400 mt-0.5 leading-snug">Staffli / Kontrol & Edit Progress</p>
                  </div>
                </div>

                <!-- Staff -->
                <div onclick="Onboarding.selectRoleOption('Staff')" id="roleCard_Staff" class="p-3 rounded-xl bay-recessed border border-white/10 cursor-pointer transition hover:scale-[1.01] flex flex-col justify-between">
                  <div class="flex items-center justify-between gap-1 mb-1">
                    <span class="text-xl">👤</span>
                    <span class="eyebrow-pill cobalt text-[8px] font-mono font-bold">SUB-DIVISI</span>
                  </div>
                  <div>
                    <h4 class="text-xs font-black text-white font-display">Staff</h4>
                    <p class="text-[9px] text-slate-400 mt-0.5 leading-snug">Staff Pelaksana Sub-Divisi</p>
                  </div>
                </div>

              </div>
            </div>

            <!-- 3. Dinamis: Informasi Akses Penuh vs Pemilihan Penugasan Sub-Divisi -->
            
            <!-- Banner Akses Penuh (Tampil jika Kadiv / Wakadiv / Staff Ahli) -->
            <div id="omniAccessBanner" class="bay-recessed p-3 rounded-xl border border-amber-500/30 bg-amber-950/20 flex items-start gap-2.5">
              <span class="text-lg">👑</span>
              <div class="text-[11px] font-mono text-slate-300 leading-relaxed">
                <span class="text-amber-300 font-bold block mb-0.5">Akses Penuh Otomatis Terbuka:</span>
                Sebagai <b id="omniRoleLabel" class="text-white">Staff Ahli</b>, Anda otomatis memiliki akses ke seluruh 4 sub-divisi, overview, seluruh sheets & drive, serta hak penuh mengedit Tracker Progress 0-100%!
              </div>
            </div>

            <!-- Sub-Divisi Penugasan (Hanya muncul jika Jabatan = Staff) -->
            <div id="subEventSelectionSection" class="space-y-2 hidden">
              <div class="flex items-center justify-between">
                <label class="block text-[10px] font-mono font-bold text-slate-300 uppercase tracking-wider">Pilih Sub-Divisi Penugasan Anda:</label>
                <span class="text-[9px] font-mono text-blue-400 font-bold">Pilih 1 Sub-Divisi</span>
              </div>

              <div class="grid grid-cols-2 gap-2">
                <div onclick="Onboarding.setSubEvent('safari')" id="subCard_safari" class="p-2.5 rounded-xl bay-recessed border-2 border-blue-500 bg-blue-950/20 cursor-pointer transition flex items-center gap-2">
                  <span class="text-xl">🏛️</span>
                  <div class="min-w-0">
                    <div class="text-xs font-bold text-white truncate">Safari Faculty</div>
                    <div class="text-[9px] font-mono text-slate-400">SF-01 (Flagship)</div>
                  </div>
                </div>

                <div onclick="Onboarding.setSubEvent('startpoint')" id="subCard_startpoint" class="p-2.5 rounded-xl bay-recessed border border-white/5 opacity-60 hover:opacity-100 cursor-pointer transition flex items-center gap-2">
                  <span class="text-xl">🚀</span>
                  <div class="min-w-0">
                    <div class="text-xs font-bold text-white truncate">Start Point</div>
                    <div class="text-[9px] font-mono text-slate-400">SP-02</div>
                  </div>
                </div>

                <div onclick="Onboarding.setSubEvent('odl')" id="subCard_odl" class="p-2.5 rounded-xl bay-recessed border border-white/5 opacity-60 hover:opacity-100 cursor-pointer transition flex items-center gap-2">
                  <span class="text-xl">🎓</span>
                  <div class="min-w-0">
                    <div class="text-xs font-bold text-white truncate">One Day Lecture</div>
                    <div class="text-[9px] font-mono text-slate-400">ODL-03</div>
                  </div>
                </div>

                <div onclick="Onboarding.setSubEvent('technocraft')" id="subCard_technocraft" class="p-2.5 rounded-xl bay-recessed border border-white/5 opacity-60 hover:opacity-100 cursor-pointer transition flex items-center gap-2">
                  <span class="text-xl">⚡</span>
                  <div class="min-w-0">
                    <div class="text-xs font-bold text-white truncate">Technocraft</div>
                    <div class="text-[9px] font-mono text-slate-400">TC-04</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Submit Button -->
            <button onclick="Onboarding.saveProfile()" class="w-full mt-2 btn-tactical py-3 text-xs justify-center font-display uppercase tracking-wider font-bold">
              <span>Konfirmasi & Masuk Command Deck</span>
              <div class="btn-icon-bay">→</div>
            </button>

          </div>

        </div>
      </div>
    </div>`;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
  },

  selectRoleOption(role) {
    this.selectedRole = role;

    // Highlight selected role card
    ['Kadiv', 'Wakadiv', 'Staff Ahli', 'Staff'].forEach(r => {
      const cardKey = r.replace(/\s+/g, '');
      const el = document.getElementById(`roleCard_${cardKey}`);
      if (!el) return;
      if (r === role) {
        if (r === 'Staff') {
          el.className = 'p-3 rounded-xl bay-recessed border-2 border-blue-500 bg-blue-950/20 cursor-pointer transition flex flex-col justify-between';
        } else {
          el.className = 'p-3 rounded-xl bay-recessed border-2 border-amber-500 bg-amber-950/20 cursor-pointer transition flex flex-col justify-between';
        }
      } else {
        el.className = 'p-3 rounded-xl bay-recessed border border-white/10 opacity-70 hover:opacity-100 cursor-pointer transition flex flex-col justify-between';
      }
    });

    const omniBanner = document.getElementById('omniAccessBanner');
    const omniLabel = document.getElementById('omniRoleLabel');
    const subSection = document.getElementById('subEventSelectionSection');

    if (role === 'Staff') {
      if (omniBanner) omniBanner.classList.add('hidden');
      if (subSection) subSection.classList.remove('hidden');
      if (this.selectedEvent === 'all') this.selectedEvent = 'safari';
      this.refreshSubEventCards();
    } else {
      if (omniBanner) omniBanner.classList.remove('hidden');
      if (omniLabel) omniLabel.innerText = role;
      if (subSection) subSection.classList.add('hidden');
      this.selectedEvent = 'all';
    }
  },

  setSubEvent(subId) {
    this.selectedEvent = subId;
    this.refreshSubEventCards();
  },

  refreshSubEventCards() {
    ['safari', 'startpoint', 'odl', 'technocraft'].forEach(id => {
      const el = document.getElementById(`subCard_${id}`);
      if (!el) return;
      if (this.selectedEvent === id) {
        el.className = 'p-2.5 rounded-xl bay-recessed border-2 border-blue-500 bg-blue-950/30 cursor-pointer transition flex items-center gap-2 shadow-sm shadow-blue-500/20';
      } else {
        el.className = 'p-2.5 rounded-xl bay-recessed border border-white/5 opacity-60 hover:opacity-100 cursor-pointer transition flex items-center gap-2';
      }
    });
  },

  openModal(canClose = true) {
    this.renderModal();
    const gate = document.getElementById('onboardingGate');
    const card = document.getElementById('onboardingCard');
    const closeBtn = document.getElementById('closeOnboardingBtn');

    if (canClose) closeBtn?.classList.remove('hidden');
    else closeBtn?.classList.add('hidden');

    // Hide any intercept gate so the onboarding modal takes center stage
    const interceptGate = document.getElementById('pageAccessGateIntercept');
    if (interceptGate) {
      interceptGate.classList.add('hidden');
    }

    gate?.classList.remove('opacity-0', 'pointer-events-none');
    card?.classList.remove('scale-95');
    card?.classList.add('scale-100');

    const profile = this.getProfile();
    const nameInput = document.getElementById('inputStaffName');

    if (nameInput) nameInput.value = profile.name || '';
    this.selectRoleOption(profile.role || 'Staff Ahli');
    if (profile.role === 'Staff') {
      this.setSubEvent(profile.assignedEvent || 'safari');
    }
  },

  closeModal() {
    const gate = document.getElementById('onboardingGate');
    const card = document.getElementById('onboardingCard');
    gate?.classList.add('opacity-0', 'pointer-events-none');
    card?.classList.remove('scale-100');
    card?.classList.add('scale-95');

    // If intercept gate was previously hidden and user still has no access, re-show it
    const interceptGate = document.getElementById('pageAccessGateIntercept');
    if (interceptGate && this.currentPageEventId && !this.canAccess(this.currentPageEventId)) {
      interceptGate.classList.remove('hidden');
    }
  },

  async saveProfile() {
    const name = document.getElementById('inputStaffName')?.value.trim() || 'Panitia CE';
    const role = this.selectedRole || 'Staff Ahli';
    const assignedEvent = role === 'Staff' ? (this.selectedEvent || 'safari') : 'all';

    const profile = {
      name,
      role,
      roleTitle: role,
      roleType: role === 'Staff' ? 'subevent' : 'core',
      assignedEvent,
      event: assignedEvent
    };

    localStorage.setItem('ce_user_profile', JSON.stringify(profile));
    this.updateHeader(profile);

    // Remove intercept gate immediately if user now has access
    const interceptGate = document.getElementById('pageAccessGateIntercept');
    if (interceptGate && this.canAccess(this.currentPageEventId)) {
      interceptGate.remove();
    }

    if (typeof Sidebar !== 'undefined' && typeof Sidebar.updateAccessRestrictions === 'function') {
      Sidebar.updateAccessRestrictions();
    }
    
    this.closeModal();

    if (typeof playChimeSound === 'function') playChimeSound('success');
    if (typeof showToast === 'function') {
      const scopeLabel = role === 'Staff' ? `Penugasan: ${this.subEventMap[assignedEvent]?.name || assignedEvent}` : 'Akses Penuh 4 Sub-Divisi';
      showToast(`Identitas Terdaftar: ${name} (${role} • ${scopeLabel})`, 'success');
    }

    // Notify backend
    try {
      await fetch('/api/subevent/active', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: assignedEvent === 'all' ? 'safari' : assignedEvent })
      });
    } catch (e) {}

    // Re-check access for current page
    if (typeof this.checkCurrentPageAccess === 'function') {
      this.checkCurrentPageAccess();
    }

    // If ProgressTracker is on this page, re-render to reflect new supervisor status
    if (typeof ProgressTracker !== 'undefined' && typeof ProgressTracker.render === 'function') {
      ProgressTracker.render();
    }

    if (typeof window.onProfileSaved === 'function') {
      window.onProfileSaved(profile);
    }
  },

  enforceAccess(pageSubEventId) {
    this.currentPageEventId = pageSubEventId;
    setTimeout(() => {
      this.checkCurrentPageAccess();
    }, 100);
  },

  checkCurrentPageAccess() {
    if (!this.currentPageEventId || this.currentPageEventId === 'dashboard') return;

    const allowed = this.canAccess(this.currentPageEventId);
    let gate = document.getElementById('pageAccessGateIntercept');

    if (!allowed) {
      const profile = this.getProfile();
      const mySub = this.subEventMap[profile.assignedEvent] || { name: 'Sub-Divisi Anda', url: '/index.html' };
      const targetSub = this.subEventMap[this.currentPageEventId] || { name: this.currentPageEventId };

      if (!gate) {
        const interceptHtml = `
          <div id="pageAccessGateIntercept" class="fixed inset-0 z-[105] bg-[#07090E]/95 backdrop-blur-2xl flex items-center justify-center p-4">
            <div class="chassis max-w-lg w-full text-center p-6 sm:p-8 rounded-2xl shadow-2xl border-rose-500/30">
              <div class="w-16 h-16 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 font-mono font-bold flex items-center justify-center text-3xl mb-4">
                🛡️
              </div>
              <span class="eyebrow-pill red text-[9px] font-mono mb-2">AKSES SUB-DIVISI TERBATAS</span>
              <h3 class="text-lg sm:text-xl font-black text-white font-display mb-2">
                Zona Khusus: ${targetSub.name}
              </h3>
              <p class="text-xs text-slate-300 leading-relaxed mb-6">
                Identitas Anda saat ini terdaftar sebagai <b>${profile.role}</b> di sub-divisi <b>${mySub.name}</b>. Halaman ini diproteksi khusus untuk tim ${targetSub.name} atau Pimpinan / Staff Ahli (Kadiv, Wakadiv, Staff Ahli).
              </p>

              <div class="space-y-2.5">
                <a href="${mySub.url}" class="w-full btn-tactical py-2.5 px-4 text-xs font-bold justify-center">
                  <span>← Buka Hub Saya (${mySub.name})</span>
                </a>
                <button onclick="Onboarding.openModal(false)" class="w-full btn-ghost py-2.5 px-4 text-xs font-mono font-bold text-amber-400 border-amber-500/30 hover:border-amber-400 justify-center">
                  <span>👑 Beralih Jabatan / Masuk Staff Ahli</span>
                </button>
                <a href="/index.html" class="block text-slate-500 hover:text-slate-300 text-xs font-mono pt-2">
                  Kembali ke Mission Overview
                </a>
              </div>
            </div>
          </div>
        `;
        document.body.insertAdjacentHTML('beforeend', interceptHtml);
      } else {
        gate.classList.remove('hidden');
      }
    } else {
      if (gate) {
        gate.remove();
      }
    }
  }
};

// Global helper for opening onboarding modal from anywhere
window.openOnboardingGate = function(canClose = true) {
  if (window.Onboarding) {
    window.Onboarding.openModal(canClose);
  }
};

window.Onboarding = Onboarding;

// Auto-initialize when document is ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Onboarding.init());
  } else {
    Onboarding.init();
  }
}
