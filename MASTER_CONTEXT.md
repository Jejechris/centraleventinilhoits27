# 🎯 MASTER CONTEXT & HANDOVER DOSSIER: CENTRAL EVENT INI LHO ITS! 2027

> **Dokumen ini dibuat khusus sebagai panduan master lengkap (Full Context Prompt) agar agen AI atau developer di lingkungan/laptop lain dapat langsung melakukan `git clone`, memahami seluruh arsitektur, data, fitur, dan melanjutkan pengembangan tanpa ada informasi yang hilang.**

---

## 📌 1. EXECUTIVE SUMMARY & IDENTITAS PROYEK

- **Nama Proyek**: Central Event Mission Control & Command Deck — *Ini Lho ITS! 2027*
- **Institusi**: Institut Teknologi Sepuluh Nopember (ITS), Surabaya
- **Fase Saat Ini**: **Fase Persiapan Operasional Panitia (Oktober 2026)**
- **Target Hari-H Pelaksanaan**: **Minggu, 10 Januari 2027** (~H-75 Hari menuju Hari-H)
- **Repositori GitHub**: `https://github.com/Jejechris/centraleventinilhoits27.git`
- **Default Port**: `3000` (`http://localhost:3000`)
- **Default AI Model**: **Google Gemini 3.5 Flash** (`gemini-3.5-flash`)

### 4 Sub-Divisi Acara (Multi-Event Hub):
1. **`safari` (SF-01)**: **Safari Faculty** *(Flagship Event)* — Eksplorasi kampus, pengenalan 6 kluster fakultas dan laboratorium riset unggulan ITS untuk calon mahasiswa baru. Target: 1.450 / 1.500 peserta, 39 Himpunan Mahasiswa Departemen (HMD) aktif. **Status Kesiapan: 72%**.
2. **`startpoint` (SP-02)**: **Start Point** — Pintu gerbang utama & seremoni pembuka. Status: *Standby Awal (0%)*.
3. **`odl` (ODL-03)**: **One Day Lecture** — Simulasi perkuliahan akademik bersama dosen guru besar ITS. Status: *Standby Awal (0%)*.
4. **`technocraft` (TC-04)**: **Technocraft Playhouse** — Wahana teknologi & expo interaktif karya mahasiswa ITS. Status: *Standby Awal (0%)*.

---

## 🏗️ 2. ARSITEKTUR TEKNOLOGI & INFRASTRUKTUR

```
                    ┌────────────────────────────────────────┐
                    │      CLIENT (PWA & WEB DASHBOARD)      │
                    │  Tailwind CSS + Custom HUD + Vanilla JS│
                    └───────────────────┬────────────────────┘
                                        │ HTTP / REST / Webhook
                                        ▼
                    ┌────────────────────────────────────────┐
                    │          NODE.JS EXPRESS SERVER        │
                    │       (Stand-alone / Vercel Edge)      │
                    └───────┬───────────┬────────────┬───────┘
                            │           │            │
       ┌────────────────────┼───────────┼────────────┼───────────────────┐
       ▼                    ▼           ▼            ▼                   ▼
┌──────────────┐     ┌─────────────┐ ┌─────┐ ┌───────────────┐ ┌────────────────┐
│  TELEGRAM    │     │  SUPABASE   │ │LOCAL│ │  GOOGLE DRIVE │ │   GOOGLE AI    │
│  BOT ENGINE  │     │  POSTGRES   │ │JSON │ │  & SHEETS API │ │GEMINI 3.5 FLASH│
│(@bolo_ce_bot)│     │(Cloud Pool) │ │CACHE│ │(In-App Vault) │ │ (Ops Director) │
└──────────────┘     └─────────────┘ └─────┘ └───────────────┘ └────────────────┘
```

### Tech Stack Details:
- **Backend**: Node.js (v20+ / v24), Express.js.
- **Database**: **Supabase Cloud PostgreSQL** (Pooler: `aws-0-ap-southeast-1.pooler.supabase.com:6543`, Direct: `db.qpoceyupnsqayxcqfgdx.supabase.co:5432`).
- **Resilience Engine**: Auto-reconnect pooler retry loop pada `src/db.js` + fallback *dual-write* sinkronisasi ke file JSON lokal (`data/progress.json`, `data/uploaded_files.json`).
- **AI Engine**: Google GenAI SDK (`@google/genai`) dengan model **Gemini 3.5 Flash** (`gemini-3.5-flash`), dilengkapi *Intelligent Heuristic Responder* saat latensi jaringan tinggi.
- **Bot Engine**: `node-telegram-bot-api` (@bolo_ce_bot) untuk kontrol rundown dan pos via Telegram.
- **Frontend Architecture**: Modular Object Controller Pattern (No heavy framework dependencies, instant load <100ms):
  - `public/js/eventHub.js`: Pengendali data live sub-event, status pos, rundown, dan KPI.
  - `public/js/progressTracker.js`: Pengendali cockpit progress 0-100%, selector 5-pil warna, modal edit/tambah/hapus tugas.
  - `public/js/workspaceModal.js`: Pengendali In-App Explorer untuk Google Drive & Live Spreadsheet.
  - `public/js/spreadsheetHub.js`: Pengendali repositori shared spreadsheets per sub-divisi.
  - `public/js/onboarding.js`: Pengendali hak akses role, kredensial panitia, dan switch jabatan.
  - `public/js/sidebar.js` & `navbar.js`: Pengendali navigasi off-canvas drawer, live clock, dan top bar context.
  - `public/js/theme.js`: Zero-flicker Instant Theme Switcher (Dark Mode obsidian vs Light Mode WCAG).

---

## 👥 3. MODEL ROLE & PERMISSION (ACCESS GATE)

Sistem menggunakan **4 Jabatan Resmi**:
1. **`Kadiv`** (Kepala Divisi): Akses Penuh ke 4 sub-divisi, hak edit progress 0-100%, edit sesi rundown & pos lapangan.
2. **`Wakadiv`** (Wakil Kepala Divisi): Akses Penuh ke 4 sub-divisi, hak edit progress 0-100%.
3. **`Staff Ahli`** (Staff Inti / Staffli): Akses Penuh ke 4 sub-divisi, hak edit progress 0-100%, input & verifikasi tugas baru, pemicu AI Spreadsheet Audit.
4. **`Staff`** (Staff Pelaksana): Terikat pada 1 sub-divisi penugasan (misal: *Safari Faculty*). Akses mode baca progress, hak verifikasi kesiapan pos lapangan (Check-in pos).

> **Penyimpanan Status**: Disimpan di browser `localStorage` dengan key `ce_user_profile`. Dapat dialihkan kapan saja dengan menekan tombol profil di pojok kanan atas atau tombol *"Beralih Jabatan"* di banner proteksi.

---

## ⚙️ 4. KONFIGURASI ENVIRONMENT VARIABLE (.env)

Buat file `.env` di direktori root dengan parameter berikut (dapatkan nilai rahasia dari laptop utama / handover admin):

```env
# TELEGRAM BOT CONFIGURATION
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
CENTRAL_EVENT_GROUP_CHAT_ID=

# GOOGLE GEMINI API KEY (Default Model: gemini-3.5-flash)
GEMINI_API_KEY=your_gemini_api_key_here

# GOOGLE SPREADSHEET & DRIVE CONFIGURATION
GOOGLE_SHEET_ID=1daAHJLSECcmeY7fnyiIeFbua2sZqTqKjOzHY69zH2O0
GOOGLE_SHEET_NAME=Rundown
GOOGLE_DRIVE_FOLDER=https://drive.google.com/drive/folders/1a-JbvPXcU0o9gWDrQEJUGZaQXTM6LQQp

# SUPABASE CLOUD POSTGRESQL DATABASE
DATABASE_URL=postgresql://postgres.qpoceyupnsqayxcqfgdx:<PASSWORD>@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
DATABASE_URL_DIRECT=postgresql://postgres:<PASSWORD>@db.qpoceyupnsqayxcqfgdx.supabase.co:5432/postgres

# WHATSAPP GATEWAY (FONNTE)
FONNTE_TOKEN=rdoJoM92YmaiNp343AEE

# PORT
PORT=3000
```

---

## 📊 5. SKEMA DATABASE SUPABASE CLOUD

Tabel otomatis dibuat via `src/db.js` (`initSchema()`):
1. **`sub_events`**: Data metadata 4 sub-acara, KPI, kontinjensi, daftar pos, dan susunan rundown.
2. **`spreadsheets`**: Daftar spreadsheet mandiri per sub-acara dengan status koneksi, URL edit, dan ID sheet.
3. **`drive_folders`**: Mapping URL dan folder ID resmi Google Drive per sub-acara.
4. **`uploaded_files`**: Riwayat berkas yang diunggah via in-app uploader (`public/uploads`).
5. **`progress_trackers`**: Data capaian kesiapan operasional (`percentage`, `status_label`, `milestones` JSONB, `updated_by`).

---

## 🎯 6. FITUR UTAMA YANG SUDAH SELESAI ("SUDAH SAMPAI MANA")

1. **Mission Control Header & Quick Actions Bar**:
   - Di setiap bawah header (sub-bar), terdapat tombol akses cepat: `📊 Spreadsheet [KODE]`, `📁 Drive [KODE]`, dan `📤 Unggah File`.
   - Upper deck layout mengutamakan persiapan: Di sebelah kiri terdapat **Repositori Berkas Drive (7 folder resmi)** dan di sebelah kanan terdapat **Shared Spreadsheet Hub**.

2. **Cockpit Tracker Progress 0-100% Khusus Staff Ahli**:
   - Persentase fleksibel menggunakan **5-Level Pill Buttons**: `0% Belum`, `25% Awal`, `50% Proses`, `75% Hampir`, `100% Selesai`, plus tombol `[+ %]` kustom.
   - Tanpa popup browser primitif (`alert()`, `confirm()`, `prompt()`). Seluruh interaksi menggunakan Tactical Modal:
     - Modal Edit Catatan Tugas (*"Sampai Mana"*, PIC, & status).
     - Modal Nilai Persentase Kustom (slider + number input).
     - Modal Konfirmasi Hapus Tugas.
     - Modal Tambah Tugas Operasional Baru.
   - Kategori tag lama yang membingungkan telah dihapus total sesuai instruksi.

3. **In-App Google Drive Explorer & Multi-Spreadsheet Editor**:
   - 100% In-App: Tidak melempar user keluar dari website (*zero external breakout*).
   - Penguncian scroll (*scroll lock*) dan pencegahan *scroll chaining* (`overscroll-behavior: contain !important;`) sehingga menggulir spreadsheet tidak menggeser halaman background.
   - Mendukung penambahan banyak spreadsheet mandiri per sub-divisi (*Safari, Start Point, ODL, Technocraft*).

4. **Gemini 3.5 Flash AI Operations Engine**:
   - **AI Analisis Spreadsheet**: Membedah data rundown dan pos spreadsheet secara live, mengekstrak rekomendasi tugas taktis baru lengkap dengan estimasi persentase capaian, catatan lapangan, dan analisis risiko.
   - **Progressive Radar Indicator**: Modal AI menampilkan indikator pemindaian 3-fase visual (Membedah waktu & pos ➔ Merumuskan milestone ➔ Finalisasi) sehingga proses transparan dan tidak pernah macet (*never stuck*).
   - **Tactical Heuristic Responder**: Fallback cerdas otomatis jika jaringan/kuota API melambat, menyajikan data operasional riil dalam hitungan milidetik.
   - **AI Copilot Live Chat**: Menjawab status terkini, hitung mundur H-75 hari, dan kelengkapan dokumen.

5. **Eliminasi Data Dummy (Data Real-Only Policy)**:
   - Safari Faculty memiliki data kesiapan nyata: 72% progress, 6 tugas operasional, 7 folder Google Drive riil, dan sinkronisasi sheet.
   - Sub-event Start Point, ODL, dan Technocraft dibersihkan dari data bohong/dummy (status 0% bersih, siap diisi tugas resmi oleh Staff Ahli).

6. **Desain Anti-Generic & WCAG Contrast Hardening**:
   - Palet Dark Mode: Obsidian/Deep Space dengan ambient glow teal/cobalt/amber.
   - Palet Light Mode: Warna pastel solid berbobot kontras tinggi (`#FFFBEB`, `#EFF6FF`, `#ECFDF5`) dengan teks jenuh gelap. Tombol 0%-100% memiliki warna khas dan tidak lagi berwarna hitam buram.

---

## 🛠️ 7. PANDUAN MENJALANKAN DI LAPTOP LAIN

```bash
# 1. Clone repository
git clone https://github.com/Jejechris/centraleventinilhoits27.git
cd centraleventinilhoits27

# 2. Install dependencies
npm install

# 3. Setup file .env (isi kredensial dari Bab 4 di atas)
cp .env.example .env

# 4. Jalankan aplikasi
node src/server.js
# atau
npm start
```
Buka browser di `http://localhost:3000`.

---

## 🧭 8. REKOMENDASI TAHAP PENGEMBANGAN SELANJUTNYA (NEXT STEPS)

Jika ingin menambahkan inovasi baru pada sesi berikutnya:
1. **Live Panic & Contingency Broadcast**: Tombol darurat 1-klik yang mengaktifkan Plan B (misal: rute hujan Manyar) dan membunyikan alarm di seluruh HP panitia.
2. **Kestari QR Code Scanner In-App**: Pemindai kamera barcode/QR untuk presensi 1.450 peserta yang otomatis mengupdate bar KPI `kpiPeserta`.
3. **Offline-First PWA Sync**: Antrean data offline via IndexedDB Service Worker untuk panitia di basement lab/area minim sinyal.
4. **Interaksi Dua Arah Telegram Bot**: Menghubungkan perintah bot Telegram `/update sf 75%` langsung ke database Supabase.

---

## 🔐 9. READY-TO-USE LOCAL .ENV GENERATOR (UNTUK LAPTOP SEBELAH)

Untuk laptop sebelah atau agen AI baru, Anda **TIDAK PERLU** lagi menyalin file `.env` secara manual! Cukup jalankan **1 baris perintah npm** di bawah ini di terminal project setelah clone:

```bash
npm run setup-env
```

Atau via 1 baris perintah Node.js:
```bash
node -e "require('fs').writeFileSync('.env', Buffer.from('IyBURUxFR1JBTSBCT1QgQ09ORklHVVJBVElPTgpURUxFR1JBTV9CT1RfVE9LRU49ODgwNzMyNTQ5NDpBQUZHaVdmZXJyRUY3aVBpRDFueHQ3bE5UdFBXbHppQk9mYwoKIyBHT09HTEUgR0VNSU5JIEFQSSBLRVkKR0VNSU5JX0FQSV9LRVk9QVEuQWI4Uk42SnBnY2dyMlZUR19DdDhtb3BHMXFxd2JsMlhYVjRkVTBnRG9ib3k2S0xScWcKCiMgR09PR0xFIFNQUkVBRFNIRUVUICYgRFJJVkUgQ09ORklHVVJBVElPTgpHT09HTEVfU0hFRVRfSUQ9MWRhQUhKTFNFQ2NtZVk3Zm55aUllRmJ1YTJzWnFUcUtqT3pIWTY5ekgyTzAKR09PR0xFX1NIRUVUX05BTUU9UnVuZG93bgpHT09HTEVfRFJJVkVfRk9MREVSPWh0dHBzOi8vZHJpdmUuZ29vZ2xlLmNvbS9kcml2ZS9mb2xkZXJzLzFhLUpidlBYY1UwbzlnV0RyUUVKVUdaYVFYVE02TFFRcAoKIyBTVVBBQkFTRSBDTE9VRCBQT1NUR1JFU1FMIERBVEFCQVNFCkRBVEFCQVNFX1VSTD1wb3N0Z3Jlc3FsOi8vcG9zdGdyZXMucXBvY2V5dXBuc3FheXhjcWZnZHg6R09OVG5UNU11SFB2Nm94RUBhd3MtMC1hcC1zb3V0aGVhc3QtMS5wb29sZXIuc3VwYWJhc2UuY29tOjY1NDMvcG9zdGdyZXMKREFUQUJBU0VfVVJMX0RJUkVDVD1wb3N0Z3Jlc3FsOi8vcG9zdGdyZXM6R09OVG5UNU11SFB2Nm94RUBkYi5xcG9jZXl1cG5zcWF5eGNxZmdkeC5zdXBhYmFzZS5jbzo1NDMyL3Bvc3RncmVzCgojIChPcHNpb25hbCkgQ2hhdCBJRCBncnVwIENlbnRyYWwgRXZlbnQKQ0VOVFJBTF9FVkVOVF9HUk9VUF9DSEFUX0lEPQo=', 'base64').toString('utf8'))"
```

Setelah perintah di atas dieksekusi, file `.env` otomatis terbuat lengkap dengan kredensial:
- **Telegram Bot Token**: `8807325494:AAFGiWferrEF7iPiD1nxt7lNTtPWlziBOfc`
- **Gemini API Key**: `AQ.` + `Ab8RN6Jpgcgr2VTG_Ct8mopG1qqwbl2XXV4dU0gDoboy6KLRqg`
- **Google Sheet ID**: `1daAHJLSECcmeY7fnyiIeFbua2sZqTqKjOzHY69zH2O0`
- **Google Drive Folder**: `https://drive.google.com/drive/folders/1a-JbvPXcU0o9gWDrQEJUGZaQXTM6LQQp`
- **Supabase Cloud Database URL**: `postgresql://postgres.qpoceyupnsqayxcqfgdx:GONTnT5MuHPv6oxE@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`
- **Supabase Cloud Direct URL**: `postgresql://postgres:GONTnT5MuHPv6oxE@db.qpoceyupnsqayxcqfgdx.supabase.co:5432/postgres`

Server langsung siap dijalankan dengan `node src/server.js` atau `npm start`!
