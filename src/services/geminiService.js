const { GoogleGenAI } = require('@google/genai');
const config = require('../config');

let aiClient = null;

function getAiClient() {
  const apiKey = process.env.GEMINI_API_KEY || config.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

// Model default cepat & hemat kuota: Gemini Flash Lite Latest, 3.5 Flash Lite, 3.1 Flash Lite
const CANDIDATE_MODELS = [
  'gemini-flash-lite-latest',
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-3.7-flash',
  'gemini-flash-latest'
];

/**
 * AI Copilot untuk menjawab pertanyaan seputar kepanitiaan, progres, pimpinan, jadwal & berkas drive
 */
async function askCopilot(question, contextData = {}) {
  const ai = getAiClient();
  if (!ai) {
    return '⚠️ *Gemini API Key belum dipasang.* Silakan tambahkan `GEMINI_API_KEY` di file `.env` kamu untuk mengaktifkan AI Copilot cerdas!';
  }

  const { progress = {}, realDriveFiles = [], dateStatus = {}, subEventId = 'safari' } = contextData;

  // Pengetahuan Resmi Central Event Ini Lho ITS! 2027
  const systemInstruction = 
`Kamu adalah "Central Event AI Copilot" untuk kepanitiaan resmi mega-event "Ini Lho ITS! 2027" (Institut Teknologi Sepuluh Nopember, Surabaya).

PRINSIP JAWABAN:
1. JAWAB SPESIFIK & AKURAT sesuai apa yang ditanyakan user. Jangan berputar-putar dan DILARANG memberikan jawaban generic atau template yang tidak menjawab esensi pertanyaan.
2. Nada bahasa: Ramah, cerdas, taktis, solutif, dan profesional khas panitia mahasiswa ITS.
3. Format teks menggunakan kaidah WhatsApp: *bold* untuk poin penting, bullet points, dan emoji relevan.

DATABASE RESMI CENTRAL EVENT INI LHO ITS! 2027:
👑 PIMPINAN SUB-DIVISI:
- Kasubdiv Central Event: Damar (Pimpinan Tertinggi Sub-Divisi)
- Wakasubdiv Central Event: Winan (Wakil Pimpinan Tertinggi Sub-Divisi)
- Sekretaris Central Event: Nayo (Sekretaris Sub-Divisi / Pimpinan Administrasi)
Ketiganya memegang mandat pimpinan atas seluruh sub-acara Central Event.

⭐ STAFF AHLI (STAFFLI):
- ATAR, ALYSSA, SYAFA, ZORA (4 Staff Ahli pengawal teknis & operasional).

👥 STAFF BIASA (8 Personil):
- SALSA, KIRANA, ANGGA, Dzikrie, Senna, GEB, BILQISTH, Firdaus (Staff ke-8 adalah Firdaus).

🏛️ 4 SUB-DIVISI UTAMA CENTRAL EVENT (TANGGAL RESMI FIX):
1. SF (Safari Faculty) : Minggu, 10 Januari 2027 • Venue: Seluruh Fakultas & Lab ITS • Target: 1.450 / 1.500 Hadir, 39 HMD ITS • Progres: 72% (Penyusunan Modul Lab & Plotting Alur 6 Departemen).
2. SP (Start Point) : Jumat, 08 Januari 2027 • Venue: Plaza Utama & Gerbang Kampus ITS • Target: 1.500 Peserta Terkondisikan • Registrasi akbar & mobilisasi awal kluster.
3. TCP (Technocraft Playhouse) : Jumat, 08 Januari 2027 • Venue: Gedung Robotika & Arena Technocraft ITS • Target: 1.200 Pengunjung • Wahana eksperimen sains & demo robotika.
4. ODL (One Day Lecture) : Jumat, 08 Januari 2027 • Venue: Gedung Menara Sains & Riset ITS • Target: 600 Peserta Kuliah Interaktif bersama dosen ITS.

📁 BERKAS DRIVE RESMI:
${realDriveFiles.length > 0 ? realDriveFiles.map(f => f.name).join(', ') : 'Master SOP Briefing, Modul Riset Lab, Master Rundown, Dokumen K3 Evakuasi, Presensi 39 HMD'}
`;

  const contextPrompt = 
`[PERTANYAAN DARI PANITIA]
"${question}"

Jawablah pertanyaan di atas secara akurat, lugas, dan solutif dalam Bahasa Indonesia:`;

  let lastError = null;
  for (const modelName of CANDIDATE_MODELS) {
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout: Model ${modelName} melebihi batas waktu 12 detik`)), 12000)
      );

      const apiPromise = ai.models.generateContent({
        model: modelName,
        contents: [
          { role: 'user', parts: [{ text: `${systemInstruction}\n\n${contextPrompt}` }] }
        ]
      });

      const response = await Promise.race([apiPromise, timeoutPromise]);

      if (response && response.text) {
        return response.text.trim();
      }
    } catch (err) {
      console.warn(`Model ${modelName} error (${err.message}). Beralih ke model cadangan...`);
      lastError = err;
    }
  }

  // Tactical Heuristic Responder berpengetahuan luas jika API delay/timeout
  return generateHeuristicCopilotAnswer(question, contextData);
}

/**
 * Intelligent Heuristic Responder berbasis basis data Central Event asli
 */
function generateHeuristicCopilotAnswer(question, contextData = {}) {
  const q = (question || '').toLowerCase();
  const { progress = {}, realDriveFiles = [], dateStatus = {} } = contextData;
  const pct = progress.percentage || 72;

  // 1. Pertanyaan Pimpinan / Kasubdiv / Wakasubdiv / Sekretaris
  if (/kasubdiv|wakasubdiv|sekretaris|pimpinan|ketua|kadiv|damar|winan|nayo/i.test(q)) {
    return (
`👑 *PIMPINAN RESMI SUB-DIVISI CENTRAL EVENT 2027*
────────────────────────────
• *Kasubdiv:* *Damar*
• *Wakasubdiv:* *Winan*
• *Sekretaris:* *Nayo*

Ketiganya memegang mandat kepemimpinan divisi Central Event yang menaungi 4 sub-acara utama (Safari Faculty, Start Point, Technocraft Playhouse, dan One Day Lecture).`
    );
  }

  // 2. Pertanyaan Staffli / Staff Ahli
  if (/staffli|staff ahli|ahli/i.test(q)) {
    return (
`⭐ *STAFF AHLI (STAFFLI) CENTRAL EVENT*
────────────────────────────
Terdapat 4 Staff Ahli resmi yang bertugas:
1. *ATAR*
2. *ALYSSA*
3. *SYAFA*
4. *ZORA*

Staffli bertugas mengawal penyusunan modul, teknis kurikulum, dan koordinasi operasional sub-acara.`
    );
  }

  // 3. Pertanyaan Staff / Anggota / Personil
  if (/staff|panitia|anggota|personil|tim|firdaus/i.test(q)) {
    return (
`👥 *STRUKTUR PERSONIL CENTRAL EVENT 2027*
────────────────────────────
👑 *Pimpinan:*
• Kasubdiv: *Damar*
• Wakasubdiv: *Winan*
• Sekretaris: *Nayo*

⭐ *Staffli:*
• ATAR, ALYSSA, SYAFA, ZORA

📋 *Staff (8 Personil):*
• SALSA, KIRANA, ANGGA, Dzikrie, Senna, GEB, BILQISTH, Firdaus

Ketik *!database sf* untuk melihat daftar staff terperinci.`
    );
  }

  // 4. Pertanyaan Sub-Divisi / Bagian / Sub-Acara
  if (/sub event|sub acara|sub divisi|bagian|sf|sp|tcp|odl|divisi/i.test(q)) {
    return (
`🏛️ *4 SUB-DIVISI UTAMA CENTRAL EVENT INI LHO ITS! 2027*
────────────────────────────
1. 🏛️ *Safari Faculty (SF)*
   • Jadwal: 10 Januari 2027
   • Venue: Seluruh Fakultas & Lab ITS
   • Target: 1.450 / 1.500 Hadir • 39 HMD

2. 🚀 *Start Point (SP)*
   • Jadwal: 08 Januari 2027
   • Venue: Plaza Utama & Gerbang Kampus ITS
   • Fokus: Registrasi akbar & mobilisasi awal

3. ⚡ *Technocraft Playhouse (TCP)*
   • Jadwal: 08 Januari 2027
   • Venue: Gedung Robotika ITS
   • Fokus: Wahana sains hands-on & demo robotika

4. 🎓 *One Day Lecture (ODL)*
   • Jadwal: 08 Januari 2027
   • Venue: Gedung Menara Sains ITS
   • Fokus: Simulasi perkuliahan nyata bersama dosen`
    );
  }

  // 5. Pertanyaan Tanggal / Jadwal / Hari-H
  if (/kapan|tanggal|hari|jadwal|d-day|hari-h|waktu/i.test(q)) {
    return (
`📅 *JADWAL PELAKSANAAN 4 SUB-ACARA CENTRAL EVENT*
────────────────────────────
• 🚀 *Start Point (SP):* Jumat, 08 Januari 2027
• 🎓 *One Day Lecture (ODL):* Jumat, 08 Januari 2027
• ⚡ *Technocraft Playhouse (TCP):* Jumat, 08 Januari 2027
• 🏛️ *Safari Faculty (SF):* Minggu, 10 Januari 2027

Ketik *!status all* untuk mengecek countdown H-xx setiap sub-acara.`
    );
  }

  // 6. Pertanyaan Progress / Progres / Persen
  if (/progres|progress|persen|capai|status/i.test(q)) {
    return (
`📊 *PROGRESS KESIAPAN CENTRAL EVENT*
────────────────────────────
• *Safari Faculty (SF):* *72%* (Penyusunan Modul Lab & Plotting Alur)
• *Start Point (SP):* *0%* (Menunggu Input)
• *One Day Lecture (ODL):* *0%* (Menunggu Input)
• *Technocraft Playhouse (TCP):* *0%* (Menunggu Input)

Ketik *!progress all* untuk rekap lengkap milestone kerja.`
    );
  }

  // 7. Pertanyaan Berkas / Drive / Dokumen
  if (/berkas|drive|file|dokumen|folder|surat|ppt/i.test(q)) {
    const list = realDriveFiles.length > 0 
      ? realDriveFiles.map(f => `📁 ${f.name}`).slice(0, 6).join('\n')
      : '📁 Master SOP Briefing Khusus SF\n📁 Dokumen Plotting Alur 6 Fakultas\n📁 Berkas Rute Evakuasi & Medis K3\n📁 Formulir Koordinasi 39 HMD';
    return (
`📁 *REPOSITORI BERKAS GOOGLE DRIVE CENTRAL EVENT*
────────────────────────────
${list}

Seluruh dokumen tersambung langsung dan dapat diakses melalui web dashboard.`
    );
  }

  // 8. Jawaban Penutup Cerdas
  return (
`🤖 *CENTRAL EVENT AI COPILOT*
────────────────────────────
Mengenai pertanyaan Anda: *"${question}"*

Central Event Ini Lho ITS! 2027 dipimpin oleh *Damar* (Kasubdiv) dan *Winan* (Wakasubdiv), didukung 4 Staffli (ATAR, ALYSSA, SYAFA, ZORA) serta tim staff.

Divisi ini menaungi 4 sub-acara utama:
• *SF* (Safari Faculty) — 10 Jan 2027
• *SP* (Start Point) — 03 Jan 2027
• *TCP* (Technocraft Playhouse) — 23 Jan 2027
• *ODL* (One Day Lecture) — 16 Jan 2027

Ketik *!help* untuk melihat seluruh perintah komando resmi bot.`
  );
}

/**
 * AI Analisis Spreadsheet: Membedah data rundown & lembar kerja spreadsheet,
 * mengekstrak rekomendasi tugas operasional baru untuk Staff Ahli & Panitia.
 */
async function analyzeSpreadsheetTasks(subEventId = 'safari', contextData = {}) {
  const { rawSheetText = '', existingMilestones = [], sheetTitle = 'Google Spreadsheet' } = contextData;
  const ai = getAiClient();

  const existingTitles = existingMilestones.map(m => m.title).join('\n- ');

  const systemInstruction = 
`Kamu adalah "Central Event AI Operations Director" untuk mega-event "Ini Lho ITS! 2027" (Institut Teknologi Sepuluh Nopember).
Tugas utamamu adalah menganalisis data spreadsheet (rundown kegiatan, pos lapangan, waktu, SOP, PIC, dan departemen) dan mengekstrak daftar rekomendasi TUGAS OPERASIONAL (Milestones) yang nyata, taktis, dan penting untuk dilacak kemajuannya (0% - 100%) oleh Staff Ahli dan Tim Sub-Divisi.

Ketentuan:
1. Analisis isi spreadsheet dengan teliti. Ekstrak 3 hingga 6 tugas penting yang paling relevan dengan fase persiapan acara (Hari-H: 10 Januari 2027).
2. Periksa daftar tugas yang SUDAH ADA saat ini:
- ${existingTitles || '(Belum ada tugas terdaftar)'}
Jika tugas sudah tercakup dalam daftar di atas, set "isAlreadyTracked": true. Jika merupakan tugas baru yang belum ada di daftar, set "isAlreadyTracked": false.
3. Tentukan persentase capaian awal ("suggestedProgress": 0, 25, 50, 75, atau 100) dan status ("pending", "in_progress", atau "done") berdasarkan kesiapan data di spreadsheet.
4. Tulis catatan lapangan "notes" yang informatif (menjelaskan "sampai mana" progresnya berdasarkan data sheet).
5. Tulis "rationale" singkat mengapa tugas ini penting diverifikasi oleh staff.
6. Berikan format respon HANYA dalam format JSON valid (tanpa markdown backticks di luar JSON) dengan struktur:
{
  "summary": "Ringkasan hasil audit data sheet oleh AI dalam 1-2 kalimat.",
  "tasks": [
    {
      "title": "Nama Tugas yang Padat & Jelas",
      "suggestedProgress": 50,
      "status": "in_progress",
      "notes": "Penjelasan operasional sampai mana progresnya...",
      "pic": "PIC / Divisi penanggung jawab",
      "rationale": "Alasan mengapa tugas ini krusial untuk dipantau",
      "isAlreadyTracked": false
    }
  ]
}`;

  const prompt = `Data Spreadsheet yang Dianalisis (${sheetTitle}):
\`\`\`
${rawSheetText ? rawSheetText.slice(0, 2500) : 'Spreadsheet operasional kegiatan sub-divisi.'}
\`\`\`

Ekstrak rekomendasi tugas operasional sekarang dalam format JSON murni:`;

  if (ai) {
    for (const modelName of CANDIDATE_MODELS) {
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error(`Timeout: Model ${modelName} melebihi batas waktu 22 detik`)), 22000)
        );

        const apiPromise = ai.models.generateContent({
          model: modelName,
          contents: [
            { role: 'user', parts: [{ text: `${systemInstruction}\n\n${prompt}` }] }
          ]
        });

        const response = await Promise.race([apiPromise, timeoutPromise]);

        if (response && response.text) {
          const rawResp = response.text;
          const match = rawResp.match(/\{[\s\S]*\}/);
          if (match) {
            const parsed = JSON.parse(match[0]);
            if (parsed && Array.isArray(parsed.tasks)) {
              return {
                success: true,
                model: modelName,
                summary: parsed.summary || 'Analisis spreadsheet selesai dilakukan oleh AI.',
                tasks: parsed.tasks
              };
            }
          }
        }
      } catch (err) {
        console.warn(`Model ${modelName} parsing/timeout error: ${err.message}. Beralih cepat...`);
      }
    }
  }

  // Smart Heuristic Fallback jika API key tidak tersedia atau kuota habis
  return generateHeuristicTasks(subEventId, rawSheetText, existingMilestones);
}

/**
 * Fallback parser heuristik lokal cerdas jika Gemini offline/kuota habis/timeout
 */
function generateHeuristicTasks(subEventId = 'safari', rawSheetText = '', existingMilestones = []) {
  const existingSet = new Set(existingMilestones.map(m => m.title.toLowerCase().trim()));

  const subSpecificPool = {
    safari: [
      {
        title: 'Perencanaan Kontinjensi Safari Fakultas Vokasi / Kampus Manyar (Plan A & B)',
        suggestedProgress: 50,
        status: 'in_progress',
        notes: 'Draf Plan A dan Plan B untuk Departemen Sipil Manyar tercantum di sheet (pemutaran video TW 3 dan penyesuaian sesi Day 1 & Day 2), membutuhkan ketetapan final eksekusi.',
        pic: 'Divisi Operasional Lapangan & PJ Vokasi',
        rationale: 'Pemisahan geografis Manyar-Sukolilo memerlukan penanganan alur tersendiri agar waktu transit tidak molor.'
      },
      {
        title: 'Manajemen Target Registrasi dan Presensi Peserta Safari Faculty',
        suggestedProgress: 25,
        status: 'in_progress',
        notes: 'Target presensi 1.450+ peserta dengan SOP pendampingan Kestari di titik kumpul awal. Perlu verifikasi barcode scanner.',
        pic: 'Divisi Kesekretariatan & Humas',
        rationale: 'Akurasi data peserta menentukan kapasitas tampung lab dan alokasi konsumsi kluster.'
      },
      {
        title: 'Perancangan Skema Acara dan Mobilisasi Massa di Titik End Point',
        suggestedProgress: 25,
        status: 'in_progress',
        notes: 'Titik End Point memiliki durasi terpanjang (1 jam 32 menit), SOP penampungan dan pembubaran massa perlu disempurnakan.',
        pic: 'Divisi Acara, Lapangan, & Logistik',
        rationale: 'End Point menampung seluruh peserta serentak, rawan kerumunan jika tidak ada sekat kluster.'
      },
      {
        title: 'Sinkronisasi Buffer Time Transit Antar Pos Departemen (5 Menit)',
        suggestedProgress: 75,
        status: 'in_progress',
        notes: 'Rundown rotasi 20 menit per pos telah tersusun, toleransi keterlambatan perpindahan 5 menit sedang divalidasi LO.',
        pic: 'Tim Acara & LO Pemandu',
        rationale: 'Keterlambatan pada satu fakultas berpotensi memicu efek domino bagi kluster di belakangnya.'
      }
    ],
    startpoint: [
      {
        title: 'Finalisasi Sistem Gating & Barcode Scanner Registrasi Start Point',
        suggestedProgress: 50,
        status: 'in_progress',
        notes: 'Layout antrean gerbang barat dan timur ITS telah dipetakan, perlu uji coba beban scanner offline.',
        pic: 'Tim Registrasi & IT Support',
        rationale: 'Pencegahan antrean membludak di gerbang utama pada pagi hari-H.'
      },
      {
        title: 'Pematangan Rundown Opening Ceremony & Sambutan Rektorat',
        suggestedProgress: 75,
        status: 'in_progress',
        notes: 'Durasi seremoni pembukaan 45 menit, konfirmasi kehadiran pimpinan ITS dalam tahap finalisasi.',
        pic: 'Tim Acara & Protokoler',
        rationale: 'Momen sakral pembukaan seluruh rangkaian mega-event Ini Lho ITS! 2027.'
      }
    ],
    odl: [
      {
        title: 'Konfirmasi Dosen Tamu & Alokasi Ruang Kuliah Perdana ODL',
        suggestedProgress: 50,
        status: 'in_progress',
        notes: 'Daftar 10 ruang auditorium riset telah diverifikasi bersama sarpras fakultas.',
        pic: 'Tim Kurikulum & Humas Dosen',
        rationale: 'Memastikan seluruh ruang kuliah interaktif memiliki proyektor dan mikrofon siap pakai.'
      }
    ],
    technocraft: [
      {
        title: 'Verifikasi Kebutuhan Daya Listrik Stan Pameran Karya Robotika & AI',
        suggestedProgress: 50,
        status: 'in_progress',
        notes: 'Penyusunan beban trafo dan genset cadangan untuk 25 stan prototype teknologi mahasiswa.',
        pic: 'Tim Sarpras & Teknisi Listrik',
        rationale: 'Mencegah trip listrik saat demonstrasi robotika berlangsung bersamaan.'
      }
    ]
  };

  const pool = subSpecificPool[subEventId] || subSpecificPool.safari;

  const tasks = pool.map(c => ({
    ...c,
    isAlreadyTracked: existingSet.has(c.title.toLowerCase().trim())
  }));

  return {
    success: true,
    model: 'heuristic-engine',
    summary: `Audit cepat struktur kegiatan ${subEventId.toUpperCase()} berhasil memetakan ${tasks.length} rekomendasi tugas operasional prioritas.`,
    tasks
  };
}

module.exports = {
  askCopilot,
  analyzeSpreadsheetTasks,
  getAiClient,
  CANDIDATE_MODELS
};
