/**
 * ==============================================================================
 * CENTRAL EVENT INI LHO ITS! 2027 - GOOGLE APPS SCRIPT COMPANION (MULTI-SHEET)
 * ==============================================================================
 * Skrip ini dipasang di dalam Google Spreadsheet tim Central Event.
 * Buka Spreadsheet -> Menu 'Extensions' (Ekstensi) -> 'Apps Script' -> Tempel kode ini.
 */

var TELEGRAM_BOT_TOKEN = "8807325494:AAFGiWferrEF7iPiD1nxt7lNTtPWlziBOfc";
var CHAT_ID = ""; // (Opsional) Chat ID grup Telegram Central Event

/**
 * 1. WEB APP JSON ENDPOINT (AUTO-DETECT SELURUH SHEET/TAB)
 * Skrip ini otomatis membaca SEMUA TAB (Day 1, Day 2, Gladi, Closing, dll)
 * dan mengembalikannya dalam format JSON rapi untuk Bot & Gemini AI.
 */
function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var allSheets = ss.getSheets();
  var result = {
    spreadsheetTitle: ss.getName(),
    totalSheets: allSheets.length,
    sheets: []
  };

  for (var s = 0; s < allSheets.length; s++) {
    var sheet = allSheets[s];
    var sheetName = sheet.getName();
    var data = sheet.getDataRange().getValues();

    if (data.length > 1) {
      var headers = data[0];
      var rows = [];

      for (var i = 1; i < data.length; i++) {
        var rowObj = {};
        for (var j = 0; j < headers.length; j++) {
          var headerKey = String(headers[j] || "col_" + j).trim();
          rowObj[headerKey] = data[i][j];
        }
        rows.push(rowObj);
      }

      result.sheets.push({
        name: sheetName,
        rowCount: rows.length,
        data: rows
      });
    }
  }

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * 2. AUTOMATIC REMINDER H-10 MENIT
 * Pasang Trigger waktu di Apps Script (Triggers -> Add Trigger -> checkUpcomingSessionReminder -> Minutes timer).
 */
function checkUpcomingSessionReminder() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Rundown") || ss.getSheets()[0];
  if (!sheet) return;

  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return;

  var now = new Date();
  var currentMinutes = now.getHours() * 60 + now.getMinutes();

  for (var i = 1; i < data.length; i++) {
    var startStr = String(data[i][0]).trim();
    var title = data[i][2];
    var location = data[i][3];
    var pic = data[i][4];

    if (startStr && startStr.indexOf(":") > -1) {
      var parts = startStr.split(":");
      var sessionStartMinutes = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
      var diff = sessionStartMinutes - currentMinutes;

      if (diff === 10 && CHAT_ID) {
        var msg = "⏰ *PENGINGAT CENTRAL EVENT (H-10 Menit)*\n\n" +
                  "📌 *Sesi:* " + title + "\n" +
                  "📍 *Lokasi:* " + location + "\n" +
                  "👤 *PIC Lapangan:* " + pic + "\n\n" +
                  "⚠️ _Mohon PIC panggung dan talent segera merapat!_";
        
        sendTelegram(msg);
      }
    }
  }
}

function sendTelegram(text) {
  var url = "https://api.telegram.org/bot" + TELEGRAM_BOT_TOKEN + "/sendMessage";
  var payload = { chat_id: CHAT_ID, text: text, parse_mode: "Markdown" };
  UrlFetchApp.fetch(url, {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });
}
