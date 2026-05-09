require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function runQuery(query) {
  try {
    await pool.query(query);
  } catch (err) {
    console.log(`Query failed: ${query}`, err.message);
  }
}

async function migrate() {
  console.log('Renaming base_price to price...');
  await runQuery('ALTER TABLE stays RENAME COLUMN base_price TO price;');

  console.log('Adding missing columns to stays...');
  await runQuery("ALTER TABLE stays ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'INR';");
  await runQuery("ALTER TABLE stays ADD COLUMN IF NOT EXISTS is_sponsored BOOLEAN DEFAULT FALSE;");
  await runQuery("ALTER TABLE stays ADD COLUMN IF NOT EXISTS is_listed BOOLEAN DEFAULT TRUE;");
  await runQuery("ALTER TABLE stays ADD COLUMN IF NOT EXISTS rating NUMERIC(3,2) DEFAULT 0.00;");
  await runQuery("ALTER TABLE stays ADD COLUMN IF NOT EXISTS property_code VARCHAR(20) UNIQUE;");
  await runQuery("ALTER TABLE stays ADD COLUMN IF NOT EXISTS property_type VARCHAR(50);");
  await runQuery("ALTER TABLE stays ADD COLUMN IF NOT EXISTS bedrooms INTEGER DEFAULT 0;");
  await runQuery("ALTER TABLE stays ADD COLUMN IF NOT EXISTS bathrooms INTEGER DEFAULT 0;");
  await runQuery("ALTER TABLE stays ADD COLUMN IF NOT EXISTS amenities TEXT[] DEFAULT '{}';");
  await runQuery("ALTER TABLE stays ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;");
  await runQuery("ALTER TABLE stays ADD COLUMN IF NOT EXISTS location GEOGRAPHY(POINT, 4326);");
  await runQuery("ALTER TABLE stays ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();");
  await runQuery("ALTER TABLE stay_images ADD COLUMN IF NOT EXISTS uploaded_at TIMESTAMP DEFAULT NOW();");

  console.log('Adding listed_by_id...');
  await runQuery('ALTER TABLE stays ADD COLUMN IF NOT EXISTS listed_by_id INTEGER REFERENCES users(id);');

  console.log('Migrating owner_id to listed_by_id...');
  await runQuery('UPDATE stays SET listed_by_id = owner_id WHERE listed_by_id IS NULL AND owner_id IS NOT NULL;');

  console.log('Dropping owner_id and broker_id...');
  await runQuery('ALTER TABLE stays DROP COLUMN IF EXISTS owner_id;');
  await runQuery('ALTER TABLE stays DROP COLUMN IF EXISTS broker_id;');

  console.log('Dropping bookings and payments tables...');
  await runQuery('DROP TABLE IF EXISTS payments CASCADE;');
  await runQuery('DROP TABLE IF EXISTS bookings CASCADE;');

  console.log('Ensuring PostGIS is enabled...');
  await runQuery('CREATE EXTENSION IF NOT EXISTS postgis;');

  console.log('Creating/Updating conversations table...');
  await runQuery(`
    CREATE TABLE IF NOT EXISTS conversations (
      id SERIAL PRIMARY KEY,
      stay_id INTEGER REFERENCES stays(id) ON DELETE CASCADE,
      initiator_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      recipient_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
  
  await runQuery('ALTER TABLE conversations RENAME COLUMN property_id TO stay_id;');
  await runQuery('ALTER TABLE conversations RENAME COLUMN guest_id TO initiator_id;');
  await runQuery('ALTER TABLE conversations RENAME COLUMN host_id TO recipient_id;');
  await runQuery('ALTER TABLE conversations DROP COLUMN IF EXISTS updated_at;');

  console.log('Creating/Updating messages table...');
  await runQuery(`
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
      sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      message_text TEXT NOT NULL,
      is_read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
  
  await runQuery('ALTER TABLE messages RENAME COLUMN content TO message_text;');

  console.log('Migration successful.');
  pool.end();
}

migrate();
