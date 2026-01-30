
import express from 'express';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Database Connection
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
});

// Auto-Migration & Seeding Logic
async function initializeDatabase() {
  console.log('--- Initializing Database ---');
  const client = await pool.connect();
  try {
    // Create Tables
    await client.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
      
      CREATE TABLE IF NOT EXISTS contacts (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          phone_number VARCHAR(20) NOT NULL,
          product_name VARCHAR(255) NOT NULL,
          old_address TEXT NOT NULL,
          new_address TEXT,
          status VARCHAR(50) DEFAULT 'Pending',
          conversation JSONB DEFAULT '[]',
          last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS settings (
          id SERIAL PRIMARY KEY,
          webhook_url TEXT,
          gemini_api_key TEXT,
          inbound_api_key TEXT UNIQUE,
          initial_message_template TEXT,
          auto_delete_done BOOLEAN DEFAULT FALSE
      );
    `);

    // Check for seed data
    const res = await client.query('SELECT COUNT(*) FROM settings');
    if (parseInt(res.rows[0].count) === 0) {
      console.log('Seeding initial configuration...');
      await client.query(`
        INSERT INTO settings (inbound_api_key, initial_message_template)
        VALUES ($1, $2)
      `, ['G360-' + Math.random().toString(36).substr(2, 9).toUpperCase(), 
          'Hello! We\'re preparing to ship your order for "{productName}". We noticed the delivery address provided ("{oldAddress}") seems incorrect. Could you please provide the correct address?']);
    }

    console.log('Database Ready ✅');
  } catch (err) {
    console.error('Migration Error ❌:', err);
  } finally {
    client.release();
  }
}

// Serve static frontend files from dist folder
app.use(express.static(path.join(__dirname, 'dist')));

// API Routes
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    message: 'GoFor360 API is running',
    timestamp: new Date().toISOString(),
    endpoints: {
      contacts: '/api/contacts'
    }
  });
});

app.get('/api/contacts', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM contacts ORDER BY last_updated DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fallback for SPA routes - serve index.html for any unmatched routes
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  await initializeDatabase();
  console.log(`Server running on port ${PORT}`);
});
