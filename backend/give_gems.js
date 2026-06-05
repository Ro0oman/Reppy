// Usage: node backend/give_gems.js <user_id> <amount>
import { query } from './db.js';

const userId = process.argv[2];
const amount = parseInt(process.argv[3], 10);

if (!userId || isNaN(amount)) {
  console.error('Usage: node backend/give_gems.js <user_id> <amount>');
  process.exit(1);
}

const res = await query(
  'UPDATE users SET reppy_gems = reppy_gems + $1 WHERE id = $2 RETURNING id, reppy_gems',
  [amount, userId]
);

if (res.rows.length === 0) {
  console.error('Usuario no encontrado:', userId);
} else {
  console.log(`✅ +${amount} gems → user ${res.rows[0].id} | Total: ${res.rows[0].reppy_gems} gems`);
}
process.exit(0);
