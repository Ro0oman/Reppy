import pg from 'pg';
import fs from 'fs/promises';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function applySchema() {
  console.log('--- Aplicando nuevo esquema en Supabase ---');
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const sql = await fs.readFile(schemaPath, 'utf8');

    console.log('Ejecutando SQL...');
    await pool.query(sql);
    
    console.log(`\n✅ Esquema aplicado con éxito.`);
  } catch (error) {
    console.error('❌ Error al aplicar esquema:', error);
  } finally {
    await pool.end();
  }
}

applySchema();
