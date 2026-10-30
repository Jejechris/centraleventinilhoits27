/**
 * CENTRAL EVENT 2027 — SPREADSHEET & CANVA DESIGN BANK HUB
 * Menampilkan Bank Spreadsheet & Bank Link Canva terorganisir per sub-divisi,
 * dilengkapi Katalog Pop-up Layar Luas, Fitur Edit/Rename, Pencarian Real-time, dan Supabase Cloud Sync.
 */

const SpreadsheetHub = {
  currentSubEventId: 'safari',
  containerId: 'sharedSpreadsheetMount',
  activeTab: 'sheets', // 'sheets' | 'canva'
  activeCanvaFilter: 'all',
  
  // Catalog Modal Filter States
  catalogSearchQuery: '',
  catalogSubEventFilter: 'all',
  catalogCanvaCategoryFilter: 'all',

  sheets: [],
  canvaLinks: [],
  activeEditItem: null,

  subEventMap: {
    safari: { name: 'Safari Faculty', code: 'SF-01', icon: '🏛️', color: 'emerald' },
    startpoint: { name: 'Start Point', code: 'SP-02', icon: '🚀', color: 'amber' },
    odl: { name: 'One Day Lecture', code: 'ODL-03', icon: '🎓', color: 'blue' },
    technocraft: { name: 'Technocraft', code: 'TC-04', icon: '⚡', color: 'purple' },
    all: { name: 'Semua Sub-Divisi', code: 'ALL', icon: '🌐', color: 'slate' }
  },

  canvaCategories: [
    'all',
    'ID Card & Tanda Pengenal',
    'Banner & Backdrop',
    'Cue Card & Rundown Visual',
    'PPT & Presentasi',
    'Signage & Peta Rute',
    'Merchandise & Identitas',
    'Sertifikat & Dokumen',
    'Media Sosial',
    'Desain & Media'
  ],

  async init(subEventId = 'safari', containerId = 'sharedSpreadsheetMount') {
    this.currentSubEventId = subEventId;
    this.containerId = containerId;
    this.catalogSubEventFilter = subEventId || 'all';

    if (typeof window !== 'undefined' && window.location.hash === '#canva') {
      this.activeTab = 'canva';
    }

    this.injectAllModals();
    await this.fetchAndRender();
  },

  async switchTab(tab) {
    this.activeTab = tab;
    this.render();
    if (this.isFullCatalogOpen()) {
      this.renderFullCatalog();
    }
  },

  setCanvaFilter(category) {
    this.activeCanvaFilter = category;
    this.render();
  },

  setCatalogSubEvent(subId) {
    this.catalogSubEventFilter = subId;
    this.renderFullCatalog();
  },

  setCatalogCanvaCategory(cat) {
    this.catalogCanvaCategoryFilter = cat;
    this.renderFullCatalog();
  },

  onCatalogSearch(val) {
    this.catalogSearchQuery = (val || '').toLowerCase().trim();
    this.renderFullCatalog();
  },

  async fetchAndRender() {
    // 1. Fetch Spreadsheets (all or by current sub-event)
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
    if (this.isFullCatalogOpen()) {
      this.renderFullCatalog();
    }
  },

  /**
   * Render On-Page Widget (Inside #sharedSpreadsheetMount)
   */
  render() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    const subInfo = this.subEventMap[this.currentSubEventId] || { name: this.currentSubEventId, code: 'SUB', icon: '📊' };
    const configuredSheets = (this.sheets || []).filter(s => s.isConfigured);
    const canvaList = this.canvaLinks || [];

    const filteredCanva = this.activeCanvaFilter === 'all'
      ? canvaList
      : canvaList.filter(c => c.category === this.activeCanvaFilter);

    const availableCategories = ['all', ...new Set(canvaList.map(c => c.category).filter(Boolean))];

    container.innerHTML = `
      <div class="chassis-core flex flex-col justify-between h-full space-y-3.5">
        
        <!-- Top Ribbon: Mode Switcher, Pop-up Launcher & Actions -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/5 gap-2.5 flex-shrink-0">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="eyebrow-pill emerald text-[9px] font-mono font-bold">● CLOUD REPO LIVE</span>
              <span class="eyebrow-pill cobalt text-[9px] font-mono font-bold">${subInfo.code} REPO</span>
            </div>
            
            <!-- Dual Tab Selector -->
            <div class="flex items-center gap-1.5 mt-1 flex-wrap">
              <button 
                onclick="SpreadsheetHub.switchTab('sheets')" 
                class="px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 ${this.activeTab === 'sheets' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' : 'bay-recessed text-slate-400 hover:text-white border border-white/5'}"
              >
                <span>📊 Bank Sheet</span>
                <span class="px-1.5 py-0.2 rounded-full text-[9px] bg-black/30 text-emerald-200">${configuredSheets.length}</span>
              </button>

              <button 
                onclick="SpreadsheetHub.switchTab('canva')" 
                class="px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 ${this.activeTab === 'canva' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'bay-recessed text-slate-400 hover:text-white border border-white/5'}"
              >
                <span>🎨 Bank Canva</span>
                <span class="px-1.5 py-0.2 rounded-full text-[9px] bg-black/30 text-blue-200">${canvaList.length}</span>
              </button>
            </div>
          </div>

          <!-- Action Buttons: Full Catalog Pop-up & Add New -->
          <div class="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <button 
              onclick="SpreadsheetHub.openFullCatalog()" 
              class="px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold bay-recessed text-blue-300 hover:text-white border border-blue-500/30 hover:border-blue-400 flex items-center gap-1.5 transition active:scale-[0.98] shadow-sm"
              title="Buka katalog lengkap di pop-up layar luas"
            >
              <span>⛶</span>
              <span class="hidden md:inline">Katalog Luas</span>
            </button>

            ${this.activeTab === 'sheets' ? `
              <button onclick="SpreadsheetHub.openAddModal()" class="btn-tactical py-1.5 px-3 text-xs bg-emerald-600 hover:bg-emerald-500 font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition">
                <span>➕</span>
                <span>Tambah Sheet</span>
              </button>
            ` : `
              <button onclick="SpreadsheetHub.openAddCanvaModal()" class="btn-tactical py-1.5 px-3 text-xs bg-blue-600 hover:bg-blue-500 font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition">
                <span>➕</span>
                <span>Tambah Canva</span>
              </button>
            `}
          </div>
        </div>

        <!-- Tab 1: SPREADSHEET REPOSITORY LIST -->
        ${this.activeTab === 'sheets' ? `
          <div class="space-y-2.5 overflow-y-auto custom-scrollbar flex-1 max-h-[300px] pr-1">
            ${configuredSheets.length === 0 ? `
              <div class="p-6 rounded-xl bay-recessed border border-dashed border-white/10 text-center space-y-2">
                <div class="text-2xl">📊</div>
                <div class="text-xs font-mono font-bold text-slate-300">Belum Ada Spreadsheet Terhubung</div>
                <p class="text-[11px] font-mono text-slate-400 max-w-xs mx-auto">
                  Tautkan lembar kerja Google Sheets untuk kolaborasi data real-time panitia.
                </p>
                <button onclick="SpreadsheetHub.openAddModal()" class="btn-ghost py-1 px-3 text-xs text-emerald-400 border-emerald-500/30 hover:border-emerald-400 font-bold mt-2">
                  + Tautkan Lembar Kerja
                </button>
              </div>
            ` : configuredSheets.map((sheet) => {
              const cleanSheetId = sheet.sheetId || (sheet.id.startsWith('sheet_') ? '' : sheet.id);
              const previewLink = cleanSheetId
                ? `https://docs.google.com/spreadsheets/d/${cleanSheetId}/htmlembed?widget=true`
                : (sheet.previewUrl || sheet.externalUrl);
              const editLink = cleanSheetId
                ? `https://docs.google.com/spreadsheets/d/${cleanSheetId}/edit`
                : (sheet.editUrl || sheet.externalUrl);

              return `
                <div class="bay-recessed p-3 rounded-xl border border-white/10 hover:border-emerald-500/30 transition flex flex-col justify-between gap-2.5 group">
                  <div class="flex items-start justify-between gap-2">
                    <div class="flex items-start gap-2.5 min-w-0">
                      <div class="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-base text-emerald-400 flex-shrink-0 mt-0.5">
                        ${sheet.icon || '📊'}
                      </div>
                      <div class="min-w-0 flex-1">
                        <div class="flex items-center gap-1.5 mb-0.5 flex-wrap">
                          <span class="text-xs font-extrabold text-white truncate group-hover:text-emerald-300 transition">${sheet.name}</span>
                          <span class="px-1.5 py-0.2 rounded text-[8px] font-mono font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">ONLINE</span>
                        </div>
                        <p class="text-[10px] font-mono text-slate-400 truncate">${sheet.date || 'Tersambung Cloud'}</p>
                      </div>
                    </div>

                    <div class="flex items-center gap-1">
                      <button onclick="SpreadsheetHub.openEditSheetModal('${sheet.id}')" class="text-slate-400 hover:text-amber-400 p-1 text-xs transition" title="Edit / Ganti Nama Sheet">
                        ✏️
                      </button>
                      <button onclick="SpreadsheetHub.deleteSheet('${sheet.id}')" class="text-slate-500 hover:text-rose-400 p-1 text-xs transition" title="Hapus Spreadsheet">
                        🗑️
                      </button>
                    </div>
                  </div>

                  <!-- Direct Actions Row -->
                  <div class="flex items-center justify-between gap-1.5 pt-1.5 border-t border-white/5">
                    <div class="flex items-center gap-1">
                      <button onclick="SpreadsheetHub.openEditSheetModal('${sheet.id}')" class="btn-ghost py-1 px-2 text-[10px] text-amber-400 hover:text-amber-300 border-amber-500/20">
                        ✏️ Edit / Rename
                      </button>
                      <button onclick="SpreadsheetHub.copyLink('${editLink}')" class="btn-ghost py-1 px-2 text-[10px] text-slate-400 hover:text-white" title="Salin Tautan">
                        📋 Salin
                      </button>
                    </div>

                    <div class="flex items-center gap-1.5">
                      <button onclick="SpreadsheetHub.openInApp('${cleanSheetId || sheet.id}')" class="btn-tactical py-1 px-2.5 text-xs font-bold flex items-center gap-1 shadow-sm">
                        <span>📊 Buka In-App</span>
                        <span class="text-[10px]">↗</span>
                      </button>
                      <a href="${editLink}" target="_blank" class="btn-ghost py-1 px-2 text-xs text-slate-400 hover:text-white" title="Buka di Tab Baru">
                        ↗
                      </a>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        ` : `
          <!-- Tab 2: CANVA DESIGN BANK LIST -->
          <div class="flex flex-col space-y-2.5 flex-1">
            <!-- Filter Categories Chip Ribbon -->
            <div class="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 text-[10px] font-mono flex-shrink-0">
              ${availableCategories.map(cat => {
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
                    Kumpulkan tautan ID Card, Banner, Backdrop, & Cue Card Canva tim agar tersortir rapi!
                  </p>
                  <button onclick="SpreadsheetHub.openAddCanvaModal()" class="btn-ghost py-1 px-3 text-xs text-blue-400 border-blue-500/30 hover:border-blue-400 font-bold mt-2">
                    + Tambah Link Canva
                  </button>
                </div>
              ` : filteredCanva.map(item => {
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

                      <div class="flex items-center gap-1">
                        <button onclick="SpreadsheetHub.openEditCanvaModal('${item.id}')" class="text-slate-400 hover:text-amber-400 p-1 text-xs transition" title="Edit / Ganti Nama & Link Canva">
                          ✏️
                        </button>
                        <button onclick="SpreadsheetHub.deleteCanva('${item.id}')" class="text-slate-500 hover:text-rose-400 p-1 text-xs transition" title="Hapus Link Canva">
                          🗑️
                        </button>
                      </div>
                    </div>

                    <!-- Direct Actions Row -->
                    <div class="flex items-center justify-between gap-1.5 pt-1.5 border-t border-white/5">
                      <div class="flex items-center gap-1">
                        <button onclick="SpreadsheetHub.openEditCanvaModal('${item.id}')" class="btn-ghost py-1 px-2 text-[10px] text-amber-400 hover:text-amber-300 border-amber-500/20">
                          ✏️ Edit
                        </button>
                        <button onclick="SpreadsheetHub.copyLink('${item.url}')" class="btn-ghost py-1 px-2 text-[10px] text-slate-400 hover:text-white" title="Salin Tautan">
                          📋 Salin
                        </button>
                      </div>

                      <div class="flex items-center gap-1.5">
                        <button onclick="SpreadsheetHub.openCanvaInApp('${item.url}')" class="btn-tactical py-1 px-3 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1 shadow-sm">
                          <span>🎨 Buka Desain</span>
                          <span class="text-[10px]">↗</span>
                        </button>
                      </div>
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
          <button onclick="SpreadsheetHub.openFullCatalog()" class="text-blue-400 hover:text-blue-300 font-bold hover:underline">
            Buka Katalog Pop-up ⛶
          </button>
        </div>

      </div>
    `;
  },

  /**
   * ================================================================
   * EXPANSIVE FULL CATALOG POP-UP (SOLVING THE TINY SCROLLBOX ISSUE)
   * ================================================================
   */
  async openFullCatalog(tab, subEventId) {
    if (tab) this.activeTab = tab;
    if (subEventId) this.catalogSubEventFilter = subEventId;
    
    this.injectFullCatalogModal();
    const modal = document.getElementById('fullCatalogHubModal');
    const card = document.getElementById('fullCatalogHubCard');
    if (!modal || !card) return;

    modal.classList.remove('opacity-0', 'pointer-events-none');
    modal.classList.add('opacity-100', 'pointer-events-auto');
    card.classList.remove('scale-95');
    card.classList.add('scale-100');

    document.body.classList.add('overflow-hidden');
    
    if ((!this.sheets || this.sheets.length === 0) && (!this.canvaLinks || this.canvaLinks.length === 0)) {
      await this.fetchAndRender();
    } else {
      this.renderFullCatalog();
    }
  },

  closeFullCatalog() {
    const modal = document.getElementById('fullCatalogHubModal');
    const card = document.getElementById('fullCatalogHubCard');
    if (modal && card) {
      modal.classList.remove('opacity-100', 'pointer-events-auto');
      modal.classList.add('opacity-0', 'pointer-events-none');
      card.classList.remove('scale-100');
      card.classList.add('scale-95');
    }
    document.body.classList.remove('overflow-hidden');
  },

  isFullCatalogOpen() {
    const modal = document.getElementById('fullCatalogHubModal');
    return modal && modal.classList.contains('opacity-100');
  },

  renderFullCatalog() {
    const gridContainer = document.getElementById('fullCatalogContentArea');
    const titleCountEl = document.getElementById('catalogModalCountBadge');
    if (!gridContainer) return;

    // Filter items based on activeTab, catalogSubEventFilter, catalogCanvaCategoryFilter, and catalogSearchQuery
    const isSheets = this.activeTab === 'sheets';
    const subFilter = this.catalogSubEventFilter;
    const q = this.catalogSearchQuery;

    let items = isSheets ? this.sheets : this.canvaLinks;

    // Filter by Sub-Divisi
    if (subFilter !== 'all') {
      items = items.filter(it => it.subEventId === subFilter);
    }

    // If Canva, filter by Category
    if (!isSheets && this.catalogCanvaCategoryFilter !== 'all') {
      items = items.filter(it => it.category === this.catalogCanvaCategoryFilter);
    }

    // Filter by Search Query
    if (q) {
      items = items.filter(it => {
        const nameMatch = (it.name || '').toLowerCase().includes(q);
        const subMatch = (it.subEventName || it.subEventId || '').toLowerCase().includes(q);
        const catMatch = (it.category || '').toLowerCase().includes(q);
        const descMatch = (it.description || '').toLowerCase().includes(q);
        return nameMatch || subMatch || catMatch || descMatch;
      });
    }

    if (titleCountEl) {
      titleCountEl.innerText = `${items.length} ${isSheets ? 'Spreadsheet' : 'Desain'}`;
    }

    // Render Toolbar Tabs & Sub-Event Chips
    const toolbarEl = document.getElementById('catalogToolbarArea');
    if (toolbarEl) {
      toolbarEl.innerHTML = `
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-white/10">
          
          <!-- Mode Tabs Switcher -->
          <div class="flex items-center gap-2">
            <button 
              onclick="SpreadsheetHub.switchTab('sheets')" 
              class="px-4 py-2 rounded-xl text-xs font-mono font-bold transition flex items-center gap-2 ${isSheets ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' : 'bay-recessed text-slate-400 hover:text-white border border-white/5'}"
            >
              <span>📊 Bank Spreadsheet</span>
              <span class="px-2 py-0.5 rounded-full text-[10px] bg-black/30 font-bold">${this.sheets.length}</span>
            </button>

            <button 
              onclick="SpreadsheetHub.switchTab('canva')" 
              class="px-4 py-2 rounded-xl text-xs font-mono font-bold transition flex items-center gap-2 ${!isSheets ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'bay-recessed text-slate-400 hover:text-white border border-white/5'}"
            >
              <span>🎨 Bank Desain Canva</span>
              <span class="px-2 py-0.5 rounded-full text-[10px] bg-black/30 font-bold">${this.canvaLinks.length}</span>
            </button>
          </div>

          <!-- Sub-Divisi Filter Chips -->
          <div class="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 text-xs font-mono">
            ${[
              { id: 'all', label: '🌐 Semua Sub', code: 'ALL' },
              { id: 'safari', label: '🏛️ Safari', code: 'SF' },
              { id: 'startpoint', label: '🚀 Start Point', code: 'SP' },
              { id: 'odl', label: '🎓 ODL', code: 'ODL' },
              { id: 'technocraft', label: '⚡ Technocraft', code: 'TCP' }
            ].map(s => {
              const active = this.catalogSubEventFilter === s.id;
              return `
                <button 
                  onclick="SpreadsheetHub.setCatalogSubEvent('${s.id}')" 
                  class="px-3 py-1 rounded-xl transition whitespace-nowrap font-bold ${active ? 'bg-white/15 text-white border border-white/30 shadow-sm' : 'bay-recessed text-slate-400 hover:text-white border border-white/5'}"
                >
                  ${s.label}
                </button>
              `;
            }).join('')}
          </div>

        </div>

        <!-- Secondary Filter Bar (Search + Canva Categories + Add Button) -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          
          <!-- Search Input -->
          <div class="relative flex-1 max-w-md">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-xs pointer-events-none">🔍</span>
            <input 
              type="text" 
              id="catalogLiveSearchInput" 
              value="${this.catalogSearchQuery}" 
              oninput="SpreadsheetHub.onCatalogSearch(this.value)"
              placeholder="Cari nama lembar kerja, PIC, kategori, atau tag..." 
              class="w-full pl-8 pr-3.5 py-2 bay-recessed rounded-xl text-xs font-mono text-white placeholder-slate-500 border border-white/10 focus:outline-none focus:border-blue-500"
            />
          </div>

          <!-- Add Trigger in Modal -->
          <div class="flex items-center gap-2 self-end sm:self-auto">
            ${isSheets ? `
              <button onclick="SpreadsheetHub.openAddModal()" class="btn-tactical py-2 px-4 text-xs bg-emerald-600 hover:bg-emerald-500 font-bold flex items-center gap-2 shadow-md shadow-emerald-600/20">
                <span>➕</span>
                <span>Tautkan Spreadsheet Baru</span>
              </button>
            ` : `
              <button onclick="SpreadsheetHub.openAddCanvaModal()" class="btn-tactical py-2 px-4 text-xs bg-blue-600 hover:bg-blue-500 font-bold flex items-center gap-2 shadow-md shadow-blue-600/20">
                <span>➕</span>
                <span>Tambah Desain Canva Baru</span>
              </button>
            `}
          </div>

        </div>

        <!-- Canva Category Chips (Only if Canva Tab) -->
        ${!isSheets ? `
          <div class="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pt-2 pb-1 text-[11px] font-mono">
            <span class="text-slate-400 font-bold mr-1">🏷️ Kategori:</span>
            ${this.canvaCategories.map(cat => {
              const active = this.catalogCanvaCategoryFilter === cat;
              const label = cat === 'all' ? 'Semua Desain' : cat;
              return `
                <button 
                  onclick="SpreadsheetHub.setCatalogCanvaCategory('${cat}')" 
                  class="px-2.5 py-1 rounded-lg border transition whitespace-nowrap ${active ? 'bg-blue-600 text-white font-bold border-blue-500' : 'bay-recessed text-slate-400 hover:text-white border-white/5'}"
                >
                  ${label}
                </button>
              `;
            }).join('')}
          </div>
        ` : ''}
      `;
    }

    // Render Cards in Expansive Multi-Column Grid
    if (items.length === 0) {
      gridContainer.innerHTML = `
        <div class="p-12 rounded-2xl bay-recessed border border-dashed border-white/10 text-center space-y-3 col-span-full">
          <div class="text-4xl">${isSheets ? '📊' : '🎨'}</div>
          <div class="text-base font-extrabold text-white font-display">Tidak Ada Data Ditemukan</div>
          <p class="text-xs font-mono text-slate-400 max-w-md mx-auto">
            Tidak ada lembar kerja atau aset desain yang cocok dengan kata kunci <b>"${this.catalogSearchQuery}"</b> atau filter yang dipilih.
          </p>
          <div class="flex items-center justify-center gap-3 pt-2">
            <button onclick="SpreadsheetHub.onCatalogSearch(''); SpreadsheetHub.setCatalogSubEvent('all'); SpreadsheetHub.setCatalogCanvaCategory('all');" class="btn-ghost py-1.5 px-4 text-xs text-blue-400 border-blue-500/30 hover:border-blue-400 font-bold">
              Reset Semua Filter
            </button>
          </div>
        </div>
      `;
      return;
    }

    if (isSheets) {
      gridContainer.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
          ${items.map(sheet => {
            const cleanSheetId = sheet.sheetId || (sheet.id.startsWith('sheet_') ? '' : sheet.id);
            const sub = this.subEventMap[sheet.subEventId] || { name: sheet.subEventName || sheet.subEventId, code: 'SUB', icon: '📊' };
            const editLink = cleanSheetId
              ? `https://docs.google.com/spreadsheets/d/${cleanSheetId}/edit`
              : (sheet.editUrl || sheet.externalUrl);

            return `
              <div class="chassis p-4 rounded-2xl border border-white/10 hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-200 flex flex-col justify-between space-y-3.5 group bg-[#0c101c]/80">
                
                <div>
                  <!-- Card Header: Badges & Edit Triggers -->
                  <div class="flex items-center justify-between pb-2 border-b border-white/5 gap-2">
                    <span class="px-2 py-0.5 rounded-md text-[9px] font-mono font-extrabold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <span>${sub.icon}</span>
                      <span>${sub.code} • ${sub.name}</span>
                    </span>
                    
                    <div class="flex items-center gap-1">
                      <button onclick="SpreadsheetHub.openEditSheetModal('${sheet.id}')" class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-300 hover:bg-amber-500 hover:text-black border border-amber-500/30 transition flex items-center gap-1" title="Edit nama & link spreadsheet">
                        <span>✏️</span>
                        <span>Edit</span>
                      </button>
                      <button onclick="SpreadsheetHub.deleteSheet('${sheet.id}')" class="text-slate-500 hover:text-rose-400 p-1 text-xs transition" title="Hapus Spreadsheet">
                        🗑️
                      </button>
                    </div>
                  </div>

                  <!-- Card Title & Meta -->
                  <div class="pt-2">
                    <h4 class="text-sm font-extrabold text-white font-display leading-snug group-hover:text-emerald-300 transition line-clamp-2">
                      ${sheet.name}
                    </h4>
                    <div class="flex items-center gap-2 mt-1.5 text-[10px] font-mono text-slate-400">
                      <span class="text-emerald-400 font-bold">● Google Sheets</span>
                      <span>•</span>
                      <span>${sheet.date || 'Tersambung Cloud'}</span>
                    </div>
                  </div>
                </div>

                <!-- Card Action Footer -->
                <div class="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                  <div class="flex items-center gap-1.5">
                    <button onclick="SpreadsheetHub.copyLink('${editLink}')" class="btn-ghost py-1 px-2.5 text-[11px] font-mono text-slate-400 hover:text-white" title="Salin Tautan">
                      📋 Salin
                    </button>
                    <a href="${editLink}" target="_blank" class="btn-ghost py-1 px-2 text-[11px] font-mono text-slate-400 hover:text-white" title="Buka Tab Baru Google">
                      ↗
                    </a>
                  </div>

                  <button onclick="SpreadsheetHub.openInApp('${cleanSheetId || sheet.id}')" class="btn-tactical py-1.5 px-3.5 text-xs font-bold flex items-center gap-1.5 shadow-sm">
                    <span>📊 Buka In-App</span>
                    <span class="text-[10px]">↗</span>
                  </button>
                </div>

              </div>
            `;
          }).join('')}
        </div>
      `;
    } else {
      // Canva Items Grid
      gridContainer.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
          ${items.map(item => {
            const sub = this.subEventMap[item.subEventId] || { name: item.subEventName || item.subEventId, code: 'SUB', icon: '🎨' };
            return `
              <div class="chassis p-4 rounded-2xl border border-white/10 hover:border-blue-500/40 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-200 flex flex-col justify-between space-y-3.5 group bg-[#0c101c]/80">
                
                <div>
                  <!-- Card Header: Badges & Edit Triggers -->
                  <div class="flex items-center justify-between pb-2 border-b border-white/5 gap-2">
                    <div class="flex items-center gap-1.5 flex-wrap">
                      <span class="px-2 py-0.5 rounded-md text-[9px] font-mono font-extrabold bg-blue-500/15 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                        <span>${sub.icon}</span>
                        <span>${sub.code}</span>
                      </span>
                      <span class="px-2 py-0.5 rounded-md text-[9px] font-mono font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                        ${item.category || 'Desain'}
                      </span>
                    </div>

                    <div class="flex items-center gap-1">
                      <button onclick="SpreadsheetHub.openEditCanvaModal('${item.id}')" class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-300 hover:bg-amber-500 hover:text-black border border-amber-500/30 transition flex items-center gap-1" title="Edit nama, kategori & link Canva">
                        <span>✏️</span>
                        <span>Edit</span>
                      </button>
                      <button onclick="SpreadsheetHub.deleteCanva('${item.id}')" class="text-slate-500 hover:text-rose-400 p-1 text-xs transition" title="Hapus Desain Canva">
                        🗑️
                      </button>
                    </div>
                  </div>

                  <!-- Card Title & Description -->
                  <div class="pt-2 space-y-1">
                    <h4 class="text-sm font-extrabold text-white font-display leading-snug group-hover:text-blue-300 transition line-clamp-2">
                      ${item.name}
                    </h4>
                    <p class="text-[11px] font-mono text-slate-300 leading-relaxed line-clamp-2">
                      ${item.description || 'Aset desain resmi tim Central Event 2027.'}
                    </p>
                  </div>
                </div>

                <!-- Card Action Footer -->
                <div class="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                  <div class="flex items-center gap-1.5">
                    <button onclick="SpreadsheetHub.copyLink('${item.url}')" class="btn-ghost py-1 px-2.5 text-[11px] font-mono text-slate-400 hover:text-white" title="Salin Tautan">
                      📋 Salin
                    </button>
                    <a href="${item.url}" target="_blank" class="btn-ghost py-1 px-2 text-[11px] font-mono text-slate-400 hover:text-white" title="Buka Canva.com">
                      ↗
                    </a>
                  </div>

                  <button onclick="SpreadsheetHub.openCanvaInApp('${item.url}')" class="btn-tactical py-1.5 px-3.5 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 shadow-sm">
                    <span>🎨 Buka Desain</span>
                    <span class="text-[10px]">↗</span>
                  </button>
                </div>

              </div>
            `;
          }).join('')}
        </div>
      `;
    }
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
    if (!confirm('Hapus lembar kerja ini dari daftar repositori?')) return;
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
    if (!confirm('Hapus tautan Canva ini dari daftar aset?')) return;
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

  /**
   * ================================================================
   * MODAL INJECTION SYSTEM
   * ================================================================
   */
  injectAllModals() {
    this.injectAddSpreadsheetModal();
    this.injectAddCanvaModal();
    this.injectEditSpreadsheetModal();
    this.injectEditCanvaModal();
    this.injectFullCatalogModal();
  },

  injectFullCatalogModal() {
    if (document.getElementById('fullCatalogHubModal')) return;

    const modalHtml = `
      <div id="fullCatalogHubModal" class="fixed inset-0 z-[140] bg-[#05070c]/90 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-6 transition-all duration-300 opacity-0 pointer-events-none">
        <div class="chassis max-w-6xl w-full max-h-[92vh] flex flex-col rounded-3xl shadow-2xl relative transform transition-all duration-300 scale-95 border border-white/10 overflow-hidden" id="fullCatalogHubCard">
          
          <!-- Top Modal Header -->
          <div class="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between gap-4 flex-shrink-0 bg-[#090d18]/90">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center text-xl shadow-inner">
                📁
              </div>
              <div>
                <div class="flex items-center gap-2 mb-0.5">
                  <span class="eyebrow-pill emerald text-[9px] font-mono font-bold">● CLOUD LIVE REPOSITORY</span>
                  <span id="catalogModalCountBadge" class="eyebrow-pill cobalt text-[9px] font-mono font-bold">KATALOG MASTER</span>
                </div>
                <h3 class="text-base sm:text-lg font-black text-white font-display tracking-tight">
                  Master Repositori Bank Spreadsheet & Desain Canva 2027
                </h3>
              </div>
            </div>

            <button onclick="SpreadsheetHub.closeFullCatalog()" class="w-9 h-9 rounded-xl bay-recessed border border-white/10 text-slate-400 hover:text-white flex items-center justify-center text-base transition hover:border-white/30">
              ✕
            </button>
          </div>

          <!-- Dynamic Filter & Search Toolbar -->
          <div id="catalogToolbarArea" class="px-5 sm:px-6 pt-4 pb-3 flex-shrink-0 bg-[#070a14]/95 border-b border-white/5 space-y-2">
            <!-- Injected by renderFullCatalog() -->
          </div>

          <!-- Scrollable Cards Grid Area -->
          <div id="fullCatalogContentArea" class="flex-1 overflow-y-auto custom-scrollbar p-5 sm:p-6 bg-[#060810]/60">
            <!-- Injected cards grid -->
          </div>

          <!-- Footer Telemetry -->
          <div class="p-3.5 px-6 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400 flex-shrink-0 bg-[#090d18]/90">
            <span class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Pusat Kolaborasi Data & Desain Resmi Central Event 2027
            </span>
            <span class="text-blue-400 font-bold hidden sm:inline">
              100% Realtime Cloud Synchronized
            </span>
          </div>

        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
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
                <label class="block text-[11px] font-mono text-slate-300 mb-1 font-bold">Judul Lembar Kerja</label>
                <input 
                  type="text" 
                  id="inputNewSheetName" 
                  placeholder="Misal: Checklist Perlengkapan & Logistik..." 
                  class="w-full bay-recessed px-3.5 py-2.5 rounded-xl text-xs text-white border border-white/10 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label class="block text-[11px] font-mono text-slate-300 mb-1 font-bold">Tautan Google Sheet / Sheet ID <span class="text-emerald-400">*</span></label>
                <input 
                  type="text" 
                  id="inputNewSheetUrl" 
                  placeholder="https://docs.google.com/spreadsheets/d/1abc.../edit" 
                  class="w-full bay-recessed px-3.5 py-2.5 rounded-xl text-xs text-white border border-white/10 focus:outline-none focus:border-emerald-500 font-mono"
                />
                <p class="text-[10px] font-mono text-slate-400 mt-1">
                  💡 Tempel tautan utuh atau ID sheet Google Docs Anda.
                </p>
              </div>

              <div>
                <label class="block text-[11px] font-mono text-slate-300 mb-1 font-bold">Alokasi Sub-Divisi</label>
                <select id="selectNewSheetSubEvent" class="w-full bay-recessed px-3.5 py-2.5 rounded-xl text-xs text-white border border-white/10 focus:outline-none focus:border-emerald-500 font-mono">
                  <option value="safari">🏛️ Safari Faculty (SF-01)</option>
                  <option value="startpoint">🚀 Start Point (SP-02)</option>
                  <option value="odl">🎓 One Day Lecture (ODL-03)</option>
                  <option value="technocraft">⚡ Technocraft (TC-04)</option>
                  <option value="all">🌐 Semua Sub-Divisi (Umum)</option>
                </select>
              </div>
            </div>

            <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
              <button onclick="SpreadsheetHub.closeAddModal()" class="btn-ghost py-2 px-4 text-xs text-slate-400 hover:text-white">
                Batal
              </button>
              <button onclick="SpreadsheetHub.submitAddSpreadsheet()" id="btnSubmitNewSheet" class="btn-tactical py-2 px-4 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30">
                💾 Tautkan & Simpan
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
                  <span class="eyebrow-pill cobalt text-[9px] font-mono">CANVA DESIGN BANK</span>
                  <h3 class="text-base font-extrabold text-white font-display">Tambah Tautan Desain Canva</h3>
                </div>
              </div>
              <button onclick="SpreadsheetHub.closeAddCanvaModal()" class="text-slate-400 hover:text-white p-1.5 text-sm">
                ✕
              </button>
            </div>

            <div class="space-y-3.5">
              <div>
                <label class="block text-[11px] font-mono text-slate-300 mb-1 font-bold">Nama / Judul Desain <span class="text-blue-400">*</span></label>
                <input 
                  type="text" 
                  id="inputNewCanvaName" 
                  placeholder="Misal: Banner Gate Kedatangan, ID Card LO..." 
                  class="w-full bay-recessed px-3.5 py-2.5 rounded-xl text-xs text-white border border-white/10 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label class="block text-[11px] font-mono text-slate-300 mb-1 font-bold">Kategori Desain</label>
                <select id="selectNewCanvaCategory" class="w-full bay-recessed px-3.5 py-2.5 rounded-xl text-xs text-white border border-white/10 focus:outline-none focus:border-blue-500 font-mono">
                  <option value="ID Card & Tanda Pengenal">🪪 ID Card & Tanda Pengenal</option>
                  <option value="Banner & Backdrop">🎨 Banner & Backdrop</option>
                  <option value="Cue Card & Rundown Visual">📑 Cue Card & Rundown Visual</option>
                  <option value="PPT & Presentasi">📊 PPT & Presentasi</option>
                  <option value="Signage & Peta Rute">📍 Signage & Peta Rute</option>
                  <option value="Merchandise & Identitas">👕 Merchandise & Identitas</option>
                  <option value="Sertifikat & Dokumen">📜 Sertifikat & Dokumen</option>
                  <option value="Media Sosial">📱 Media Sosial</option>
                  <option value="Desain & Media" selected>✨ Desain & Media Lainnya</option>
                </select>
              </div>

              <div>
                <label class="block text-[11px] font-mono text-slate-300 mb-1 font-bold">Tautan / URL Canva <span class="text-blue-400">*</span></label>
                <input 
                  type="text" 
                  id="inputNewCanvaUrl" 
                  placeholder="https://www.canva.com/design/DAF.../view" 
                  class="w-full bay-recessed px-3.5 py-2.5 rounded-xl text-xs text-white border border-white/10 focus:outline-none focus:border-blue-500 font-mono"
                />
                <p class="text-[10px] font-mono text-slate-400 mt-1">
                  💡 Tempel tautan Share / View / Edit Canva Anda.
                </p>
              </div>

              <div>
                <label class="block text-[11px] font-mono text-slate-300 mb-1 font-bold">Sub-Divisi Pemilik</label>
                <select id="selectNewCanvaSubEvent" class="w-full bay-recessed px-3.5 py-2.5 rounded-xl text-xs text-white border border-white/10 focus:outline-none focus:border-blue-500 font-mono">
                  <option value="safari">🏛️ Safari Faculty (SF-01)</option>
                  <option value="startpoint">🚀 Start Point (SP-02)</option>
                  <option value="odl">🎓 One Day Lecture (ODL-03)</option>
                  <option value="technocraft">⚡ Technocraft (TC-04)</option>
                  <option value="all">🌐 Umum & Medkraf Pusat</option>
                </select>
              </div>

              <div>
                <label class="block text-[11px] font-mono text-slate-300 mb-1 font-bold">Deskripsi Singkat / Catatan Cetak</label>
                <textarea 
                  id="inputNewCanvaDesc" 
                  rows="2" 
                  placeholder="Misal: Ukuran 3x2 meter, bahan flexi korea 440gr..." 
                  class="w-full bay-recessed px-3.5 py-2 rounded-xl text-xs text-white border border-white/10 focus:outline-none focus:border-blue-500 font-mono"
                ></textarea>
              </div>
            </div>

            <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
              <button onclick="SpreadsheetHub.closeAddCanvaModal()" class="btn-ghost py-2 px-4 text-xs text-slate-400 hover:text-white">
                Batal
              </button>
              <button onclick="SpreadsheetHub.submitAddCanva()" id="btnSubmitNewCanva" class="btn-tactical py-2 px-4 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30">
                💾 Simpan ke Bank Canva
              </button>
            </div>

          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
  },

  /**
   * ================================================================
   * EDIT & RENAME SPREADSHEET MODAL
   * ================================================================
   */
  injectEditSpreadsheetModal() {
    if (document.getElementById('editSpreadsheetHubModal')) return;

    const modalHtml = `
      <div id="editSpreadsheetHubModal" class="fixed inset-0 z-[170] bg-[#07090E]/90 backdrop-blur-xl flex items-center justify-center p-3 sm:p-5 transition-all duration-300 opacity-0 pointer-events-none">
        <div class="chassis max-w-lg w-full rounded-2xl shadow-2xl relative transform transition-all duration-300 scale-95 border-amber-500/40" id="editSpreadsheetHubCard">
          <div class="chassis-core p-5 sm:p-7 space-y-4">
            
            <div class="flex items-center justify-between pb-3 border-b border-white/10">
              <div class="flex items-center gap-2.5">
                <div class="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 font-mono font-bold flex items-center justify-center text-lg">
                  ✏️
                </div>
                <div>
                  <span class="eyebrow-pill amber text-[9px] font-mono">RENAME & GANTI TAUTAN</span>
                  <h3 class="text-base font-extrabold text-white font-display">Edit Spreadsheet</h3>
                </div>
              </div>
              <button onclick="SpreadsheetHub.closeEditSheetModal()" class="text-slate-400 hover:text-white p-1.5 text-sm">
                ✕
              </button>
            </div>

            <input type="hidden" id="inputEditSheetId" />

            <div class="space-y-3.5">
              <div>
                <label class="block text-[11px] font-mono text-slate-300 mb-1 font-bold">Nama / Judul Lembar Kerja <span class="text-amber-400">*</span></label>
                <input 
                  type="text" 
                  id="inputEditSheetName" 
                  class="w-full bay-recessed px-3.5 py-2.5 rounded-xl text-xs text-white border border-white/10 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label class="block text-[11px] font-mono text-slate-300 mb-1 font-bold">Tautan Google Sheet / ID</label>
                <input 
                  type="text" 
                  id="inputEditSheetUrl" 
                  class="w-full bay-recessed px-3.5 py-2.5 rounded-xl text-xs text-white border border-white/10 focus:outline-none focus:border-amber-500 font-mono"
                />
                <p class="text-[10px] font-mono text-slate-400 mt-1">
                  💡 Ganti URL jika tautan sheet dipindahkan atau diperbarui.
                </p>
              </div>

              <div>
                <label class="block text-[11px] font-mono text-slate-300 mb-1 font-bold">Alokasi Sub-Divisi</label>
                <select id="selectEditSheetSubEvent" class="w-full bay-recessed px-3.5 py-2.5 rounded-xl text-xs text-white border border-white/10 focus:outline-none focus:border-amber-500 font-mono">
                  <option value="safari">🏛️ Safari Faculty (SF-01)</option>
                  <option value="startpoint">🚀 Start Point (SP-02)</option>
                  <option value="odl">🎓 One Day Lecture (ODL-03)</option>
                  <option value="technocraft">⚡ Technocraft (TC-04)</option>
                  <option value="all">🌐 Semua Sub-Divisi (Umum)</option>
                </select>
              </div>
            </div>

            <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
              <button onclick="SpreadsheetHub.closeEditSheetModal()" class="btn-ghost py-2 px-4 text-xs text-slate-400 hover:text-white">
                Batal
              </button>
              <button onclick="SpreadsheetHub.submitEditSheet()" id="btnSubmitEditSheet" class="btn-tactical py-2 px-4 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/20">
                💾 Simpan Perubahan
              </button>
            </div>

          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
  },

  /**
   * ================================================================
   * EDIT & RENAME CANVA LINK MODAL
   * ================================================================
   */
  injectEditCanvaModal() {
    if (document.getElementById('editCanvaHubModal')) return;

    const modalHtml = `
      <div id="editCanvaHubModal" class="fixed inset-0 z-[170] bg-[#07090E]/90 backdrop-blur-xl flex items-center justify-center p-3 sm:p-5 transition-all duration-300 opacity-0 pointer-events-none">
        <div class="chassis max-w-lg w-full rounded-2xl shadow-2xl relative transform transition-all duration-300 scale-95 border-amber-500/40" id="editCanvaHubCard">
          <div class="chassis-core p-5 sm:p-7 space-y-4">
            
            <div class="flex items-center justify-between pb-3 border-b border-white/10">
              <div class="flex items-center gap-2.5">
                <div class="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 font-mono font-bold flex items-center justify-center text-lg">
                  ✏️
                </div>
                <div>
                  <span class="eyebrow-pill amber text-[9px] font-mono">RENAME & GANTI TAUTAN</span>
                  <h3 class="text-base font-extrabold text-white font-display">Edit Desain Canva</h3>
                </div>
              </div>
              <button onclick="SpreadsheetHub.closeEditCanvaModal()" class="text-slate-400 hover:text-white p-1.5 text-sm">
                ✕
              </button>
            </div>

            <input type="hidden" id="inputEditCanvaId" />

            <div class="space-y-3.5">
              <div>
                <label class="block text-[11px] font-mono text-slate-300 mb-1 font-bold">Nama / Judul Desain <span class="text-amber-400">*</span></label>
                <input 
                  type="text" 
                  id="inputEditCanvaName" 
                  class="w-full bay-recessed px-3.5 py-2.5 rounded-xl text-xs text-white border border-white/10 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label class="block text-[11px] font-mono text-slate-300 mb-1 font-bold">Tautan / URL Canva <span class="text-amber-400">*</span></label>
                <input 
                  type="text" 
                  id="inputEditCanvaUrl" 
                  class="w-full bay-recessed px-3.5 py-2.5 rounded-xl text-xs text-white border border-white/10 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label class="block text-[11px] font-mono text-slate-300 mb-1 font-bold">Kategori Desain</label>
                <select id="selectEditCanvaCategory" class="w-full bay-recessed px-3.5 py-2.5 rounded-xl text-xs text-white border border-white/10 focus:outline-none focus:border-amber-500 font-mono">
                  <option value="ID Card & Tanda Pengenal">🪪 ID Card & Tanda Pengenal</option>
                  <option value="Banner & Backdrop">🎨 Banner & Backdrop</option>
                  <option value="Cue Card & Rundown Visual">📑 Cue Card & Rundown Visual</option>
                  <option value="PPT & Presentasi">📊 PPT & Presentasi</option>
                  <option value="Signage & Peta Rute">📍 Signage & Peta Rute</option>
                  <option value="Merchandise & Identitas">👕 Merchandise & Identitas</option>
                  <option value="Sertifikat & Dokumen">📜 Sertifikat & Dokumen</option>
                  <option value="Media Sosial">📱 Media Sosial</option>
                  <option value="Desain & Media">✨ Desain & Media Lainnya</option>
                </select>
              </div>

              <div>
                <label class="block text-[11px] font-mono text-slate-300 mb-1 font-bold">Sub-Divisi Pemilik</label>
                <select id="selectEditCanvaSubEvent" class="w-full bay-recessed px-3.5 py-2.5 rounded-xl text-xs text-white border border-white/10 focus:outline-none focus:border-amber-500 font-mono">
                  <option value="safari">🏛️ Safari Faculty (SF-01)</option>
                  <option value="startpoint">🚀 Start Point (SP-02)</option>
                  <option value="odl">🎓 One Day Lecture (ODL-03)</option>
                  <option value="technocraft">⚡ Technocraft (TC-04)</option>
                  <option value="all">🌐 Umum & Medkraf Pusat</option>
                </select>
              </div>

              <div>
                <label class="block text-[11px] font-mono text-slate-300 mb-1 font-bold">Deskripsi Singkat / Catatan</label>
                <textarea 
                  id="inputEditCanvaDesc" 
                  rows="2" 
                  class="w-full bay-recessed px-3.5 py-2 rounded-xl text-xs text-white border border-white/10 focus:outline-none focus:border-amber-500 font-mono"
                ></textarea>
              </div>
            </div>

            <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
              <button onclick="SpreadsheetHub.closeEditCanvaModal()" class="btn-ghost py-2 px-4 text-xs text-slate-400 hover:text-white">
                Batal
              </button>
              <button onclick="SpreadsheetHub.submitEditCanva()" id="btnSubmitEditCanva" class="btn-tactical py-2 px-4 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/20">
                💾 Simpan Perubahan
              </button>
            </div>

          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
  },

  /**
   * Open Edit Sheet Dialog
   */
  openEditSheetModal(sheetId) {
    this.injectEditSpreadsheetModal();
    const sheet = (this.sheets || []).find(s => s.id === sheetId);
    if (!sheet) {
      alert('Spreadsheet tidak ditemukan.');
      return;
    }

    const idInput = document.getElementById('inputEditSheetId');
    const nameInput = document.getElementById('inputEditSheetName');
    const urlInput = document.getElementById('inputEditSheetUrl');
    const subSelect = document.getElementById('selectEditSheetSubEvent');

    if (idInput) idInput.value = sheet.id;
    if (nameInput) nameInput.value = sheet.name;
    if (urlInput) urlInput.value = sheet.externalUrl || sheet.sheetId || '';
    if (subSelect) subSelect.value = sheet.subEventId || this.currentSubEventId || 'safari';

    const modal = document.getElementById('editSpreadsheetHubModal');
    const card = document.getElementById('editSpreadsheetHubCard');
    if (modal && card) {
      modal.classList.remove('opacity-0', 'pointer-events-none');
      modal.classList.add('opacity-100', 'pointer-events-auto');
      card.classList.remove('scale-95');
      card.classList.add('scale-100');
    }
  },

  closeEditSheetModal() {
    const modal = document.getElementById('editSpreadsheetHubModal');
    const card = document.getElementById('editSpreadsheetHubCard');
    if (modal && card) {
      modal.classList.remove('opacity-100', 'pointer-events-auto');
      modal.classList.add('opacity-0', 'pointer-events-none');
      card.classList.remove('scale-100');
      card.classList.add('scale-95');
    }
  },

  async submitEditSheet() {
    const idInput = document.getElementById('inputEditSheetId');
    const nameInput = document.getElementById('inputEditSheetName');
    const urlInput = document.getElementById('inputEditSheetUrl');
    const subSelect = document.getElementById('selectEditSheetSubEvent');
    const btn = document.getElementById('btnSubmitEditSheet');

    const id = idInput ? idInput.value : '';
    const name = nameInput ? nameInput.value.trim() : '';
    const sheetIdOrUrl = urlInput ? urlInput.value.trim() : '';
    const subEventId = subSelect ? subSelect.value : undefined;

    if (!id) return;
    if (!name) {
      alert('Nama lembar kerja wajib diisi.');
      nameInput?.focus();
      return;
    }

    if (btn) {
      btn.disabled = true;
      btn.innerText = 'Menyimpan...';
    }

    try {
      const res = await CE_API.updateSpreadsheet(id, {
        name,
        sheetIdOrUrl: sheetIdOrUrl || undefined,
        subEventId
      });

      if (res && res.success) {
        if (typeof showToast === 'function') {
          showToast(`Spreadsheet "${res.sheet.name}" berhasil diperbarui!`, 'success');
        }
        this.closeEditSheetModal();
        await this.fetchAndRender();
      } else {
        alert('Gagal: ' + (res?.error || 'Periksa format data'));
      }
    } catch (e) {
      alert('Error koneksi: ' + e.message);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerText = '💾 Simpan Perubahan';
      }
    }
  },

  /**
   * Open Edit Canva Dialog
   */
  openEditCanvaModal(canvaId) {
    this.injectEditCanvaModal();
    const item = (this.canvaLinks || []).find(c => c.id === canvaId);
    if (!item) {
      alert('Tautan Canva tidak ditemukan.');
      return;
    }

    const idInput = document.getElementById('inputEditCanvaId');
    const nameInput = document.getElementById('inputEditCanvaName');
    const urlInput = document.getElementById('inputEditCanvaUrl');
    const catSelect = document.getElementById('selectEditCanvaCategory');
    const subSelect = document.getElementById('selectEditCanvaSubEvent');
    const descInput = document.getElementById('inputEditCanvaDesc');

    if (idInput) idInput.value = item.id;
    if (nameInput) nameInput.value = item.name;
    if (urlInput) urlInput.value = item.url || '';
    if (catSelect) catSelect.value = item.category || 'Desain & Media';
    if (subSelect) subSelect.value = item.subEventId || this.currentSubEventId || 'safari';
    if (descInput) descInput.value = item.description || '';

    const modal = document.getElementById('editCanvaHubModal');
    const card = document.getElementById('editCanvaHubCard');
    if (modal && card) {
      modal.classList.remove('opacity-0', 'pointer-events-none');
      modal.classList.add('opacity-100', 'pointer-events-auto');
      card.classList.remove('scale-95');
      card.classList.add('scale-100');
    }
  },

  closeEditCanvaModal() {
    const modal = document.getElementById('editCanvaHubModal');
    const card = document.getElementById('editCanvaHubCard');
    if (modal && card) {
      modal.classList.remove('opacity-100', 'pointer-events-auto');
      modal.classList.add('opacity-0', 'pointer-events-none');
      card.classList.remove('scale-100');
      card.classList.add('scale-95');
    }
  },

  async submitEditCanva() {
    const idInput = document.getElementById('inputEditCanvaId');
    const nameInput = document.getElementById('inputEditCanvaName');
    const urlInput = document.getElementById('inputEditCanvaUrl');
    const catSelect = document.getElementById('selectEditCanvaCategory');
    const subSelect = document.getElementById('selectEditCanvaSubEvent');
    const descInput = document.getElementById('inputEditCanvaDesc');
    const btn = document.getElementById('btnSubmitEditCanva');

    const id = idInput ? idInput.value : '';
    const name = nameInput ? nameInput.value.trim() : '';
    const url = urlInput ? urlInput.value.trim() : '';
    const category = catSelect ? catSelect.value : undefined;
    const subEventId = subSelect ? subSelect.value : undefined;
    const description = descInput ? descInput.value.trim() : undefined;

    if (!id) return;
    if (!name) {
      alert('Nama desain Canva wajib diisi.');
      nameInput?.focus();
      return;
    }
    if (!url) {
      alert('Tautan Canva wajib diisi.');
      urlInput?.focus();
      return;
    }

    if (btn) {
      btn.disabled = true;
      btn.innerText = 'Menyimpan...';
    }

    try {
      const res = await CE_API.updateCanvaLink(id, {
        name,
        url,
        category,
        subEventId,
        description
      });

      if (res && res.success) {
        if (typeof showToast === 'function') {
          showToast(`Desain Canva "${res.link.name}" berhasil diperbarui!`, 'success');
        }
        this.closeEditCanvaModal();
        await this.fetchAndRender();
      } else {
        alert('Gagal: ' + (res?.error || 'Periksa format data'));
      }
    } catch (e) {
      alert('Error koneksi: ' + e.message);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerText = '💾 Simpan Perubahan';
      }
    }
  },

  /**
   * Modal Open / Close for Add Operations
   */
  openAddModal() {
    this.injectAddSpreadsheetModal();
    const modal = document.getElementById('addSpreadsheetHubModal');
    const card = document.getElementById('addSpreadsheetHubCard');
    const subSelect = document.getElementById('selectNewSheetSubEvent');
    if (subSelect) subSelect.value = this.currentSubEventId;

    if (modal && card) {
      modal.classList.remove('opacity-0', 'pointer-events-none');
      modal.classList.add('opacity-100', 'pointer-events-auto');
      card.classList.remove('scale-95');
      card.classList.add('scale-100');
    }
  },

  closeAddModal() {
    const modal = document.getElementById('addSpreadsheetHubModal');
    const card = document.getElementById('addSpreadsheetHubCard');
    if (modal && card) {
      modal.classList.remove('opacity-100', 'pointer-events-auto');
      modal.classList.add('opacity-0', 'pointer-events-none');
      card.classList.remove('scale-100');
      card.classList.add('scale-95');
    }
  },

  openAddCanvaModal() {
    this.injectAddCanvaModal();
    const modal = document.getElementById('addCanvaHubModal');
    const card = document.getElementById('addCanvaHubCard');
    const subSelect = document.getElementById('selectNewCanvaSubEvent');
    if (subSelect) subSelect.value = this.currentSubEventId;

    if (modal && card) {
      modal.classList.remove('opacity-0', 'pointer-events-none');
      modal.classList.add('opacity-100', 'pointer-events-auto');
      card.classList.remove('scale-95');
      card.classList.add('scale-100');
    }
  },

  closeAddCanvaModal() {
    const modal = document.getElementById('addCanvaHubModal');
    const card = document.getElementById('addCanvaHubCard');
    if (modal && card) {
      modal.classList.remove('opacity-100', 'pointer-events-auto');
      modal.classList.add('opacity-0', 'pointer-events-none');
      card.classList.remove('scale-100');
      card.classList.add('scale-95');
    }
  },

  async submitAddSpreadsheet() {
    const nameInput = document.getElementById('inputNewSheetName');
    const urlInput = document.getElementById('inputNewSheetUrl');
    const subSelect = document.getElementById('selectNewSheetSubEvent');
    const btn = document.getElementById('btnSubmitNewSheet');

    const name = nameInput ? nameInput.value.trim() : '';
    const sheetIdOrUrl = urlInput ? urlInput.value.trim() : '';
    const subEventId = subSelect ? subSelect.value : this.currentSubEventId;

    if (!sheetIdOrUrl) {
      alert('Tautan atau ID Google Sheet wajib diisi.');
      urlInput?.focus();
      return;
    }

    if (btn) {
      btn.disabled = true;
      btn.innerText = 'Menyambungkan...';
    }

    try {
      const res = await CE_API.addSpreadsheet({
        name: name || undefined,
        sheetIdOrUrl,
        subEventId,
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
        btn.innerText = '💾 Tautkan & Simpan';
      }
    }
  },

  async submitAddCanva() {
    const nameInput = document.getElementById('inputNewCanvaName');
    const catInput = document.getElementById('selectNewCanvaCategory');
    const urlInput = document.getElementById('inputNewCanvaUrl');
    const subSelect = document.getElementById('selectNewCanvaSubEvent');
    const descInput = document.getElementById('inputNewCanvaDesc');
    const btn = document.getElementById('btnSubmitNewCanva');

    const name = nameInput ? nameInput.value.trim() : '';
    const category = catInput ? catInput.value : 'Desain & Media';
    const url = urlInput ? urlInput.value.trim() : '';
    const subEventId = subSelect ? subSelect.value : this.currentSubEventId;
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
        subEventId,
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
