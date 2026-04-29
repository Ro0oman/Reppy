import dotenv from 'dotenv';
import path from 'path';
import pg from 'pg';

dotenv.config({ path: path.resolve('backend/.env') });

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost') ? { rejectUnauthorized: false } : false
});

async function testDailyShop() {
  const userId = '113903862264612270084'; // Roman's ID
  try {
    const dailyRes = await pool.query(`
      SELECT d.*, i.name, i.description, i.rarity, i.type, i.image_url, i.svg_key, i.stats,
             CASE WHEN d.item_id IS NOT NULL THEN EXISTS(SELECT 1 FROM user_items WHERE user_id = $1 AND item_id = i.id) ELSE d.is_claimed END as owned
      FROM daily_shop_items d
      LEFT JOIN items i ON d.item_id = i.id
      WHERE d.user_id = $1
    `, [userId]);
    console.log('Daily shop test success:', dailyRes.rows.length, 'rows');
  } catch (err) {
    console.error('Daily shop test FAILED:', err.message);
  } finally {
    await pool.end();
  }
}

testDailyShop();
