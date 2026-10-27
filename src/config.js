require('dotenv').config();

module.exports = {
  BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || '',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  GROUP_CHAT_ID: process.env.CENTRAL_EVENT_GROUP_CHAT_ID || '',
  FONNTE_TOKEN: process.env.FONNTE_TOKEN || '',
  GOOGLE_SHEET_ID: process.env.GOOGLE_SHEET_ID || '1daAHJLSECcmeY7fnyiIeFbua2sZqTqKjOzHY69zH2O0',
  GOOGLE_SHEET_NAME: process.env.GOOGLE_SHEET_NAME || 'Rundown',
  
  // Tautan Penting Drive & Komando Central Event
  DRIVE_LINKS: {
    masterRundown: 'https://docs.google.com/spreadsheets/d/1daAHJLSECcmeY7fnyiIeFbua2sZqTqKjOzHY69zH2O0/edit',
    mainDriveFolder: 'https://drive.google.com/drive/folders/1a-JbvPXcU0o9gWDrQEJUGZaQXTM6LQQp',
    cueCardFolder: 'https://drive.google.com/drive/folders/1a-JbvPXcU0o9gWDrQEJUGZaQXTM6LQQp',
    venueLayout: 'https://drive.google.com/drive/folders/1a-JbvPXcU0o9gWDrQEJUGZaQXTM6LQQp',
    medkrafAssets: 'https://drive.google.com/drive/folders/1a-JbvPXcU0o9gWDrQEJUGZaQXTM6LQQp',
    emergencySop: 'https://drive.google.com/drive/folders/1a-JbvPXcU0o9gWDrQEJUGZaQXTM6LQQp'
  }
};
