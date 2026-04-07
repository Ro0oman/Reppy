import { query } from '../db.js';

/**
 * Log a coin transaction for a user.
 * 
 * @param {string} userId - The Google ID of the user.
 * @param {number} amount - Positive for gains, negative for spends.
 * @param {string} source - Source type: EXERCISE, CHEST_BOSS, CHEST_LVL, ROULETTE, PURCHASE.
 * @param {string} description - Human-readable description of the transaction.
 */
export const trackCoinTransaction = async (userId, amount, source, description) => {
  if (!amount || amount === 0) return;
  
  try {
    await query(
      `INSERT INTO coin_transactions (user_id, amount, source, description) 
       VALUES ($1, $2, $3, $4)`,
      [userId, amount, source, description]
    );
  } catch (err) {
    console.error('Failed to log coin transaction:', err);
    // We don't want to fail the main process if logging fails
  }
};
