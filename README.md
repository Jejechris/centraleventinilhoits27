# 🎯 Central Event Mission Control — Ini Lho ITS! 2027

[![Node.js](https://img.shields.io/badge/Node.js-v20%2B-green.svg)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/Database-Supabase%20PostgreSQL-3ECF8E.svg)](https://supabase.com/)
[![AI Engine](https://img.shields.io/badge/AI%20Model-Gemini%203.5%20Flash-4285F4.svg)](https://ai.google.dev/)
[![Telegram Bot](https://img.shields.io/badge/Telegram%20Bot-%40bolo__ce__bot-0088cc.svg)](https://t.me/bolo_ce_bot)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable-blueviolet.svg)](https://web.dev/progressive-web-apps/)

Sistem Komando Operasional, Pemantau Progres Kesiapan 0-100%, Repositori Berkas Google Drive In-App, Multi-Spreadsheet Live Editor, dan AI Operasional Panitia khusus untuk **Divisi Central Event Ini Lho ITS! 2027** (Institut Teknologi Sepuluh Nopember, Surabaya).

---

## ⚡ Fitur Utama Sistem

1. **Cockpit Tracker Progress 0-100% (Khusus Staff Ahli / Kadiv / Wakadiv)**:
   - Pelacak capaian tugas operasional dengan selektor 5-pil warna (`0%`, `25%`, `50%`, `75%`, `100%`, dan kustom).
   - Bebas popup browser primitif — seluruh interaksi menggunakan modal taktis modern (edit tugas, catat progres *"sampai mana"*, konfirmasi hapus, tambah tugas).
2. **Google Drive & Spreadsheet In-App Explorer**:
   - Akses dan navigasi 7 folder resmi Google Drive dan lembar kerja live spreadsheet langsung di dalam aplikasi web (*zero external breakout*).
   - Pencegahan scroll bleed (`overscroll-behavior: contain`) untuk kenyamanan penggunaan laptop maupun smartphone.
3. **Gemini 3.5 Flash Tactical AI Operations**:
   - **AI Analisis Spreadsheet**: Membedah susunan rundown dan pos di sheet, lalu mengekstrak rekomendasi milestone tugas operasional baru.
   - **Tactical Copilot Chat**: Asisten cerdas menjawab pertanyaan terkait berkas, rundown, posko, dan hitung mundur Hari-H (10 Januari 2027).
   - Dilengkapi **Intelligent Heuristic Responder** sebagai fallback cerdas berkecepatan tinggi.
4. **Cloud Database Resilience (Supabase PostgreSQL)**:
   - Terhubung dengan Supabase Cloud PostgreSQL via Connection Pooler (kompatibel penuh untuk deploy Vercel maupun server mandiri).
   - Dilengkapi *auto-reconnect retry loop* dan sinkronisasi dual-write ke cache lokal JSON.
5. **Access Gate & 4 Jabatan Panitia**:
   - Hak akses berjenjang: `Kadiv`, `Wakadiv`, `Staff Ahli` (akses penuh 4 sub-acara), dan `Staff` (terikat penugasan 1 sub-divisi).
   - Beralih jabatan instan via modal profil panitia.
6. **Multi-Sub Event Deck**:
   - `safari` (Safari Faculty - SF-01) — Kesiapan 72%, data riil 6 departemen, 39 HMD, dan 7 folder berkas resmi.
   - `startpoint` (Start Point - SP-02) — Mode siaga awal (0%).
   - `odl` (One Day Lecture - ODL-03) — Mode siaga awal (0%).
   - `technocraft` (Technocraft Playhouse - TC-04) — Mode siaga awal (0%).

---

## 🚀 Cara Menjalankan di Komputer / Laptop

### 1. Klon Repositori
```bash
git clone https://github.com/Jejechris/centraleventinilhoits27.git
cd centraleventinilhoits27
```

### 2. Instal Dependensi
```bash
npm install
```

### 3. Konfigurasi File Lingkungan (.env)
Salin `.env.example` ke `.env`:
```bash
cp .env.example .env
```
Isi konfigurasi database Supabase, token Telegram bot, dan Google Gemini API Key sesuai petunjuk di file [MASTER_CONTEXT.md](./MASTER_CONTEXT.md).

### 4. Jalankan Aplikasi
```bash
npm start
# atau
node src/server.js
```
Buka browser di **`http://localhost:3000`**.

---

## 📖 Dokumentasi Lengkap
Untuk panduan arsitektur komprehensif, skema database, rincian REST API, dan pedoman agen AI selanjutnya, baca file [MASTER_CONTEXT.md](./MASTER_CONTEXT.md).

---

*Central Event — Ini Lho ITS! 2027*  
*Institut Teknologi Sepuluh Nopember, Surabaya*
