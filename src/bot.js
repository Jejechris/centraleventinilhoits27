const { Telegraf, Markup } = require('telegraf');
const config = require('./config');
const subEventsConfig = require('./services/subEventsConfig');
const sheetsService = require('./services/sheetsService');
const progressService = require('./services/progressService');
const driveService = require('./services/driveService');
const stageCheckService = require('./services/stageCheckService');
const geminiService = require('./services/geminiService');

const bot = new Telegraf(config.BOT_TOKEN || 'DUMMY_TOKEN');

// Helper: Persistent Bottom Keyboard (1 Jempol HP)
function getMainReplyKeyboard() {
  return Markup.keyboard([
    ['⏱️ Status Sesi', '🎮 Mode Simulasi'],
    ['📋 Master Rundown', '📁 Berkas Drive'],
    ['🔄 Pilih 4 Inti Acara', '📡 Kesiapan Pos'],
    ['🚨 Kontinjensi Plan', '🤖 Tanya AI Copilot']
  ]).resize();
}

// Helper: Tampilan Utama (Home Card) yang Estetik
function getHomeContent() {
  const currentSub = subEventsConfig.getSubEvent(subEventsConfig.getActiveSubEventId());
  const dateStatus = sheetsService.getEventDateStatus(currentSub.id);
  const simTime = sheetsService.getSimulationTime();
  const delay = sheetsService.getDelay();
  const readiness = stageCheckService.getReadinessSummary(currentSub.id);

  const simBadge = simTime ? `\n🎮 <b>Mode Simulasi Aktif:</b> <code>${simTime} WIB</code>` : '';
  const delayBadge = delay > 0 ? `\n⚠️ <b>Pergeseran Waktu:</b> +${delay} Menit` : '';
  const primaryBadge = currentSub.isPrimary ? ' ⭐ <i>(Fokus Utama)</i>' : '';

  const html = 
`🎯 <b>CENTRAL EVENT COMMAND CENTER</b>
<i>Ini Lho ITS! 2027 • Divisi Acara Pusat</i>
────────────────────────────
📌 <b>Penugasan Acara:</b> <b>${currentSub.icon} ${currentSub.name}</b>${primaryBadge}
📍 <b>Venue:</b> ${currentSub.venue}
📅 <b>Tanggal:</b> ${currentSub.dateStr} (<b>H-${dateStatus.daysUntil} Hari</b>)
📡 <b>Kesiapan Pos:</b> <b>${readiness.readyCount}/${readiness.total} Pos Standby (${readiness.percentage}%)</b>
⚡ <b>AI Engine:</b> Gemini 3.5 Flash${simBadge}${delayBadge}
────────────────────────────
Pilih menu di bawah atau ketik langsung pertanyaanmu:`;

  const inlineKeyboard = Markup.inlineKeyboard([
    [
      Markup.button.callback('⏱️ Status Sesi', 'nav_session'),
      Markup.button.callback('🎮 Mode Simulasi', 'nav_simulasi')
    ],
    [
      Markup.button.callback('📋 Master Rundown', 'nav_rundown'),
      Markup.button.callback('📁 Berkas Drive (Buka di Chat)', 'nav_drive')
    ],
    [
      Markup.button.callback('🔄 Ganti Penugasan Acara', 'nav_subevents'),
      Markup.button.callback('📡 Kesiapan Pos', 'nav_stage_check')
    ],
    [
      Markup.button.url('🌐 Buka Web Command App', 'http://localhost:3000'),
      Markup.button.callback('🤖 Tanya AI Copilot', 'nav_ai_info')
    ]
  ]);

  return { html, inlineKeyboard };
}

// 1. Perintah /start dan /help
bot.start(async (ctx) => {
  const home = getHomeContent();
  await ctx.replyWithHTML(home.html, getMainReplyKeyboard());
  await ctx.replyWithHTML('💡 <i>Panel Komando Central Event:</i>', home.inlineKeyboard);
});

bot.help(async (ctx) => {
  const helpHtml = 
`📖 <b>PANDUAN OPERASIONAL CENTRAL EVENT BOT</b>
────────────────────────────
<b>4 Inti Acara Utama Central Event:</b>
1. 🚀 <b>Start Point</b>
2. 🏛️ <b>Safari Faculty</b> <i>(Fokus Utama)</i>
3. 🎓 <b>One Day Lecture</b>
4. ⚡ <b>Technocraft Playhouse</b>

<b>Perintah Cepat:</b>
• <code>/event</code> — Beralih antara 4 inti acara
• <code>/sekarang</code> — Cek sesi yang sedang berlangsung
• <code>/simulasi 07:15</code> — Uji coba rundown pada jam tertentu
• <code>/simulasioff</code> — Matikan mode simulasi
• <code>/rundown</code> — Jadwal lengkap sub-event aktif
• <code>/drive</code> atau <code>/berkas</code> — Buka & intip isi folder Drive di Telegram
• <code>/pos</code> — Check-in kesiapan pos panggung & departemen
• <code>/plan</code> — SOP kontinjensi
• <code>/ask [pertanyaan]</code> — Tanya AI Copilot seputar acara`;

  await ctx.replyWithHTML(helpHtml, Markup.inlineKeyboard([
    [Markup.button.callback('🔙 Kembali ke Menu Utama', 'nav_home')]
  ]));
});

// 2. Sub-Event Switcher Menu
bot.hears(['🔄 Pilih 4 Inti Acara', '🔄 Ganti Sub-Event'], handleSubEventsMenu);
bot.command('event', handleSubEventsMenu);

async function handleSubEventsMenu(ctx) {
  const currentSub = subEventsConfig.getSubEvent(subEventsConfig.getActiveSubEventId());
  const allSubs = subEventsConfig.getAllSubEvents();

  let text = `🔄 <b>PILIH PENUGASAN INTI ACARA CENTRAL EVENT</b>\n`;
  text += `────────────────────────────\n`;
  text += `Event yang sedang kamu pantau saat ini:\n`;
  text += `👉 <b>${currentSub.icon} ${currentSub.name}</b>\n\n`;
  text += `Pilih salah satu dari 4 inti acara resmi di bawah untuk memuat data & panggungnya:`;

  const buttons = allSubs.map(sub => {
    const isCur = sub.id === currentSub.id ? '🔘 ' : '';
    const badge = sub.isPrimary ? ' ⭐ (Utama)' : '';
    return [Markup.button.callback(`${isCur}${sub.icon} ${sub.name}${badge}`, `set_sub_${sub.id}`)];
  });

  buttons.push([Markup.button.callback('🔙 Kembali ke Menu Utama', 'nav_home')]);

  if (ctx.callbackQuery) {
    return ctx.editMessageText(text, { parse_mode: 'HTML', ...Markup.inlineKeyboard(buttons) });
  }
  return ctx.replyWithHTML(text, Markup.inlineKeyboard(buttons));
}

bot.action(/set_sub_(.+)/, async (ctx) => {
  const subId = ctx.match[1];
  const switched = subEventsConfig.setActiveSubEventId(subId);
  if (switched) {
    await ctx.answerCbQuery(`Penugasan dialihkan ke: ${switched.name}`);
  }
  const home = getHomeContent();
  return ctx.editMessageText(home.html, { parse_mode: 'HTML', ...home.inlineKeyboard });
});

// 3. Handler Status Sesi (/sekarang)
bot.hears('⏱️ Status Sesi', handleCurrentSession);
bot.command('sekarang', handleCurrentSession);

async function handleCurrentSession(ctx) {
  const currentSub = subEventsConfig.getSubEvent(subEventsConfig.getActiveSubEventId());
  const sessionData = await sheetsService.getCurrentAndNextSession(null, currentSub.id);

  if (sessionData.isBeforeEvent) {
    const text = 
`⏳ <b>STATUS: H-${sessionData.daysUntil} HARI MENUJU ${currentSub.name.toUpperCase()}</b>
────────────────────────────
📅 <b>Tanggal:</b> ${sessionData.eventDateStr}
📌 <b>Inti Acara:</b> ${currentSub.name}
🏛️ <b>Venue:</b> ${currentSub.venue}

💡 <i>Acara saat ini belum berjalan (fase persiapan panitia).</i>
Gunakan <b>Mode Simulasi</b> untuk menguji alur panggung seolah-olah hari-H:`;

    const buttons = Markup.inlineKeyboard([
      [
        Markup.button.callback('🌅 Simulasi 06:15', 'sim_06:15'),
        Markup.button.callback('🏛️ Simulasi 07:10', 'sim_07:10')
      ],
      [
        Markup.button.callback('🔄 Simulasi 08:25', 'sim_08:25'),
        Markup.button.callback('🏁 Simulasi 09:35', 'sim_09:35')
      ],
      [Markup.button.callback('📋 Buka Seluruh Rundown', 'nav_rundown')],
      [Markup.button.callback('🔙 Kembali ke Menu Utama', 'nav_home')]
    ]);

    if (ctx.callbackQuery) {
      return ctx.editMessageText(text, { parse_mode: 'HTML', ...buttons });
    }
    return ctx.replyWithHTML(text, buttons);
  }

  const { current, next, globalDelayMinutes, isSimulation, simulatedTime } = sessionData;

  const simBadge = isSimulation ? `\n🎮 <b>[MODE SIMULASI: ${simulatedTime} WIB]</b>` : '';
  const delayBadge = globalDelayMinutes > 0 ? `\n⚠️ <b>Delay Aktif:</b> +${globalDelayMinutes} Menit` : '';

  if (!current) {
    const text = 
`ℹ️ <b>BELUM ADA SESI AKTIF PADA JAM INI</b>${simBadge}
────────────────────────────
${next ? `🔜 <b>Sesi Berikutnya:</b> <code>${next.adjustedStart || next.start} WIB</code>\n📌 <b>Acara:</b> ${next.title}\n👤 <b>PIC:</b> ${next.pic}` : '🏁 <i>Seluruh rangkaian acara telah selesai.</i>'}`;

    const buttons = Markup.inlineKeyboard([
      [Markup.button.callback('⏭️ Cek Sesi Berikutnya', 'action_next_session')],
      [Markup.button.callback('🔄 Refresh Status', 'action_refresh_current')],
      [Markup.button.callback('🔙 Kembali ke Menu Utama', 'nav_home')]
    ]);

    if (ctx.callbackQuery) {
      return ctx.editMessageText(text, { parse_mode: 'HTML', ...buttons });
    }
    return ctx.replyWithHTML(text, buttons);
  }

  const startTime = current.adjustedStart || current.start;
  const endTime = current.adjustedEnd || current.end;

  const msg = 
`🟢 <b>SESI SEDANG BERLANGSUNG (${currentSub.name})</b>${simBadge}${delayBadge}
────────────────────────────
⏰ <b>Waktu:</b> <code>${startTime} - ${endTime} WIB</code>
📌 <b>Mata Acara:</b>
<b>${current.title}</b>

📍 <b>Lokasi:</b> ${current.location}
👤 <b>PIC Lapangan:</b> ${current.pic}
📝 <b>Catatan Teknis:</b> ${current.notes}
────────────────────────────
${next ? `🔜 <b>Sesi Berikutnya:</b> ${next.title} (<code>${next.adjustedStart || next.start} WIB</code>)` : '🏁 <b>Ini adalah sesi penutup!</b>'}`;

  const buttons = [
    [
      Markup.button.callback('⏭️ Sesi Selanjutnya', 'action_next_session'),
      Markup.button.callback('🔄 Refresh', 'action_refresh_current')
    ]
  ];

  if (isSimulation) {
    buttons.push([Markup.button.callback('❌ Matikan Mode Simulasi', 'sim_off')]);
  }
  buttons.push([Markup.button.callback('🔙 Kembali ke Menu Utama', 'nav_home')]);

  const inlineMarkup = Markup.inlineKeyboard(buttons);

  if (ctx.callbackQuery) {
    return ctx.editMessageText(msg, { parse_mode: 'HTML', ...inlineMarkup });
  }
  return ctx.replyWithHTML(msg, inlineMarkup);
}

// 4. Handler Mode Simulasi
bot.hears('🎮 Mode Simulasi', handleSimulationMenu);
bot.command('simulasi', async (ctx) => {
  const args = ctx.message.text.split(' ');
  const timeInput = args[1];

  if (!timeInput) {
    return handleSimulationMenu(ctx);
  }

  sheetsService.setSimulationTime(timeInput);
  await ctx.replyWithHTML(
    `🎮 <b>Mode Simulasi Aktif!</b>\nWaktu diatur ke pukul <code>${timeInput} WIB</code>.\n\nMemuat sesi aktif...`,
    Markup.inlineKeyboard([
      [Markup.button.callback('⏱️ Lihat Sesi Aktif', 'nav_session')],
      [Markup.button.callback('❌ Matikan Simulasi', 'sim_off')],
      [Markup.button.callback('🔙 Menu Utama', 'nav_home')]
    ])
  );
});

bot.command('simulasioff', async (ctx) => {
  sheetsService.setSimulationTime(null);
  await ctx.replyWithHTML('✅ <b>Mode Simulasi Dimatikan.</b> Bot kembali ke waktu real-time.', Markup.inlineKeyboard([
    [Markup.button.callback('🔙 Kembali ke Menu Utama', 'nav_home')]
  ]));
});

async function handleSimulationMenu(ctx) {
  const currentSim = sheetsService.getSimulationTime();
  const currentSub = subEventsConfig.getSubEvent(subEventsConfig.getActiveSubEventId());

  const text = 
`🎮 <b>PENGATURAN MODE SIMULASI (${currentSub.name.toUpperCase()})</b>
────────────────────────────
Status Saat Ini: <b>${currentSim ? `${currentSim} WIB (Aktif)` : 'Non-Aktif (Real-Time)'}</b>

Pilih jam simulasi di bawah:`;

  const buttons = Markup.inlineKeyboard([
    [
      Markup.button.callback('🌅 04:45 (Briefing)', 'sim_04:45'),
      Markup.button.callback('🚪 06:15 (Open Gate)', 'sim_06:15')
    ],
    [
      Markup.button.callback('🏛️ 07:10 (Sesi Awal)', 'sim_07:10'),
      Markup.button.callback('🚶 07:28 (Transisi)', 'sim_07:28')
    ],
    [
      Markup.button.callback('🏛️ 08:30 (Sesi Inti)', 'sim_08:30'),
      Markup.button.callback('🎯 09:40 (Penutupan)', 'sim_09:40')
    ],
    [
      Markup.button.callback('❌ Matikan Simulasi', 'sim_off'),
      Markup.button.callback('🔙 Menu Utama', 'nav_home')
    ]
  ]);

  if (ctx.callbackQuery) {
    return ctx.editMessageText(text, { parse_mode: 'HTML', ...buttons });
  }
  return ctx.replyWithHTML(text, buttons);
}

// 5. Handler Master Rundown
bot.hears('📋 Master Rundown', handleFullRundown);
bot.command('rundown', handleFullRundown);

async function handleFullRundown(ctx) {
  const currentSub = subEventsConfig.getSubEvent(subEventsConfig.getActiveSubEventId());
  const rundown = await sheetsService.getRundown(currentSub.id);
  const delay = sheetsService.getDelay();
  const dateStatus = sheetsService.getEventDateStatus(currentSub.id);

  let text = `📋 <b>MASTER RUNDOWN ${currentSub.name.toUpperCase()}</b>\n`;
  text += `📅 <b>Tanggal:</b> ${dateStatus.eventDateStr} (H-${dateStatus.daysUntil})\n`;
  text += `🏛️ <b>Venue:</b> ${currentSub.venue}\n`;
  
  if (delay > 0) {
    text += `⚠️ <b>Status:</b> Penyesuaian waktu <b>+${delay} Menit</b>\n`;
  } else {
    text += `✅ <b>Status:</b> Jadwal On-Time\n`;
  }
  text += `────────────────────────────\n`;

  rundown.forEach(item => {
    const s = item.adjustedStart || item.start;
    const e = item.adjustedEnd || item.end;
    let icon = '•';
    if (item.title.toLowerCase().includes('mobilisasi')) icon = '🚶';
    else if (item.title.toLowerCase().includes('open gate') || item.title.toLowerCase().includes('gate')) icon = '🚪';
    else if (item.title.toLowerCase().includes('briefing') || item.title.toLowerCase().includes('sound')) icon = '🌅';
    else if (item.title.toLowerCase().includes('end point') || item.title.toLowerCase().includes('penutupan')) icon = '🎯';
    else if (item.title.toLowerCase().includes('talkshow') || item.title.toLowerCase().includes('sambutan')) icon = '🎤';

    text += `${icon} <code>${s}-${e}</code> <b>${item.title}</b>\n`;
  });

  text += `────────────────────────────\n`;
  text += `💡 <i>Terkoneksi dengan Central Event System.</i>`;

  const buttons = Markup.inlineKeyboard([
    [
      Markup.button.callback('⏱️ Sesi Aktif', 'nav_session'),
      Markup.button.callback('📁 Berkas Drive', 'nav_drive')
    ],
    [Markup.button.callback('🔙 Kembali ke Menu Utama', 'nav_home')]
  ]);

  if (ctx.callbackQuery) {
    return ctx.editMessageText(text, { parse_mode: 'HTML', ...buttons });
  }
  return ctx.replyWithHTML(text, buttons);
}

// 6. In-Telegram Google Drive Explorer
bot.hears('📁 Berkas Drive', handleDriveVault);
bot.command('berkas', handleDriveVault);
bot.command('drive', handleDriveVault);

async function handleDriveVault(ctx) {
  if (!ctx.callbackQuery) {
    await ctx.sendChatAction('typing');
  }

  const items = await driveService.fetchRealDriveItems();

  let text = `📁 <b>GOOGLE DRIVE EXPLORER (LANGSUNG DI TELEGRAM)</b>\n`;
  text += `<i>Klik tombol folder di bawah untuk melihat isi berkas tanpa perlu keluar dari Telegram:</i>\n`;
  text += `────────────────────────────\n`;

  items.forEach((item, idx) => {
    text += `<b>${idx + 1}.</b> 📁 <b>${item.name}</b>\n`;
  });

  text += `────────────────────────────\n`;
  text += `💡 <i>Pilih folder untuk melihat isi berkas di dalamnya:</i>`;

  const buttonRows = [];
  for (let i = 0; i < items.length; i += 2) {
    const row = [];
    const item1 = items[i];
    const shortName1 = item1.name.replace(/^\d+\.\s*/, '').slice(0, 16);
    row.push(Markup.button.callback(`📂 ${shortName1}`, `view_subfolder_${item1.id}`));

    if (items[i + 1]) {
      const item2 = items[i + 1];
      const shortName2 = item2.name.replace(/^\d+\.\s*/, '').slice(0, 16);
      row.push(Markup.button.callback(`📂 ${shortName2}`, `view_subfolder_${item2.id}`));
    }
    buttonRows.push(row);
  }

  buttonRows.push([Markup.button.url('🌐 Buka Root Folder di Google Drive', config.DRIVE_LINKS.mainDriveFolder)]);
  buttonRows.push([Markup.button.callback('🔙 Kembali ke Menu Utama', 'nav_home')]);

  const inlineMarkup = Markup.inlineKeyboard(buttonRows);

  if (ctx.callbackQuery) {
    return ctx.editMessageText(text, { parse_mode: 'HTML', disable_web_page_preview: true, ...inlineMarkup });
  }
  return ctx.replyWithHTML(text, { disable_web_page_preview: true, ...inlineMarkup });
}

// Subfolder Viewer Action
bot.action(/view_subfolder_(.+)/, async (ctx) => {
  const folderId = ctx.match[1];
  await ctx.answerCbQuery('Membuka folder...');

  const allItems = await driveService.fetchRealDriveItems();
  const folder = allItems.find(f => f.id === folderId) || { name: 'Folder Terpilih', id: folderId };

  const contents = await driveService.fetchSubfolderContents(folderId, folder.name);

  let text = `📂 <b>ISI FOLDER: ${folder.name}</b>\n`;
  text += `────────────────────────────\n`;

  const buttons = [];

  if (contents.fileCount === 0) {
    text += `ℹ️ <i>Folder ini saat ini masih kosong di Google Drive (Belum ada dokumen yang diunggah).</i>\n`;
  } else {
    text += `Ditemukan <b>${contents.fileCount} dokumen</b> di dalam folder ini:\n\n`;
    contents.files.forEach((file, idx) => {
      text += `<b>${idx + 1}.</b> ${file.icon} <a href="${file.url}"><b>${file.name}</b></a>\n`;
      buttons.push([Markup.button.url(`🔗 Buka: ${file.name.slice(0, 26)}`, file.url)]);
    });
  }

  text += `────────────────────────────\n`;
  text += `💡 <i>Kamu bisa membuka dokumen di atas atau kembali ke daftar folder.</i>`;

  buttons.push([Markup.button.url('🌐 Buka Folder Ini di Drive', `https://drive.google.com/drive/folders/${folderId}`)]);
  buttons.push([Markup.button.callback('📁 Kembali ke Daftar 7 Folder', 'nav_drive')]);
  buttons.push([Markup.button.callback('🔙 Menu Utama', 'nav_home')]);

  return ctx.editMessageText(text, {
    parse_mode: 'HTML',
    disable_web_page_preview: true,
    ...Markup.inlineKeyboard(buttons)
  });
});

// 7. Kesiapan Pos Lapangan
bot.hears('📡 Kesiapan Pos', handleStageCheck);
bot.command('pos', handleStageCheck);

async function handleStageCheck(ctx) {
  const currentSub = subEventsConfig.getSubEvent(subEventsConfig.getActiveSubEventId());
  const stations = stageCheckService.getAllStations(currentSub.id);
  const readiness = stageCheckService.getReadinessSummary(currentSub.id);

  let text = `📡 <b>PANEL KESIAPAN POS: ${currentSub.name.toUpperCase()}</b>\n`;
  text += `<i>Status Kesiapan: <b>${readiness.readyCount}/${readiness.total} Pos Siap (${readiness.percentage}%)</b></i>\n`;
  text += `────────────────────────────\n`;

  stations.forEach(s => {
    const badge = s.ready ? '🟢' : '⚪';
    text += `${badge} <b>${s.name}</b>\n`;
    text += `   ├ Status: <b>${s.status}</b>\n`;
    text += `   ├ PIC: ${s.pic}\n`;
    text += `   └ Check-in: <i>${s.updatedAt}</i>\n\n`;
  });

  text += `────────────────────────────\n`;
  text += `💡 <i>Klik pos di bawah untuk check-in / toggle status kesiapan:</i>`;

  const buttons = [];
  for (let i = 0; i < stations.length; i += 2) {
    const row = [];
    const s1 = stations[i];
    const icon1 = s1.ready ? '✅' : '⚪';
    row.push(Markup.button.callback(`${icon1} ${s1.name.slice(0, 16)}`, `toggle_pos_${s1.id}`));

    if (stations[i + 1]) {
      const s2 = stations[i + 1];
      const icon2 = s2.ready ? '✅' : '⚪';
      row.push(Markup.button.callback(`${icon2} ${s2.name.slice(0, 16)}`, `toggle_pos_${s2.id}`));
    }
    buttons.push(row);
  }

  buttons.push([Markup.button.callback('🔄 Refresh Kesiapan', 'nav_stage_check')]);
  buttons.push([Markup.button.callback('🔙 Kembali ke Menu Utama', 'nav_home')]);

  const inlineMarkup = Markup.inlineKeyboard(buttons);

  if (ctx.callbackQuery) {
    return ctx.editMessageText(text, { parse_mode: 'HTML', ...inlineMarkup });
  }
  return ctx.replyWithHTML(text, inlineMarkup);
}

bot.action(/toggle_pos_(.+)/, async (ctx) => {
  const posId = ctx.match[1];
  const user = ctx.from ? `@${ctx.from.username || ctx.from.first_name}` : 'Panitia';
  const updated = stageCheckService.toggleStationReady(posId, user);
  
  if (updated) {
    await ctx.answerCbQuery(`${updated.name}: ${updated.status}`);
  }
  return handleStageCheck(ctx);
});

// 8. Kontinjensi Plan Menu
bot.hears('🚨 Kontinjensi Plan', handlePlanMenu);
bot.command('plan', handlePlanMenu);

async function handlePlanMenu(ctx) {
  const currentSub = subEventsConfig.getSubEvent(subEventsConfig.getActiveSubEventId());

  let text = `🚨 <b>SOP KONTINJENSI: ${currentSub.name.toUpperCase()}</b>\n`;
  text += `────────────────────────────\n`;
  text += `<b>📌 Skenario & Rencana Mitigasi:</b>\n`;
  text += `${currentSub.contingency}\n\n`;
  text += `💡 <i>Gunakan informasi ini jika terjadi kendala rute atau situasi darurat di panggung/venue.</i>`;

  const buttons = Markup.inlineKeyboard([
    [Markup.button.callback('🔙 Kembali ke Menu Utama', 'nav_home')]
  ]);

  if (ctx.callbackQuery) {
    return ctx.editMessageText(text, { parse_mode: 'HTML', ...buttons });
  }
  return ctx.replyWithHTML(text, buttons);
}

// 9. AI Copilot (Gemini 3.1 Flash Lite)
bot.hears('🤖 Tanya AI Copilot', (ctx) => {
  const text = 
`🤖 <b>CENTRAL EVENT AI COPILOT</b>
<i>Ditenagai oleh Google Gemini 3.1 Flash Lite</i>
────────────────────────────
AI membaca 4 inti acara resmi (Start Point, Safari Faculty, One Day Lecture, Technocraft), alur pos, dan berkas Drive secara real-time.

<b>Contoh pertanyaan yang bisa kamu ajukan:</b>
• <i>"Jelaskan rincian 4 inti acara di bawah Central Event 2027"</i>
• <i>"Apa agenda utama di Technocraft Playhouse?"</i>
• <i>"Bagaimana alur pos dan kontinjensi di Safari Faculty?"</i>
• <i>"Apa target peserta di Start Point?"</i>

Ketik langsung pertanyaanmu di chat ini, atau gunakan:
<code>/ask [pertanyaan kamu]</code>`;

  ctx.replyWithHTML(text, Markup.inlineKeyboard([
    [Markup.button.callback('🔙 Kembali ke Menu Utama', 'nav_home')]
  ]));
});

bot.command(['ask', 'ai'], async (ctx) => {
  const question = ctx.message.text.replace(/^\/(ask|ai)\s*/i, '').trim();
  if (!question) {
    return ctx.replyWithHTML('Silakan tuliskan pertanyaanmu. Contoh: <code>/ask Apa saja 4 inti acara kita?</code>');
  }
  await handleCopilotQuestion(ctx, question);
});

async function handleCopilotQuestion(ctx, question) {
  try {
    await ctx.sendChatAction('typing');

    const targetSub = subEventsConfig.getActiveSubEventId();
    const subEvent = subEventsConfig.getSubEvent(targetSub);

    const progress = progressService.getProgress(targetSub);
    const rawSpreadsheetText = await sheetsService.getRawSpreadsheetText();
    const realDriveFiles = await driveService.fetchRealDriveItems();
    const dateStatus = sheetsService.getEventDateStatus(targetSub);

    const answer = await geminiService.askCopilot(question, {
      progress,
      rawSpreadsheetText,
      realDriveFiles,
      dateStatus: {
        ...dateStatus,
        subEventName: subEvent.name,
        venue: subEvent.venue
      }
    });

    await ctx.reply(answer, {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔙 Kembali ke Menu Utama', callback_data: 'nav_home' }]
        ]
      }
    });
  } catch (err) {
    console.error('Error copilot handler:', err);
    await ctx.reply(`⚠️ Terjadi kendala saat memproses: ${err.message}`);
  }
}

// 10. Navigasi Callback Actions
bot.action('nav_home', async (ctx) => {
  await ctx.answerCbQuery();
  const home = getHomeContent();
  return ctx.editMessageText(home.html, { parse_mode: 'HTML', ...home.inlineKeyboard });
});

bot.action('nav_session', async (ctx) => {
  await ctx.answerCbQuery();
  return handleCurrentSession(ctx);
});

bot.action('nav_simulasi', async (ctx) => {
  await ctx.answerCbQuery();
  return handleSimulationMenu(ctx);
});

bot.action('nav_rundown', async (ctx) => {
  await ctx.answerCbQuery();
  return handleFullRundown(ctx);
});

bot.action('nav_drive', async (ctx) => {
  await ctx.answerCbQuery();
  return handleDriveVault(ctx);
});

bot.action('nav_stage_check', async (ctx) => {
  await ctx.answerCbQuery();
  return handleStageCheck(ctx);
});

bot.action('nav_subevents', async (ctx) => {
  await ctx.answerCbQuery();
  return handleSubEventsMenu(ctx);
});

bot.action('nav_plan', async (ctx) => {
  await ctx.answerCbQuery();
  return handlePlanMenu(ctx);
});

bot.action('nav_ai_info', async (ctx) => {
  await ctx.answerCbQuery();
  const text = 
`🤖 <b>TANYA AI COPILOT</b>
Ketik pertanyaan bebas langsung di chat ini, AI akan membaca 4 sub-event, Spreadsheet & Drive secara real-time!`;
  return ctx.editMessageText(text, {
    parse_mode: 'HTML',
    ...Markup.inlineKeyboard([
      [Markup.button.callback('🔙 Kembali ke Menu Utama', 'nav_home')]
    ])
  });
});

bot.action('action_next_session', async (ctx) => {
  await ctx.answerCbQuery();
  const currentSub = subEventsConfig.getSubEvent(subEventsConfig.getActiveSubEventId());
  const sessionData = await sheetsService.getCurrentAndNextSession(null, currentSub.id);
  
  if (sessionData.isBeforeEvent) {
    return ctx.editMessageText(
      `⏳ <b>Hari-H masih H-${sessionData.daysUntil} hari lagi (${sessionData.eventDateStr}).</b>\nCoba gunakan <b>Mode Simulasi</b> untuk menguji alur acara.`,
      {
        parse_mode: 'HTML',
        ...Markup.inlineKeyboard([
          [Markup.button.callback('🎮 Buka Mode Simulasi', 'nav_simulasi')],
          [Markup.button.callback('🔙 Kembali', 'nav_session')]
        ])
      }
    );
  }

  const { next, globalDelayMinutes, isSimulation } = sessionData;
  if (!next) {
    return ctx.editMessageText('🏁 <b>Tidak ada sesi berikutnya. Seluruh rangkaian acara telah usai.</b>', {
      parse_mode: 'HTML',
      ...Markup.inlineKeyboard([[Markup.button.callback('🔙 Kembali', 'nav_session')]])
    });
  }

  const startTime = next.adjustedStart || next.start;
  const endTime = next.adjustedEnd || next.end;
  const delayBadge = globalDelayMinutes > 0 ? ` <i>(+${globalDelayMinutes}m)</i>` : '';
  const simBadge = isSimulation ? ' <i>(Simulasi)</i>' : '';

  const msg = 
`⏭️ <b>PERSIAPAN SESI BERIKUTNYA${simBadge}</b>
────────────────────────────
⏰ <b>Waktu:</b> <code>${startTime} - ${endTime} WIB</code>${delayBadge}
📌 <b>Acara:</b> <b>${next.title}</b>
📍 <b>Lokasi:</b> ${next.location}
👤 <b>PIC Standby:</b> ${next.pic}
📝 <b>Catatan:</b> ${next.notes}

⚠️ <i>PIC panggung/pos diharapkan bersiap di lokasi.</i>`;

  return ctx.editMessageText(msg, {
    parse_mode: 'HTML',
    ...Markup.inlineKeyboard([
      [Markup.button.callback('⏱️ Sesi Sekarang', 'action_refresh_current')],
      [Markup.button.callback('🔙 Menu Utama', 'nav_home')]
    ])
  });
});

bot.action('action_refresh_current', async (ctx) => {
  await ctx.answerCbQuery('Data disegarkan!');
  return handleCurrentSession(ctx);
});

// Simulasi Actions
bot.action(/sim_(.+)/, async (ctx) => {
  const simVal = ctx.match[1];
  if (simVal === 'off') {
    sheetsService.setSimulationTime(null);
    await ctx.answerCbQuery('Simulasi dimatikan');
    return handleCurrentSession(ctx);
  } else {
    sheetsService.setSimulationTime(simVal);
    await ctx.answerCbQuery(`Simulasi ${simVal} WIB`);
    return handleCurrentSession(ctx);
  }
});

// Tangani pesan teks biasa sebagai pertanyaan AI Copilot
bot.on('text', async (ctx, next) => {
  const text = ctx.message.text.trim();
  
  const isCommandOrButton = text.startsWith('/') || [
    '⏱️ Status Sesi', '🎮 Mode Simulasi',
    '📋 Master Rundown', '📁 Berkas Drive',
    '🔄 Pilih 4 Inti Acara', '🔄 Ganti Sub-Event', '📡 Kesiapan Pos',
    '🚨 Kontinjensi Plan', '🤖 Tanya AI Copilot'
  ].includes(text);

  if (isCommandOrButton) {
    return next();
  }

  await handleCopilotQuestion(ctx, text);
});

// Catch all Telegraf errors gracefully
bot.catch((err, ctx) => {
  console.error(`Telegram Bot Error for ${ctx?.updateType}:`, err.message);
});

// Start bot lokal jika dijalankan via node
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  if (config.BOT_TOKEN && config.BOT_TOKEN !== 'DUMMY_TOKEN') {
    bot.launch({ dropPendingUpdates: true }).catch(err => {
      console.error('Telegram bot launch error:', err.message);
    });
    bot.telegram.getMe().then(me => {
      console.log(`🚀 Central Event Telegram Bot (@${me.username}) aktif dan siap menerima perintah!`);
    }).catch(err => {
      console.error('Gagal mengambil profil bot:', err.message);
    });
  }

  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
}

module.exports = bot;
