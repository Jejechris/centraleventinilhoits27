/**
 * CENTRAL EVENT 2027 — SHARED SPREADSHEET REPOSITORY HUB
 * Menampilkan daftar spreadsheet mandiri per sub-divisi untuk diakses & diedit bersama seluruh panitia.
 */

const SpreadsheetHub = {
  currentSubEventId: 'safari',
  containerId: 'sharedSpreadsheetMount',
  sheets: [],

  subEventMap: {
    safari: { name: 'Safari Faculty', code: 'SF-01', icon: '🏛️' },
    startpoint: { name: 'Start Point', code: 'SP-02', icon: '🚀' },
    odl: { name: 'One Day Lecture', code: 'ODL-03', icon: '🎓' },
    technocraft: { name: 'Technocraft', code: 'TC-04', icon: '⚡' }
  },

  async init(subEventId = 'safari', containerId = 'sharedSpreadsheetMount') {
    this.currentSubEventId = subEventId;
    this.containerId = containerId;
    this.injectAddModal();
    await this.fetchAndRender();
  },

  async fetchAndRender() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    try {
      const res = await fetch(`/api/spreadsheets/${this.currentSubEventId}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.sheets)) {
        this.sheets = json.sheets;
      }
    } catch (e) {
      console.warn('Gagal memuat list spreadsheet:', e);
    }

    // Default fallback for Safari if empty
    if (this.currentSubEventId === 'safari' && (!this.sheets || this.sheets.length === 0)) {
      this.sheets = [{
        id: 'sheet_safari',
        sheetId: '1daAHJLSECcmeY7fnyiIeFbua2sZqTqKjOzHY69zH2O0',
        name: '00. Master Rundown & Pos Checklist Safari Faculty',
        subEventId: 'safari',
        subEventName: 'Safari Faculty',
        icon: '🏛️',
        isConfigured: true,
        isDefault: true,
        date: 'Aktif Terhubung',
        externalUrl: 'https://docs.google.com/spreadsheets/d/1daAHJLSECcmeY7fnyiIeFbua2sZqTqKjOzHY69zH2O0/edit'
      }];
    }

    this.render();
  },

  render() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    const subInfo = this.subEventMap[this.currentSubEventId] || { name: this.currentSubEventId, code: 'SUB', icon: '📊' };
    const configuredSheets = this.sheets.filter(s => s.isConfigured);

    container.innerHTML = `
      <div class="chassis-core flex flex-col justify-between h-full space-y-3.5">
        
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/5 gap-2 flex-shrink-0">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="eyebrow-pill emerald text-[9px] font-mono font-bold">● CLOUD LIVE SYNC</span>
              <span class="eyebrow-pill cobalt text-[9px] font-mono font-bold">${subInfo.code} REPOSITORY</span>
            </div>
            <h3 class="text-sm font-extrabold text-white font-display flex items-center gap-2">
              <span>📊</span> Spreadsheet & Lembar Kerja Bersama
            </h3>
            <p class="text-[11px] font-mono text-slate-300 mt-0.5">
              ${configuredSheets.length} Spreadsheet aktif terhubung untuk tim ${subInfo.name}
            </p>
          </div>

          <button onclick="SpreadsheetHub.openAddModal()" class="btn-tactical py-1.5 px-3 text-xs bg-emerald-600 hover:bg-emerald-500 font-bold self-start sm:self-auto flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition">
            <span>➕</span>
            <span>Tambah Sheet</span>
          </button>
        </div>

        <!-- Scrollable List of Spreadsheets for this sub-divisi -->
        <div class="space-y-2.5 overflow-y-auto custom-scrollbar flex-1 max-h-[280px] pr-1">
          ${configuredSheets.length === 0 ? `
            <div class="p-6 rounded-xl bay-recessed border border-dashed border-white/10 text-center space-y-2">
              <div class="text-2xl">📋</div>
              <div class="text-xs font-mono font-bold text-slate-300">Belum Ada Spreadsheet Terhubung</div>
              <p class="text-[11px] font-mono text-slate-400 max-w-xs mx-auto">
                Tautkan Google Spreadsheet tim Anda agar dapat diedit & ditinjau in-app bersama!
              </p>
              <button onclick="SpreadsheetHub.openAddModal()" class="btn-ghost py-1 px-3 text-xs text-emerald-400 border-emerald-500/30 hover:border-emerald-400 font-bold mt-2">
                + Tautkan Sekarang
              </button>
            </div>
          ` : configuredSheets.map(s => {
            const isDefault = s.isDefault || s.id === 'sheet_safari';
            return `
              <div class="bay-recessed p-3 rounded-xl border border-white/10 hover:border-emerald-500/30 transition flex flex-col justify-between gap-2.5 group">
                <div class="flex items-start justify-between gap-2">
                  <div class="flex items-start gap-2.5 min-w-0">
                    <div class="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-base text-emerald-400 flex-shrink-0 mt-0.5">
                      📊
                    </div>
                    <div class="min-w-0 flex-1">
                      <div class="flex items-center gap-1.5 mb-0.5 flex-wrap">
                        <span class="text-xs font-extrabold text-white truncate group-hover:text-emerald-300 transition">${s.name}</span>
                        ${isDefault ? '<span class="px-1.5 py-0.2 rounded text-[8px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">MASTER</span>' : '<span class="px-1.5 py-0.2 rounded text-[8px] font-mono font-bold bg-blue-400/20 text-blue-300 border border-blue-400/30">BERSAMA</span>'}
                      </div>
                      <div class="text-[10px] font-mono text-slate-400 flex items-center gap-2">
                        <span class="text-emerald-400 font-bold">● Live Sync</span>
                        <span>•</span>
                        <span>${s.date || 'Aktif'}</span>
                      </div>
                    </div>
                  </div>

                  ${!isDefault ? `
                    <button onclick="SpreadsheetHub.deleteSheet('${s.id}')" class="text-slate-500 hover:text-rose-400 p-1 text-xs" title="Hapus Spreadsheet">
                      🗑️
                    </button>
                  ` : ''}
                </div>

                <!-- Direct Actions Row -->
                <div class="flex items-center justify-end gap-1.5 pt-1 border-t border-white/5">
                  <button onclick="SpreadsheetHub.openInApp('${s.id}')" class="btn-tactical py-1 px-3 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1 shadow-sm">
                    <span>📊 Buka In-App</span>
                    <span class="text-[10px]">⛶</span>
                  </button>
                  ${s.externalUrl ? `
                    <a href="${s.externalUrl}" target="_blank" class="btn-ghost py-1 px-2.5 text-xs text-slate-300 hover:text-white font-mono flex items-center gap-1" title="Buka di Tab Baru Google">
                      <span>↗</span>
                    </a>
                  ` : ''}
                  <button onclick="SpreadsheetHub.copyLink('${s.externalUrl || ''}')" class="btn-ghost py-1 px-2 text-xs text-slate-400 hover:text-white" title="Salin Tautan">
                    📋
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Bottom Status -->
        <div class="bay-recessed p-2.5 rounded-xl border border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-400 flex-shrink-0">
          <span class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Akses Terpadu Seluruh Panitia CE
          </span>
          <span class="text-blue-400 font-bold">In-App 100% Fullscreen</span>
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

  copyLink(url) {
    if (!url) {
      alert('Tautan spreadsheet tidak tersedia');
      return;
    }
    navigator.clipboard.writeText(url)
      .then(() => {
        if (typeof showToast === 'function') showToast('Tautan Spreadsheet berhasil disalin ke clipboard!', 'success');
        else alert('Tautan tersalin ke clipboard!');
      })
      .catch(() => alert('Tautan: ' + url));
  },

  async deleteSheet(id) {
    if (!confirm('Hapus lembar kerja bersama ini dari daftar?')) return;
    try {
      const res = await fetch(`/api/spreadsheets/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        if (typeof showToast === 'function') showToast('Spreadsheet berhasil dihapus', 'info');
        await this.fetchAndRender();
      }
    } catch (e) {
      alert('Gagal menghapus spreadsheet: ' + e.message);
    }
  },

  injectAddModal() {
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
                  <span class="eyebrow-pill emerald text-[9px] font-mono">SHARED REPOSITORY</span>
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
                <input type="text" id="inputNewSheetName" placeholder="Contoh: Daftar Kontak & PIC HMD Safari" class="w-full bay-recessed px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-400 transition rounded-xl font-mono border border-white/10">
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

  openAddModal() {
    this.injectAddModal();
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
      const res = await fetch('/api/spreadsheets/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name || undefined,
          sheetIdOrUrl,
          subEventId: this.currentSubEventId,
          type: 'google'
        })
      });

      const json = await res.json();
      if (json.success) {
        if (typeof showToast === 'function') {
          showToast(`Spreadsheet "${json.sheet.name}" berhasil ditautkan untuk akses bersama!`, 'success');
        }
        this.closeAddModal();
        await this.fetchAndRender();
      } else {
        alert('Gagal: ' + (json.error || 'Periksa format tautan spreadsheet.'));
      }
    } catch (e) {
      alert('Error koneksi: ' + e.message);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerText = '💾 Tautkan & Akses Bersama';
      }
    }
  }
};

window.SpreadsheetHub = SpreadsheetHub;
