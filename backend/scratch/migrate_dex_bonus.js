import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const { query } = await import('../db.js');

async function run() {
    console.log('🚀 Ejecutando migración para dex_bonus...');
    try {
        await query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS dex_bonus INTEGER DEFAULT 0,
            ADD COLUMN IF NOT EXISTS dex_bonus_expiry TIMESTAMP WITH TIME ZONE;
        `);
        console.log('✅ Columnas dex_bonus y dex_bonus_expiry añadidas!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error en la migración:', err);
        process.exit(1);
    }
}

run();
