const { Pool } = require('pg');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';
const hasSSL = process.env.DATABASE_URL && (process.env.DATABASE_URL.includes('sslmode=require') || process.env.DATABASE_URL.includes('supabase'));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: hasSSL ? { rejectUnauthorized: false } : undefined
});

// Test connection on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error acquiring database client from pool:', err.stack);
  } else {
    console.log('Successfully connected to PostgreSQL database.');
    release();
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
