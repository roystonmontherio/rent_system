// src/config/db.js
const { Pool } = require('pg');
require('dotenv').config();

// ============================================
// 🔄 Environment Switch Logic
// Reads MODE from .env to pick local or production DB
// ============================================
const mode = (process.env.MODE || 'local').toLowerCase();
const isLocal = mode === 'local';

const connectionString = isLocal
  ? process.env.LOCAL_DATABASE_URL
  : process.env.PROD_DATABASE_URL;

if (!connectionString) {
  console.error(`❌ No database URL found for MODE="${mode}". Check your .env file.`);
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  // Recommended production settings
  max: 20, // Max number of connections in the pool
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
});

// Test the connection immediately on startup
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection failed:', err.stack);
  } else {
    console.log(`✅ Connected to PostgreSQL Database (${isLocal ? '🏠 LOCAL' : '☁️ PRODUCTION'})`);
  }
});

module.exports = pool;