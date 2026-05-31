const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
require('dotenv').config();

const runSeed = async () => {
  if (!process.env.DATABASE_URL) {
    console.error('ERROR: DATABASE_URL is missing in backend/.env file.');
    process.exit(1);
  }

  const hasSSL = process.env.DATABASE_URL.includes('sslmode=require') || process.env.DATABASE_URL.includes('supabase');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: hasSSL ? { rejectUnauthorized: false } : undefined
  });

  try {
    console.log('Fetching database structural layout schema.sql...');
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

    console.log('Connecting to remote PostgreSQL and executing queries...');
    await pool.query(schemaSql);
    console.log('Database tables constructed and default departments loaded.');

    // Seed default Admin user
    const checkAdmin = await pool.query('SELECT id FROM users WHERE email = $1', ['admin@company.com']);
    
    if (checkAdmin.rows.length === 0) {
      console.log('Seeding default Admin user...');
      const hashedPassword = await bcrypt.hash('AdminPassword123!', 10);
      
      // Assign Admin to the Engineering department
      const deptRes = await pool.query("SELECT id FROM departments WHERE name = 'Engineering' LIMIT 1");
      const deptId = deptRes.rows.length > 0 ? deptRes.rows[0].id : null;

      await pool.query(
        `INSERT INTO users (name, email, password, role, department_id)
         VALUES ($1, $2, $3, $4, $5)`,
        ['System Administrator', 'admin@company.com', hashedPassword, 'Admin', deptId]
      );
      
      console.log('\n======================================================');
      console.log('Default Admin Account Created successfully:');
      console.log('Email:    admin@company.com');
      console.log('Password: AdminPassword123!');
      console.log('======================================================\n');
    } else {
      console.log('System Administrator account is already registered.');
    }

    console.log('Database seeding operation ended successfully.');
  } catch (err) {
    console.error('Database migration/seed operation failed:', err);
  } finally {
    await pool.end();
  }
};

runSeed();
