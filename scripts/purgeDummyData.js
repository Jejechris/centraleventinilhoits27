const db = require('../src/db');
const fs = require('fs');
const path = require('path');

async function purge() {
  console.log('🧹 Purging dummy data from Supabase and data/progress.json...');

  // Update Supabase progress_trackers for startpoint, odl, technocraft
  const cleanSubs = [
    {
      id: 'startpoint',
      percentage: 0,
      statusLabel: 'Belum Dikonfigurasi (Menunggu Input Staff Ahli)',
      milestones: []
    },
    {
      id: 'odl',
      percentage: 0,
      statusLabel: 'Belum Dikonfigurasi (Menunggu Input Staff Ahli)',
      milestones: []
    },
    {
      id: 'technocraft',
      percentage: 0,
      statusLabel: 'Belum Dikonfigurasi (Menunggu Input Staff Ahli)',
      milestones: []
    }
  ];

  for (const s of cleanSubs) {
    await db.query(`
      UPDATE progress_trackers
      SET percentage = $1,
          status_label = $2,
          milestones = $3,
          updated_by = 'Sistem Central Event',
          updated_at = NOW()
      WHERE sub_event_id = $4
    `, [s.percentage, s.statusLabel, JSON.stringify(s.milestones), s.id]);
    console.log(`✅ Supabase progress_trackers updated for ${s.id}`);
  }

  // Read current progress.json and update it
  const progressPath = path.join(__dirname, '../data/progress.json');
  let current = {};
  if (fs.existsSync(progressPath)) {
    current = JSON.parse(fs.readFileSync(progressPath, 'utf8'));
  }

  for (const s of cleanSubs) {
    if (current[s.id]) {
      current[s.id].percentage = 0;
      current[s.id].statusLabel = s.statusLabel;
      current[s.id].milestones = [];
      current[s.id].updatedBy = 'Sistem Central Event';
      current[s.id].updatedAt = new Date().toISOString();
    }
  }

  fs.writeFileSync(progressPath, JSON.stringify(current, null, 2), 'utf8');
  console.log('✅ Local data/progress.json rewritten cleanly.');

  console.log('🎉 Done purging dummy data!');
  process.exit(0);
}

purge().catch(err => {
  console.error('Error during purge:', err);
  process.exit(1);
});
