import { query } from './db.js';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  try {
    const userId = '104874471911797443021';
    const type = 'pullups';
    const userResult = await query(`
        SELECT u.id, u.name, u.email, u.avatar_url, u.reppy_coins, u.daily_goal,
               u.str_xp, u.pwr_xp, u.end_xp, u.agi_xp, u.body_weight, u.is_private,
               u.equipped_title_id, u.equipped_border_id,
               cTitle.name as title_name, cTitle.css_value as title_css,
               cBorder.name as border_name, cBorder.css_value as border_css
        FROM users u
        LEFT JOIN cosmetics cTitle ON u.equipped_title_id = cTitle.id AND cTitle.type = 'title'
        LEFT JOIN cosmetics cBorder ON u.equipped_border_id = cBorder.id AND cBorder.type = 'border'
        WHERE u.id = $1
      `, [userId]);
    console.log('User result count:', userResult.rowCount);
    console.log('User first row keys:', Object.keys(userResult.rows[0]));
  } catch (err) {
    console.error('FAILED:', err);
  } finally {
    process.exit();
  }
}
test();
