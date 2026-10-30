/**
 * CENTRAL EVENT 2027 — SPREADSHEET & CANVA DESIGN BANK HUB
 * Menampilkan Bank Spreadsheet & Bank Link Canva terorganisir per sub-divisi untuk diakses & diedit bersama seluruh panitia.
 */

const SpreadsheetHub = {
  currentSubEventId: 'safari',
  containerId: 'sharedSpreadsheetMount',
  activeTab: 'sheets', // 'sheets' | 'canva'
  activeCanvaFilter: 'all',
  sheets: [],
  canvaLinks: [],

  subEventMap: {
    safari: { name: 'Safari Faculty', code: 'SF-01', icon: '🏛️' },
    startpoint: { name: 'Start Point', code: 'SP-02', icon: '🚀' },
    odl: { name: 'One Day Lecture', code: 'ODL-03', icon: '🎓' },
    technocraft: { name: 'Technocraft', code: 'TC-04', icon: '⚡' },
    all: { name: 'Semua Sub-Divisi', code: 'ALL', icon: '🌐' }
  },

  async init(subEventId = 'safari', containerId = 'sharedSpreadsheetMount') {
    this.currentSubEventId = subEventId;
    this.containerId = containerId;
    if (typeof window !== 'undefined' && window.location.hash === '#canva') {
      this.activeTab = 'canva';
    }
    this.injectAddModals();
    await this.fetchAndRender();
  },

  async switchTab(tab) {
    this.activeTab = tab;
    this.render();
  },

  setCanvaFilter(category) {
    this.activeCanvaFilter = category;
    this.render();
  },

  async fetchAndRender() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    // 1. Fetch Spreadsheets
    try {
      const res = await fetch(`/api/spreadsheets/${this.currentSubEventId}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.sheets)) {
        this.sheets = json.sheets;
      }
    } catch (e) {
      console.warn('Gagal memuat list spreadsheet:', e);
    }

    // 2. Fetch Canva Links
    try {
      const res = await fetch(`/api/canva/${this.currentSubEventId}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.links)) {
        this.canvaLinks = json.links;
      }
    } catch (e) {
      console.warn('Gagal memuat list canva:', e);
    }

    this.render();
  },

  render() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    const subInfo = this.subEventMap[this.currentSubEventId] || { name: this.currentSubEventId, code: 'SUB', icon: '📊' };
    const configuredSheets = (this.sheets || []).filter(s => s.isConfigured);
    const canvaList = this.canvaLinks || [];

    // Filter Canva links if category selected
    const filteredCanva = this.activeCanvaFilter === 'all'
      ? canvaList
      : canvaList.filter(c => c.category === this.activeCanvaFilter);

    // Extract unique categories for filter chips
    const canvaCategories = ['all', ...new Set(canvaList.map(c => c.category).filter(Boolean))];

    container.innerHTML = `
      <div class="chassis-core flex flex-col justify-between h-full space-y-3.5">
        
        <!-- Top Ribbon: Mode Switcher & Actions -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/5 gap-2.5 flex-shrink-0">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="eyebrow-pill emerald text-[9px] font-mono font-bold">● CLOUD LIVE REPOSITORY</span>
              <span class="eyebrow-pill cobalt text-[9px] font-mono font-bold">${subInfo.code} REPO</span>
            </div>
            
            <!-- Dual Tab Selector: Bank Spreadsheet vs Bank Canva -->
            <div class="flex items-center gap-1.5 mt-1">
              <button 
                onclick="SpreadsheetHub.switchTab('sheets')" 
                class="px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 ${this.activeTab === 'sheets' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' : 'bay-recessed text-slate-400 hover:text-white border border-white/5'}"
              >
                <span>📊 Bank Spreadsheet</span>
                <span class="px-1.5 py-0.2 rounded-full text-[9px] bg-black/30 text-emerald-200">${configuredSheets.length}</span>
              </button>

              <button 
                onclick="SpreadsheetHub.switchTab('canva')" 
                class="px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 ${this.activeTab === 'canva' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'bay-recessed text-slate-400 hover:text-white border border-white/5'}"
              >
                <span>🎨 Bank Desain Canva</span>
                <span class="px-1.5 py-0.2 rounded-full text-[9px] bg-black/30 text-blue-200">${canvaList.length}</span>
              </button>
            </div>
          </div>

          <!-- Add Trigger Button -->
          <div class="flex items-center gap-2 self-start sm:self-auto">
            ${this.activeTab === 'sheets' ? `
              <button onclick="SpreadsheetHub.openAddModal()" class="btn-tactical py-1.5 px-3 text-xs bg-emerald-600 hover:bg-emerald-500 font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition">
                <span>➕</span>
                <span>Tambah Sheet</span>
              </button>
            ` : `
              <button onclick="SpreadsheetHub.openAddCanvaModal()" class="btn-tactical py-1.5 px-3 text-xs bg-blue-600 hover:bg-blue-500 font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition">
                <span>➕</span>
                <span>Tambah Link Canva</span>
              </button>
            `}
          </div>
        </div>

        <!-- TAB CONTENT: SPREADSHEET BANK -->
        ${this.activeTab === 'sheets' ? `
          <div class="space-y-2.5 overflow-y-auto custom-scrollbar flex-1 max-h-[300px] pr-1">
            ${configuredSheets.length === 0 ? `
              <div class="p-6 rounded-xl bay-recessed border border-dashed border-white/10 text-center space-y-2">
                <div class="text-2xl">📋</div>
                <div class="text-xs font-mono font-bold text-slate-300">Belum Ada Spreadsheet Terhubung</div>
                <p class="text-[11px] font-mono text-slate-400 max-w-xs mx-auto">
                  Tautkan Google Spreadsheet tim ${subInfo.name} agar dapat diedit & ditinjau in-app bersama!
                </p>
                <button onclick="SpreadsheetHub.openAddModal()" class="btn-ghost py-1 px-3 text-xs text-emerald-400 border-emerald-500/30 hover:border-emerald-400 font-bold mt-2">
                  + Tautkan Sekarang
                </button>
              </div>
            ` : configuredSheets.map((s, idx) => {
              const isDefault = s.isDefault;
              return `
                <div class="bay-recessed p-3 rounded-xl border border-white/10 hover:border-emerald-500/30 transition flex flex-col justify-between gap-2.5 group">
                  <div class="flex items-start justify-between gap-2">
                    <div class="flex items-start gap-2.5 min-w-0">
                      <div class="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-base text-emerald-400 flex-shrink-0 mt-0.5">
                        ${s.icon || '📊'}
                      </div>
                      <div class="min-w-0 flex-1">
                        <div class="flex items-center gap-1.5 mb-0.5 flex-wrap">
                          <span class="text-xs font-extrabold text-white truncate group-hover:text-emerald-300 transition">${s.name}</span>
                          ${isDefault ? '<span class="px-1.5 py-0.2 rounded text-[8px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">MASTER</span>' : '<span class="px-1.5 py-0.2 rounded text-[8px] font-mono font-bold bg-blue-400/20 text-blue-300 border border-blue-400/30">OPERASIONAL</span>'}
                        </div>
                        <div class="text-[10px] font-mono text-slate-400 flex items-center gap-2">
                          <span class="text-emerald-400 font-bold">● Live Sync</span>
                          <span>•</span>
                          <span>${s.date || 'Tersambung Cloud'}</span>
                        </div>
                      </div>
                    </div>

                    ${!isDefault ? `
                      <button onclick="SpreadsheetHub.deleteSheet('${s.id}')" class="text-slate-500 hover:text-rose-400 p-1 text-xs transition" title="Hapus Spreadsheet">
                        🗑️
                      </button>
                    ` : ''}
                  </div>

                  <!-- Direct Actions Row -->
                  <div class="flex items-center justify-end gap-1.5 pt-1 border-t border-white/5">
                    <button onclick="SpreadsheetHub.openInApp('${s.id}')" class="btn-tactical py-1 px-3 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1 shadow-sm">
                      <span>📊 Buka Editor In-App</span>
                      <span class="text-[10px]">⛶</span>
                    </button>
                    ${s.externalUrl ? `
                      <a href="${s.externalUrl}" target="_blank" class="btn-ghost py-1 px-2.5 text-xs text-slate-300 hover:text-white font-mono flex items-center gap-1" title="Buka di Tab Baru Google">
                        <span>↗ Tab Baru</span>
                      </a>
                    ` : ''}
                    <button onclick="SpreadsheetHub.copyLink('${s.externalUrl || s.editUrl || ''}')" class="btn-ghost py-1 px-2 text-xs text-slate-400 hover:text-white" title="Salin Tautan">
                      📋
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        ` : `
          <!-- TAB CONTENT: CANVA DESIGN BANK -->
          <div class="space-y-2 flex-1 flex flex-col min-h-0">
            
            <!-- Category Filter Pills -->
            <div class="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 text-[10px] font-mono flex-shrink-0">
              ${canvaCategories.map(cat => {
                const isActive = this.activeCanvaFilter === cat;
                const label = cat === 'all' ? 'Semua Desain' : cat;
                return `
                  <button 
                    onclick="SpreadsheetHub.setCanvaFilter('${cat}')" 
                    class="px-2.5 py-0.5 rounded-full border transition whitespace-nowrap ${isActive ? 'bg-blue-600 text-white font-bold border-blue-500' : 'bay-recessed text-slate-400 hover:text-white border-white/5'}"
                  >
                    ${label}
                  </button>
                `;
              }).join('')}
            </div>

            <div class="space-y-2.5 overflow-y-auto custom-scrollbar flex-1 max-h-[270px] pr-1">
              ${filteredCanva.length === 0 ? `
                <div class="p-6 rounded-xl bay-recessed border border-dashed border-white/10 text-center space-y-2">
                  <div class="text-2xl">🎨</div>
                  <div class="text-xs font-mono font-bold text-slate-300">Belum Ada Tautan Canva</div>
                  <p class="text-[11px] font-mono text-slate-400 max-w-xs mx-auto">
                    Kumpulkan tautan ID Card, Banner, Backdrop, & Cue Card Canva tim agar tersortir rapi dan tidak tercecer di grup chat!
                  </p>
                  <button onclick="SpreadsheetHub.openAddCanvaModal()" class="btn-ghost py-1 px-3 text-xs text-blue-400 border-blue-500/30 hover:border-blue-400 font-bold mt-2">
                    + Tambah Link Canva
                  </button>
                </div>
              ` : filteredCanva.map(item => {
                const isDefault = item.isDefault;
                return `
                  <div class="bay-recessed p-3 rounded-xl border border-white/10 hover:border-blue-500/30 transition flex flex-col justify-between gap-2.5 group">
                    <div class="flex items-start justify-between gap-2">
                      <div class="flex items-start gap-2.5 min-w-0">
                        <div class="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-base text-blue-400 flex-shrink-0 mt-0.5">
                          ${item.icon || '🎨'}
                        </div>
                        <div class="min-w-0 flex-1">
                          <div class="flex items-center gap-1.5 mb-0.5 flex-wrap">
                            <span class="text-xs font-extrabold text-white truncate group-hover:text-blue-300 transition">${item.name}</span>
                            <span class="px-1.5 py-0.2 rounded text-[8px] font-mono font-bold bg-blue-400/20 text-blue-300 border border-blue-400/30">${item.category || 'Desain'}</span>
                          </div>
                          <p class="text-[10px] font-mono text-slate-300 line-clamp-1">${item.description || 'Aset desain resmi tim Central Event.'}</p>
                        </div>
                      </div>

                      ${!isDefault ? `
                        <button onclick="SpreadsheetHub.deleteCanva('${item.id}')" class="text-slate-500 hover:text-rose-400 p-1 text-xs transition" title="Hapus Link Canva">
                          🗑️
                        </button>
                      ` : ''}
                    </div>

                    <!-- Direct Actions Row -->
                    <div class="flex items-center justify-end gap-1.5 pt-1 border-t border-white/5">
                      <button onclick="SpreadsheetHub.openCanvaInApp('${item.url}')" class="btn-tactical py-1 px-3 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1 shadow-sm">
                        <span>🎨 Buka Desain</span>
                        <span class="text-[10px]">↗</span>
                      </button>
                      <button onclick="SpreadsheetHub.copyLink('${item.url}')" class="btn-ghost py-1 px-2 text-xs text-slate-400 hover:text-white" title="Salin Tautan">
                        📋 Salin
                      </button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>

          </div>
        `}

        <!-- Bottom Telemetry Status -->
        <div class="bay-recessed p-2.5 rounded-xl border border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-400 flex-shrink-0">
          <span class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Akses Terpadu Spreadsheet & Canva Central Event
          </span>
          <span class="text-blue-400 font-bold">100% In-App Workspace</span>
        </div>

      </div>
    `;
  },

  openInApp(sheetId) {
    if (typeof WorkspaceModal !== 'undefined' && typeof WorkspaceModal.openSheet === 'function') {
      WorkspaceModal.openSheet(sheetId, 'edit');
    } else {
      window.open(`https://docs.google.com/spreadsheets/d/${sheetId}/edit`, '_blank');
    }
  },

  openCanvaInApp(url) {
    if (!url) return;
    if (typeof WorkspaceModal !== 'undefined' && typeof WorkspaceModal.openCanva === 'function') {
      WorkspaceModal.openCanva(url);
    } else {
      window.open(url, '_blank');
    }
  },

  copyLink(url) {
    if (!url) {
      alert('Tautan tidak tersedia');
      return;
    }
    navigator.clipboard.writeText(url)
      .then(() => {
        if (typeof showToast === 'function') showToast('Tautan berhasil disalin ke clipboard!', 'success');
        else alert('Tautan tersalin ke clipboard!');
      })
      .catch(() => alert('Tautan: ' + url));
  },

  async deleteSheet(id) {
    if (!confirm('Hapus lembar kerja bersama ini dari daftar?')) return;
    try {
      const res = await CE_API.deleteSpreadsheet(id);
      if (res && res.success) {
        if (typeof showToast === 'function') showToast('Spreadsheet berhasil dihapus!', 'info');
        await this.fetchAndRender();
      } else {
        throw new Error(res?.error || 'Gagal menghapus');
      }
    } catch (e) {
      alert('Gagal menghapus spreadsheet: ' + e.message);
    }
  },

  async deleteCanva(id) {
    if (!confirm('Hapus tautan Canva ini dari daftar?')) return;
    try {
      const res = await CE_API.deleteCanvaLink(id);
      if (res && res.success) {
        if (typeof showToast === 'function') showToast('Tautan Canva berhasil dihapus!', 'info');
        await this.fetchAndRender();
      } else {
        throw new Error(res?.error || 'Gagal menghapus');
      }
    } catch (e) {
      alert('Gagal menghapus tautan Canva: ' + e.message);
    }
  },

  injectAddModals() {
    this.injectAddSpreadsheetModal();
    this.injectAddCanvaModal();
  },

  injectAddSpreadsheetModal() {
    if (document.getElementById('addSpreadsheetHubModal')) return;

    const modalHtml = `
      <div id="addSpreadsheetHubModal" class="fixed inset-0 z-[160] bg-[#07090E]/90 backdrop-blur-xl flex items-center justify-center p-3 sm:p-5 transition-all duration-300 opacity-0 pointer-events-none">
        <div class="chassis max-w-lg w-full rounded-2xl shadow-2xl relative transform transition-all duration-300 scale-95 border-emerald-500/40" id="addSpreadsheetHubCard">
          <div class="chassis-core p-5 sm:p-7 space-y-4">
            
            <div class="flex items-center justify-between pb-3 border-b border-white/10">
              <div class="flex items-center gap-2.5">
                <div class="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-mono font-bold flex items-center justify-center text-lg">
                  📊
                </div>
                <div>
                  <span class="eyebrow-pill emerald text-[9px] font-mono">SPREADSHEET REPOSITORY</span>
                  <h3 class="text-base font-extrabold text-white font-display">Tautkan Spreadsheet Baru</h3>
                </div>
              </div>
              <button onclick="SpreadsheetHub.closeAddModal()" class="text-slate-400 hover:text-white p-1.5 text-sm">
                ✕
              </button>
            </div>

            <div class="space-y-3.5">
              <div>
                <label class="block text-[10px] font-mono font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Nama Lembar Kerja / Spreadsheet:
                </label>
                <input type="text" id="inputNewSheetName" placeholder="Contoh: Database Presensi & Evaluasi Kluster" class="w-full bay-recessed px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-400 transition rounded-xl font-mono border border-white/10">
              </div>

              <div>
                <label class="block text-[10px] font-mono font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Link / ID Google Spreadsheet:
                </label>
                <input type="text" id="inputNewSheetUrl" placeholder="https://docs.google.com/spreadsheets/d/.../edit" class="w-full bay-recessed px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-400 transition rounded-xl font-mono border border-white/10">
                <p class="text-[10px] font-mono text-slate-400 mt-1">
                  💡 Tips: Pastikan akses Google Sheet diatur ke "Siapa saja yang memiliki link dapat melihat/mengedit".
                </p>
              </div>
            </div>

            <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
              <button onclick="SpreadsheetHub.closeAddModal()" class="btn-ghost py-2 px-4 text-xs font-mono text-slate-400 hover:text-white">
                Batal
              </button>
              <button onclick="SpreadsheetHub.submitAddSheet()" id="btnSubmitNewSheet" class="btn-tactical py-2 px-5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-lg shadow-emerald-600/30">
                <span>💾 Tautkan & Akses Bersama</span>
              </button>
            </div>

          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
  },

  injectAddCanvaModal() {
    if (document.getElementById('addCanvaHubModal')) return;

    const modalHtml = `
      <div id="addCanvaHubModal" class="fixed inset-0 z-[160] bg-[#07090E]/90 backdrop-blur-xl flex items-center justify-center p-3 sm:p-5 transition-all duration-300 opacity-0 pointer-events-none">
        <div class="chassis max-w-lg w-full rounded-2xl shadow-2xl relative transform transition-all duration-300 scale-95 border-blue-500/40" id="addCanvaHubCard">
          <div class="chassis-core p-5 sm:p-7 space-y-4">
            
            <div class="flex items-center justify-between pb-3 border-b border-white/10">
              <div class="flex items-center gap-2.5">
                <div class="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-400 font-mono font-bold flex items-center justify-center text-lg">
                  🎨
                </div>
                <div>
                  <span class="eyebrow-pill cobalt text-[9px] font-mono">CANVA DESIGN REPOSITORY</span>
                  <h3 class="text-base font-extrabold text-white font-display">Tautkan Link Desain Canva</h3>
                </div>
              </div>
              <button onclick="SpreadsheetHub.closeAddCanvaModal()" class="text-slate-400 hover:text-white p-1.5 text-sm">
                ✕
              </button>
            </div>

            <div class="space-y-3.5">
              <div>
                <label class="block text-[10px] font-mono font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Nama Desain / Proyek Canva:
                </label>
                <input type="text" id="inputNewCanvaName" placeholder="Contoh: Cue Card MC & LO Kluster Day 1" class="w-full bay-recessed px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-400 transition rounded-xl font-mono border border-white/10">
              </div>

              <div>
                <label class="block text-[10px] font-mono font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Kategori Aset Visual:
                </label>
                <select id="selectNewCanvaCategory" class="w-full bay-recessed px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-400 transition rounded-xl font-mono border border-white/10 bg-slate-900">
                  <option value="ID Card & Tanda Pengenal">🪪 ID Card & Tanda Pengenal</option>
                  <option value="Banner & Backdrop">🎨 Banner & Backdrop</option>
                  <option value="Cue Card & Rundown Visual">📑 Cue Card & Rundown Visual</option>
                  <option value="PPT & Presentasi">📊 PPT & Presentasi</option>
                  <option value="Signage & Peta Rute">🚧 Signage & Peta Rute</option>
                  <option value="Merchandise & Identitas">🎟️ Merchandise & Identitas</option>
                  <option value="Sertifikat & Dokumen">📜 Sertifikat & Dokumen</option>
                  <option value="Media Sosial">📱 Media Sosial</option>
                </select>
              </div>

              <div>
                <label class="block text-[10px] font-mono font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Tautan / Link Canva (Share Link / View / Edit):
                </label>
                <input type="text" id="inputNewCanvaUrl" placeholder="https://www.canva.com/design/..." class="w-full bay-recessed px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-400 transition rounded-xl font-mono border border-white/10">
              </div>

              <div>
                <label class="block text-[10px] font-mono font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Catatan / Keterangan Singkat:
                </label>
                <input type="text" id="inputNewCanvaDesc" placeholder="Keterangan peruntukan aset atau revisi terakhir..." class="w-full bay-recessed px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-400 transition rounded-xl font-mono border border-white/10">
              </div>
            </div>

            <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
              <button onclick="SpreadsheetHub.closeAddCanvaModal()" class="btn-ghost py-2 px-4 text-xs font-mono text-slate-400 hover:text-white">
                Batal
              </button>
              <button onclick="SpreadsheetHub.submitAddCanva()" id="btnSubmitNewCanva" class="btn-tactical py-2 px-5 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 shadow-lg shadow-blue-600/30">
                <span>💾 Simpan ke Bank Canva</span>
              </button>
            </div>

          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
  },

  openAddModal() {
    this.injectAddSpreadsheetModal();
    const modal = document.getElementById('addSpreadsheetHubModal');
    const card = document.getElementById('addSpreadsheetHubCard');
    const inputName = document.getElementById('inputNewSheetName');
    const inputUrl = document.getElementById('inputNewSheetUrl');

    if (inputName) inputName.value = '';
    if (inputUrl) inputUrl.value = '';

    modal?.classList.remove('opacity-0', 'pointer-events-none');
    card?.classList.remove('scale-95');
    card?.classList.add('scale-100');
    setTimeout(() => inputName?.focus(), 100);
  },

  closeAddModal() {
    const modal = document.getElementById('addSpreadsheetHubModal');
    const card = document.getElementById('addSpreadsheetHubCard');
    modal?.classList.add('opacity-0', 'pointer-events-none');
    card?.classList.remove('scale-100');
    card?.classList.add('scale-95');
  },

  openAddCanvaModal() {
    this.injectAddCanvaModal();
    const modal = document.getElementById('addCanvaHubModal');
    const card = document.getElementById('addCanvaHubCard');
    const inputName = document.getElementById('inputNewCanvaName');
    const inputUrl = document.getElementById('inputNewCanvaUrl');
    const inputDesc = document.getElementById('inputNewCanvaDesc');

    if (inputName) inputName.value = '';
    if (inputUrl) inputUrl.value = '';
    if (inputDesc) inputDesc.value = '';

    modal?.classList.remove('opacity-0', 'pointer-events-none');
    card?.classList.remove('scale-95');
    card?.classList.add('scale-100');
    setTimeout(() => inputName?.focus(), 100);
  },

  closeAddCanvaModal() {
    const modal = document.getElementById('addCanvaHubModal');
    const card = document.getElementById('addCanvaHubCard');
    modal?.classList.add('opacity-0', 'pointer-events-none');
    card?.classList.remove('scale-100');
    card?.classList.add('scale-95');
  },

  async submitAddSheet() {
    const nameInput = document.getElementById('inputNewSheetName');
    const urlInput = document.getElementById('inputNewSheetUrl');
    const btn = document.getElementById('btnSubmitNewSheet');

    const name = nameInput ? nameInput.value.trim() : '';
    const sheetIdOrUrl = urlInput ? urlInput.value.trim() : '';

    if (!sheetIdOrUrl) {
      alert('Tautan atau ID Google Spreadsheet wajib diisi.');
      urlInput?.focus();
      return;
    }

    if (btn) {
      btn.disabled = true;
      btn.innerText = 'Menautkan...';
    }

    try {
      const res = await CE_API.addSpreadsheet({
        name: name || undefined,
        sheetIdOrUrl,
        subEventId: this.currentSubEventId,
        type: 'google'
      });

      if (res && res.success) {
        if (typeof showToast === 'function') {
          showToast(`Spreadsheet "${res.sheet.name}" berhasil ditautkan!`, 'success');
        }
        this.closeAddModal();
        await this.fetchAndRender();
      } else {
        alert('Gagal: ' + (res?.error || 'Periksa format tautan spreadsheet.'));
      }
    } catch (e) {
      alert('Error koneksi: ' + e.message);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerText = '💾 Tautkan & Akses Bersama';
      }
    }
  },

  async submitAddCanva() {
    const nameInput = document.getElementById('inputNewCanvaName');
    const catInput = document.getElementById('selectNewCanvaCategory');
    const urlInput = document.getElementById('inputNewCanvaUrl');
    const descInput = document.getElementById('inputNewCanvaDesc');
    const btn = document.getElementById('btnSubmitNewCanva');

    const name = nameInput ? nameInput.value.trim() : '';
    const category = catInput ? catInput.value : 'Desain & Media';
    const url = urlInput ? urlInput.value.trim() : '';
    const description = descInput ? descInput.value.trim() : '';

    if (!url) {
      alert('Tautan / Link Canva wajib diisi.');
      urlInput?.focus();
      return;
    }

    if (btn) {
      btn.disabled = true;
      btn.innerText = 'Menyimpan...';
    }

    try {
      const res = await CE_API.addCanvaLink({
        name: name || undefined,
        url,
        subEventId: this.currentSubEventId,
        category,
        description
      });

      if (res && res.success) {
        if (typeof showToast === 'function') {
          showToast(`Desain Canva "${res.link.name}" berhasil ditambahkan ke Bank Canva!`, 'success');
        }
        this.closeAddCanvaModal();
        this.activeTab = 'canva';
        await this.fetchAndRender();
      } else {
        alert('Gagal: ' + (res?.error || 'Periksa tautan Canva.'));
      }
    } catch (e) {
      alert('Error koneksi: ' + e.message);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerText = '💾 Simpan ke Bank Canva';
      }
    }
  }
};

window.SpreadsheetHub = SpreadsheetHub;
