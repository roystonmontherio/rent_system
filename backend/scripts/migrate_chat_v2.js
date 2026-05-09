// backend/scripts/migrate_chat_v2.js
const pool = require('../src/config/db');

async function migrate() {
  try {
    console.log('🚀 Starting Chat V2 Migration...');

    // 1. Add status column if not exists
    await pool.query(`
      ALTER TABLE conversations 
      ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending',
      ADD COLUMN IF NOT EXISTS last_message_at TIMESTAMP DEFAULT NOW();
    `);

    // 2. Add is_read to messages if not exists (should be there already)
    await pool.query(`
      ALTER TABLE messages 
      ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE;
    `);

    // 3. Update existing conversations to 'accepted' if they already have messages
    await pool.query(`
      UPDATE conversations 
      SET status = 'accepted' 
      WHERE id IN (SELECT DISTINCT conversation_id FROM messages);
    `);

    console.log('✅ Migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

migrate();
