const { Pool } = require('pg');
require('dotenv').config();

// Supabase Connection Configuration (Reads from process.env)
const FALLBACK_DATABASE_URL = 'postgresql://postgres.qpoceyupnsqayxcqfgdx:GONTnT5MuHPv6oxE@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres';
const POOLER_URL = process.env.DATABASE_URL || FALLBACK_DATABASE_URL;
const DIRECT_URL = process.env.DATABASE_URL_DIRECT || '';

function getConnectionString() {
  const envUrl = process.env.DATABASE_URL;
  if (!envUrl) return POOLER_URL;
  // If direct URL is given in an environment that may not route IPv6, use pooler
  if (envUrl.includes('db.qpoceyupnsqayxcqfgdx.supabase.co')) {
    return POOLER_URL;
  }
  return envUrl;
}

let pool = null;

function getPool() {
  if (!pool) {
    const connStr = getConnectionString();
    pool = new Pool({
      connectionString: connStr,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000
    });

    pool.on('error', (err) => {
      console.warn('⚠️ Supabase Postgres pool error (fallback active):', err.message);
    });
  }
  return pool;
}

async function query(text, params = []) {
  try {
    const client = getPool();
    return await client.query(text, params);
  } catch (err) {
    // If connection dropped/reset by Supabase pooler, reconnect once and retry
    const isConnErr = err.code === 'ECONNRESET' || 
                      err.message?.includes('Connection terminated') ||
                      err.message?.includes('Connection closed') ||
                      err.message?.includes('closed unexpectedly');
    if (isConnErr) {
      console.warn('⚠️ Supabase connection was reset. Reconnecting pool...');
      try {
        if (pool) {
          try { await pool.end(); } catch (e) {}
          pool = null;
        }
        const freshClient = getPool();
        return await freshClient.query(text, params);
      } catch (retryErr) {
        console.error('Database query retry error:', retryErr.message);
        throw retryErr;
      }
    }
    console.error('Database query error:', err.message);
    throw err;
  }
}

/**
 * Initialize Tables & Migrations in Supabase
 */
async function initSchema() {
  const p = getPool();
  try {
    console.log('⚡ Menginisialisasi schema tabel di Supabase Cloud...');

    await p.query(`
      CREATE TABLE IF NOT EXISTS sub_events (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        short_name VARCHAR(50),
        tagline TEXT,
        date_str VARCHAR(50),
        date_iso VARCHAR(20),
        venue TEXT,
        pic VARCHAR(100),
        icon VARCHAR(10),
        kpi JSONB,
        contingency TEXT,
        stations JSONB,
        rundown JSONB,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS spreadsheets (
        id VARCHAR(100) PRIMARY KEY,
        sheet_id VARCHAR(100),
        name VARCHAR(255) NOT NULL,
        sub_event_id VARCHAR(50) NOT NULL,
        sub_event_name VARCHAR(100),
        icon VARCHAR(10),
        type VARCHAR(50) DEFAULT 'google',
        is_configured BOOLEAN DEFAULT false,
        is_sub_event_primary BOOLEAN DEFAULT false,
        edit_url TEXT,
        preview_url TEXT,
        external_url TEXT,
        date VARCHAR(50),
        is_default BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS drive_folders (
        sub_event_id VARCHAR(50) PRIMARY KEY,
        folder_id VARCHAR(100) NOT NULL,
        url TEXT,
        is_real_google_drive BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS uploaded_files (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        folder_id VARCHAR(100),
        folder_name VARCHAR(255),
        sub_event_id VARCHAR(50),
        is_folder BOOLEAN DEFAULT false,
        type VARCHAR(50),
        icon VARCHAR(10),
        size VARCHAR(50),
        date VARCHAR(50),
        preview_url TEXT,
        edit_url TEXT,
        external_url TEXT,
        url TEXT,
        file_name VARCHAR(255),
        is_local_upload BOOLEAN DEFAULT true,
        uploaded_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS progress_trackers (
        sub_event_id VARCHAR(50) PRIMARY KEY,
        percentage INTEGER NOT NULL DEFAULT 0,
        status_label VARCHAR(255),
        milestones JSONB,
        updated_by VARCHAR(100),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    console.log('✅ Schema tabel Supabase Cloud berhasil diverifikasi!');
    return true;
  } catch (err) {
    console.error('❌ Gagal inisialisasi schema Supabase:', err.message);
    return false;
  }
}

/**
 * Sync Local State to Supabase
 */
async function syncLocalToSupabase() {
  try {
    const isReady = await initSchema();
    if (!isReady) return false;

    // 1. Sync Sub-Events
    const subEventsConfig = require('./services/subEventsConfig');
    const allSubs = subEventsConfig.getAllSubEvents();
    for (const sub of allSubs) {
      await query(`
        INSERT INTO sub_events (id, name, short_name, tagline, date_str, date_iso, venue, pic, icon, kpi, contingency, stations, rundown, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          short_name = EXCLUDED.short_name,
          tagline = EXCLUDED.tagline,
          date_str = EXCLUDED.date_str,
          venue = EXCLUDED.venue,
          pic = EXCLUDED.pic,
          icon = EXCLUDED.icon,
          kpi = EXCLUDED.kpi,
          stations = EXCLUDED.stations,
          rundown = EXCLUDED.rundown,
          updated_at = NOW();
      `, [
        sub.id, sub.name, sub.shortName || sub.name, sub.tagline || '',
        sub.dateStr || '', sub.dateIso || '', sub.venue || '', sub.pic || '',
        sub.icon || '⚡', JSON.stringify(sub.kpi || {}), sub.contingency || '',
        JSON.stringify(sub.stations || []), JSON.stringify(sub.rundown || [])
      ]);
    }

    // 2. Sync Spreadsheets (DEFAULT_SHEETS)
    const spreadsheetRegistry = require('./services/spreadsheetRegistry');
    const allSheets = spreadsheetRegistry.getAllSpreadsheets();
    for (const s of allSheets) {
      await query(`
        INSERT INTO spreadsheets (id, sheet_id, name, sub_event_id, sub_event_name, icon, type, is_configured, is_sub_event_primary, edit_url, preview_url, external_url, date, is_default, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
        ON CONFLICT (id) DO UPDATE SET
          sheet_id = EXCLUDED.sheet_id,
          name = EXCLUDED.name,
          sub_event_id = EXCLUDED.sub_event_id,
          is_configured = EXCLUDED.is_configured,
          edit_url = EXCLUDED.edit_url,
          preview_url = EXCLUDED.preview_url,
          external_url = EXCLUDED.external_url,
          updated_at = NOW();
      `, [
        s.id, s.sheetId || null, s.name, s.subEventId || 'all', s.subEventName || '',
        s.icon || '📊', s.type || 'google', !!s.isConfigured, !!s.isSubEventPrimary,
        s.editUrl || null, s.previewUrl || null, s.externalUrl || null, s.date || 'Tersambung',
        !!s.isDefault
      ]);
    }

    // 3. Sync Progress Trackers (0-100% Khusus Staff Ahli)
    const progressService = require('./services/progressService');
    await progressService.initFromSupabase();

    console.log('🌟 Sinkronisasi data awal ke Supabase Cloud BERHASIL!');
    return true;
  } catch (err) {
    console.error('❌ Error saat sinkronisasi ke Supabase:', err.message);
    return false;
  }
}

let initPromise = null;
async function ensureDbReady() {
  if (!initPromise) {
    initPromise = (async () => {
      try {
        await initSchema();
        return true;
      } catch (err) {
        console.warn('Supabase ensureDbReady warning:', err.message);
        initPromise = null;
        return false;
      }
    })();
  }
  return initPromise;
}

module.exports = {
  getPool,
  query,
  initSchema,
  syncLocalToSupabase,
  ensureDbReady,
  POOLER_URL,
  DIRECT_URL
};
