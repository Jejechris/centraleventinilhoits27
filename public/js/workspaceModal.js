/**
 * INI LHO ITS! 2027 — CENTRAL EVENT MISSION CONTROL
 * HARDENED WORKSPACE MODAL: Google Drive Native In-App Explorer & Multi-Spreadsheet Live Editor
 * Features:
 * - 100% In-App Navigation (Zero external tab breakouts!)
 * - Direct In-App File Uploading to any Drive folder
 * - Multi-Spreadsheet Selector (Safari, Start Point, ODL, Technocraft + Custom Sheets)
 * - Tautkan / Unggah Spreadsheet Baru (.xlsx, .csv, atau Google Sheet ID)
 */

const WorkspaceModal = {
  sheetId: null,
  rootFolderId: '1a-JbvPXcU0o9gWDrQEJUGZaQXTM6LQQp',
  
  // State
  activeView: null, // 'explorer' | 'viewer' | 'sheet'
  isFullscreen: false,
  sheetMode: 'edit', // 'edit' | 'clean'
  driveLayout: 'grid', // 'grid' | 'table'
  activeFilter: 'all', // 'all' | 'folder' | 'sheet' | 'doc'
  searchQuery: '',
  
  // Navigation stack for Drive Explorer
  folderStack: [], // Array of { id, name }
  currentFolderId: null,
  currentFolderName: 'Official Central Event Drive',
  currentItems: [],
  isLoading: false,
  
  // Active preview file & active sheet
  activeFile: null,
  availableSheets: [],
  activeSheetId: null,

  init() {
    this.injectModal();
    this.bindEvents();
  },

  injectModal() {
    if (document.getElementById('workspaceModal')) return;

    const modalHtml = `
      <div id="workspaceModal" class="fixed inset-0 z-[200] bg-[#07090E]/85 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 transition-all duration-300 opacity-0 pointer-events-none">
        
        <div id="workspaceChassis" class="chassis w-full max-w-6xl h-[92vh] flex flex-col transition-all duration-300 transform scale-[0.98] overflow-hidden rounded-2xl shadow-2xl relative">
          <div class="chassis-core flex flex-col h-full !p-0 overflow-hidden ws-surface-primary">
            
            <!-- 1. MODAL COMMAND BAR (Tactical Aerospace Ribbon) -->
            <div class="px-4 sm:px-6 py-3 border-b border-white/10 flex items-center justify-between gap-3 ws-surface-primary flex-shrink-0 z-20">
              
              <!-- Left: Title, Icon & Status -->
              <div class="flex items-center gap-3 min-w-0">
                <div id="wsIconBadge" class="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 font-mono font-bold flex items-center justify-center text-base flex-shrink-0">
                  📁
                </div>
                <div class="min-w-0">
                  <div class="flex items-center gap-2">
                    <span id="wsStatusBadge" class="eyebrow-pill cobalt text-[9px] font-mono">GDRIVE IN-APP EXPLORER</span>
                  </div>
                  <h3 id="wsTitle" class="text-sm sm:text-base font-extrabold text-white ws-text-title font-display truncate leading-snug mt-0.5">
                    Official Central Event Drive Repository
                  </h3>
                </div>
              </div>

              <!-- Right: Mode Switches, Fullscreen & Controls -->
              <div class="flex items-center gap-2 flex-shrink-0">
                
                <!-- Dynamic Mode Switches (Injected by active view) -->
                <div id="wsModeSwitches" class="flex items-center gap-1"></div>

                <!-- Open External Tab Fallback (User Option) -->
                <a id="wsExternalLink" href="#" target="_blank" title="Buka di Tab Baru Google" class="btn-ghost py-1.5 px-2.5 text-xs text-slate-400 hover:text-white hidden sm:inline-flex items-center gap-1 font-mono">
                  <span>Tab Baru</span>
                  <span>↗</span>
                </a>

                <!-- Fullscreen Toggle -->
                <button onclick="WorkspaceModal.toggleFullscreen()" id="wsFullscreenBtn" title="Layar Penuh" class="btn-ghost py-1.5 px-2.5 text-xs text-slate-400 hover:text-white font-mono">
                  <span id="wsFullscreenIcon">⛶</span>
                </button>

                <!-- Close Button -->
                <button onclick="WorkspaceModal.close()" class="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition text-sm font-bold">
                  ✕
                </button>

              </div>
            </div>

            <!-- 2. WORKSPACE VIEWPORT VIEW CONTAINER -->
            <div class="relative flex-1 w-full ws-surface-secondary overflow-hidden flex flex-col">
              
              <!-- A. NATIVE DRIVE EXPLORER CONTAINER -->
              <div id="wsExplorerContainer" class="flex-1 flex flex-col h-full overflow-hidden">
                
                <!-- Sub-ribbon: Breadcrumbs & Search Filter Bar -->
                <div class="px-4 sm:px-6 py-2.5 border-b border-white/5 ws-surface-primary flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
                  
                  <!-- Breadcrumb Path Trail -->
                  <div id="wsBreadcrumbs" class="flex items-center gap-1.5 overflow-x-auto custom-scrollbar text-xs font-mono py-1 max-w-full sm:max-w-xl">
                    <!-- Injected by JS -->
                  </div>

                  <!-- Action Controls: Upload, Search & Filters -->
                  <div class="flex items-center gap-2 flex-1 sm:flex-initial justify-end">
                    
                    <!-- In-App Upload File Trigger -->
                    <button onclick="WorkspaceModal.openUploadModal()" class="btn-tactical py-1.5 px-2.5 text-xs flex items-center gap-1.5 font-bold">
                      <span>📤</span>
                      <span class="font-mono text-[11px] hidden sm:inline">Unggah Berkas</span>
                    </button>

                    <!-- In-App Link Drive Trigger (Auto-Detect Link) -->
                    <button onclick="WorkspaceModal.openLinkDriveModal()" class="btn-ghost py-1.5 px-2.5 text-xs text-blue-400 border-blue-500/30 hover:border-blue-500 flex items-center gap-1.5 font-bold">
                      <span>🔗</span>
                      <span class="font-mono text-[11px] hidden sm:inline">Tautkan Drive</span>
                    </button>

                    <!-- Search Input -->
                    <div class="relative min-w-[140px] sm:min-w-[200px]">
                      <span class="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span>
                      <input 
                        type="text" 
                        id="wsSearchInput" 
                        placeholder="Tapis berkas & folder..." 
                        oninput="WorkspaceModal.onSearch(this.value)"
                        class="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs font-sans bay-recessed border border-white/10 focus:outline-none focus:border-blue-500 text-slate-200 placeholder:text-slate-500"
                      />
                    </div>

                    <!-- Layout Toggle (Grid vs Table) -->
                    <div class="flex items-center bay-recessed p-0.5 border border-white/5 rounded-lg">
                      <button onclick="WorkspaceModal.setLayout('grid')" id="wsGridBtn" title="Tampilan Kotak" class="px-2 py-1 rounded text-xs transition bg-blue-600 text-white font-bold">
                        ▦
                      </button>
                      <button onclick="WorkspaceModal.setLayout('table')" id="wsTableBtn" title="Tampilan Tabel" class="px-2 py-1 rounded text-xs transition text-slate-400 hover:text-white">
                        ☰
                      </button>
                    </div>

                    <!-- Refresh Button -->
                    <button onclick="WorkspaceModal.refreshCurrentFolder()" title="Segarkan Berkas" class="btn-ghost py-1.5 px-2 text-xs text-slate-400 hover:text-white">
                      🔄
                    </button>
                  </div>

                </div>

                <!-- Quick Filter Badges -->
                <div class="px-4 sm:px-6 py-2 border-b border-white/5 bg-black/10 flex items-center justify-between text-[11px] font-mono flex-shrink-0">
                  <div class="flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
                    <button onclick="WorkspaceModal.setFilter('all')" id="wsFilterAll" class="px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition bg-blue-600/20 text-blue-400 border-blue-500/40">
                      Semua
                    </button>
                    <button onclick="WorkspaceModal.setFilter('folder')" id="wsFilterFolder" class="px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition text-slate-400 border-transparent hover:border-white/10">
                      📁 Folder
                    </button>
                    <button onclick="WorkspaceModal.setFilter('sheet')" id="wsFilterSheet" class="px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition text-slate-400 border-transparent hover:border-white/10">
                      📊 Sheets
                    </button>
                    <button onclick="WorkspaceModal.setFilter('doc')" id="wsFilterDoc" class="px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition text-slate-400 border-transparent hover:border-white/10">
                      📑 Dokumen & PDF
                    </button>
                  </div>
                  <div id="wsItemsCounter" class="text-slate-500 text-[10px] hidden sm:block whitespace-nowrap">
                    Memuat berkas...
                  </div>
                </div>

                <!-- Scrollable Item Canvas -->
                <div id="wsItemsCanvas" class="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6">
                  <!-- Injected by renderItems() -->
                </div>

              </div>

              <!-- B. IN-APP FILE VIEWER & SPREADSHEET EDITOR CONTAINER -->
              <div id="wsViewerContainer" class="flex-1 flex flex-col h-full overflow-hidden hidden">
                
                <!-- Viewer Secondary Toolbar / Multi-Sheet Selector -->
                <div class="px-4 sm:px-6 py-2 border-b border-white/10 ws-surface-primary flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
                  
                  <div class="flex items-center gap-2 min-w-0 flex-1">
                    <button onclick="WorkspaceModal.closeFilePreview()" class="btn-ghost py-1 px-2.5 text-xs text-blue-400 border-blue-500/30 hover:border-blue-500 flex items-center gap-1.5 flex-shrink-0">
                      <span>←</span>
                      <span class="font-mono font-bold text-[11px]">Kembali</span>
                    </button>
                    <div class="h-4 w-px bg-white/10 mx-1 hidden sm:block"></div>
                    <div id="wsViewerDocName" class="text-xs font-extrabold text-white ws-text-title truncate font-mono">
                      Pratinjau Dokumen
                    </div>
                  </div>

                  <!-- Multi-Spreadsheet Quick Tabs (Shown when activeView === 'sheet') -->
                  <div id="wsSheetSelectorBar" class="hidden items-center gap-1.5 overflow-x-auto custom-scrollbar py-0.5">
                    <!-- Injected by JS -->
                  </div>

                  <div class="flex items-center gap-2 flex-shrink-0">
                    <button onclick="WorkspaceModal.copyActiveLink()" title="Salin Tautan Dokumen" class="btn-ghost py-1 px-2 text-xs text-slate-400 hover:text-white">
                      📋 <span class="hidden sm:inline text-[10px] font-mono">Salin</span>
                    </button>
                    <a id="wsViewerExternalBtn" href="#" target="_blank" title="Buka di Tab Baru" class="btn-ghost py-1 px-2 text-xs text-slate-400 hover:text-white">
                      ↗ <span class="hidden sm:inline text-[10px] font-mono">Tab Baru</span>
                    </a>
                  </div>

                </div>

                <!-- Viewer Iframe Viewport -->
                <div class="relative flex-1 w-full ws-surface-secondary overflow-hidden">
                  
                  <!-- Loading Skeleton -->
                  <div id="wsViewerLoading" class="absolute inset-0 z-10 flex flex-col items-center justify-center ws-surface-primary backdrop-blur-sm transition-opacity duration-300">
                    <div class="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                    <div class="text-xs font-mono font-bold text-slate-300 ws-text-title tracking-wider uppercase">Memuat Workspace Terpadu...</div>
                    <div class="text-[10px] font-mono text-slate-500 mt-1">Mengakses enkripsi non-breakout Google Viewer</div>
                  </div>

                  <!-- Document Iframe -->
                  <iframe 
                    id="wsViewerIframe" 
                    class="w-full h-full border-0" 
                    allow="clipboard-read; clipboard-write; fullscreen" 
                    onload="WorkspaceModal.onViewerLoaded()">
                  </iframe>

                </div>

              </div>

            </div>

            <!-- 3. MODAL STATUS FOOTER (Tactical Telemetry) -->
            <div class="px-4 py-2 border-t border-white/5 ws-surface-primary flex items-center justify-between text-[10px] font-mono text-slate-500 flex-shrink-0">
              <div class="flex items-center gap-2 truncate">
                <span class="text-blue-400 font-bold">● IN-APP ENGINE ACTIVE</span>
                <span class="text-slate-600 hidden sm:inline">•</span>
                <span id="wsFooterNote" class="truncate hidden sm:inline">Navigasi berkas & spreadsheet terpadu 100% di dalam dashboard.</span>
              </div>
              <div class="flex items-center gap-2 flex-shrink-0">
                <span class="text-slate-400">Tekan [ESC] untuk keluar</span>
              </div>
            </div>

            <!-- 4. DIALOG IN-APP UPLOAD BERKAS -->
            <div id="wsUploadDialog" class="absolute inset-0 z-30 bg-[#07090E]/90 backdrop-blur-md flex items-center justify-center p-4 transition-all duration-300 opacity-0 pointer-events-none">
              <div class="chassis max-w-lg w-full p-5 ws-surface-primary border border-white/10 rounded-2xl shadow-2xl">
                <div class="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                  <div>
                    <h4 class="text-sm font-extrabold text-white ws-text-title flex items-center gap-2">
                      <span>📤</span> Unggah Berkas Baru ke Drive
                    </h4>
                    <p class="text-[11px] font-mono text-slate-400 mt-0.5" id="wsUploadTargetFolder">
                      Target: Folder Utama
                    </p>
                  </div>
                  <button onclick="WorkspaceModal.closeUploadModal()" class="text-slate-400 hover:text-white p-1.5 rounded-lg text-sm">✕</button>
                </div>

                <div class="space-y-4">
                  <!-- Drag & Drop Zone -->
                  <div id="wsDropZone" class="border-2 border-dashed border-white/15 hover:border-blue-500 rounded-xl p-6 text-center cursor-pointer transition bay-recessed" onclick="document.getElementById('wsFileInput').click()">
                    <span class="text-3xl block mb-2">📁</span>
                    <div class="text-xs font-bold text-white ws-text-title mb-1" id="wsSelectedFileName">Pilih berkas dari perangkatmu</div>
                    <div class="text-[10px] font-mono text-slate-400">Mendukung Excel (.xlsx), PDF, Word (.docx), PPT, gambar, dll. (Maks 50MB)</div>
                    <input type="file" id="wsFileInput" class="hidden" onchange="WorkspaceModal.onFileSelected(this.files)">
                  </div>

                  <div id="wsUploadProgressBox" class="hidden space-y-1">
                    <div class="flex justify-between text-[10px] font-mono text-slate-400">
                      <span>Mengunggah berkas ke server...</span>
                      <span id="wsUploadPct">0%</span>
                    </div>
                    <div class="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div id="wsUploadBar" class="bg-blue-600 h-full rounded-full transition-all duration-300" style="width: 0%"></div>
                    </div>
                  </div>

                  <div class="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                    <button onclick="WorkspaceModal.closeUploadModal()" class="btn-ghost py-1.5 px-3 text-xs">
                      Batal
                    </button>
                    <button onclick="WorkspaceModal.submitUpload()" id="wsSubmitUploadBtn" class="btn-tactical py-1.5 px-4 text-xs font-bold" disabled>
                      <span>UNGGAH SEKARANG</span>
                      <div class="btn-icon-bay">↑</div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 5. DIALOG TAMBAH SPREADSHEET BARU -->
            <div id="wsAddSheetDialog" class="absolute inset-0 z-30 bg-[#07090E]/90 backdrop-blur-md flex items-center justify-center p-4 transition-all duration-300 opacity-0 pointer-events-none">
              <div class="chassis max-w-lg w-full p-5 ws-surface-primary border border-white/10 rounded-2xl shadow-2xl">
                <div class="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                  <div>
                    <h4 class="text-sm font-extrabold text-white ws-text-title flex items-center gap-2">
                      <span>➕</span> Tambah / Tautkan Spreadsheet Baru
                    </h4>
                    <p class="text-[11px] font-mono text-slate-400 mt-0.5">
                      Buka & kelola spreadsheet untuk sub-divisi mana pun
                    </p>
                  </div>
                  <button onclick="WorkspaceModal.closeAddSheetModal()" class="text-slate-400 hover:text-white p-1.5 rounded-lg text-sm">✕</button>
                </div>

                <div class="space-y-3.5 text-xs">
                  <div>
                    <label class="block text-[11px] font-mono font-bold text-slate-300 mb-1">NAMA SPREADSHEET:</label>
                    <input type="text" id="wsInputSheetName" placeholder="Contoh: Master Rundown Start Point Revisi" class="w-full bay-recessed px-3 py-2 rounded-lg border border-white/10 text-white focus:outline-none focus:border-blue-500">
                  </div>

                  <div>
                    <label class="block text-[11px] font-mono font-bold text-slate-300 mb-1">SUB-DIVISI TERKAIT:</label>
                    <select id="wsSelectSheetSub" class="w-full bay-recessed px-3 py-2 rounded-lg border border-white/10 text-white focus:outline-none focus:border-blue-500 cursor-pointer">
                      <option value="safari">🏛️ Safari Faculty</option>
                      <option value="startpoint">🚀 Start Point</option>
                      <option value="odl">🎓 One Day Lecture</option>
                      <option value="technocraft">⚡ Technocraft</option>
                      <option value="all">📊 Operasional Umum</option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-[11px] font-mono font-bold text-slate-300 mb-1">ID ATAU LINK GOOGLE SPREADSHEET:</label>
                    <input type="text" id="wsInputSheetUrl" placeholder="Contoh: https://docs.google.com/spreadsheets/d/.../edit" class="w-full bay-recessed px-3 py-2 rounded-lg border border-white/10 text-white focus:outline-none focus:border-blue-500">
                    <p class="text-[10px] font-mono text-slate-500 mt-1">Atau masukkan ID berkas 44 karakter Google Sheet.</p>
                  </div>

                  <div class="flex items-center justify-end gap-2 pt-3 border-t border-white/5">
                    <button onclick="WorkspaceModal.closeAddSheetModal()" class="btn-ghost py-1.5 px-3 text-xs">
                      Batal
                    </button>
                    <button onclick="WorkspaceModal.submitAddSheet()" class="btn-tactical py-1.5 px-4 text-xs font-bold">
                      <span>SIMPAN & BUKA</span>
                      <div class="btn-icon-bay">→</div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 6. DIALOG TAUTKAN GOOGLE DRIVE LINK -->
            <div id="wsLinkDriveDialog" class="absolute inset-0 z-30 bg-[#07090E]/85 backdrop-blur-md flex items-center justify-center p-4 transition-all duration-300 opacity-0 pointer-events-none">
              <div class="chassis max-w-lg w-full p-5 sm:p-6 ws-surface-primary border border-white/10 rounded-2xl shadow-2xl">
                <div class="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                  <div>
                    <h4 class="text-sm font-extrabold text-white ws-text-title flex items-center gap-2">
                      <span>🔗</span> Tautkan Google Drive (Deteksi Otomatis)
                    </h4>
                    <p class="text-[11px] font-mono text-slate-400 mt-0.5">
                      Hubungkan link folder atau drive sub-divisi tanpa perlu upload manual
                    </p>
                  </div>
                  <button onclick="WorkspaceModal.closeLinkDriveModal()" class="text-slate-400 hover:text-white p-1.5 rounded-lg text-sm font-bold">✕</button>
                </div>

                <div class="space-y-4 text-xs">
                  <div>
                    <label class="block text-[11px] font-mono font-bold text-slate-300 ws-text-title mb-1.5 uppercase">SUB-DIVISI TARGET:</label>
                    <select id="wsSelectDriveSub" class="w-full bay-recessed px-3.5 py-2.5 rounded-lg border border-white/15 text-white ws-text-title focus:outline-none focus:border-blue-500 cursor-pointer font-sans text-xs">
                      <option value="safari">🏛️ Safari Faculty (Flagship)</option>
                      <option value="startpoint">🚀 Start Point</option>
                      <option value="odl">🎓 One Day Lecture</option>
                      <option value="technocraft">⚡ Technocraft</option>
                    </select>
                  </div>

                  <div>
                    <div class="flex items-center justify-between mb-1.5">
                      <label class="text-[11px] font-mono font-bold text-slate-300 ws-text-title uppercase">LINK ATAU ID GOOGLE DRIVE:</label>
                      <span id="wsDriveLinkDetectBadge" class="text-[10px] font-mono text-slate-500">Deteksi link otomatis</span>
                    </div>
                    <input 
                      type="text" 
                      id="wsInputDriveUrl" 
                      placeholder="https://drive.google.com/drive/folders/..." 
                      oninput="WorkspaceModal.onDriveLinkInput(this.value)"
                      class="w-full bay-recessed px-3.5 py-2.5 rounded-lg border border-white/15 text-white ws-text-title focus:outline-none focus:border-blue-500 font-mono text-xs placeholder:text-slate-500"
                    />
                    <div id="wsDriveLinkFeedback" class="mt-2 text-[11px] font-mono hidden"></div>
                    <p class="text-[10px] font-mono text-slate-400 mt-1.5 leading-relaxed">
                      Mendukung link folder Drive publik/dibagikan, link file, atau ID Google Drive 20–60 karakter.
                    </p>
                  </div>

                  <div class="flex items-center justify-end gap-2 pt-3 border-t border-white/5">
                    <button onclick="WorkspaceModal.closeLinkDriveModal()" class="btn-ghost py-2 px-3.5 text-xs">
                      Batal
                    </button>
                    <button onclick="WorkspaceModal.submitLinkDrive()" id="wsSubmitLinkDriveBtn" class="btn-tactical py-2 px-5 text-xs font-bold flex items-center gap-1.5">
                      <span>HUBUNGKAN SEKARANG</span>
                      <div class="btn-icon-bay">✓</div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
  },

  bindEvents() {
    const modal = document.getElementById('workspaceModal');
    if (modal) {
      modal.addEventListener('wheel', (e) => {
        // Prevent mousewheel events from propagating to the underlying document body
        e.stopPropagation();
      }, { passive: true });
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.activeView) {
        const upDialog = document.getElementById('wsUploadDialog');
        const sheetDialog = document.getElementById('wsAddSheetDialog');
        const linkDialog = document.getElementById('wsLinkDriveDialog');
        if (upDialog && !upDialog.classList.contains('pointer-events-none')) {
          this.closeUploadModal();
          return;
        }
        if (sheetDialog && !sheetDialog.classList.contains('pointer-events-none')) {
          this.closeAddSheetModal();
          return;
        }
        if (linkDialog && !linkDialog.classList.contains('pointer-events-none')) {
          this.closeLinkDriveModal();
          return;
        }
        if (this.activeView === 'viewer') {
          this.closeFilePreview();
        } else {
          this.close();
        }
      }
    });
  },

  /**
   * Open In-App Drive Explorer (Root or Specific Folder)
   */
  async openDrive(folderId = null, folderName = null) {
    this.injectModal();
    this.activeView = 'explorer';
    this.activeFile = null;

    document.getElementById('wsExplorerContainer')?.classList.remove('hidden');
    document.getElementById('wsViewerContainer')?.classList.add('hidden');
    document.getElementById('wsSheetSelectorBar')?.classList.add('hidden');

    const titleEl = document.getElementById('wsTitle');
    const badgeEl = document.getElementById('wsStatusBadge');
    const iconEl = document.getElementById('wsIconBadge');
    const extLink = document.getElementById('wsExternalLink');
    const switches = document.getElementById('wsModeSwitches');
    const footerNote = document.getElementById('wsFooterNote');

    iconEl.innerText = '📁';
    titleEl.innerText = 'Official Central Event Drive Repository';
    badgeEl.innerText = 'GDRIVE IN-APP EXPLORER';
    badgeEl.className = 'eyebrow-pill cobalt text-[9px] font-mono';
    footerNote.innerText = 'Jelajahi & unggah berkas resmi acara langsung di dalam website.';
    extLink.href = `https://drive.google.com/drive/folders/${this.rootFolderId}`;
    switches.innerHTML = '';

    this.showModal();

    if (!folderId || folderId === this.rootFolderId) {
      this.folderStack = [{ id: this.rootFolderId, name: 'Root Repository' }];
      await this.loadRootFolders();
    } else {
      this.folderStack = [
        { id: this.rootFolderId, name: 'Root Repository' },
        { id: folderId, name: folderName || 'Subfolder' }
      ];
      await this.loadSubfolder(folderId, folderName);
    }
  },

  async openDriveForSubEvent(subEventId = null) {
    if (!subEventId || subEventId === 'dashboard' || subEventId === 'all') {
      return this.openDrive();
    }

    this.injectModal();
    this.showModal();
    this.activeView = 'explorer';
    this.currentSubEventId = subEventId;

    document.getElementById('wsViewerContainer')?.classList.add('hidden');
    document.getElementById('wsExplorerContainer')?.classList.remove('hidden');
    document.getElementById('wsSheetSelectorBar')?.classList.add('hidden');

    this.isLoading = true;
    this.renderLoadingCanvas(`Memuat repositori berkas ${subEventId.toUpperCase()}...`);

    try {
      const res = await CE_API.getSubEventDrive(subEventId);
      if (res && res.success) {
        this.currentFolderId = res.folderId;
        this.currentFolderName = res.folderName;
        this.currentItems = res.files || [];
        this.folderStack = [{ id: res.folderId, name: res.folderName }];
        this.renderBreadcrumbs();
        this.isLoading = false;
        this.renderItems();

        const titleEl = document.getElementById('wsTitle');
        const badgeEl = document.getElementById('wsStatusBadge');
        if (titleEl) titleEl.innerText = res.folderName;
        if (badgeEl) badgeEl.innerText = `${subEventId.toUpperCase()} REPOSITORI`;
      } else {
        throw new Error(res.error || 'Gagal memuat repositori sub-divisi');
      }
    } catch (err) {
      console.error('SubEvent drive error:', err);
      this.isLoading = false;
      this.renderErrorCanvas(err.message);
    }
  },

  async openDriveFolder(folderId, folderName) {
    if (!this.activeView) {
      this.openDrive(folderId, folderName);
    } else {
      const existingIdx = this.folderStack.findIndex(f => f.id === folderId);
      if (existingIdx !== -1) {
        this.folderStack = this.folderStack.slice(0, existingIdx + 1);
      } else {
        this.folderStack.push({ id: folderId, name: folderName });
      }
      this.activeView = 'explorer';
      document.getElementById('wsExplorerContainer')?.classList.remove('hidden');
      document.getElementById('wsViewerContainer')?.classList.add('hidden');
      document.getElementById('wsSheetSelectorBar')?.classList.add('hidden');
      await this.loadSubfolder(folderId, folderName);
    }
  },

  async loadRootFolders() {
    this.isLoading = true;
    this.currentFolderId = this.rootFolderId;
    this.currentFolderName = 'Official Central Event Drive';
    this.renderBreadcrumbs();
    this.renderLoadingCanvas('Memuat 7 folder resmi Central Event...');

    try {
      const res = await CE_API.getDriveFolders();
      if (res && res.success && res.folders) {
        this.currentItems = res.folders;
      } else {
        this.currentItems = [];
      }
      this.isLoading = false;
      this.renderItems();
    } catch (err) {
      console.error('Error loading root folders:', err);
      this.isLoading = false;
      this.renderErrorCanvas('Gagal memuat folder Google Drive: ' + err.message);
    }
  },

  async loadSubfolder(folderId, folderName) {
    this.isLoading = true;
    this.currentFolderId = folderId;
    this.currentFolderName = folderName || 'Subfolder';
    this.renderBreadcrumbs();
    this.renderLoadingCanvas(`Membuka folder "${this.currentFolderName}"...`);

    const extLink = document.getElementById('wsExternalLink');
    if (extLink) extLink.href = `https://drive.google.com/drive/folders/${folderId}`;

    try {
      const res = await CE_API.getDriveSubfolder(folderId, folderName);
      if (res && res.success && res.files) {
        this.currentItems = res.files;
      } else {
        this.currentItems = [];
      }
      this.isLoading = false;
      this.renderItems();
    } catch (err) {
      console.error('Error loading subfolder:', err);
      this.isLoading = false;
      this.renderErrorCanvas('Gagal memuat isi subfolder: ' + err.message);
    }
  },

  refreshCurrentFolder() {
    if (this.currentFolderId === this.rootFolderId) {
      this.loadRootFolders();
    } else {
      this.loadSubfolder(this.currentFolderId, this.currentFolderName);
    }
  },

  navigateBreadcrumb(index) {
    if (index < 0 || index >= this.folderStack.length) return;
    this.folderStack = this.folderStack.slice(0, index + 1);
    const target = this.folderStack[index];
    if (target.id === this.rootFolderId) {
      this.loadRootFolders();
    } else {
      this.loadSubfolder(target.id, target.name);
    }
  },

  goBackFolder() {
    if (this.folderStack.length > 1) {
      this.folderStack.pop();
      const prev = this.folderStack[this.folderStack.length - 1];
      if (prev.id === this.rootFolderId) {
        this.loadRootFolders();
      } else {
        this.loadSubfolder(prev.id, prev.name);
      }
    }
  },

  renderBreadcrumbs() {
    const el = document.getElementById('wsBreadcrumbs');
    if (!el) return;

    const canGoBack = this.folderStack.length > 1;
    const backBtn = canGoBack ? `
      <button onclick="WorkspaceModal.goBackFolder()" class="px-2 py-1 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white transition flex items-center gap-1 font-bold mr-1">
        <span>←</span>
        <span>Kembali</span>
      </button>
    ` : '';

    const crumbsHtml = this.folderStack.map((f, idx) => {
      const isLast = idx === this.folderStack.length - 1;
      if (isLast) {
        return `
          <span class="text-white ws-text-title font-bold px-1.5 py-0.5 rounded bay-recessed border border-white/10 truncate max-w-[180px] sm:max-w-xs">
            ${idx === 0 ? '📁' : '📂'} ${f.name}
          </span>
        `;
      }
      return `
        <button onclick="WorkspaceModal.navigateBreadcrumb(${idx})" class="text-slate-400 hover:text-blue-400 transition hover:underline truncate max-w-[120px]">
          ${idx === 0 ? '📁' : '📂'} ${f.name}
        </button>
        <span class="text-slate-600 text-xs">/</span>
      `;
    }).join('');

    el.innerHTML = `${backBtn}${crumbsHtml}`;
  },

  renderLoadingCanvas(message = 'Memuat...') {
    const canvas = document.getElementById('wsItemsCanvas');
    if (!canvas) return;
    canvas.innerHTML = `
      <div class="h-64 flex flex-col items-center justify-center text-center">
        <div class="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <div class="text-xs font-mono font-bold text-slate-300 ws-text-title tracking-wider uppercase">${message}</div>
        <div class="text-[10px] font-mono text-slate-500 mt-1">Mengambil struktur data berkas terenkripsi</div>
      </div>
    `;
    const counter = document.getElementById('wsItemsCounter');
    if (counter) counter.innerText = 'Mengambil data...';
  },

  renderErrorCanvas(error) {
    const canvas = document.getElementById('wsItemsCanvas');
    if (!canvas) return;
    canvas.innerHTML = `
      <div class="h-64 flex flex-col items-center justify-center text-center p-6 bay-recessed rounded-2xl border-white/5">
        <span class="text-3xl mb-2">⚠️</span>
        <div class="text-xs font-mono font-bold text-rose-400 mb-1">Gagal Mengakses Berkas</div>
        <div class="text-[11px] text-slate-400 max-w-md mb-4">${error}</div>
        <button onclick="WorkspaceModal.refreshCurrentFolder()" class="btn-tactical py-1.5 px-3 text-xs">
          <span>COBA LAGI</span>
          <div class="btn-icon-bay">🔄</div>
        </button>
      </div>
    `;
  },

  renderItems() {
    const canvas = document.getElementById('wsItemsCanvas');
    const counter = document.getElementById('wsItemsCounter');
    if (!canvas) return;

    let items = this.currentItems || [];

    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      items = items.filter(i => (i.name || '').toLowerCase().includes(q));
    }

    if (this.activeFilter === 'folder') {
      items = items.filter(i => i.isFolder);
    } else if (this.activeFilter === 'sheet') {
      items = items.filter(i => i.type === 'sheet');
    } else if (this.activeFilter === 'doc') {
      items = items.filter(i => ['document', 'pdf', 'presentation'].includes(i.type));
    }

    if (counter) {
      counter.innerText = `${items.length} item ${this.searchQuery ? `(filter "${this.searchQuery}")` : ''}`;
    }

    if (items.length === 0) {
      const isSubEventRoot = this.folderStack.length <= 1;
      const targetSub = this.currentSubEventId || 'safari';

      canvas.innerHTML = `
        <div class="h-80 flex flex-col items-center justify-center text-center p-6 max-w-lg mx-auto">
          <div class="w-16 h-16 rounded-2xl bg-blue-500/10 border-2 border-blue-500/30 flex items-center justify-center text-3xl mb-3 text-blue-400 shadow-xl shadow-blue-500/10">
            📂
          </div>
          <div class="text-sm sm:text-base font-extrabold text-white ws-text-title font-display">
            ${isSubEventRoot ? `Repositori Drive ${targetSub.toUpperCase()} Belum Terhubung` : 'Folder Ini Masih Kosong'}
          </div>
          <div class="text-xs text-slate-300 ws-text-muted mt-2 max-w-sm leading-relaxed">
            ${this.searchQuery 
              ? 'Tidak ada berkas yang cocok dengan kata kunci pencarian.' 
              : isSubEventRoot 
                ? 'Belum ada folder Google Drive yang ditautkan ke sub-divisi ini. Kamu bisa menempelkan link Google Drive agar berkas terbaca otomatis in-app, atau unggah dokumen langsung.'
                : 'Belum ada berkas di subfolder ini. Kamu bisa langsung mengunggah berkas sekarang!'}
          </div>
          
          <div class="flex flex-wrap items-center justify-center gap-2.5 mt-5">
            ${isSubEventRoot ? `
              <button onclick="WorkspaceModal.openLinkDriveModal('${targetSub}')" class="btn-tactical py-2 px-4 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-blue-600/20">
                <span>🔗</span>
                <span>Tautkan Link Google Drive</span>
                <div class="btn-icon-bay">→</div>
              </button>
            ` : ''}
            <button onclick="WorkspaceModal.openUploadModal()" class="btn-ghost py-2 px-4 text-xs text-emerald-400 border-emerald-500/30 hover:border-emerald-500 flex items-center gap-1.5 font-bold">
              <span>📤</span>
              <span>Unggah Berkas Manual</span>
            </button>
            ${this.folderStack.length > 1 ? `
              <button onclick="WorkspaceModal.goBackFolder()" class="btn-ghost py-2 px-3 text-xs text-blue-400">
                ← Kembali
              </button>
            ` : ''}
          </div>

          ${isSubEventRoot ? `
            <div class="mt-5 text-[10px] font-mono text-slate-500 flex items-center gap-2">
              <span>⚡ Deteksi URL Otomatis</span>
              <span>•</span>
              <span>In-App Preview 100%</span>
            </div>
          ` : ''}
        </div>
      `;
      return;
    }

    const folders = items.filter(i => i.isFolder);
    const files = items.filter(i => !i.isFolder);

    if (this.driveLayout === 'grid') {
      canvas.innerHTML = `
        <div class="space-y-6">
          
          <!-- FOLDERS SECTION -->
          ${folders.length > 0 ? `
            <div>
              <div class="text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase mb-3 flex items-center justify-between">
                <span>SUBFOLDER RESMI (${folders.length})</span>
                <span class="text-[9px] text-blue-400">KLIK UNTUK EKSPLORASI IN-APP</span>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                ${folders.map(f => this.renderFolderCard(f)).join('')}
              </div>
            </div>
          ` : ''}

          <!-- FILES SECTION -->
          ${files.length > 0 ? `
            <div>
              <div class="text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase mb-3 flex items-center justify-between">
                <span>BERKAS DOKUMEN & SPREADSHEET (${files.length})</span>
                <span class="text-[9px] text-emerald-400">PRATINJAU IN-APP SIAP</span>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                ${files.map(f => this.renderFileCard(f)).join('')}
              </div>
            </div>
          ` : ''}

        </div>
      `;
    } else {
      // Table Layout
      canvas.innerHTML = `
        <div class="overflow-x-auto custom-scrollbar rounded-xl border border-white/5">
          <table class="w-full text-left text-xs">
            <thead class="ws-surface-primary text-slate-400 text-[10px] font-mono uppercase tracking-wider border-b border-white/10">
              <tr>
                <th class="py-2.5 px-4">Nama Berkas / Folder</th>
                <th class="py-2.5 px-3 hidden sm:table-cell">Tipe</th>
                <th class="py-2.5 px-3 hidden sm:table-cell">Ukuran</th>
                <th class="py-2.5 px-3">Tgl</th>
                <th class="py-2.5 px-4 text-right">Aksi In-App</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              ${items.map(item => this.renderTableRow(item)).join('')}
            </tbody>
          </table>
        </div>
      `;
    }
  },

  renderFolderCard(f) {
    const escapedName = (f.name || '').replace(/'/g, "\\'");
    return `
      <div class="ws-surface-card rounded-xl p-3.5 flex flex-col justify-between group cursor-pointer" onclick="WorkspaceModal.openDriveFolder('${f.id}', '${escapedName}')">
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-105 group-hover:border-blue-400 transition-all">
            📁
          </div>
          <div class="min-w-0 flex-1">
            <h4 class="font-bold text-white ws-text-title text-xs leading-snug group-hover:text-blue-400 transition line-clamp-2" title="${f.name}">
              ${f.name}
            </h4>
            <div class="text-[10px] font-mono text-slate-500 ws-text-dim mt-1 flex items-center gap-1.5">
              <span>Folder</span>
              <span>•</span>
              <span>${f.date || 'Terbaru'}</span>
            </div>
          </div>
        </div>

        <div class="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[10px] font-mono">
          <span class="text-blue-400 font-bold group-hover:underline">Buka Folder In-App</span>
          <span class="text-slate-500 group-hover:text-blue-400 transition">→</span>
        </div>
      </div>
    `;
  },

  renderFileCard(f) {
    const escapedFile = JSON.stringify(f).replace(/"/g, '&quot;');
    const isSheet = f.type === 'sheet';
    const isLocal = f.isLocalUpload;

    let badgeClass = 'text-blue-400 bg-blue-600/10 border-blue-500/20';
    if (isSheet) badgeClass = 'text-emerald-400 bg-emerald-600/10 border-emerald-500/20';
    else if (f.type === 'pdf') badgeClass = 'text-rose-400 bg-rose-600/10 border-rose-500/20';
    else if (f.type === 'presentation') badgeClass = 'text-amber-400 bg-amber-600/10 border-amber-500/20';

    const localTag = isLocal ? '<span class="text-[8px] font-mono px-1 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold">UNGGAHAN LOKAL</span>' : '';

    return `
      <div class="ws-surface-card rounded-xl p-3.5 flex flex-col justify-between group">
        <div>
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-xl ${badgeClass} border flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-105 transition-all">
              ${f.icon || '📄'}
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-1.5 mb-0.5">
                ${localTag}
              </div>
              <h4 class="font-bold text-white ws-text-title text-xs leading-snug line-clamp-2 group-hover:text-blue-400 transition" title="${f.name}">
                ${f.name}
              </h4>
              <div class="text-[10px] font-mono text-slate-500 ws-text-dim mt-1 flex items-center gap-1.5">
                <span class="uppercase">${f.type}</span>
                <span>•</span>
                <span>${f.size || 'Berkas'}</span>
                <span>•</span>
                <span>${f.date || 'Terbaru'}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between gap-2">
          
          <button onclick='WorkspaceModal.openFilePreview(${escapedFile})' class="btn-tactical py-1 px-2.5 text-[10px] font-bold flex-1 justify-center">
            <span>${isSheet ? 'EDIT / PREVIEW' : 'PRATINJAU IN-APP'}</span>
            <div class="btn-icon-bay">👁️</div>
          </button>

          <a href="${f.externalUrl}" target="_blank" title="Buka / Unduh Berkas" class="btn-ghost py-1 px-2 text-xs text-slate-400 hover:text-white flex-shrink-0">
            ↗
          </a>

        </div>
      </div>
    `;
  },

  renderTableRow(item) {
    const isFolder = item.isFolder;
    const escapedFile = JSON.stringify(item).replace(/"/g, '&quot;');
    const escapedName = (item.name || '').replace(/'/g, "\\'");

    return `
      <tr class="hover:bg-white/5 transition">
        <td class="py-2.5 px-4 font-bold text-white ws-text-title">
          <div class="flex items-center gap-2.5">
            <span class="text-base flex-shrink-0">${item.icon}</span>
            <span class="truncate max-w-xs sm:max-w-md">${item.name}</span>
            ${item.isLocalUpload ? '<span class="text-[8px] font-mono px-1 rounded bg-blue-500/20 text-blue-300 font-bold">LOKAL</span>' : ''}
          </div>
        </td>
        <td class="py-2.5 px-3 text-slate-400 font-mono text-[10px] uppercase hidden sm:table-cell">
          ${item.type}
        </td>
        <td class="py-2.5 px-3 text-slate-400 font-mono text-[10px] hidden sm:table-cell">
          ${item.size || '-'}
        </td>
        <td class="py-2.5 px-3 text-slate-500 font-mono text-[10px]">
          ${item.date || '-'}
        </td>
        <td class="py-2.5 px-4 text-right">
          ${isFolder ? `
            <button onclick="WorkspaceModal.openDriveFolder('${item.id}', '${escapedName}')" class="px-2.5 py-1 rounded bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white text-[10px] font-mono font-bold transition">
              Buka Folder →
            </button>
          ` : `
            <button onclick='WorkspaceModal.openFilePreview(${escapedFile})' class="px-2.5 py-1 rounded bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white text-[10px] font-mono font-bold transition">
              Pratinjau 👁️
            </button>
          `}
        </td>
      </tr>
    `;
  },

  /**
   * File Previewer (with In-App Setup Canvas for unconfigured sheets)
   */
  openFilePreview(file) {
    this.activeView = 'viewer';
    this.activeFile = file;

    // Default Full View (Layar Penuh 100vw x 100vh) untuk pratinjau berkas & spreadsheet
    this.toggleFullscreen(true);

    document.getElementById('wsExplorerContainer')?.classList.add('hidden');
    document.getElementById('wsViewerContainer')?.classList.remove('hidden');

    const titleEl = document.getElementById('wsTitle');
    const badgeEl = document.getElementById('wsStatusBadge');
    const iconEl = document.getElementById('wsIconBadge');
    const extLink = document.getElementById('wsExternalLink');
    const viewerDocName = document.getElementById('wsViewerDocName');
    const viewerExtBtn = document.getElementById('wsViewerExternalBtn');
    const switches = document.getElementById('wsModeSwitches');
    const footerNote = document.getElementById('wsFooterNote');
    const loader = document.getElementById('wsViewerLoading');
    const iframe = document.getElementById('wsViewerIframe');
    const viewportParent = iframe?.parentElement;

    // Remove any previous setup canvas if any
    const existingSetup = document.getElementById('wsViewerSetupCanvas');
    if (existingSetup) existingSetup.remove();

    iconEl.innerText = file.icon || '📄';
    titleEl.innerText = file.name;
    badgeEl.innerText = `${(file.type || 'FILE').toUpperCase()} IN-APP VIEWER`;
    badgeEl.className = 'eyebrow-pill active text-[9px] font-mono';
    footerNote.innerText = `Menampilkan berkas "${file.name}" secara in-app tanpa keluar ke Google.`;

    if (viewerDocName) viewerDocName.innerText = file.name;
    if (extLink) extLink.href = file.externalUrl || file.previewUrl || '#';
    if (viewerExtBtn) viewerExtBtn.href = file.externalUrl || file.previewUrl || '#';

    // 1. Auto-resolve live embed URLs for Google Sheets from Drive or configured sheet IDs
    if (file.type === 'sheet') {
      const cleanId = file.sheetId || (file.id && !file.id.startsWith('sheet_') && !file.id.startsWith('local_') ? file.id : null);
      if (cleanId) {
        if (!file.editUrl) {
          file.editUrl = `https://docs.google.com/spreadsheets/d/${cleanId}/edit?embedded=true`;
        }
        if (!file.previewUrl) {
          file.previewUrl = `https://docs.google.com/spreadsheets/d/${cleanId}/htmlembed?widget=true`;
        }
        file.isConfigured = true;
      }
    }

    // 2. A spreadsheet is ONLY unconfigured if it has NO editUrl AND NO previewUrl
    const hasSheetUrl = !!(file.editUrl || file.previewUrl);
    const isUnconfiguredSheet = file.type === 'sheet' && !hasSheetUrl;

    if (isUnconfiguredSheet) {
      if (loader) loader.classList.add('opacity-0', 'pointer-events-none');
      if (iframe) {
        iframe.classList.add('hidden');
        iframe.src = 'about:blank';
      }
      if (switches) switches.innerHTML = '';

      const targetSub = file.subEventId || this.activeSubEventId || 'safari';
      const subName = file.subEventName || targetSub.toUpperCase();

      const setupHtml = `
        <div id="wsViewerSetupCanvas" class="absolute inset-0 z-20 flex items-center justify-center p-4 sm:p-6 ws-surface-secondary overflow-y-auto">
          <div class="chassis max-w-xl w-full p-6 sm:p-8 ws-surface-primary border border-white/10 shadow-2xl relative">
            <div class="flex flex-col items-center text-center">
              <div class="w-16 h-16 rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center text-3xl mb-3 text-amber-400 shadow-lg shadow-amber-500/10">
                📊
              </div>
              <div class="flex items-center gap-2 mb-2">
                <span class="eyebrow-pill amber text-[9px] font-mono font-bold">SETUP SPREADSHEET MANDIRI</span>
                <span class="eyebrow-pill cobalt text-[9px] font-mono font-bold">${subName}</span>
              </div>
              <h3 class="text-base sm:text-xl font-extrabold text-white ws-text-title font-display mb-1.5">
                ${file.name}
              </h3>
              <p class="text-xs text-slate-300 ws-text-muted max-w-md leading-relaxed">
                Spreadsheet resmi untuk <b>${subName}</b> belum terhubung. Tautkan link Google Spreadsheet sekarang untuk live edit in-app tanpa keluar website.
              </p>
            </div>

            <!-- Tactical Input Card -->
            <div class="mt-6 space-y-4">
              <div class="bay-recessed p-4 sm:p-5 rounded-2xl border border-white/10 space-y-3.5">
                <div>
                  <div class="flex items-center justify-between mb-1.5">
                    <label class="text-[10px] font-mono font-bold text-slate-300 ws-text-title uppercase tracking-wider">
                      🔗 Link atau ID Google Sheets:
                    </label>
                    <span id="wsSetupSheetDetectBadge" class="text-[10px] font-mono text-slate-500">
                      Deteksi otomatis aktif
                    </span>
                  </div>
                  
                  <div class="flex flex-col sm:flex-row gap-2">
                    <div class="relative flex-1">
                      <input 
                        type="text" 
                        id="wsSetupSheetInput" 
                        placeholder="https://docs.google.com/spreadsheets/d/..." 
                        oninput="WorkspaceModal.onSetupSheetInput(this.value)"
                        class="w-full bay-recessed px-3.5 py-2.5 rounded-lg text-xs text-white ws-text-title border border-white/15 focus:outline-none focus:border-blue-500 font-mono placeholder:text-slate-500"
                      />
                    </div>
                    <button 
                      id="wsSetupSheetSubmitBtn"
                      onclick="WorkspaceModal.submitSetupSheetLink('${targetSub}')" 
                      class="btn-tactical py-2.5 px-5 text-xs font-bold whitespace-nowrap justify-center flex items-center gap-1.5"
                    >
                      <span>HUBUNGKAN</span>
                      <div class="btn-icon-bay">→</div>
                    </button>
                  </div>

                  <!-- Live Detection Feedback Card -->
                  <div id="wsSetupSheetFeedback" class="mt-2 text-[11px] font-mono hidden"></div>
                </div>

                <div class="flex items-center gap-3 py-1">
                  <div class="flex-1 h-px bg-white/10"></div>
                  <span class="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-bold">ATAU</span>
                  <div class="flex-1 h-px bg-white/10"></div>
                </div>

                <div>
                  <button 
                    onclick="WorkspaceModal.openAddSheetModal('${targetSub}')" 
                    class="w-full py-2.5 px-4 rounded-xl border border-dashed border-emerald-500/40 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 transition text-xs font-mono font-bold flex items-center justify-center gap-2"
                  >
                    <span>📤</span>
                    <span>Unggah Berkas Excel (.xlsx / .csv) Manual</span>
                  </button>
                </div>
              </div>

              <div class="text-[10px] font-mono text-slate-500 text-center flex items-center justify-center gap-2">
                <span>🔒 Akses terenkripsi Google Workspace</span>
                <span>•</span>
                <span>Otomatis terhubung in-app</span>
              </div>
            </div>
          </div>
        </div>
      `;
      if (viewportParent) {
        viewportParent.insertAdjacentHTML('beforeend', setupHtml);
      }
      return;
    }

    // Configured file preview: show iframe
    if (iframe) {
      iframe.classList.remove('hidden');
    }

    if (file.type === 'sheet') {
      switches.innerHTML = `
        <div class="bay-recessed p-0.5 border border-white/10 rounded-lg flex items-center">
          <button onclick="WorkspaceModal.setFileSheetMode('edit')" id="wsSheetEditBtn" class="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold transition bg-blue-600 text-white">
            ✏️ Full Editor (Menu & Toolbar)
          </button>
          <button onclick="WorkspaceModal.setFileSheetMode('preview')" id="wsSheetPrevBtn" class="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold transition text-slate-400 hover:text-white">
            👁️ Pratinjau Grid
          </button>
        </div>
      `;
    } else if (file.type === 'canva') {
      switches.innerHTML = `
        <div class="bay-recessed p-0.5 border border-white/10 rounded-lg flex items-center">
          <a href="${file.externalUrl || file.previewUrl}" target="_blank" rel="noopener noreferrer" class="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold transition bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 shadow-sm">
            <span>🎨 Buka di Canva.com</span>
            <span>↗</span>
          </a>
        </div>
      `;
    } else {
      switches.innerHTML = '';
    }

    if (loader) loader.classList.remove('opacity-0', 'pointer-events-none');

    let targetUrl = file.previewUrl;
    if (file.type === 'sheet' && file.editUrl) {
      targetUrl = file.editUrl;
    } else if (file.type === 'canva') {
      targetUrl = file.previewUrl || file.externalUrl;
    }

    if (iframe) {
      iframe.src = targetUrl;
    }
  },

  onSetupSheetInput(val) {
    const badge = document.getElementById('wsSetupSheetDetectBadge');
    const feedback = document.getElementById('wsSetupSheetFeedback');
    
    if (!val || !val.trim()) {
      if (badge) badge.innerHTML = '<span class="text-slate-500">Deteksi otomatis aktif</span>';
      if (feedback) feedback.classList.add('hidden');
      return;
    }

    const str = val.trim();
    const sheetMatch = str.match(/\/spreadsheets(?:\/u\/\d+)?\/d\/([a-zA-Z0-9-_]+)/);
    const directMatch = str.match(/\/d\/([a-zA-Z0-9-_]+)/);
    const rawMatch = /^[a-zA-Z0-9-_]{20,60}$/.test(str);

    let sheetId = null;
    if (sheetMatch) sheetId = sheetMatch[1];
    else if (directMatch) sheetId = directMatch[1];
    else if (rawMatch) sheetId = str;

    if (sheetId) {
      if (badge) badge.innerHTML = '<span class="text-emerald-400 font-bold">✓ Tautan Dikenali</span>';
      if (feedback) {
        feedback.classList.remove('hidden');
        feedback.innerHTML = `
          <div class="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-between gap-2">
            <div class="flex items-center gap-2 truncate">
              <span>✓</span>
              <span class="truncate"><b>ID Google Sheet:</b> <code class="bg-black/30 px-1 py-0.5 rounded text-[10px] text-white font-mono">${sheetId.substring(0, 16)}...</code></span>
            </div>
            <span class="text-[9px] font-mono text-emerald-300 font-bold uppercase whitespace-nowrap">Siap Dihubungkan</span>
          </div>
        `;
      }
    } else {
      if (badge) badge.innerHTML = '<span class="text-amber-400 font-bold">⚠️ Format Belum Cocok</span>';
      if (feedback) {
        feedback.classList.remove('hidden');
        feedback.innerHTML = `
          <div class="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center gap-2">
            <span>ℹ️</span>
            <span>Tempel URL lengkap dari bilah browser Google Sheets atau masukkan ID berkas.</span>
          </div>
        `;
      }
    }
  },

  async submitSetupSheetLink(subEventId) {
    const input = document.getElementById('wsSetupSheetInput');
    const btn = document.getElementById('wsSetupSheetSubmitBtn');
    const val = input?.value?.trim();
    if (!val) {
      if (typeof showToast === 'function') showToast('Mohon masukkan Link atau ID Google Spreadsheet.', 'error'); else console.warn('Mohon masukkan Link atau ID Google Spreadsheet.');
      return;
    }

    try {
      if (btn) {
        btn.disabled = true;
        btn.innerText = 'Menghubungkan...';
      }

      const res = await CE_API.addSpreadsheet({
        subEventId,
        sheetIdOrUrl: val
      });

      if (res && res.success) {
        if (typeof showToast === 'function') {
          showToast(`Spreadsheet ${subEventId.toUpperCase()} berhasil ditautkan & aktif otomatis!`, 'success');
        }
        await this.openSheet(subEventId, 'edit');
      } else {
        throw new Error(res.error || 'Gagal menautkan spreadsheet');
      }
    } catch (e) {
      alert('Gagal: ' + e.message);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<span>HUBUNGKAN</span><div class="btn-icon-bay">→</div>';
      }
    }
  },

  openLinkDriveModal(subEventId = null) {
    const dialog = document.getElementById('wsLinkDriveDialog');
    const select = document.getElementById('wsSelectDriveSub');
    const input = document.getElementById('wsInputDriveUrl');
    const badge = document.getElementById('wsDriveLinkDetectBadge');
    const feedback = document.getElementById('wsDriveLinkFeedback');
    
    const targetSub = subEventId || this.currentSubEventId || 'safari';
    if (select) select.value = targetSub;
    if (input) input.value = '';
    if (badge) badge.innerHTML = '<span class="text-slate-500">Deteksi link otomatis</span>';
    if (feedback) feedback.classList.add('hidden');

    if (dialog) {
      dialog.classList.remove('opacity-0', 'pointer-events-none');
      setTimeout(() => input?.focus(), 100);
    }
  },

  closeLinkDriveModal() {
    const dialog = document.getElementById('wsLinkDriveDialog');
    if (dialog) dialog.classList.add('opacity-0', 'pointer-events-none');
  },

  onDriveLinkInput(val) {
    const badge = document.getElementById('wsDriveLinkDetectBadge');
    const feedback = document.getElementById('wsDriveLinkFeedback');
    
    if (!val || !val.trim()) {
      if (badge) badge.innerHTML = '<span class="text-slate-500">Deteksi link otomatis</span>';
      if (feedback) feedback.classList.add('hidden');
      return;
    }

    const str = val.trim();
    const folderMatch = str.match(/\/folders\/([a-zA-Z0-9-_]{20,})/);
    const fileMatch = str.match(/\/file\/d\/([a-zA-Z0-9-_]{20,})/);
    const paramMatch = str.match(/[?&]id=([a-zA-Z0-9-_]{20,})/);
    const rawMatch = /^[a-zA-Z0-9-_]{20,60}$/.test(str);

    let detectedId = null;
    let type = 'Folder Google Drive';

    if (folderMatch) {
      detectedId = folderMatch[1];
      type = 'Folder Google Drive';
    } else if (fileMatch) {
      detectedId = fileMatch[1];
      type = 'File Google Drive';
    } else if (paramMatch) {
      detectedId = paramMatch[1];
      type = 'Google Drive Item';
    } else if (rawMatch) {
      detectedId = str;
      type = 'ID Google Drive Mentah';
    }

    if (detectedId) {
      if (badge) badge.innerHTML = '<span class="text-emerald-400 font-bold">✓ Link Valid Dikenali</span>';
      if (feedback) {
        feedback.classList.remove('hidden');
        feedback.innerHTML = `
          <div class="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-between gap-2">
            <div class="flex items-center gap-2 truncate">
              <span>✓</span>
              <span class="truncate"><b>${type}:</b> <code class="bg-black/30 px-1.5 py-0.5 rounded text-[10px] text-white font-mono">${detectedId.substring(0, 18)}...</code></span>
            </div>
            <span class="text-[9px] font-mono text-emerald-300 font-bold uppercase whitespace-nowrap">Siap Dihubungkan</span>
          </div>
        `;
      }
    } else {
      if (badge) badge.innerHTML = '<span class="text-amber-400 font-bold">⚠️ Format Belum Cocok</span>';
      if (feedback) {
        feedback.classList.remove('hidden');
        feedback.innerHTML = `
          <div class="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center gap-2">
            <span>ℹ️</span>
            <span>Tempel URL folder lengkap Google Drive (drive.google.com/drive/folders/...)</span>
          </div>
        `;
      }
    }
  },

  async submitLinkDrive() {
    const subSelect = document.getElementById('wsSelectDriveSub');
    const urlInput = document.getElementById('wsInputDriveUrl');
    const btn = document.getElementById('wsSubmitLinkDriveBtn');
    
    const subEventId = subSelect ? subSelect.value : (this.currentSubEventId || 'safari');
    const urlOrId = urlInput ? urlInput.value.trim() : '';

    if (!urlOrId) {
      if (typeof showToast === 'function') showToast('Masukkan link atau ID Google Drive terlebih dahulu!', 'error'); else console.warn('Masukkan link atau ID Google Drive terlebih dahulu!');
      return;
    }

    try {
      if (btn) {
        btn.disabled = true;
        btn.innerText = 'Menghubungkan...';
      }

      const res = await CE_API.linkSubEventDrive(subEventId, urlOrId);
      if (res && res.success) {
        this.closeLinkDriveModal();
        if (typeof showToast === 'function') {
          showToast(`Google Drive ${subEventId.toUpperCase()} berhasil dihubungkan & disinkronkan!`, 'success');
        }
        await this.openDriveForSubEvent(subEventId);
      } else {
        throw new Error(res.error || 'Gagal menautkan Google Drive');
      }
    } catch (err) {
      if (typeof showToast === 'function') showToast(`Error: ${err.message}`, 'error'); else console.warn(`Error: ${err.message}`);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<span>HUBUNGKAN SEKARANG</span><div class="btn-icon-bay">✓</div>';
      }
    }
  },

  setFileSheetMode(mode) {
    if (!this.activeFile) return;
    const iframe = document.getElementById('wsViewerIframe');
    const loader = document.getElementById('wsViewerLoading');
    const editBtn = document.getElementById('wsSheetEditBtn');
    const prevBtn = document.getElementById('wsSheetPrevBtn');

    if (loader) loader.classList.remove('opacity-0', 'pointer-events-none');

    if (mode === 'edit') {
      if (editBtn) editBtn.className = 'px-2.5 py-1 rounded-md text-[10px] font-mono font-bold transition bg-blue-600 text-white';
      if (prevBtn) prevBtn.className = 'px-2.5 py-1 rounded-md text-[10px] font-mono font-bold transition text-slate-400 hover:text-white';
      if (iframe) iframe.src = this.activeFile.editUrl || `https://docs.google.com/spreadsheets/d/${this.activeFile.id}/edit?embedded=true`;
    } else {
      if (editBtn) editBtn.className = 'px-2.5 py-1 rounded-md text-[10px] font-mono font-bold transition text-slate-400 hover:text-white';
      if (prevBtn) prevBtn.className = 'px-2.5 py-1 rounded-md text-[10px] font-mono font-bold transition bg-blue-600 text-white';
      if (iframe) iframe.src = this.activeFile.previewUrl || `https://drive.google.com/file/d/${this.activeFile.id}/preview`;
    }
  },

  closeFilePreview() {
    this.activeView = 'explorer';
    this.activeFile = null;

    const iframe = document.getElementById('wsViewerIframe');
    if (iframe) iframe.src = 'about:blank';

    const existingSetup = document.getElementById('wsViewerSetupCanvas');
    if (existingSetup) existingSetup.remove();

    document.getElementById('wsViewerContainer')?.classList.add('hidden');
    document.getElementById('wsExplorerContainer')?.classList.remove('hidden');
    document.getElementById('wsSheetSelectorBar')?.classList.add('hidden');

    const titleEl = document.getElementById('wsTitle');
    const badgeEl = document.getElementById('wsStatusBadge');
    const iconEl = document.getElementById('wsIconBadge');
    const switches = document.getElementById('wsModeSwitches');
    const footerNote = document.getElementById('wsFooterNote');

    iconEl.innerText = '📁';
    titleEl.innerText = this.currentFolderName || 'Official Central Event Drive';
    badgeEl.innerText = 'GDRIVE IN-APP EXPLORER';
    badgeEl.className = 'eyebrow-pill cobalt text-[9px] font-mono';
    footerNote.innerText = 'Jelajahi berkas resmi acara tanpa keluar dari website.';
    switches.innerHTML = '';
  },

  /**
   * Open Spreadsheet Hub & Selector (Mandiri per Sub-Divisi & Full Screen Default)
   */
  async openSheet(targetSubOrId = 'safari', mode = 'edit') {
    this.injectModal();
    this.sheetMode = mode;
    this.activeView = 'sheet';

    // 1. DEFAULT FULL SCREEN: 100vw x 100vh for maximum spreadsheet editing immersion!
    this.toggleFullscreen(true);
    this.showModal();

    // 2. Resolve sub-divisi target & enforce role isolation
    const isCore = typeof Onboarding !== 'undefined' && typeof Onboarding.isCoreStaff === 'function' ? Onboarding.isCoreStaff() : true;
    let targetSub = targetSubOrId;
    if (!isCore && typeof Onboarding !== 'undefined') {
      const myEvent = Onboarding.getProfile().assignedEvent;
      if (myEvent && myEvent !== 'all') {
        targetSub = myEvent;
      }
    }

    if (targetSub && targetSub.startsWith('sheet_')) {
      const parts = targetSub.replace('sheet_', '').split('_');
      targetSub = parts[0] || 'safari';
    }
    this.activeSubEventId = targetSub || 'safari';

    // Fetch spreadsheets for this sub-divisi specifically
    try {
      const res = await CE_API.getSpreadsheets(this.activeSubEventId);
      if (res && res.success && res.sheets && res.sheets.length > 0) {
        this.availableSheets = res.sheets;
      }
    } catch (err) {
      console.warn('Could not load spreadsheet list:', err.message);
    }

    // Find requested sheet or primary configured sheet for this sub-divisi specifically
    let selectedSheet = this.availableSheets.find(s => s.id === targetSubOrId || s.sheetId === targetSubOrId)
      || this.availableSheets.find(s => s.subEventId === this.activeSubEventId && s.isConfigured)
      || this.availableSheets.find(s => s.subEventId === this.activeSubEventId)
      || {
        id: `sheet_${this.activeSubEventId}`,
        name: `Master Spreadsheet ${this.activeSubEventId === 'safari' ? 'Safari Faculty' : this.activeSubEventId === 'startpoint' ? 'Start Point' : this.activeSubEventId === 'odl' ? 'One Day Lecture' : this.activeSubEventId === 'technocraft' ? 'Technocraft' : 'Central Event'}`,
        subEventId: this.activeSubEventId,
        subEventName: this.activeSubEventId === 'safari' ? 'Safari Faculty' : this.activeSubEventId === 'startpoint' ? 'Start Point' : this.activeSubEventId === 'odl' ? 'One Day Lecture' : this.activeSubEventId === 'technocraft' ? 'Technocraft' : 'Central Event',
        icon: this.activeSubEventId === 'safari' ? '🏛️' : this.activeSubEventId === 'odl' ? '🎓' : '📊',
        isConfigured: false
      };

    this.activeSheetId = selectedSheet.id;
    this.renderSheetSelector();

    const sheetFile = {
      id: selectedSheet.sheetId || selectedSheet.id,
      name: selectedSheet.name,
      subEventId: selectedSheet.subEventId || this.activeSubEventId,
      subEventName: selectedSheet.subEventName,
      isConfigured: !!selectedSheet.isConfigured,
      type: 'sheet',
      icon: selectedSheet.icon || '📊',
      previewUrl: selectedSheet.previewUrl,
      editUrl: selectedSheet.editUrl,
      externalUrl: selectedSheet.externalUrl
    };

    this.openFilePreview(sheetFile);

    const titleEl = document.getElementById('wsTitle');
    const badgeEl = document.getElementById('wsStatusBadge');
    const footerNote = document.getElementById('wsFooterNote');
    if (titleEl) titleEl.innerText = sheetFile.name;
    if (badgeEl) badgeEl.innerText = `${(sheetFile.subEventName || this.activeSubEventId).toUpperCase()} SPREADSHEET`;
    if (footerNote) footerNote.innerText = `Menampilkan spreadsheet resmi ${sheetFile.subEventName || this.activeSubEventId} secara mandiri & full screen.`;
  },

  openSheetForSubEvent(subEventId) {
    this.openSheet(subEventId, 'edit');
  },

  openSheetBank(subEventId) {
    if (typeof SpreadsheetHub !== 'undefined') {
      SpreadsheetHub.openExplorer('sheets', subEventId);
    } else {
      this.openSheet(subEventId);
    }
  },

  openCanvaBank(subEventId) {
    if (typeof SpreadsheetHub !== 'undefined') {
      SpreadsheetHub.openExplorer('canva', subEventId);
    } else {
      window.location.href = '/safari.html#canva';
    }
  },

  /**
   * Open Canva Modal / Viewer (Fullscreen In-App or Direct Launcher)
   */
  openCanva(canvaLinkOrUrl, customTitle) {
    this.injectModal();
    this.activeView = 'canva';
    this.toggleFullscreen(true);
    this.showModal();

    let url = typeof canvaLinkOrUrl === 'string' ? canvaLinkOrUrl : (canvaLinkOrUrl?.url || canvaLinkOrUrl?.embedUrl);
    let title = customTitle || (typeof canvaLinkOrUrl === 'object' ? canvaLinkOrUrl.name : 'Desain Visual Canva');
    let category = typeof canvaLinkOrUrl === 'object' ? (canvaLinkOrUrl.category || 'Desain Visual') : 'Desain Visual';

    let embedUrl = url;
    if (embedUrl && embedUrl.includes('canva.com/design/') && !embedUrl.includes('view?embed')) {
      embedUrl = embedUrl.replace(/\/edit.*$/, '').replace(/\/view.*$/, '') + '/view?embed';
    }

    const canvaFile = {
      id: 'canva_' + Date.now(),
      name: title,
      subEventName: category,
      type: 'canva',
      icon: '🎨',
      previewUrl: embedUrl || url,
      editUrl: url,
      externalUrl: url,
      isConfigured: true
    };

    this.openFilePreview(canvaFile);
  },

  renderSheetSelector() {
    const container = document.getElementById('wsSheetSelectorBar');
    if (!container) return;

    container.classList.remove('hidden');
    container.classList.add('flex');

    const isCore = typeof Onboarding !== 'undefined' && typeof Onboarding.isCoreStaff === 'function' ? Onboarding.isCoreStaff() : true;

    // Supervisor Sub-Divisi Switcher (Only visible to Staff Ahli / Pengawas)
    let supervisorSwitcher = '';
    if (isCore) {
      const subList = [
        { id: 'safari', label: 'SF', icon: '🏛️' },
        { id: 'startpoint', label: 'SP', icon: '🚀' },
        { id: 'odl', label: 'ODL', icon: '🎓' },
        { id: 'technocraft', label: 'TC', icon: '⚡' }
      ];
      supervisorSwitcher = `
        <div class="bay-recessed p-0.5 rounded-lg border border-amber-500/30 flex items-center gap-0.5 mr-2">
          <span class="text-[9px] font-mono text-amber-400 font-bold px-1.5 hidden md:inline">👑 STAFF AHLI:</span>
          ${subList.map(s => {
            const isCur = s.id === this.activeSubEventId;
            return `
              <button onclick="WorkspaceModal.openSheet('${s.id}')" title="Buka Spreadsheet ${s.label}" class="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold transition ${isCur ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white'}">
                <span>${s.icon} ${s.label}</span>
              </button>
            `;
          }).join('')}
        </div>
      `;
    }

    // Pills for the active sub-divisi's sheets
    const pills = this.availableSheets.map(s => {
      const isActive = s.id === this.activeSheetId;
      const activeClass = isActive 
        ? 'bg-blue-600 text-white font-bold border-blue-500 shadow-sm' 
        : 'text-slate-400 hover:text-white bay-recessed border-white/5';

      return `
        <button onclick="WorkspaceModal.switchSheet('${s.id}')" class="px-2.5 py-1 rounded-lg text-[10px] font-mono border transition flex items-center gap-1.5 flex-shrink-0 ${activeClass}">
          <span>${s.icon || '📊'}</span>
          <span class="truncate max-w-[140px]">${s.name}</span>
          ${!s.isConfigured ? '<span class="text-[8px] text-amber-400 ml-1 font-mono">(Setup)</span>' : ''}
        </button>
      `;
    }).join('');

    const addBtn = `
      <button onclick="WorkspaceModal.openAddSheetModal('${this.activeSubEventId}')" class="px-2 py-1 rounded-lg text-[10px] font-mono font-bold bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600 hover:text-white transition flex items-center gap-1 flex-shrink-0">
        <span>➕</span>
        <span>Tambah Sheet</span>
      </button>
    `;

    container.innerHTML = `${supervisorSwitcher}${pills}${addBtn}`;
  },

  switchSheet(sheetId) {
    this.openSheet(sheetId, this.sheetMode);
  },

  /**
   * Upload Dialog Handler
   */
  selectedUploadFile: null,

  openUploadModal() {
    const dialog = document.getElementById('wsUploadDialog');
    const targetLabel = document.getElementById('wsUploadTargetFolder');
    const fileLabel = document.getElementById('wsSelectedFileName');
    const submitBtn = document.getElementById('wsSubmitUploadBtn');
    const progressBox = document.getElementById('wsUploadProgressBox');

    if (targetLabel) targetLabel.innerText = `Target Folder: ${this.currentFolderName}`;
    if (fileLabel) fileLabel.innerText = 'Pilih berkas dari perangkatmu';
    if (submitBtn) submitBtn.disabled = true;
    if (progressBox) progressBox.classList.add('hidden');
    this.selectedUploadFile = null;

    if (dialog) {
      dialog.classList.remove('opacity-0', 'pointer-events-none');
    }
  },

  closeUploadModal() {
    const dialog = document.getElementById('wsUploadDialog');
    if (dialog) {
      dialog.classList.add('opacity-0', 'pointer-events-none');
    }
    this.selectedUploadFile = null;
  },

  onFileSelected(files) {
    if (!files || files.length === 0) return;
    const file = files[0];
    this.selectedUploadFile = file;

    const fileLabel = document.getElementById('wsSelectedFileName');
    const submitBtn = document.getElementById('wsSubmitUploadBtn');

    if (fileLabel) {
      const sizeStr = (file.size / 1024).toFixed(1) + ' KB';
      fileLabel.innerText = `📄 ${file.name} (${sizeStr})`;
    }
    if (submitBtn) submitBtn.disabled = false;
  },

  async submitUpload() {
    if (!this.selectedUploadFile) return;

    const file = this.selectedUploadFile;
    const submitBtn = document.getElementById('wsSubmitUploadBtn');
    const progressBox = document.getElementById('wsUploadProgressBox');
    const progressBar = document.getElementById('wsUploadBar');
    const progressPct = document.getElementById('wsUploadPct');

    if (submitBtn) submitBtn.disabled = true;
    if (progressBox) progressBox.classList.remove('hidden');
    if (progressBar) progressBar.style.width = '30%';
    if (progressPct) progressPct.innerText = '30%';

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        if (progressBar) progressBar.style.width = '70%';
        if (progressPct) progressPct.innerText = '70%';

        const base64Data = e.target.result;
        const res = await CE_API.uploadDriveFile({
          folderId: this.currentFolderId,
          folderName: this.currentFolderName,
          fileName: file.name,
          fileData: base64Data,
          fileType: file.type
        });

        if (progressBar) progressBar.style.width = '100%';
        if (progressPct) progressPct.innerText = '100%';

        if (res && res.success) {
          if (typeof showToast === 'function') {
            showToast(`Berkas "${file.name}" berhasil diunggah!`, 'success');
          }
          this.closeUploadModal();
          this.refreshCurrentFolder();
        } else {
          throw new Error(res.error || 'Gagal mengunggah berkas');
        }
      } catch (err) {
        console.error('Upload error:', err);
        alert('Gagal mengunggah berkas: ' + err.message);
        if (submitBtn) submitBtn.disabled = false;
        if (progressBox) progressBox.classList.add('hidden');
      }
    };

    reader.onerror = () => {
      if (typeof showToast === 'function') showToast('Gagal membaca berkas dari sistem.', 'error'); else console.warn('Gagal membaca berkas dari sistem.');
      if (submitBtn) submitBtn.disabled = false;
    };

    reader.readAsDataURL(file);
  },

  /**
   * Add Spreadsheet Modal
   */
  openAddSheetModal(preselectedSubEvent = null) {
    const dialog = document.getElementById('wsAddSheetDialog');
    const subSelect = document.getElementById('wsSelectSheetSub');
    if (subSelect && preselectedSubEvent) {
      subSelect.value = preselectedSubEvent;
    }
    if (dialog) {
      dialog.classList.remove('opacity-0', 'pointer-events-none');
    }
  },

  closeAddSheetModal() {
    const dialog = document.getElementById('wsAddSheetDialog');
    if (dialog) {
      dialog.classList.add('opacity-0', 'pointer-events-none');
    }
  },

  async submitAddSheet() {
    const nameInput = document.getElementById('wsInputSheetName');
    const subSelect = document.getElementById('wsSelectSheetSub');
    const urlInput = document.getElementById('wsInputSheetUrl');

    const name = nameInput?.value?.trim();
    const subEventId = subSelect?.value || 'all';
    const sheetUrl = urlInput?.value?.trim();

    if (!sheetUrl) {
      if (typeof showToast === 'function') showToast('Mohon masukkan Link atau ID Google Spreadsheet.', 'error'); else console.warn('Mohon masukkan Link atau ID Google Spreadsheet.');
      return;
    }

    try {
      const res = await CE_API.addSpreadsheet({
        name: name || undefined,
        sheetIdOrUrl: sheetUrl,
        subEventId
      });

      if (res && res.success) {
        if (typeof showToast === 'function') {
          showToast(`Spreadsheet "${res.sheet.name}" berhasil ditautkan!`, 'success');
        }
        this.closeAddSheetModal();
        this.openSheet(res.sheet.id, 'edit');
      } else {
        throw new Error(res.error || 'Gagal menambahkan spreadsheet');
      }
    } catch (err) {
      alert('Gagal: ' + err.message);
    }
  },

  onViewerLoaded() {
    const loader = document.getElementById('wsViewerLoading');
    if (loader) {
      setTimeout(() => {
        loader.classList.add('opacity-0', 'pointer-events-none');
      }, 300);
    }
  },

  onSearch(query) {
    this.searchQuery = query;
    this.renderItems();
  },

  setLayout(layout) {
    this.driveLayout = layout;
    const gridBtn = document.getElementById('wsGridBtn');
    const tableBtn = document.getElementById('wsTableBtn');
    if (layout === 'grid') {
      if (gridBtn) gridBtn.className = 'px-2 py-1 rounded text-xs transition bg-blue-600 text-white font-bold';
      if (tableBtn) tableBtn.className = 'px-2 py-1 rounded text-xs transition text-slate-400 hover:text-white';
    } else {
      if (gridBtn) gridBtn.className = 'px-2 py-1 rounded text-xs transition text-slate-400 hover:text-white';
      if (tableBtn) tableBtn.className = 'px-2 py-1 rounded text-xs transition bg-blue-600 text-white font-bold';
    }
    this.renderItems();
  },

  setFilter(filter) {
    this.activeFilter = filter;
    const filterIds = ['wsFilterAll', 'wsFilterFolder', 'wsFilterSheet', 'wsFilterDoc'];
    const activeMap = { all: 'wsFilterAll', folder: 'wsFilterFolder', sheet: 'wsFilterSheet', doc: 'wsFilterDoc' };

    filterIds.forEach(id => {
      const btn = document.getElementById(id);
      if (!btn) return;
      if (id === activeMap[filter]) {
        btn.className = 'px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition bg-blue-600/20 text-blue-400 border-blue-500/40';
      } else {
        btn.className = 'px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition text-slate-400 border-transparent hover:border-white/10';
      }
    });

    this.renderItems();
  },

  copyActiveLink() {
    if (!this.activeFile) return;
    const link = this.activeFile.externalUrl || this.activeFile.previewUrl;
    navigator.clipboard.writeText(link).then(() => {
      if (typeof showToast === 'function') {
        showToast('Tautan dokumen berhasil disalin ke clipboard!', 'success');
      } else {
        alert('Tautan disalin: ' + link);
      }
    }).catch(() => {
      prompt('Salin tautan dokumen:', link);
    });
  },

  showModal() {
    const modal = document.getElementById('workspaceModal');
    const chassis = document.getElementById('workspaceChassis');
    if (modal) {
      modal.classList.remove('opacity-0', 'pointer-events-none');
    }
    if (chassis) {
      chassis.classList.remove('scale-[0.98]');
      chassis.classList.add('scale-100');
    }

    // Lock page background scroll so scrolling inside sheet/drive never scrolls the page
    document.body.classList.add('modal-open');
    document.documentElement.classList.add('modal-open');
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    if (typeof playChimeSound === 'function') {
      playChimeSound('chime');
    }
  },

  close() {
    const modal = document.getElementById('workspaceModal');
    const chassis = document.getElementById('workspaceChassis');
    const iframe = document.getElementById('wsViewerIframe');
    if (modal) {
      modal.classList.add('opacity-0', 'pointer-events-none');
    }
    if (chassis) {
      chassis.classList.add('scale-[0.98]');
      chassis.classList.remove('scale-100');
    }
    if (iframe) {
      iframe.src = 'about:blank';
    }

    // Restore page scroll
    document.body.classList.remove('modal-open');
    document.documentElement.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';

    this.closeUploadModal();
    this.closeAddSheetModal();
    this.activeView = null;
    this.activeFile = null;
    if (this.isFullscreen) {
      this.toggleFullscreen(false);
    }
  },

  toggleFullscreen(forceState = null) {
    this.isFullscreen = forceState !== null ? forceState : !this.isFullscreen;
    const modal = document.getElementById('workspaceModal');
    const chassis = document.getElementById('workspaceChassis');
    const icon = document.getElementById('wsFullscreenIcon');
    if (!chassis) return;

    if (this.isFullscreen) {
      if (modal) {
        modal.classList.remove('p-2', 'sm:p-4');
        modal.classList.add('p-0');
      }
      chassis.classList.remove('max-w-6xl', 'h-[92vh]', 'rounded-2xl');
      chassis.classList.add('w-screen', 'h-screen', '!max-w-none', '!rounded-none');
      if (icon) icon.innerText = '⤓';
    } else {
      if (modal) {
        modal.classList.remove('p-0');
        modal.classList.add('p-2', 'sm:p-4');
      }
      chassis.classList.add('max-w-6xl', 'h-[92vh]', 'rounded-2xl');
      chassis.classList.remove('w-screen', 'h-screen', '!max-w-none', '!rounded-none');
      if (icon) icon.innerText = '⛶';
    }
  }
};

// Expose globally
window.WorkspaceModal = WorkspaceModal;

// Auto-initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => WorkspaceModal.init());
} else {
  WorkspaceModal.init();
}
