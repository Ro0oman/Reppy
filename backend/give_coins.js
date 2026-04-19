import { query } from './db.js';

async function giveCoins(email, amount) {
  try {
    const res = await query('UPDATE users SET reppy_coins = reppy_coins + $1 WHERE email = $2 RETURNING id', [amount, email]);
    if (res.rowCount > 0) {
      console.log(`Successfully gave ${amount} coins to ${email}`);
    } else {
      console.log(`User ${email} not found`);
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

const email = process.argv[2];
const amount = parseInt(process.argv[3]) || 10000;

if (!email) {
  console.log('Usage: node give_coins.js <email> <amount>');
  process.exit(1);
}

giveCoins(email, amount);
