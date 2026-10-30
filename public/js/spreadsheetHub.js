/**
 * CENTRAL EVENT 2027 — SPREADSHEET & CANVA DESIGN BANK HUB
 * Menghadirkan Pop-up UI/UX Explorer Terpadu (layaknya Drive In-App Explorer)
 * lengkap dengan Sortir Fleksibel (A-Z, Tanggal, Sub-Divisi, Kategori), Tampilan Grid/Tabel,
 * Fitur Edit & Rename Judul/Tautan, dan Sinkronisasi Real-Time Supabase Cloud.
 */

const SpreadsheetHub = {
  currentSubEventId: 'safari',
  containerId: 'sharedSpreadsheetMount',
  
  // Explorer States
  activeTab: 'sheets', // 'sheets' | 'canva'
  subEventFilter: 'all',
  canvaCategoryFilter: 'all',
  searchQuery: '',
  sortBy: 'sub_asc', // 'name_asc' | 'name_desc' | 'date_desc' | 'sub_asc' | 'category'
  layoutMode: 'grid', // 'grid' | 'table'

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
    this.subEventFilter = subEventId || 'all';

    if (typeof window !== 'undefined' && window.location.hash === '#canva') {
      this.activeTab = 'canva';
    }

    this.injectAllModals();
    await this.fetchAndRender();
  },

  async fetchAndRender() {
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

    this.renderOnPageWidget();
    if (this.isExplorerOpen()) {
      this.renderExplorerContent();
    }
  },

  /**
   * ================================================================
   * ON-PAGE WIDGET (Inside #sharedSpreadsheetMount)
   * Menggantikan kotak kecil yang sesak dengan Launcher Explorer Elegan
   * ================================================================
   */
  renderOnPageWidget() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    const subInfo = this.subEventMap[this.currentSubEventId] || { name: this.currentSubEventId, code: 'SUB', icon: '📊' };
    const sheetCount = (this.sheets || []).length;
    const canvaCount = (this.canvaLinks || []).length;

    container.innerHTML = `
      <div class="chassis-core flex flex-col justify-between h-full space-y-4">
        
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-white/5 gap-2.5">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="eyebrow-pill emerald text-[9px] font-mono font-bold">● CLOUD LIVE REPO</span>
              <span class="eyebrow-pill cobalt text-[9px] font-mono font-bold">${subInfo.code} REPOSITORI</span>
            </div>
            <h3 class="text-sm font-extrabold text-white font-display flex items-center gap-2">
              <span>📊</span> Bank Lembar Kerja & <span>🎨</span> Desain Canva
            </h3>
            <p class="text-[11px] font-mono text-slate-300">
              Akses cepat lembar kerja operasional & aset visual resmi ${subInfo.name}
            </p>
          </div>

          <!-- Fast Add & Pop-up Explorer Buttons -->
          <div class="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <button 
              onclick="SpreadsheetHub.openExplorer('sheets')" 
              class="btn-tactical py-1.5 px-3 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
            >
              <span>📊 BUKA BANK SHEET</span>
              <span class="text-[10px]">↗</span>
            </button>
            <button 
              onclick="SpreadsheetHub.openExplorer('canva')" 
              class="btn-ghost py-1.5 px-3 text-xs font-bold text-blue-400 border-blue-500/30 hover:border-blue-400 flex items-center gap-1.5"
            >
              <span>🎨 BUKA CANVA</span>
              <span class="text-[10px]">↗</span>
            </button>
          </div>
        </div>

        <!-- 2 Grand Interactive Hub Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          
          <!-- Card 1: Bank Spreadsheet Hub -->
          <div 
            onclick="SpreadsheetHub.openExplorer('sheets')" 
            class="bay-recessed p-4 rounded-2xl border border-white/10 hover:border-emerald-500/40 hover:bg-emerald-500/5 transition cursor-pointer flex flex-col justify-between group space-y-3"
          >
            <div>
              <div class="flex items-center justify-between gap-2 mb-2">
                <div class="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono font-bold flex items-center justify-center text-lg group-hover:scale-105 transition">
                  📊
                </div>
                <span class="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                  ${sheetCount} LEMBAR KERJA
                </span>
              </div>
              <h4 class="text-sm font-extrabold text-white font-display group-hover:text-emerald-300 transition">
                Bank Spreadsheet Operasional
              </h4>
              <p class="text-[11px] font-mono text-slate-400 mt-1 line-clamp-2">
                Master Rundown, Plotting Rute, Logistik, Presensi, dan inventaris tim Central Event.
              </p>
            </div>

            <!-- Quick Pill Peek -->
            <div class="pt-2 border-t border-white/5 flex items-center justify-between text-xs font-mono">
              <span class="text-[10px] text-slate-500 font-bold">MODE POP-UP & SORTIR</span>
              <span class="text-emerald-400 group-hover:underline font-bold flex items-center gap-1">
                Eksplorasi Sheet <span>→</span>
              </span>
            </div>
          </div>

          <!-- Card 2: Bank Desain Canva Hub -->
          <div 
            onclick="SpreadsheetHub.openExplorer('canva')" 
            class="bay-recessed p-4 rounded-2xl border border-white/10 hover:border-blue-500/40 hover:bg-blue-500/5 transition cursor-pointer flex flex-col justify-between group space-y-3"
          >
            <div>
              <div class="flex items-center justify-between gap-2 mb-2">
                <div class="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 font-mono font-bold flex items-center justify-center text-lg group-hover:scale-105 transition">
                  🎨
                </div>
                <span class="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-blue-400/20 text-blue-300 border border-blue-400/30">
                  ${canvaCount} ASET DESAIN
                </span>
              </div>
              <h4 class="text-sm font-extrabold text-white font-display group-hover:text-blue-300 transition">
                Bank Desain Canva Resmi
              </h4>
              <p class="text-[11px] font-mono text-slate-400 mt-1 line-clamp-2">
                ID Card Panitia, Banner Gate, Cue Card MC, PPT Deck, Signage, dan materi publikasi.
              </p>
            </div>

            <!-- Quick Pill Peek -->
            <div class="pt-2 border-t border-white/5 flex items-center justify-between text-xs font-mono">
              <span class="text-[10px] text-slate-500 font-bold">MODE POP-UP & SORTIR</span>
              <span class="text-blue-400 group-hover:underline font-bold flex items-center gap-1">
                Eksplorasi Canva <span>→</span>
              </span>
            </div>
          </div>

        </div>

        <!-- Telemetry Bottom Strip -->
        <div class="bay-recessed p-2.5 rounded-xl border border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-400">
          <span class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Tersinkronisasi Otomatis Supabase Cloud & Multi-Device
          </span>
          <button onclick="SpreadsheetHub.openExplorer()" class="text-blue-400 hover:text-blue-300 font-bold hover:underline">
            Buka Explorer Penuh ⛶
          </button>
        </div>

      </div>
    `;
  },

  /**
   * ================================================================
   * POP-UP UI/UX EXPLORER (Mirip Drive In-App Explorer)
   * Menyediakan Sortir Lengkap, Filter Kategori, Grid/Table View, Edit/Rename
   * ================================================================
   */
  async openExplorer(type = 'sheets', subEventId = null) {
    if (type) this.activeTab = type;
    if (subEventId) this.subEventFilter = subEventId;

    this.injectExplorerModal();
    const modal = document.getElementById('hubExplorerModal');
    const card = document.getElementById('hubExplorerCard');
    if (!modal || !card) return;

    modal.classList.remove('opacity-0', 'pointer-events-none');
    modal.classList.add('opacity-100', 'pointer-events-auto');
    card.classList.remove('scale-95');
    card.classList.add('scale-100');

    document.body.classList.add('overflow-hidden');

    if ((!this.sheets || this.sheets.length === 0) && (!this.canvaLinks || this.canvaLinks.length === 0)) {
      await this.fetchAndRender();
    } else {
      this.renderExplorerContent();
    }
  },

  // Alias for backward compatibility
  openFullCatalog(type, subEventId) {
    return this.openExplorer(type, subEventId);
  },

  closeExplorer() {
    const modal = document.getElementById('hubExplorerModal');
    const card = document.getElementById('hubExplorerCard');
    if (modal && card) {
      modal.classList.remove('opacity-100', 'pointer-events-auto');
      modal.classList.add('opacity-0', 'pointer-events-none');
      card.classList.remove('scale-100');
      card.classList.add('scale-95');
    }
    document.body.classList.remove('overflow-hidden');
  },

  isExplorerOpen() {
    const modal = document.getElementById('hubExplorerModal');
    return modal && modal.classList.contains('opacity-100');
  },

  switchExplorerTab(tab) {
    this.activeTab = tab;
    this.renderExplorerContent();
  },

  setSubEventFilter(subId) {
    this.subEventFilter = subId;
    this.renderExplorerContent();
  },

  setCanvaCategoryFilter(cat) {
    this.canvaCategoryFilter = cat;
    this.renderExplorerContent();
  },

  setSortBy(sortKey) {
    this.sortBy = sortKey;
    this.renderExplorerContent();
  },

  setLayoutMode(layout) {
    this.layoutMode = layout;
    this.renderExplorerContent();
  },

  onSearch(query) {
    this.searchQuery = (query || '').toLowerCase().trim();
    this.renderExplorerContent();
  },

  /**
   * Filter and Sort Data
   */
  getSortedAndFilteredItems() {
    const isSheets = this.activeTab === 'sheets';
    let items = isSheets ? [...this.sheets] : [...this.canvaLinks];

    // 1. Filter by Sub-Divisi
    if (this.subEventFilter && this.subEventFilter !== 'all') {
      items = items.filter(it => it.subEventId === this.subEventFilter);
    }

    // 2. Filter by Canva Category
    if (!isSheets && this.canvaCategoryFilter && this.canvaCategoryFilter !== 'all') {
      items = items.filter(it => it.category === this.canvaCategoryFilter);
    }

    // 3. Filter by Search Query
    if (this.searchQuery) {
      const q = this.searchQuery;
      items = items.filter(it => {
        const nameMatch = (it.name || '').toLowerCase().includes(q);
        const subMatch = (it.subEventName || it.subEventId || '').toLowerCase().includes(q);
        const catMatch = (it.category || '').toLowerCase().includes(q);
        const descMatch = (it.description || '').toLowerCase().includes(q);
        return nameMatch || subMatch || catMatch || descMatch;
      });
    }

    // 4. Sort Items ("lebih enak buat sortir")
    switch (this.sortBy) {
      case 'name_asc':
        items.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'name_desc':
        items.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
        break;
      case 'date_desc':
        items.sort((a, b) => (b.created_at || b.date || '').localeCompare(a.created_at || a.date || ''));
        break;
      case 'sub_asc':
        items.sort((a, b) => (a.subEventId || '').localeCompare(b.subEventId || ''));
        break;
      case 'category':
        items.sort((a, b) => (a.category || '').localeCompare(b.category || '') || (a.name || '').localeCompare(b.name || ''));
        break;
      default:
        break;
    }

    return items;
  },

  renderExplorerContent() {
    const isSheets = this.activeTab === 'sheets';
    const items = this.getSortedAndFilteredItems();

    // 1. Update Top Title & Eyebrow
    const titleEl = document.getElementById('hubExplorerTitle');
    const badgeEl = document.getElementById('hubExplorerStatusBadge');
    const iconEl = document.getElementById('hubExplorerIconBadge');
    const counterEl = document.getElementById('hubExplorerCounter');

    if (titleEl) {
      titleEl.innerText = isSheets 
        ? 'Bank Spreadsheet Operasional Central Event 2027' 
        : 'Bank Desain Canva Resmi Central Event 2027';
    }
    if (badgeEl) {
      badgeEl.innerText = isSheets ? 'SPREADSHEET IN-APP EXPLORER' : 'CANVA DESIGN ASSET EXPLORER';
      badgeEl.className = isSheets 
        ? 'eyebrow-pill emerald text-[9px] font-mono' 
        : 'eyebrow-pill cobalt text-[9px] font-mono';
    }
    if (iconEl) {
      iconEl.innerText = isSheets ? '📊' : '🎨';
      iconEl.className = isSheets
        ? 'w-9 h-9 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 font-mono font-bold flex items-center justify-center text-base flex-shrink-0'
        : 'w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 font-mono font-bold flex items-center justify-center text-base flex-shrink-0';
    }
    if (counterEl) {
      counterEl.innerText = `${items.length} ${isSheets ? 'Lembar Kerja' : 'Aset Desain'}`;
    }

    // 2. Render Toolbar (Breadcrumbs/Tabs, Search, Sort Dropdown, Layout Switcher)
    const toolbarEl = document.getElementById('hubExplorerToolbar');
    if (toolbarEl) {
      toolbarEl.innerHTML = `
        <!-- Sub-Ribbon Row 1: Mode Tabs & Sub-Divisi Switcher -->
        <div class="px-4 sm:px-6 py-2.5 border-b border-white/5 ws-surface-primary flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
          
          <!-- Mode Tabs (Bank Sheet vs Bank Canva) -->
          <div class="flex items-center gap-1.5 bay-recessed p-1 rounded-xl border border-white/10">
            <button 
              onclick="SpreadsheetHub.switchExplorerTab('sheets')" 
              class="px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 ${isSheets ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}"
            >
              <span>📊 Bank Sheet</span>
              <span class="px-1.5 py-0.2 rounded-full text-[9px] bg-black/40 text-emerald-200">${this.sheets.length}</span>
            </button>
            <button 
              onclick="SpreadsheetHub.switchExplorerTab('canva')" 
              class="px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 ${!isSheets ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}"
            >
              <span>🎨 Bank Canva</span>
              <span class="px-1.5 py-0.2 rounded-full text-[9px] bg-black/40 text-blue-200">${this.canvaLinks.length}</span>
            </button>
          </div>

          <!-- Sub-Divisi Filter Pills -->
          <div class="flex items-center gap-1.5 overflow-x-auto custom-scrollbar text-xs font-mono">
            ${[
              { id: 'all', label: '🌐 Semua', code: 'ALL' },
              { id: 'safari', label: '🏛️ SF', code: 'SF' },
              { id: 'startpoint', label: '🚀 SP', code: 'SP' },
              { id: 'odl', label: '🎓 ODL', code: 'ODL' },
              { id: 'technocraft', label: '⚡ TCP', code: 'TCP' }
            ].map(s => {
              const active = this.subEventFilter === s.id;
              return `
                <button 
                  onclick="SpreadsheetHub.setSubEventFilter('${s.id}')" 
                  class="px-2.5 py-1 rounded-lg transition font-bold whitespace-nowrap ${active ? 'bg-white/15 text-white border border-white/30 shadow-sm' : 'bay-recessed text-slate-400 hover:text-white border border-white/5'}"
                >
                  ${s.label}
                </button>
              `;
            }).join('')}
          </div>

          <!-- Add Trigger -->
          <div class="flex items-center gap-2">
            ${isSheets ? `
              <button onclick="SpreadsheetHub.openAddModal()" class="btn-tactical py-1.5 px-3 text-xs bg-emerald-600 hover:bg-emerald-500 font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20">
                <span>➕</span>
                <span class="hidden sm:inline">Tambah Sheet</span>
              </button>
            ` : `
              <button onclick="SpreadsheetHub.openAddCanvaModal()" class="btn-tactical py-1.5 px-3 text-xs bg-blue-600 hover:bg-blue-500 font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/20">
                <span>➕</span>
                <span class="hidden sm:inline">Tambah Canva</span>
              </button>
            `}
          </div>

        </div>

        <!-- Sub-Ribbon Row 2: Search, Sorting Dropdown, Layout Mode -->
        <div class="px-4 sm:px-6 py-2 border-b border-white/5 bg-black/10 flex flex-wrap items-center justify-between gap-3 text-xs font-mono flex-shrink-0">
          
          <div class="flex items-center gap-2.5 flex-1 max-w-md">
            <!-- Search Input -->
            <div class="relative w-full">
              <span class="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span>
              <input 
                type="text" 
                value="${this.searchQuery}" 
                oninput="SpreadsheetHub.onSearch(this.value)"
                placeholder="Tapis & cari ${isSheets ? 'spreadsheet...' : 'desain Canva...'}" 
                class="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs bay-recessed border border-white/10 focus:outline-none focus:border-blue-500 text-white placeholder:text-slate-500"
              />
            </div>
          </div>

          <div class="flex items-center gap-2 flex-wrap">
            <!-- Sort Dropdown ("lebih enak buat sortir") -->
            <div class="flex items-center gap-1.5 bay-recessed px-2.5 py-1 rounded-lg border border-white/10 text-slate-300">
              <span class="text-[10px] text-slate-400 font-bold">⇅ SORTIR:</span>
              <select 
                onchange="SpreadsheetHub.setSortBy(this.value)" 
                class="bg-transparent text-xs text-white focus:outline-none cursor-pointer font-bold"
              >
                <option value="sub_asc" ${this.sortBy === 'sub_asc' ? 'selected' : ''}>🏛️ Sub-Divisi</option>
                <option value="name_asc" ${this.sortBy === 'name_asc' ? 'selected' : ''}>🔤 Nama (A - Z)</option>
                <option value="name_desc" ${this.sortBy === 'name_desc' ? 'selected' : ''}>🔤 Nama (Z - A)</option>
                <option value="date_desc" ${this.sortBy === 'date_desc' ? 'selected' : ''}>📅 Terbaru</option>
                ${!isSheets ? `<option value="category" ${this.sortBy === 'category' ? 'selected' : ''}>🏷️ Kategori</option>` : ''}
              </select>
            </div>

            <!-- Layout Mode Switcher (Grid vs Table) -->
            <div class="flex items-center bay-recessed p-0.5 border border-white/10 rounded-lg">
              <button 
                onclick="SpreadsheetHub.setLayoutMode('grid')" 
                title="Tampilan Kotak / Kartu" 
                class="px-2.5 py-1 rounded text-xs transition ${this.layoutMode === 'grid' ? (isSheets ? 'bg-emerald-600 text-white font-bold' : 'bg-blue-600 text-white font-bold') : 'text-slate-400 hover:text-white'}"
              >
                ▦ Kotak
              </button>
              <button 
                onclick="SpreadsheetHub.setLayoutMode('table')" 
                title="Tampilan Tabel Data" 
                class="px-2.5 py-1 rounded text-xs transition ${this.layoutMode === 'table' ? (isSheets ? 'bg-emerald-600 text-white font-bold' : 'bg-blue-600 text-white font-bold') : 'text-slate-400 hover:text-white'}"
              >
                ☰ Tabel
              </button>
            </div>
          </div>

        </div>

        <!-- Canva Category Chips Ribbon (Only in Canva Tab) -->
        ${!isSheets ? `
          <div class="px-4 sm:px-6 py-1.5 border-b border-white/5 bg-[#080b14] flex items-center gap-1.5 overflow-x-auto custom-scrollbar text-[10px] font-mono flex-shrink-0">
            <span class="text-slate-400 font-bold mr-1">🏷️ KATEGORI:</span>
            ${this.canvaCategories.map(cat => {
              const active = this.canvaCategoryFilter === cat;
              const label = cat === 'all' ? 'Semua Kategori' : cat;
              return `
                <button 
                  onclick="SpreadsheetHub.setCanvaCategoryFilter('${cat}')" 
                  class="px-2.5 py-0.5 rounded-full border transition whitespace-nowrap ${active ? 'bg-blue-600 text-white font-bold border-blue-500' : 'bay-recessed text-slate-400 hover:text-white border-white/5'}"
                >
                  ${label}
                </button>
              `;
            }).join('')}
          </div>
        ` : ''}
      `;
    }

    // 3. Render Items Canvas (Grid or Table)
    const canvasEl = document.getElementById('hubExplorerCanvas');
    if (!canvasEl) return;

    if (items.length === 0) {
      canvasEl.innerHTML = `
        <div class="p-12 rounded-2xl bay-recessed border border-dashed border-white/10 text-center space-y-3">
          <div class="text-4xl">${isSheets ? '📊' : '🎨'}</div>
          <div class="text-base font-extrabold text-white font-display">Tidak Ada Data Ditemukan</div>
          <p class="text-xs font-mono text-slate-400 max-w-md mx-auto">
            Tidak ada item yang sesuai dengan kata kunci atau filter yang Anda pilih.
          </p>
          <button onclick="SpreadsheetHub.onSearch(''); SpreadsheetHub.setSubEventFilter('all'); SpreadsheetHub.setCanvaCategoryFilter('all');" class="btn-ghost py-1.5 px-4 text-xs text-blue-400 border-blue-500/30 hover:border-blue-400 font-bold mt-2">
            Reset Filter
          </button>
        </div>
      `;
      return;
    }

    if (this.layoutMode === 'table') {
      // TABLE VIEW (☰)
      canvasEl.innerHTML = this.renderTableView(items, isSheets);
    } else {
      // GRID CARDS VIEW (▦)
      canvasEl.innerHTML = this.renderGridView(items, isSheets);
    }
  },

  /**
   * Render Grid View (▦)
   */
  renderGridView(items, isSheets) {
    return `
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
        ${items.map(item => {
          const sub = this.subEventMap[item.subEventId] || { name: item.subEventName || item.subEventId, code: 'SUB', icon: isSheets ? '📊' : '🎨' };
          const cleanSheetId = item.sheetId || (item.id && !item.id.startsWith('sheet_') ? item.id : null);
          const externalUrl = item.externalUrl || item.url || (cleanSheetId ? `https://docs.google.com/spreadsheets/d/${cleanSheetId}/edit` : '#');

          return `
            <div class="chassis p-4 rounded-2xl border border-white/10 ${isSheets ? 'hover:border-emerald-500/40 hover:shadow-emerald-500/10' : 'hover:border-blue-500/40 hover:shadow-blue-500/10'} hover:shadow-xl transition-all duration-200 flex flex-col justify-between space-y-3.5 group bg-[#0c101c]/80">
              
              <div>
                <!-- Card Header -->
                <div class="flex items-center justify-between pb-2 border-b border-white/5 gap-2">
                  <div class="flex items-center gap-1.5 flex-wrap">
                    <span class="px-2 py-0.5 rounded-md text-[9px] font-mono font-extrabold ${isSheets ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-blue-500/15 text-blue-300 border border-blue-500/30'} flex items-center gap-1">
                      <span>${sub.icon}</span>
                      <span>${sub.code} • ${sub.name}</span>
                    </span>
                    ${!isSheets ? `
                      <span class="px-2 py-0.5 rounded-md text-[9px] font-mono font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                        ${item.category || 'Desain'}
                      </span>
                    ` : ''}
                  </div>

                  <div class="flex items-center gap-1">
                    <button 
                      onclick="${isSheets ? `SpreadsheetHub.openEditSheetModal('${item.id}')` : `SpreadsheetHub.openEditCanvaModal('${item.id}')`}" 
                      class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-300 hover:bg-amber-500 hover:text-black border border-amber-500/30 transition flex items-center gap-1"
                      title="Edit / Rename & Ganti Link"
                    >
                      <span>✏️</span>
                      <span>Edit</span>
                    </button>
                    <button 
                      onclick="${isSheets ? `SpreadsheetHub.deleteSheet('${item.id}')` : `SpreadsheetHub.deleteCanva('${item.id}')`}" 
                      class="text-slate-500 hover:text-rose-400 p-1 text-xs transition"
                      title="Hapus"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <!-- Card Body -->
                <div class="pt-2 space-y-1">
                  <h4 class="text-sm font-extrabold text-white font-display leading-snug ${isSheets ? 'group-hover:text-emerald-300' : 'group-hover:text-blue-300'} transition line-clamp-2">
                    ${item.name}
                  </h4>
                  <p class="text-[11px] font-mono text-slate-400 leading-relaxed line-clamp-2">
                    ${item.description || (isSheets ? 'Lembar kerja operasional resmi Central Event.' : 'Aset visual Canva resmi.')}
                  </p>
                </div>
              </div>

              <!-- Card Action Tray -->
              <div class="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                <div class="flex items-center gap-1.5">
                  <button onclick="SpreadsheetHub.copyLink('${externalUrl}')" class="btn-ghost py-1 px-2.5 text-[11px] font-mono text-slate-400 hover:text-white" title="Salin Tautan">
                    📋 Salin
                  </button>
                  <a href="${externalUrl}" target="_blank" class="btn-ghost py-1 px-2 text-[11px] font-mono text-slate-400 hover:text-white" title="Buka Tab Baru">
                    ↗
                  </a>
                </div>

                ${isSheets ? `
                  <button onclick="SpreadsheetHub.openInApp('${cleanSheetId || item.id}')" class="btn-tactical py-1.5 px-3.5 text-xs font-bold flex items-center gap-1.5 shadow-sm">
                    <span>📊 Buka In-App</span>
                    <span class="text-[10px]">↗</span>
                  </button>
                ` : `
                  <button onclick="SpreadsheetHub.openCanvaInApp('${item.url}')" class="btn-tactical py-1.5 px-3.5 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 shadow-sm">
                    <span>🎨 Buka Desain</span>
                    <span class="text-[10px]">↗</span>
                  </button>
                `}
              </div>

            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  /**
   * Render Table View (☰) - Format data tabular yang rapi
   */
  renderTableView(items, isSheets) {
    return `
      <div class="overflow-x-auto custom-scrollbar rounded-2xl border border-white/10 bg-[#0c101c]/90">
        <table class="w-full text-left text-xs font-mono">
          <thead class="bg-white/5 border-b border-white/10 text-slate-400 uppercase text-[10px] tracking-wider">
            <tr>
              <th class="py-3 px-4">Nama Item</th>
              <th class="py-3 px-3">Sub-Divisi</th>
              ${!isSheets ? '<th class="py-3 px-3">Kategori</th>' : '<th class="py-3 px-3">Tipe</th>'}
              <th class="py-3 px-3">Tanggal / Info</th>
              <th class="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5">
            ${items.map(item => {
              const sub = this.subEventMap[item.subEventId] || { name: item.subEventName || item.subEventId, code: 'SUB', icon: isSheets ? '📊' : '🎨' };
              const cleanSheetId = item.sheetId || (item.id && !item.id.startsWith('sheet_') ? item.id : null);
              const externalUrl = item.externalUrl || item.url || (cleanSheetId ? `https://docs.google.com/spreadsheets/d/${cleanSheetId}/edit` : '#');

              return `
                <tr class="hover:bg-white/5 transition group">
                  
                  <!-- Nama -->
                  <td class="py-3 px-4 font-bold text-white group-hover:text-blue-300">
                    <div class="flex items-center gap-2">
                      <span>${item.icon || (isSheets ? '📊' : '🎨')}</span>
                      <span class="max-w-xs sm:max-w-md truncate">${item.name}</span>
                    </div>
                  </td>

                  <!-- Sub-Divisi -->
                  <td class="py-3 px-3 whitespace-nowrap">
                    <span class="px-2 py-0.5 rounded text-[10px] bg-white/5 border border-white/10 text-slate-300">
                      ${sub.icon} ${sub.code}
                    </span>
                  </td>

                  <!-- Kategori / Tipe -->
                  <td class="py-3 px-3 whitespace-nowrap text-slate-400">
                    ${!isSheets ? (item.category || 'Desain') : 'Google Sheets'}
                  </td>

                  <!-- Tanggal / Status -->
                  <td class="py-3 px-3 whitespace-nowrap text-slate-500 text-[11px]">
                    ${item.date || 'Aktif'}
                  </td>

                  <!-- Aksi -->
                  <td class="py-3 px-4 text-right whitespace-nowrap">
                    <div class="flex items-center justify-end gap-1.5">
                      <button 
                        onclick="${isSheets ? `SpreadsheetHub.openEditSheetModal('${item.id}')` : `SpreadsheetHub.openEditCanvaModal('${item.id}')`}" 
                        class="px-2 py-1 rounded text-[10px] bg-amber-500/10 text-amber-300 hover:bg-amber-500 hover:text-black transition font-bold"
                        title="Edit / Rename"
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        onclick="SpreadsheetHub.copyLink('${externalUrl}')" 
                        class="px-2 py-1 rounded text-[10px] bg-white/5 text-slate-400 hover:text-white transition"
                        title="Salin Link"
                      >
                        📋 Salin
                      </button>
                      ${isSheets ? `
                        <button 
                          onclick="SpreadsheetHub.openInApp('${cleanSheetId || item.id}')" 
                          class="px-2.5 py-1 rounded text-[10px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition shadow-sm"
                        >
                          Buka In-App ↗
                        </button>
                      ` : `
                        <button 
                          onclick="SpreadsheetHub.openCanvaInApp('${item.url}')" 
                          class="px-2.5 py-1 rounded text-[10px] bg-blue-600 hover:bg-blue-500 text-white font-bold transition shadow-sm"
                        >
                          Buka Canva ↗
                        </button>
                      `}
                      <button 
                        onclick="${isSheets ? `SpreadsheetHub.deleteSheet('${item.id}')` : `SpreadsheetHub.deleteCanva('${item.id}')`}" 
                        class="text-slate-500 hover:text-rose-400 p-1 text-xs transition"
                        title="Hapus"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>

                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
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
    if (!confirm('Hapus lembar kerja ini dari repositori?')) return;
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

  /**
   * ================================================================
   * MODAL INJECTION SYSTEM
   * ================================================================
   */
  injectAllModals() {
    this.injectExplorerModal();
    this.injectAddSpreadsheetModal();
    this.injectAddCanvaModal();
    this.injectEditSpreadsheetModal();
    this.injectEditCanvaModal();
  },

  injectExplorerModal() {
    if (document.getElementById('hubExplorerModal')) return;

    const modalHtml = `
      <div id="hubExplorerModal" class="fixed inset-0 z-[140] bg-[#05070c]/90 backdrop-blur-2xl flex items-center justify-center p-2 sm:p-4 transition-all duration-300 opacity-0 pointer-events-none">
        
        <div id="hubExplorerCard" class="chassis w-full max-w-6xl h-[92vh] flex flex-col transition-all duration-300 transform scale-[0.98] overflow-hidden rounded-2xl shadow-2xl relative border border-white/10">
          <div class="chassis-core flex flex-col h-full !p-0 overflow-hidden ws-surface-primary bg-[#080b14]">
            
            <!-- 1. MODAL COMMAND BAR (Menyerupai Workspace Drive Ribbon) -->
            <div class="px-4 sm:px-6 py-3 border-b border-white/10 flex items-center justify-between gap-3 ws-surface-primary flex-shrink-0 z-20 bg-[#090d18]">
              
              <!-- Left: Title, Icon & Status -->
              <div class="flex items-center gap-3 min-w-0">
                <div id="hubExplorerIconBadge" class="w-9 h-9 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 font-mono font-bold flex items-center justify-center text-base flex-shrink-0">
                  📊
                </div>
                <div class="min-w-0">
                  <div class="flex items-center gap-2">
                    <span id="hubExplorerStatusBadge" class="eyebrow-pill emerald text-[9px] font-mono">SPREADSHEET IN-APP EXPLORER</span>
                    <span id="hubExplorerCounter" class="eyebrow-pill cobalt text-[9px] font-mono hidden sm:inline">0 Items</span>
                  </div>
                  <h3 id="hubExplorerTitle" class="text-sm sm:text-base font-extrabold text-white ws-text-title font-display truncate leading-snug mt-0.5">
                    Bank Spreadsheet Operasional Central Event 2027
                  </h3>
                </div>
              </div>

              <!-- Right: Close Button -->
              <div class="flex items-center gap-2 flex-shrink-0">
                <button onclick="SpreadsheetHub.closeExplorer()" class="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition text-sm font-bold border border-white/10">
                  ✕ Tutup
                </button>
              </div>

            </div>

            <!-- 2. TOOLBAR SUB-RIBBON (Search, Sort, Layout Switcher) -->
            <div id="hubExplorerToolbar" class="flex-shrink-0">
              <!-- Injected by renderExplorerContent() -->
            </div>

            <!-- 3. SCROLLABLE ITEM CANVAS -->
            <div id="hubExplorerCanvas" class="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 bg-[#060810]/60">
              <!-- Injected by renderExplorerContent() -->
            </div>

            <!-- 4. BOTTOM TELEMETRY FOOTER -->
            <div class="px-4 sm:px-6 py-2.5 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400 flex-shrink-0 bg-[#090d18]">
              <span class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Pusat Kendali Lembar Kerja & Aset Visual Central Event 2027
              </span>
              <span class="text-blue-400 font-bold hidden sm:inline">
                Supabase Cloud PostgreSQL Synchronized
              </span>
            </div>

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
