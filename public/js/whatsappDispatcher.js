/**
 * INI LHO ITS! 2027 — CENTRAL EVENT MISSION CONTROL
 * WHATSAPP LIVE MISSION DISPATCHER (Fonnte Gateway Engine)
 * Features:
 * - Live Device Status & Quota Telemetry (+6282342815719)
 * - Interactive Test Message Sender (Direct Phone / Group)
 * - 1-Click Operational Presets (Delay Alert, Weather Red Plan B, Pos Check-in, Announcement)
 * - Realtime Dispatch Activity Log
 */

const WhatsAppDispatcher = {
  deviceData: null,
  isLoading: false,
  dispatchHistory: [],

  init() {
    this.injectModal();
    this.fetchStatus();
  },

  async fetchStatus() {
    try {
      const res = await fetch('/api/whatsapp/status');
      const data = await res.json();
      this.deviceData = data;
      this.updateStatusUI();
    } catch (e) {
      console.warn('Gagal memuat status WhatsApp:', e.message);
    }
  },

  injectModal() {
    if (document.getElementById('waDispatcherModal')) return;

    const modalHtml = `
      <div id="waDispatcherModal" class="fixed inset-0 z-[110] bg-[#07090E]/85 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 transition-all duration-300 opacity-0 pointer-events-none">
        
        <div id="waDispatcherChassis" class="chassis w-full max-w-4xl max-h-[92vh] flex flex-col transition-all duration-300 transform scale-[0.98] overflow-hidden rounded-2xl shadow-2xl relative border border-emerald-500/20 bg-[#0B0F17]">
          
          <!-- 1. MODAL COMMAND BAR -->
          <div class="px-4 sm:px-6 py-3.5 border-b border-white/10 flex items-center justify-between gap-3 bg-[#0D131F] flex-shrink-0 z-20">
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-bold flex items-center justify-center text-lg flex-shrink-0">
                💬
              </div>
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <span class="eyebrow-pill emerald text-[9px] font-mono tracking-wider">WHATSAPP FIELD DISPATCHER</span>
                  <span id="waStatusBadge" class="text-[10px] font-mono text-emerald-400 flex items-center gap-1 font-bold">
                    <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    ONLINE
                  </span>
                </div>
                <h3 class="text-sm sm:text-base font-extrabold text-white tracking-tight truncate mt-0.5">
                  Pusat Komando Pesan Lapangan WhatsApp
                </h3>
              </div>
            </div>

            <!-- Close & Refresh -->
            <div class="flex items-center gap-2">
              <button onclick="WhatsAppDispatcher.fetchStatus()" title="Refresh Status Perangkat" class="btn-ghost py-1 px-2.5 text-xs text-slate-300 hover:text-white">
                <span>🔄 Cek Kuota</span>
              </button>
              <button onclick="WhatsAppDispatcher.closeModal()" class="btn-ghost py-1 px-2 text-xs text-slate-400 hover:text-white">
                <span>✕</span>
              </button>
            </div>
          </div>

          <!-- 2. DEVICE TELEMETRY STRIP -->
          <div class="px-4 sm:px-6 py-3 bg-[#080C14] border-b border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div class="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
              <div class="text-[10px] font-mono text-slate-400 uppercase">Perangkat Aktif</div>
              <div id="waDeviceName" class="font-bold text-white mt-0.5 truncate">Central Event ILITS 2027</div>
            </div>
            <div class="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
              <div class="text-[10px] font-mono text-slate-400 uppercase">Nomor HP Bot</div>
              <div id="waDevicePhone" class="font-mono font-bold text-emerald-400 mt-0.5">+62 823-4281-5719</div>
            </div>
            <div class="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
              <div class="text-[10px] font-mono text-slate-400 uppercase">Sisa Kuota Pesan</div>
              <div id="waDeviceQuota" class="font-mono font-bold text-amber-300 mt-0.5">1.000 Pesan</div>
            </div>
            <div class="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
              <div class="text-[10px] font-mono text-slate-400 uppercase">Paket / Engine</div>
              <div class="font-mono text-slate-300 mt-0.5">Fonnte Cloud Gateway</div>
            </div>
          </div>

          <!-- 3. MODAL NAVIGATION TABS -->
          <div class="px-4 sm:px-6 pt-3 pb-0 flex items-center gap-2 border-b border-white/5 bg-[#0A0E18]">
            <button type="button" id="waTabBtnSend" onclick="WhatsAppDispatcher.switchTab('send')" class="px-3.5 py-2 text-xs font-mono font-bold border-b-2 border-emerald-400 text-emerald-400 transition flex items-center gap-1.5">
              <span>🚀</span>
              <span>Kirim & Broadcast</span>
            </button>
            <button type="button" id="waTabBtnBot" onclick="WhatsAppDispatcher.switchTab('bot')" class="px-3.5 py-2 text-xs font-mono font-bold border-b-2 border-transparent text-slate-400 hover:text-white transition flex items-center gap-1.5">
              <span>🤖</span>
              <span>Command Bot Grup</span>
              <span class="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 text-[9px] border border-emerald-500/30">BARU</span>
            </button>
          </div>

          <!-- 4. MODAL BODY: TAB 1 (DISPATCH CONTROLLER) -->
          <div id="waTabContentSend" class="p-4 sm:p-6 overflow-y-auto custom-scrollbar flex-1 space-y-5">
            
            <!-- Quick Template Preset Selector -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">⚡ Template Siap Pakai (1-Klik Isi Pesan):</span>
                <span class="text-[10px] font-mono text-slate-500">Klik untuk memuat format</span>
              </div>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button type="button" onclick="WhatsAppDispatcher.loadTemplate('delay')" class="p-2.5 text-left rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-300 text-xs font-bold transition flex flex-col justify-between">
                  <span class="text-sm">⏱️</span>
                  <span class="mt-1">Pemberitahuan Delay (+10m)</span>
                </button>
                <button type="button" onclick="WhatsAppDispatcher.loadTemplate('emergency')" class="p-2.5 text-left rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 text-xs font-bold transition flex flex-col justify-between">
                  <span class="text-sm">🚨</span>
                  <span class="mt-1">Weather Red (Plan B)</span>
                </button>
                <button type="button" onclick="WhatsAppDispatcher.loadTemplate('station')" class="p-2.5 text-left rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-300 text-xs font-bold transition flex flex-col justify-between">
                  <span class="text-sm">📍</span>
                  <span class="mt-1">Kesiapan Pos Lab</span>
                </button>
                <button type="button" onclick="WhatsAppDispatcher.loadTemplate('test')" class="p-2.5 text-left rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-300 text-xs font-bold transition flex flex-col justify-between">
                  <span class="text-sm">🧪</span>
                  <span class="mt-1">Tes Koneksi (Halo)</span>
                </button>
              </div>
            </div>

            <!-- Form Dispatch -->
            <div class="bay-recessed p-4 sm:p-5 rounded-2xl border border-white/5 space-y-4">
              
              <!-- Nomor Tujuan -->
              <div>
                <label class="block text-xs font-mono text-slate-300 font-bold mb-1.5 flex items-center justify-between">
                  <span>📱 NOMOR TUJUAN ATAU ID GRUP WHATSAPP:</span>
                  <span class="text-[10px] text-slate-400 font-normal">Contoh: 08123456789 atau 628123456789</span>
                </label>
                <input 
                  type="text" 
                  id="waTargetInput" 
                  placeholder="Masukkan nomor WhatsApp tujuan (misal: nomor kamu)..." 
                  class="w-full px-3.5 py-2.5 rounded-xl bg-[#070A10] border border-white/10 text-white font-mono text-sm focus:border-emerald-500 focus:outline-none transition placeholder-slate-600"
                />
              </div>

              <!-- Isi Pesan -->
              <div>
                <label class="block text-xs font-mono text-slate-300 font-bold mb-1.5 flex items-center justify-between">
                  <span>📝 ISI PESAN WHATSAPP:</span>
                  <span id="waCharCounter" class="text-[10px] font-mono text-slate-400">0 karakter</span>
                </label>
                <textarea 
                  id="waMessageInput" 
                  rows="6" 
                  placeholder="Ketik pesan yang ingin dikirim atau klik template di atas..." 
                  class="w-full px-3.5 py-2.5 rounded-xl bg-[#070A10] border border-white/10 text-white font-mono text-xs focus:border-emerald-500 focus:outline-none transition placeholder-slate-600 leading-relaxed custom-scrollbar"
                ></textarea>
                <div class="mt-1 flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>Mendukung format WhatsApp: *tebal*, _miring_, ~coret~</span>
                  <span>Dikirim atas nama: <b>Central Event ILITS 2027</b></span>
                </div>
              </div>

              <!-- Tombol Kirim -->
              <div class="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div id="waDispatchFeedback" class="text-xs font-mono text-slate-400">
                  Status: Siap mengirim pesan
                </div>
                
                <button 
                  type="button" 
                  id="waSendBtn" 
                  onclick="WhatsAppDispatcher.sendCurrentMessage()" 
                  class="btn-tactical w-full sm:w-auto px-6 py-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40"
                >
                  <span>🚀</span>
                  <span>KIRIM PESAN WHATSAPP</span>
                </button>
              </div>

            </div>

            <!-- Activity Log -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">📋 Riwayat Pengiriman Sesi Ini:</span>
                <span id="waLogCount" class="text-[10px] font-mono text-slate-500">0 Pesan Terkirim</span>
              </div>
              <div id="waLogList" class="space-y-2 max-h-36 overflow-y-auto custom-scrollbar">
                <div class="p-3 rounded-xl bg-white/[0.01] border border-white/5 text-center text-xs text-slate-500 font-mono">
                  Belum ada pesan yang dikirim pada sesi ini. Masukkan nomor tujuan di atas dan coba tes kirim!
                </div>
              </div>
            </div>

          </div>

          <!-- 5. MODAL BODY: TAB 2 (GROUP COMMAND BOT GUIDE) -->
          <div id="waTabContentBot" class="p-4 sm:p-6 overflow-y-auto custom-scrollbar flex-1 space-y-5 hidden">
            
            <div class="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-slate-300 space-y-2">
              <div class="flex items-center gap-2 font-bold text-emerald-400 text-sm">
                <span>🤖</span>
                <span>Cara Menggunakan Bot di Grup WhatsApp Panitia / LO:</span>
              </div>
              <p>Nomor bot kamu (<b>+62 823-4281-5719</b>) bisa dimasukkan ke dalam grup WhatsApp mana saja. Cukup tambahkan nomor tersebut ke grup, lalu ketik perintah dengan awalan <b>!</b> atau <b>/</b>.</p>
            </div>

            <!-- Command Matrix Grid -->
            <div>
              <div class="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2.5">
                ⚡ DAFTAR PERINTAH RESMI BOT (BISA DI GRUP / JAPRI):
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                
                <div class="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                  <div class="font-mono font-extrabold text-emerald-400">!menu / !help</div>
                  <div class="text-slate-300 font-semibold">Tampilkan Buku Panduan Perintah</div>
                  <div class="text-[11px] text-slate-500 font-mono">Menampilkan seluruh menu bot resmi yang tersedia.</div>
                </div>

                <div class="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                  <div class="font-mono font-extrabold text-blue-400">!status</div>
                  <div class="text-slate-300 font-semibold">Status Kesiapan & Hitung Mundur</div>
                  <div class="text-[11px] text-slate-500 font-mono">Menampilkan progress 72%, H-75 hari, dan pos yang siap.</div>
                </div>

                <div class="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                  <div class="font-mono font-extrabold text-cyan-400">!database [sf/odl/sp/tc]</div>
                  <div class="text-slate-300 font-semibold">Database Personil Panitia & LO</div>
                  <div class="text-[11px] text-slate-500 font-mono">Contoh: <code>!database sf</code> (Daftar Kadiv, LO & PIC).</div>
                </div>

                <div class="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                  <div class="font-mono font-extrabold text-amber-400">!rundown</div>
                  <div class="text-slate-300 font-semibold">Sesi Rundown Live & Berikutnya</div>
                  <div class="text-[11px] text-slate-500 font-mono">Membaca jadwal Google Sheets secara real-time.</div>
                </div>

                <div class="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                  <div class="font-mono font-extrabold text-purple-400">!pos</div>
                  <div class="text-slate-300 font-semibold">Cek Kesiapan 9 Pos Lapangan</div>
                  <div class="text-[11px] text-slate-500 font-mono">Daftar pos lab, stan departemen, & status standby.</div>
                </div>

                <div class="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                  <div class="font-mono font-extrabold text-emerald-300">!ready [id_pos]</div>
                  <div class="text-slate-300 font-semibold">Check-in Pos Lapangan oleh LO</div>
                  <div class="text-[11px] text-slate-500 font-mono">Contoh: <code>!ready dept1</code> (Langsung centang hijau di web).</div>
                </div>

                <div class="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                  <div class="font-mono font-extrabold text-amber-300">!delay [menit]</div>
                  <div class="text-slate-300 font-semibold">Lapor Pergeseran Waktu Rundown</div>
                  <div class="text-[11px] text-slate-500 font-mono">Contoh: <code>!delay 10</code> (Update otomatis ke seluruh sistem).</div>
                </div>

                <div class="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                  <div class="font-mono font-extrabold text-rose-400">!planb / !hujan</div>
                  <div class="text-slate-300 font-semibold">Protokol Cuaca Hujan (Plan B)</div>
                  <div class="text-[11px] text-slate-500 font-mono">Panduan rute selasar beratap & titik evakuasi peserta.</div>
                </div>

                <div class="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                  <div class="font-mono font-extrabold text-indigo-400">!tanya [pertanyaan]</div>
                  <div class="text-slate-300 font-semibold">Tanya AI Gemini 3.5 Flash</div>
                  <div class="text-[11px] text-slate-500 font-mono">Contoh: <code>!tanya apa saja berkas di drive?</code></div>
                </div>

              </div>
            </div>

            <!-- Webhook Connection Info -->
            <div class="bay-recessed p-4 rounded-xl border border-white/5 text-xs font-mono space-y-2">
              <div class="font-bold text-white flex items-center justify-between">
                <span>🔗 WEBHOOK URL UNTUK FONNTE:</span>
                <span class="text-emerald-400 text-[10px]">ENDPOINT AKTIF</span>
              </div>
              <div class="p-2.5 rounded-lg bg-[#07090E] border border-white/10 text-emerald-400 select-all font-mono text-xs break-all">
                <code>/api/whatsapp/webhook</code>
              </div>
              <div class="text-[11px] text-slate-400 font-sans leading-relaxed">
                Di dashboard Fonnte (<code>md.fonnte.com</code>) menu <b>Device</b>, masukkan URL server kamu + <code>/api/whatsapp/webhook</code> ke kolom <b>Webhook URL</b> agar pesan grup otomatis diproses & dibalas oleh bot.
              </div>
            </div>

          </div>

        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Bind char counter
    const msgInput = document.getElementById('waMessageInput');
    if (msgInput) {
      msgInput.addEventListener('input', () => {
        const len = msgInput.value.length;
        const counter = document.getElementById('waCharCounter');
        if (counter) counter.textContent = `${len} karakter`;
      });
    }
  },

  updateStatusUI() {
    if (!this.deviceData) return;
    const { connected, deviceNumber, deviceName, quota } = this.deviceData;

    const statusBadge = document.getElementById('waStatusBadge');
    if (statusBadge) {
      if (connected) {
        statusBadge.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> ONLINE`;
        statusBadge.className = "text-[10px] font-mono text-emerald-400 flex items-center gap-1 font-bold";
      } else {
        statusBadge.innerHTML = `<span class="w-2 h-2 rounded-full bg-rose-400"></span> OFFLINE`;
        statusBadge.className = "text-[10px] font-mono text-rose-400 flex items-center gap-1 font-bold";
      }
    }

    if (deviceName && document.getElementById('waDeviceName')) {
      document.getElementById('waDeviceName').textContent = deviceName;
    }
    if (deviceNumber && document.getElementById('waDevicePhone')) {
      document.getElementById('waDevicePhone').textContent = deviceNumber.startsWith('62') ? `+${deviceNumber}` : deviceNumber;
    }
    if (quota && document.getElementById('waDeviceQuota')) {
      document.getElementById('waDeviceQuota').textContent = `${quota} Pesan`;
    }
  },

  openModal() {
    this.injectModal();
    const modal = document.getElementById('waDispatcherModal');
    const chassis = document.getElementById('waDispatcherChassis');
    if (!modal || !chassis) return;

    this.fetchStatus();
    modal.classList.remove('opacity-0', 'pointer-events-none');
    chassis.classList.remove('scale-[0.98]');
    chassis.classList.add('scale-100');

    // Auto focus target input if empty
    setTimeout(() => {
      const input = document.getElementById('waTargetInput');
      if (input && !input.value) input.focus();
    }, 150);
  },

  closeModal() {
    const modal = document.getElementById('waDispatcherModal');
    const chassis = document.getElementById('waDispatcherChassis');
    if (!modal || !chassis) return;

    modal.classList.add('opacity-0', 'pointer-events-none');
    chassis.classList.remove('scale-100');
    chassis.classList.add('scale-[0.98]');
  },

  switchTab(tab) {
    const tabSend = document.getElementById('waTabContentSend');
    const tabBot = document.getElementById('waTabContentBot');
    const btnSend = document.getElementById('waTabBtnSend');
    const btnBot = document.getElementById('waTabBtnBot');

    if (tab === 'bot') {
      if (tabSend) tabSend.classList.add('hidden');
      if (tabBot) tabBot.classList.remove('hidden');
      if (btnSend) {
        btnSend.className = "px-3.5 py-2 text-xs font-mono font-bold border-b-2 border-transparent text-slate-400 hover:text-white transition flex items-center gap-1.5";
      }
      if (btnBot) {
        btnBot.className = "px-3.5 py-2 text-xs font-mono font-bold border-b-2 border-emerald-400 text-emerald-400 transition flex items-center gap-1.5";
      }
    } else {
      if (tabSend) tabSend.classList.remove('hidden');
      if (tabBot) tabBot.classList.add('hidden');
      if (btnSend) {
        btnSend.className = "px-3.5 py-2 text-xs font-mono font-bold border-b-2 border-emerald-400 text-emerald-400 transition flex items-center gap-1.5";
      }
      if (btnBot) {
        btnBot.className = "px-3.5 py-2 text-xs font-mono font-bold border-b-2 border-transparent text-slate-400 hover:text-white transition flex items-center gap-1.5";
      }
    }
  },

  loadTemplate(type) {
    const msgInput = document.getElementById('waMessageInput');
    if (!msgInput) return;

    if (type === 'test') {
      msgInput.value = 
`🎯 *[CENTRAL EVENT INI LHO ITS! 2027]*
_Pusat Komando Operasional Acara_
────────────────────────────
Halo Rekan Panitia! 👋

Pesan ini adalah *Uji Coba Sistem WhatsApp Gateway (Fonnte)* untuk memverifikasi kesiapan komunikasi lapangan Central Event Ini Lho ITS! 2027.

Status Gateway: *ONLINE & TERVERIFIKASI* 🟢
Waktu: ${new Date().toLocaleTimeString('id-ID')} WIB

_Pesan otomatis dari Central Event Command Center_`;
    } else if (type === 'delay') {
      msgInput.value = 
`⚠️ *[CENTRAL EVENT ALERT: PERGESERAN WAKTU]*
_Ini Lho ITS! 2027 • Komando Acara Pusat_
────────────────────────────
📌 *Sub-Acara:* Safari Faculty (SF-01)
⏱️ *Pergeseran:* +10 Menit
📋 *Sesi Terkait:* Rotasi Stan Lab Departemen #2
👤 *PIC:* Korlap & LO Kluster
────────────────────────────
📢 *Instruksi Lapangan:*
Harap seluruh LO Kluster dan Penjaga Pos Departemen menyesuaikan waktu pemaparan materi agar rotasi kluster berikutnya tetap sinkron dan tidak memotong alokasi waktu ISHOMA.

_Pesan otomatis dari Central Event Command Center_`;
    } else if (type === 'emergency') {
      msgInput.value = 
`🚨 *[CENTRAL EVENT: PROTOKOL DARURAT]*
_Ini Lho ITS! 2027 • Komando Acara Pusat_
────────────────────────────
⚡ *Status:* WEATHER RED (HUJAN DERAS - PLAN B)
📍 *Area:* Selasar Fakultas Sains & Analitika Data
⏰ *Waktu:* ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
────────────────────────────
🛡️ *Instruksi Segera:*
Seluruh rombongan Safari dialihkan ke rute selasar tertutup (Plan B). Tim Logistik segera siapkan payung evakuasi di titik persimpangan.

Segera konfirmasi keselamatan rombongan ke Command Center!

_Pesan prioritas tinggi dari Central Event Command Center_`;
    } else if (type === 'station') {
      msgInput.value = 
`✅ *[CENTRAL EVENT: UPDATE KESIAPAN POS]*
_Ini Lho ITS! 2027 • Kesiapan Venue_
────────────────────────────
📍 *Pos/Fakultas:* Laboratorium Riset FTIRS
📊 *Status:* *READY / SIAP TERIMA ROMBONGAN*
👤 *PIC Pos:* LO HMD Mesin & Elektro
⏰ *Waktu Verifikasi:* ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
────────────────────────────
Pos telah terverifikasi aman & siap di Master Command Dashboard.`;
    }

    const counter = document.getElementById('waCharCounter');
    if (counter) counter.textContent = `${msgInput.value.length} karakter`;
  },

  async sendCurrentMessage() {
    const targetInput = document.getElementById('waTargetInput');
    const msgInput = document.getElementById('waMessageInput');
    const sendBtn = document.getElementById('waSendBtn');
    const feedback = document.getElementById('waDispatchFeedback');

    if (!targetInput || !msgInput) return;

    const target = targetInput.value.trim();
    const message = msgInput.value.trim();

    if (!target) {
      if (feedback) {
        feedback.innerHTML = `<span class="text-rose-400 font-bold">⚠️ Masukkan nomor WhatsApp tujuan terlebih dahulu!</span>`;
      }
      targetInput.focus();
      return;
    }

    if (!message) {
      if (feedback) {
        feedback.innerHTML = `<span class="text-rose-400 font-bold">⚠️ Isi pesan tidak boleh kosong!</span>`;
      }
      msgInput.focus();
      return;
    }

    // Set Loading state
    if (sendBtn) {
      sendBtn.disabled = true;
      sendBtn.innerHTML = `<span>⏳</span><span>MENGIRIM KE WHATSAPP...</span>`;
    }
    if (feedback) {
      feedback.innerHTML = `<span class="text-amber-400">Menghubungi Fonnte Gateway...</span>`;
    }

    try {
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target, message })
      });

      const data = await res.json();

      if (data.success) {
        if (feedback) {
          feedback.innerHTML = `<span class="text-emerald-400 font-bold">✅ Pesan BERHASIL terkirim ke WhatsApp ${target}!</span>`;
        }
        this.addLog(target, message);
        this.fetchStatus(); // update quota
      } else {
        throw new Error(data.error || 'Gagal mengirim pesan.');
      }
    } catch (err) {
      if (feedback) {
        feedback.innerHTML = `<span class="text-rose-400 font-bold">❌ Gagal: ${err.message}</span>`;
      }
    } finally {
      if (sendBtn) {
        sendBtn.disabled = false;
        sendBtn.innerHTML = `<span>🚀</span><span>KIRIM PESAN WHATSAPP</span>`;
      }
    }
  },

  addLog(target, message) {
    const logList = document.getElementById('waLogList');
    const logCount = document.getElementById('waLogCount');
    if (!logList) return;

    const time = new Date().toLocaleTimeString('id-ID');
    const snippet = message.substring(0, 60) + (message.length > 60 ? '...' : '');

    this.dispatchHistory.unshift({ target, snippet, time });

    if (logCount) {
      logCount.textContent = `${this.dispatchHistory.length} Pesan Terkirim`;
    }

    const itemsHtml = this.dispatchHistory.slice(0, 5).map(item => `
      <div class="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between text-xs font-mono">
        <div class="min-w-0 pr-3">
          <div class="flex items-center gap-2">
            <span class="text-emerald-400 font-bold">→ ${item.target}</span>
            <span class="text-[10px] text-slate-500">${item.time}</span>
          </div>
          <div class="text-[11px] text-slate-300 truncate mt-0.5">${item.snippet}</div>
        </div>
        <span class="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold flex-shrink-0">SENT</span>
      </div>
    `).join('');

    logList.innerHTML = itemsHtml;
  }
};

// Auto init on page load
if (typeof window !== 'undefined') {
  window.WhatsAppDispatcher = WhatsAppDispatcher;
  document.addEventListener('DOMContentLoaded', () => {
    WhatsAppDispatcher.init();
  });
}
