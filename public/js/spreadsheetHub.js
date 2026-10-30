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

  async switchTab(tab) {
    this.activeTab = tab;
    this.renderOnPageWidget();
    if (this.isExplorerOpen()) {
      this.renderExplorerContent();
    }
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
   * Menggantikan kotak kecil yang sesak & tombol berulang-ulang
   * dengan daftar operasional riil + SATU tombol launcher explorer
   * ================================================================
   */
  renderOnPageWidget() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    const subInfo = this.subEventMap[this.currentSubEventId] || { name: this.currentSubEventId, code: 'SUB', icon: '📊' };
    const sheetCount = (this.sheets || []).length;
    const canvaCount = (this.canvaLinks || []).length;

    // Filter items according to the active tab
    const isSheets = this.activeTab === 'sheets';
    const items = isSheets ? this.sheets : this.canvaLinks;

    container.innerHTML = `
      <div class="chassis-core flex flex-col justify-between h-full space-y-3">
        
        <!-- Header (Clean, Non-repetitive: Hanya 1 tombol explorer) -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 dark:border-white/5 gap-2.5 flex-shrink-0">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="eyebrow-pill emerald text-[9px] font-mono font-bold">● CLOUD SYNC</span>
              <span class="eyebrow-pill cobalt text-[9px] font-mono font-bold">${subInfo.code} REPOSITORI</span>
            </div>
            <h3 class="text-sm font-extrabold text-slate-900 dark:text-white font-display flex items-center gap-2">
              <span>📁</span> Bank Lembar Kerja & Desain Visual
            </h3>
            <p class="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              Pusat lembar kerja operasional & materi grafis resmi ${subInfo.name}
            </p>
          </div>

          <!-- SATU Tombol Utama (Buka Explorer) -->
          <button 
            onclick="SpreadsheetHub.openExplorer('${this.activeTab}', '${this.currentSubEventId}')" 
            class="btn-tactical py-1.5 px-3.5 text-xs font-bold flex items-center gap-1.5 shadow-sm self-start sm:self-auto"
            title="Buka Repositori Lengkap di Layar Luas"
          >
            <span>⛶ Buka Bank Explorer</span>
            <div class="btn-icon-bay">↗</div>
          </button>
        </div>

        <!-- Mode Tabs Switcher (Segmented Control) -->
        <div class="flex items-center gap-1 p-1 bay-recessed rounded-xl border border-slate-200 dark:border-white/5 flex-shrink-0">
          <button 
            onclick="SpreadsheetHub.switchTab('sheets')" 
            class="flex-1 py-1.5 px-3 rounded-lg text-xs font-mono font-bold transition flex items-center justify-center gap-2 ${isSheets ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}"
          >
            <span>📊 Bank Sheet</span>
            <span class="px-1.5 py-0.2 rounded-full text-[9px] ${isSheets ? 'bg-black/30 text-emerald-200' : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400'}">${sheetCount}</span>
          </button>

          <button 
            onclick="SpreadsheetHub.switchTab('canva')" 
            class="flex-1 py-1.5 px-3 rounded-lg text-xs font-mono font-bold transition flex items-center justify-center gap-2 ${!isSheets ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}"
          >
            <span>🎨 Bank Canva</span>
            <span class="px-1.5 py-0.2 rounded-full text-[9px] ${!isSheets ? 'bg-black/30 text-blue-200' : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400'}">${canvaCount}</span>
          </button>
        </div>

        <!-- Body: Real Operational Item List (No empty fake cards!) -->
        <div class="space-y-2 overflow-y-auto custom-scrollbar flex-1 max-h-[280px] pr-1">
          ${items.length === 0 ? `
            <div class="p-6 rounded-xl bay-recessed border border-dashed border-slate-300 dark:border-white/10 text-center space-y-2">
              <div class="text-2xl">${isSheets ? '📊' : '🎨'}</div>
              <div class="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">Belum Ada ${isSheets ? 'Spreadsheet' : 'Desain'}</div>
              <button 
                onclick="${isSheets ? 'SpreadsheetHub.openAddModal()' : 'SpreadsheetHub.openAddCanvaModal()'}" 
                class="btn-ghost py-1 px-3 text-xs text-blue-600 dark:text-blue-400 border-blue-500/30 hover:border-blue-400 font-bold mt-1"
              >
                + Tambah Baru
              </button>
            </div>
          ` : items.map(item => {
            const cleanSheetId = item.sheetId || (item.id && !item.id.startsWith('sheet_') ? item.id : null);
            const externalUrl = item.externalUrl || item.url || (cleanSheetId ? `https://docs.google.com/spreadsheets/d/${cleanSheetId}/edit` : '#');

            return `
              <div class="bay-recessed p-2.5 sm:p-3 rounded-xl border border-slate-200 dark:border-white/10 hover:border-blue-500/30 transition flex items-center justify-between gap-2.5 group">
                
                <!-- Left: Icon & Meta -->
                <div class="flex items-center gap-2.5 min-w-0 flex-1">
                  <div class="w-8 h-8 rounded-lg ${isSheets ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400' : 'bg-blue-500/15 border border-blue-500/30 text-blue-600 dark:text-blue-400'} flex items-center justify-center text-sm flex-shrink-0">
                    ${item.icon || (isSheets ? '📊' : '🎨')}
                  </div>
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-1.5 mb-0.5 flex-wrap">
                      <span class="text-xs font-extrabold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition leading-snug">
                        ${item.name}
                      </span>
                      ${!isSheets && item.category ? `
                        <span class="px-1.5 py-0.2 rounded text-[8px] font-mono font-bold bg-blue-500/10 text-blue-600 dark:text-blue-300 border border-blue-500/20">
                          ${item.category}
                        </span>
                      ` : `
                        <span class="px-1.5 py-0.2 rounded text-[8px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20">
                          ONLINE
                        </span>
                      `}
                    </div>
                    <div class="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate">
                      ${isSheets ? (item.date || 'Tersambung Cloud') : (item.description || 'Aset desain resmi tim.')}
                    </div>
                  </div>
                </div>

                <!-- Right Actions: Edit, Salin, Buka -->
                <div class="flex items-center gap-1 flex-shrink-0">
                  <button 
                    onclick="${isSheets ? `SpreadsheetHub.openEditSheetModal('${item.id}')` : `SpreadsheetHub.openEditCanvaModal('${item.id}')`}" 
                    class="btn-ghost py-1 px-2 text-[10px] text-amber-600 dark:text-amber-400 hover:text-amber-500 border border-amber-500/20"
                    title="Edit Nama / Ganti Tautan"
                  >
                    ✏️
                  </button>
                  <button 
                    onclick="SpreadsheetHub.copyLink('${externalUrl}')" 
                    class="btn-ghost py-1 px-2 text-[10px] text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white border border-slate-200 dark:border-white/10"
                    title="Salin Tautan"
                  >
                    📋
                  </button>
                  ${isSheets ? `
                    <button 
                      onclick="SpreadsheetHub.openInApp('${cleanSheetId || item.id}')" 
                      class="btn-tactical py-1 px-2.5 text-xs font-bold flex items-center gap-1 shadow-sm"
                    >
                      <span>Buka</span>
                      <span class="text-[9px]">↗</span>
                    </button>
                  ` : `
                    <button 
                      onclick="SpreadsheetHub.openCanvaInApp('${item.url}')" 
                      class="btn-tactical py-1 px-2.5 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1 shadow-sm"
                    >
                      <span>Buka</span>
                      <span class="text-[9px]">↗</span>
                    </button>
                  `}
                </div>

              </div>
            `;
          }).join('')}
        </div>

        <!-- Footer Strip (No redundant buttons!) -->
        <div class="pt-2 border-t border-slate-200 dark:border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400 flex-shrink-0">
          <span class="flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Supabase Cloud PostgreSQL Synchronized
          </span>
          <span class="text-slate-400 dark:text-slate-500 font-medium">
            ${items.length} ${isSheets ? 'Lembar Kerja Aktif' : 'Aset Desain Aktif'}
          </span>
        </div>

      </div>
    `;
  },

  /**
   * ================================================================
   * POP-UP UI/UX EXPLORER (Menggunakan Standard WorkspaceModal Theme)
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

    // 1. Top Ribbon Meta
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
        ? 'w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-mono font-bold flex items-center justify-center text-base flex-shrink-0'
        : 'w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-600 dark:text-blue-400 font-mono font-bold flex items-center justify-center text-base flex-shrink-0';
    }
    if (counterEl) {
      counterEl.innerText = `${items.length} ${isSheets ? 'Lembar Kerja' : 'Aset Desain'}`;
    }

    // 2. Toolbar Rendering (Menyesuaikan ws-surface classes agar serasi Light/Dark)
    const toolbarEl = document.getElementById('hubExplorerToolbar');
    if (toolbarEl) {
      toolbarEl.innerHTML = `
        <!-- Row 1: Mode Segmented Switcher & Sub-Divisi Filters -->
        <div class="px-4 sm:px-6 py-2.5 border-b border-slate-200 dark:border-white/10 ws-surface-primary flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
          
          <!-- Segmented Tab Switch -->
          <div class="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
            <button 
              onclick="SpreadsheetHub.switchExplorerTab('sheets')" 
              class="px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 ${isSheets ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}"
            >
              <span>📊 Bank Sheet</span>
              <span class="px-1.5 py-0.2 rounded-full text-[9px] ${isSheets ? 'bg-black/30 text-emerald-200' : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400'}">${this.sheets.length}</span>
            </button>
            <button 
              onclick="SpreadsheetHub.switchExplorerTab('canva')" 
              class="px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 ${!isSheets ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}"
            >
              <span>🎨 Bank Canva</span>
              <span class="px-1.5 py-0.2 rounded-full text-[9px] ${!isSheets ? 'bg-black/30 text-blue-200' : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400'}">${this.canvaLinks.length}</span>
            </button>
          </div>

          <!-- Sub-Divisi Filter Pills -->
          <div class="flex items-center gap-1.5 overflow-x-auto custom-scrollbar text-xs font-mono py-1">
            ${[
              { id: 'all', label: '🌐 Semua Sub', code: 'ALL' },
              { id: 'safari', label: '🏛️ SF', code: 'SF' },
              { id: 'startpoint', label: '🚀 SP', code: 'SP' },
              { id: 'odl', label: '🎓 ODL', code: 'ODL' },
              { id: 'technocraft', label: '⚡ TCP', code: 'TCP' }
            ].map(s => {
              const active = this.subEventFilter === s.id;
              return `
                <button 
                  onclick="SpreadsheetHub.setSubEventFilter('${s.id}')" 
                  class="px-2.5 py-1 rounded-lg transition font-bold whitespace-nowrap text-xs ${active ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10'}"
                >
                  ${s.label}
                </button>
              `;
            }).join('')}
          </div>

          <!-- Add Trigger -->
          <div>
            ${isSheets ? `
              <button onclick="SpreadsheetHub.openAddModal()" class="btn-tactical py-1.5 px-3 text-xs bg-emerald-600 hover:bg-emerald-500 font-bold flex items-center gap-1.5 shadow-sm">
                <span>➕</span>
                <span>Tambah Sheet Baru</span>
              </button>
            ` : `
              <button onclick="SpreadsheetHub.openAddCanvaModal()" class="btn-tactical py-1.5 px-3 text-xs bg-blue-600 hover:bg-blue-500 font-bold flex items-center gap-1.5 shadow-sm">
                <span>➕</span>
                <span>Tambah Desain Baru</span>
              </button>
            `}
          </div>

        </div>

        <!-- Row 2: Search Input, Sortir Dropdown, Layout Mode Toggle -->
        <div class="px-4 sm:px-6 py-2.5 border-b border-slate-200 dark:border-white/10 ws-surface-secondary flex flex-wrap items-center justify-between gap-3 text-xs font-mono flex-shrink-0">
          
          <!-- Search Input -->
          <div class="relative flex-1 max-w-md">
            <span class="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span>
            <input 
              type="text" 
              value="${this.searchQuery}" 
              oninput="SpreadsheetHub.onSearch(this.value)"
              placeholder="Tapis berkas & desain..." 
              class="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs bg-white dark:bg-[#0c101c] border border-slate-300 dark:border-white/10 focus:outline-none focus:border-blue-500 text-slate-800 dark:text-white placeholder:text-slate-400"
            />
          </div>

          <div class="flex items-center gap-2 flex-wrap">
            <!-- Sort Dropdown ("lebih enak buat sortir") -->
            <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-[#0c101c] border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-300">
              <span class="text-[10px] text-slate-400 font-bold uppercase">⇅ SORTIR:</span>
              <select 
                onchange="SpreadsheetHub.setSortBy(this.value)" 
                class="bg-transparent text-xs text-slate-800 dark:text-white focus:outline-none cursor-pointer font-bold"
              >
                <option value="sub_asc" ${this.sortBy === 'sub_asc' ? 'selected' : ''}>🏛️ Sub-Divisi</option>
                <option value="name_asc" ${this.sortBy === 'name_asc' ? 'selected' : ''}>🔤 Nama (A - Z)</option>
                <option value="name_desc" ${this.sortBy === 'name_desc' ? 'selected' : ''}>🔤 Nama (Z - A)</option>
                <option value="date_desc" ${this.sortBy === 'date_desc' ? 'selected' : ''}>📅 Terbaru</option>
                ${!isSheets ? `<option value="category" ${this.sortBy === 'category' ? 'selected' : ''}>🏷️ Kategori</option>` : ''}
              </select>
            </div>

            <!-- Layout Mode Toggle (Grid vs Table) -->
            <div class="flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
              <button 
                onclick="SpreadsheetHub.setLayoutMode('grid')" 
                title="Tampilan Kotak" 
                class="px-2.5 py-1 rounded text-xs transition ${this.layoutMode === 'grid' ? 'bg-blue-600 text-white font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}"
              >
                ▦ Kotak
              </button>
              <button 
                onclick="SpreadsheetHub.setLayoutMode('table')" 
                title="Tampilan Tabel" 
                class="px-2.5 py-1 rounded text-xs transition ${this.layoutMode === 'table' ? 'bg-blue-600 text-white font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}"
              >
                ☰ Tabel
              </button>
            </div>
          </div>

        </div>

        <!-- Canva Category Chips (Only in Canva Tab) -->
        ${!isSheets ? `
          <div class="px-4 sm:px-6 py-2 border-b border-slate-200 dark:border-white/10 ws-surface-primary flex items-center gap-1.5 overflow-x-auto custom-scrollbar text-[10px] font-mono flex-shrink-0">
            <span class="text-slate-500 font-bold mr-1">🏷️ KATEGORI:</span>
            ${this.canvaCategories.map(cat => {
              const active = this.canvaCategoryFilter === cat;
              const label = cat === 'all' ? 'Semua Kategori' : cat;
              return `
                <button 
                  onclick="SpreadsheetHub.setCanvaCategoryFilter('${cat}')" 
                  class="px-2.5 py-0.5 rounded-full border transition whitespace-nowrap ${active ? 'bg-blue-600 text-white font-bold border-blue-500 shadow-sm' : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border-slate-200 dark:border-white/10'}"
                >
                  ${label}
                </button>
              `;
            }).join('')}
          </div>
        ` : ''}
      `;
    }

    // 3. Canvas Content (Using ws-surface-secondary for crisp light/dark support)
    const canvasEl = document.getElementById('hubExplorerCanvas');
    if (!canvasEl) return;

    if (items.length === 0) {
      canvasEl.innerHTML = `
        <div class="p-12 rounded-2xl ws-surface-card border border-dashed border-slate-300 dark:border-white/10 text-center space-y-3">
          <div class="text-4xl">${isSheets ? '📊' : '🎨'}</div>
          <div class="text-base font-extrabold ws-text-title font-display">Tidak Ada Berkas Ditemukan</div>
          <p class="text-xs font-mono ws-text-muted max-w-md mx-auto">
            Tidak ada item yang sesuai dengan kata kunci pencarian atau filter sub-divisi yang dipilih.
          </p>
          <button onclick="SpreadsheetHub.onSearch(''); SpreadsheetHub.setSubEventFilter('all'); SpreadsheetHub.setCanvaCategoryFilter('all');" class="btn-ghost py-1.5 px-4 text-xs text-blue-600 dark:text-blue-400 border border-blue-500/30 hover:border-blue-400 font-bold mt-2">
            Reset Filter
          </button>
        </div>
      `;
      return;
    }

    if (this.layoutMode === 'table') {
      canvasEl.innerHTML = this.renderTableView(items, isSheets);
    } else {
      canvasEl.innerHTML = this.renderGridView(items, isSheets);
    }
  },

  /**
   * Render Grid View (▦) - Menggunakan ws-surface-card & ws-text-title
   */
  renderGridView(items, isSheets) {
    return `
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
        ${items.map(item => {
          const sub = this.subEventMap[item.subEventId] || { name: item.subEventName || item.subEventId, code: 'SUB', icon: isSheets ? '📊' : '🎨' };
          const cleanSheetId = item.sheetId || (item.id && !item.id.startsWith('sheet_') ? item.id : null);
          const externalUrl = item.externalUrl || item.url || (cleanSheetId ? `https://docs.google.com/spreadsheets/d/${cleanSheetId}/edit` : '#');

          return `
            <div class="ws-surface-card p-4 rounded-2xl border border-slate-200 dark:border-white/10 transition-all duration-200 flex flex-col justify-between space-y-3.5 group shadow-sm hover:shadow-md">
              
              <div>
                <!-- Card Header -->
                <div class="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/10 gap-2">
                  <div class="flex items-center gap-1.5 flex-wrap">
                    <span class="px-2 py-0.5 rounded-md text-[9px] font-mono font-extrabold ${isSheets ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30' : 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30'} flex items-center gap-1">
                      <span>${sub.icon}</span>
                      <span>${sub.code} • ${sub.name}</span>
                    </span>
                    ${!isSheets ? `
                      <span class="px-2 py-0.5 rounded-md text-[9px] font-mono font-bold bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                        ${item.category || 'Desain'}
                      </span>
                    ` : ''}
                  </div>

                  <div class="flex items-center gap-1">
                    <button 
                      onclick="${isSheets ? `SpreadsheetHub.openEditSheetModal('${item.id}')` : `SpreadsheetHub.openEditCanvaModal('${item.id}')`}" 
                      class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 hover:bg-amber-500 hover:text-black border border-amber-500/30 transition flex items-center gap-1"
                      title="Edit / Rename & Ganti Link"
                    >
                      <span>✏️</span>
                      <span>Edit</span>
                    </button>
                    <button 
                      onclick="${isSheets ? `SpreadsheetHub.deleteSheet('${item.id}')` : `SpreadsheetHub.deleteCanva('${item.id}')`}" 
                      class="text-slate-400 hover:text-rose-600 p-1 text-xs transition"
                      title="Hapus"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <!-- Card Body -->
                <div class="pt-2 space-y-1">
                  <h4 class="text-sm font-extrabold ws-text-title font-display leading-snug ${isSheets ? 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400' : 'group-hover:text-blue-600 dark:group-hover:text-blue-400'} transition line-clamp-2">
                    ${item.name}
                  </h4>
                  <p class="text-[11px] font-mono ws-text-muted leading-relaxed line-clamp-2">
                    ${item.description || (isSheets ? 'Lembar kerja operasional resmi Central Event.' : 'Aset visual Canva resmi.')}
                  </p>
                </div>
              </div>

              <!-- Card Action Tray -->
              <div class="pt-2 border-t border-slate-200 dark:border-white/10 flex items-center justify-between gap-2">
                <div class="flex items-center gap-1.5">
                  <button onclick="SpreadsheetHub.copyLink('${externalUrl}')" class="btn-ghost py-1 px-2.5 text-[11px] font-mono text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10" title="Salin Tautan">
                    📋 Salin
                  </button>
                  <a href="${externalUrl}" target="_blank" class="btn-ghost py-1 px-2 text-[11px] font-mono text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10" title="Buka Tab Baru">
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
   * Render Table View (☰)
   */
  renderTableView(items, isSheets) {
    return `
      <div class="overflow-x-auto custom-scrollbar rounded-2xl border border-slate-200 dark:border-white/10 ws-surface-card">
        <table class="w-full text-left text-xs font-mono">
          <thead class="bg-slate-100 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider">
            <tr>
              <th class="py-3 px-4">Nama Item</th>
              <th class="py-3 px-3">Sub-Divisi</th>
              ${!isSheets ? '<th class="py-3 px-3">Kategori</th>' : '<th class="py-3 px-3">Tipe</th>'}
              <th class="py-3 px-3">Tanggal / Info</th>
              <th class="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-white/5">
            ${items.map(item => {
              const sub = this.subEventMap[item.subEventId] || { name: item.subEventName || item.subEventId, code: 'SUB', icon: isSheets ? '📊' : '🎨' };
              const cleanSheetId = item.sheetId || (item.id && !item.id.startsWith('sheet_') ? item.id : null);
              const externalUrl = item.externalUrl || item.url || (cleanSheetId ? `https://docs.google.com/spreadsheets/d/${cleanSheetId}/edit` : '#');

              return `
                <tr class="hover:bg-slate-50 dark:hover:bg-white/5 transition">
                  <!-- Nama -->
                  <td class="py-3 px-4 font-bold ws-text-title">
                    <div class="flex items-center gap-2">
                      <span>${isSheets ? '📊' : '🎨'}</span>
                      <span class="truncate max-w-xs sm:max-w-md">${item.name}</span>
                    </div>
                  </td>

                  <!-- Sub-Divisi -->
                  <td class="py-3 px-3 whitespace-nowrap">
                    <span class="px-2 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300">
                      ${sub.icon} ${sub.code}
                    </span>
                  </td>

                  <!-- Kategori / Tipe -->
                  <td class="py-3 px-3 whitespace-nowrap ws-text-muted">
                    ${!isSheets ? (item.category || 'Desain') : 'Google Sheets'}
                  </td>

                  <!-- Tanggal / Info -->
                  <td class="py-3 px-3 whitespace-nowrap text-slate-400 dark:text-slate-500 text-[11px]">
                    ${item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID') : (item.date || 'Aktif')}
                  </td>

                  <!-- Aksi -->
                  <td class="py-3 px-4 text-right whitespace-nowrap">
                    <div class="flex items-center justify-end gap-1.5">
                      <button 
                        onclick="${isSheets ? `SpreadsheetHub.openEditSheetModal('${item.id}')` : `SpreadsheetHub.openEditCanvaModal('${item.id}')`}" 
                        class="px-2 py-1 rounded text-[10px] bg-amber-500/15 text-amber-700 dark:text-amber-300 hover:bg-amber-500 hover:text-black transition font-bold"
                        title="Edit / Rename"
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        onclick="SpreadsheetHub.copyLink('${externalUrl}')" 
                        class="px-2 py-1 rounded text-[10px] bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition border border-slate-200 dark:border-white/10"
                        title="Salin Link"
                      >
                        📋 Salin
                      </button>
                      ${isSheets ? `
                        <button 
                          onclick="SpreadsheetHub.openInApp('${cleanSheetId || item.id}')" 
                          class="px-2.5 py-1 rounded text-[10px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition"
                        >
                          Buka In-App ↗
                        </button>
                      ` : `
                        <button 
                          onclick="SpreadsheetHub.openCanvaInApp('${item.url}')" 
                          class="px-2.5 py-1 rounded text-[10px] bg-blue-600 hover:bg-blue-500 text-white font-bold transition"
                        >
                          Buka Canva ↗
                        </button>
                      `}
                      <button 
                        onclick="${isSheets ? `SpreadsheetHub.deleteSheet('${item.id}')` : `SpreadsheetHub.deleteCanva('${item.id}')`}" 
                        class="text-slate-400 hover:text-rose-600 p-1 text-xs transition"
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
   * MODAL INJECTION SYSTEM (All using ws-surface & ws-text theme tokens)
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
      <div id="hubExplorerModal" class="fixed inset-0 z-[140] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 transition-all duration-300 opacity-0 pointer-events-none">
        
        <div id="hubExplorerCard" class="chassis w-full max-w-6xl h-[92vh] flex flex-col transition-all duration-300 transform scale-[0.98] overflow-hidden rounded-2xl shadow-2xl relative ws-surface-primary border border-slate-300 dark:border-white/10">
          <div class="chassis-core flex flex-col h-full !p-0 overflow-hidden ws-surface-primary">
            
            <!-- 1. MODAL COMMAND BAR -->
            <div class="px-4 sm:px-6 py-3 border-b border-slate-200 dark:border-white/10 flex items-center justify-between gap-3 ws-surface-primary flex-shrink-0 z-20">
              
              <!-- Left: Title, Icon & Status -->
              <div class="flex items-center gap-3 min-w-0">
                <div id="hubExplorerIconBadge" class="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-mono font-bold flex items-center justify-center text-base flex-shrink-0">
                  📊
                </div>
                <div class="min-w-0">
                  <div class="flex items-center gap-2">
                    <span id="hubExplorerStatusBadge" class="eyebrow-pill emerald text-[9px] font-mono">SPREADSHEET IN-APP EXPLORER</span>
                    <span id="hubExplorerCounter" class="eyebrow-pill cobalt text-[9px] font-mono hidden sm:inline">0 Items</span>
                  </div>
                  <h3 id="hubExplorerTitle" class="text-sm sm:text-base font-extrabold ws-text-title font-display truncate leading-snug mt-0.5">
                    Bank Spreadsheet Operasional Central Event 2027
                  </h3>
                </div>
              </div>

              <!-- Right: Close Button -->
              <div class="flex items-center gap-2 flex-shrink-0">
                <button onclick="SpreadsheetHub.closeExplorer()" class="btn-ghost py-1.5 px-3 text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white border border-slate-300 dark:border-white/10 font-mono font-bold flex items-center gap-1.5 rounded-xl">
                  ✕ Tutup
                </button>
              </div>

            </div>

            <!-- 2. TOOLBAR SUB-RIBBON (Search, Sort, Layout Switcher) -->
            <div id="hubExplorerToolbar" class="flex-shrink-0">
              <!-- Injected by renderExplorerContent() -->
            </div>

            <!-- 3. SCROLLABLE ITEM CANVAS -->
            <div id="hubExplorerCanvas" class="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 ws-surface-secondary">
              <!-- Injected by renderExplorerContent() -->
            </div>

            <!-- 4. BOTTOM TELEMETRY FOOTER -->
            <div class="px-4 sm:px-6 py-2.5 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400 flex-shrink-0 ws-surface-primary">
              <span class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Pusat Kendali Lembar Kerja & Aset Visual Central Event 2027
              </span>
              <span class="text-blue-600 dark:text-blue-400 font-bold hidden sm:inline">
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
      <div id="addSpreadsheetHubModal" class="fixed inset-0 z-[160] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 transition-all duration-300 opacity-0 pointer-events-none">
        <div class="chassis max-w-lg w-full rounded-2xl shadow-2xl relative transform transition-all duration-300 scale-95 border border-emerald-500/40 ws-surface-primary" id="addSpreadsheetHubCard">
          <div class="chassis-core p-5 sm:p-7 space-y-4 ws-surface-primary">
            
            <div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
              <div class="flex items-center gap-2.5">
                <div class="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-mono font-bold flex items-center justify-center text-lg">
                  📊
                </div>
                <div>
                  <span class="eyebrow-pill emerald text-[9px] font-mono">SPREADSHEET REPOSITORY</span>
                  <h3 class="text-base font-extrabold ws-text-title font-display">Tautkan Spreadsheet Baru</h3>
                </div>
              </div>
              <button onclick="SpreadsheetHub.closeAddModal()" class="text-slate-400 hover:text-slate-800 dark:hover:text-white p-1.5 text-sm">
                ✕
              </button>
            </div>

            <div class="space-y-3.5">
              <div>
                <label class="block text-[11px] font-mono text-slate-700 dark:text-slate-300 mb-1 font-bold">Judul Lembar Kerja</label>
                <input 
                  type="text" 
                  id="inputNewSheetName" 
                  placeholder="Misal: Checklist Perlengkapan & Logistik..." 
                  class="w-full px-3.5 py-2.5 rounded-xl text-xs border border-slate-300 dark:border-white/10 focus:outline-none focus:border-emerald-500 font-mono bg-white dark:bg-[#0c101c] text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label class="block text-[11px] font-mono text-slate-700 dark:text-slate-300 mb-1 font-bold">Tautan Google Sheet / Sheet ID <span class="text-emerald-500">*</span></label>
                <input 
                  type="text" 
                  id="inputNewSheetUrl" 
                  placeholder="https://docs.google.com/spreadsheets/d/.../edit" 
                  class="w-full px-3.5 py-2.5 rounded-xl text-xs border border-slate-300 dark:border-white/10 focus:outline-none focus:border-emerald-500 font-mono bg-white dark:bg-[#0c101c] text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label class="block text-[11px] font-mono text-slate-700 dark:text-slate-300 mb-1 font-bold">Alokasi Sub-Divisi</label>
                <select id="selectNewSheetSubEvent" class="w-full px-3.5 py-2.5 rounded-xl text-xs border border-slate-300 dark:border-white/10 focus:outline-none focus:border-emerald-500 font-mono bg-white dark:bg-[#0c101c] text-slate-800 dark:text-white">
                  <option value="safari">🏛️ Safari Faculty (SF-01)</option>
                  <option value="startpoint">🚀 Start Point (SP-02)</option>
                  <option value="odl">🎓 One Day Lecture (ODL-03)</option>
                  <option value="technocraft">⚡ Technocraft (TC-04)</option>
                  <option value="all">🌐 Semua Sub-Divisi (Umum)</option>
                </select>
              </div>
            </div>

            <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-white/10">
              <button onclick="SpreadsheetHub.closeAddModal()" class="btn-ghost py-2 px-4 text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                Batal
              </button>
              <button onclick="SpreadsheetHub.submitAddSpreadsheet()" id="btnSubmitNewSheet" class="btn-tactical py-2 px-4 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md">
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
      <div id="addCanvaHubModal" class="fixed inset-0 z-[160] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 transition-all duration-300 opacity-0 pointer-events-none">
        <div class="chassis max-w-lg w-full rounded-2xl shadow-2xl relative transform transition-all duration-300 scale-95 border border-blue-500/40 ws-surface-primary" id="addCanvaHubCard">
          <div class="chassis-core p-5 sm:p-7 space-y-4 ws-surface-primary">
            
            <div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
              <div class="flex items-center gap-2.5">
                <div class="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-600 dark:text-blue-400 font-mono font-bold flex items-center justify-center text-lg">
                  🎨
                </div>
                <div>
                  <span class="eyebrow-pill cobalt text-[9px] font-mono">CANVA DESIGN BANK</span>
                  <h3 class="text-base font-extrabold ws-text-title font-display">Tambah Tautan Desain Canva</h3>
                </div>
              </div>
              <button onclick="SpreadsheetHub.closeAddCanvaModal()" class="text-slate-400 hover:text-slate-800 dark:hover:text-white p-1.5 text-sm">
                ✕
              </button>
            </div>

            <div class="space-y-3.5">
              <div>
                <label class="block text-[11px] font-mono text-slate-700 dark:text-slate-300 mb-1 font-bold">Nama / Judul Desain <span class="text-blue-500">*</span></label>
                <input 
                  type="text" 
                  id="inputNewCanvaName" 
                  placeholder="Misal: Banner Gate Kedatangan, ID Card LO..." 
                  class="w-full px-3.5 py-2.5 rounded-xl text-xs border border-slate-300 dark:border-white/10 focus:outline-none focus:border-blue-500 font-mono bg-white dark:bg-[#0c101c] text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label class="block text-[11px] font-mono text-slate-700 dark:text-slate-300 mb-1 font-bold">Kategori Desain</label>
                <select id="selectNewCanvaCategory" class="w-full px-3.5 py-2.5 rounded-xl text-xs border border-slate-300 dark:border-white/10 focus:outline-none focus:border-blue-500 font-mono bg-white dark:bg-[#0c101c] text-slate-800 dark:text-white">
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
                <label class="block text-[11px] font-mono text-slate-700 dark:text-slate-300 mb-1 font-bold">Tautan / URL Canva <span class="text-blue-500">*</span></label>
                <input 
                  type="text" 
                  id="inputNewCanvaUrl" 
                  placeholder="https://www.canva.com/design/DAF.../view" 
                  class="w-full px-3.5 py-2.5 rounded-xl text-xs border border-slate-300 dark:border-white/10 focus:outline-none focus:border-blue-500 font-mono bg-white dark:bg-[#0c101c] text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label class="block text-[11px] font-mono text-slate-700 dark:text-slate-300 mb-1 font-bold">Sub-Divisi Pemilik</label>
                <select id="selectNewCanvaSubEvent" class="w-full px-3.5 py-2.5 rounded-xl text-xs border border-slate-300 dark:border-white/10 focus:outline-none focus:border-blue-500 font-mono bg-white dark:bg-[#0c101c] text-slate-800 dark:text-white">
                  <option value="safari">🏛️ Safari Faculty (SF-01)</option>
                  <option value="startpoint">🚀 Start Point (SP-02)</option>
                  <option value="odl">🎓 One Day Lecture (ODL-03)</option>
                  <option value="technocraft">⚡ Technocraft (TC-04)</option>
                  <option value="all">🌐 Umum & Medkraf Pusat</option>
                </select>
              </div>

              <div>
                <label class="block text-[11px] font-mono text-slate-700 dark:text-slate-300 mb-1 font-bold">Deskripsi Singkat / Catatan Cetak</label>
                <textarea 
                  id="inputNewCanvaDesc" 
                  rows="2" 
                  placeholder="Misal: Ukuran 3x2 meter, bahan flexi korea 440gr..." 
                  class="w-full px-3.5 py-2 rounded-xl text-xs border border-slate-300 dark:border-white/10 focus:outline-none focus:border-blue-500 font-mono bg-white dark:bg-[#0c101c] text-slate-800 dark:text-white"
                ></textarea>
              </div>
            </div>

            <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-white/10">
              <button onclick="SpreadsheetHub.closeAddCanvaModal()" class="btn-ghost py-2 px-4 text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                Batal
              </button>
              <button onclick="SpreadsheetHub.submitAddCanva()" id="btnSubmitNewCanva" class="btn-tactical py-2 px-4 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md">
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
      <div id="editSpreadsheetHubModal" class="fixed inset-0 z-[170] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 transition-all duration-300 opacity-0 pointer-events-none">
        <div class="chassis max-w-lg w-full rounded-2xl shadow-2xl relative transform transition-all duration-300 scale-95 border border-amber-500/40 ws-surface-primary" id="editSpreadsheetHubCard">
          <div class="chassis-core p-5 sm:p-7 space-y-4 ws-surface-primary">
            
            <div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
              <div class="flex items-center gap-2.5">
                <div class="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-600 dark:text-amber-400 font-mono font-bold flex items-center justify-center text-lg">
                  ✏️
                </div>
                <div>
                  <span class="eyebrow-pill amber text-[9px] font-mono">RENAME & GANTI TAUTAN</span>
                  <h3 class="text-base font-extrabold ws-text-title font-display">Edit Spreadsheet</h3>
                </div>
              </div>
              <button onclick="SpreadsheetHub.closeEditSheetModal()" class="text-slate-400 hover:text-slate-800 dark:hover:text-white p-1.5 text-sm">
                ✕
              </button>
            </div>

            <input type="hidden" id="inputEditSheetId" />

            <div class="space-y-3.5">
              <div>
                <label class="block text-[11px] font-mono text-slate-700 dark:text-slate-300 mb-1 font-bold">Nama / Judul Lembar Kerja <span class="text-amber-500">*</span></label>
                <input 
                  type="text" 
                  id="inputEditSheetName" 
                  class="w-full px-3.5 py-2.5 rounded-xl text-xs border border-slate-300 dark:border-white/10 focus:outline-none focus:border-amber-500 font-mono bg-white dark:bg-[#0c101c] text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label class="block text-[11px] font-mono text-slate-700 dark:text-slate-300 mb-1 font-bold">Tautan Google Sheet / ID</label>
                <input 
                  type="text" 
                  id="inputEditSheetUrl" 
                  class="w-full px-3.5 py-2.5 rounded-xl text-xs border border-slate-300 dark:border-white/10 focus:outline-none focus:border-amber-500 font-mono bg-white dark:bg-[#0c101c] text-slate-800 dark:text-white"
                />
                <p class="text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-1">
                  💡 Ganti URL jika tautan sheet dipindahkan atau diperbarui.
                </p>
              </div>

              <div>
                <label class="block text-[11px] font-mono text-slate-700 dark:text-slate-300 mb-1 font-bold">Alokasi Sub-Divisi</label>
                <select id="selectEditSheetSubEvent" class="w-full px-3.5 py-2.5 rounded-xl text-xs border border-slate-300 dark:border-white/10 focus:outline-none focus:border-amber-500 font-mono bg-white dark:bg-[#0c101c] text-slate-800 dark:text-white">
                  <option value="safari">🏛️ Safari Faculty (SF-01)</option>
                  <option value="startpoint">🚀 Start Point (SP-02)</option>
                  <option value="odl">🎓 One Day Lecture (ODL-03)</option>
                  <option value="technocraft">⚡ Technocraft (TC-04)</option>
                  <option value="all">🌐 Semua Sub-Divisi (Umum)</option>
                </select>
              </div>
            </div>

            <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-white/10">
              <button onclick="SpreadsheetHub.closeEditSheetModal()" class="btn-ghost py-2 px-4 text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                Batal
              </button>
              <button onclick="SpreadsheetHub.submitEditSheet()" id="btnSubmitEditSheet" class="btn-tactical py-2 px-4 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black shadow-md">
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
      <div id="editCanvaHubModal" class="fixed inset-0 z-[170] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 transition-all duration-300 opacity-0 pointer-events-none">
        <div class="chassis max-w-lg w-full rounded-2xl shadow-2xl relative transform transition-all duration-300 scale-95 border border-amber-500/40 ws-surface-primary" id="editCanvaHubCard">
          <div class="chassis-core p-5 sm:p-7 space-y-4 ws-surface-primary">
            
            <div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
              <div class="flex items-center gap-2.5">
                <div class="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-600 dark:text-amber-400 font-mono font-bold flex items-center justify-center text-lg">
                  ✏️
                </div>
                <div>
                  <span class="eyebrow-pill amber text-[9px] font-mono">RENAME & GANTI TAUTAN</span>
                  <h3 class="text-base font-extrabold ws-text-title font-display">Edit Desain Canva</h3>
                </div>
              </div>
              <button onclick="SpreadsheetHub.closeEditCanvaModal()" class="text-slate-400 hover:text-slate-800 dark:hover:text-white p-1.5 text-sm">
                ✕
              </button>
            </div>

            <input type="hidden" id="inputEditCanvaId" />

            <div class="space-y-3.5">
              <div>
                <label class="block text-[11px] font-mono text-slate-700 dark:text-slate-300 mb-1 font-bold">Nama / Judul Desain <span class="text-amber-500">*</span></label>
                <input 
                  type="text" 
                  id="inputEditCanvaName" 
                  class="w-full px-3.5 py-2.5 rounded-xl text-xs border border-slate-300 dark:border-white/10 focus:outline-none focus:border-amber-500 font-mono bg-white dark:bg-[#0c101c] text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label class="block text-[11px] font-mono text-slate-700 dark:text-slate-300 mb-1 font-bold">Tautan / URL Canva <span class="text-amber-500">*</span></label>
                <input 
                  type="text" 
                  id="inputEditCanvaUrl" 
                  class="w-full px-3.5 py-2.5 rounded-xl text-xs border border-slate-300 dark:border-white/10 focus:outline-none focus:border-amber-500 font-mono bg-white dark:bg-[#0c101c] text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label class="block text-[11px] font-mono text-slate-700 dark:text-slate-300 mb-1 font-bold">Kategori Desain</label>
                <select id="selectEditCanvaCategory" class="w-full px-3.5 py-2.5 rounded-xl text-xs border border-slate-300 dark:border-white/10 focus:outline-none focus:border-amber-500 font-mono bg-white dark:bg-[#0c101c] text-slate-800 dark:text-white">
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
                <label class="block text-[11px] font-mono text-slate-700 dark:text-slate-300 mb-1 font-bold">Sub-Divisi Pemilik</label>
                <select id="selectEditCanvaSubEvent" class="w-full px-3.5 py-2.5 rounded-xl text-xs border border-slate-300 dark:border-white/10 focus:outline-none focus:border-amber-500 font-mono bg-white dark:bg-[#0c101c] text-slate-800 dark:text-white">
                  <option value="safari">🏛️ Safari Faculty (SF-01)</option>
                  <option value="startpoint">🚀 Start Point (SP-02)</option>
                  <option value="odl">🎓 One Day Lecture (ODL-03)</option>
                  <option value="technocraft">⚡ Technocraft (TC-04)</option>
                  <option value="all">🌐 Umum & Medkraf Pusat</option>
                </select>
              </div>

              <div>
                <label class="block text-[11px] font-mono text-slate-700 dark:text-slate-300 mb-1 font-bold">Deskripsi Singkat / Catatan</label>
                <textarea 
                  id="inputEditCanvaDesc" 
                  rows="2" 
                  class="w-full px-3.5 py-2 rounded-xl text-xs border border-slate-300 dark:border-white/10 focus:outline-none focus:border-amber-500 font-mono bg-white dark:bg-[#0c101c] text-slate-800 dark:text-white"
                ></textarea>
              </div>
            </div>

            <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-white/10">
              <button onclick="SpreadsheetHub.closeEditCanvaModal()" class="btn-ghost py-2 px-4 text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                Batal
              </button>
              <button onclick="SpreadsheetHub.submitEditCanva()" id="btnSubmitEditCanva" class="btn-tactical py-2 px-4 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black shadow-md">
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
