import express from 'express';
import { query, withTransaction } from './db.js';
import { authenticate, optionalAuthenticate } from './middleware.js';

// How often the free spin recharges. Used by /status and /spin so they can
// never disagree on whether the user is still on cooldown.
const SPIN_COOLDOWN_HOURS = 4;

// The Daily Roulette recharges once per day. It's the slower, higher-stakes
// sibling of the 4h wheel: fewer spins, but rewards that actually matter.
const DAILY_COOLDOWN_HOURS = 24;

// Prize table — shared by the free spin and the bought extra spin so both
// endpoints can never drift apart. Rebalanced for the 4h cooldown (~6 free
// spins/day vs 1): coin payouts and gem/chest odds are lowered so the daily
// economy stays roughly flat despite the much higher spin frequency.
// NOTE: weights must sum to 100 — the wheel UI maps each weight to a slice of
// 360° (weight × 3.6), and pickPrize() walks a 0–100 cumulative range.
const ROULETTE_PRIZES = [
  { id: 0, value: 40, weight: 42.5, type: 'coins' },
  { id: 1, value: 75, weight: 18, type: 'coins' },
  { id: 2, value: 120, weight: 10, type: 'coins' },
  { id: 3, value: 200, weight: 6, type: 'coins' },
  { id: 4, value: 350, weight: 3, type: 'coins' },
  { id: 5, value: 600, weight: 1, type: 'coins' },
  { id: 10, value: 2, weight: 10, type: 'gems', label: '2 Gemas' },
  { id: 6, rarity: 'common', weight: 6, type: 'consumable', label: 'Consumible Común' },
  { id: 7, type: 'chest', rarity: 'level', weight: 2, label: 'Cofre de Nivel' },
  { id: 8, type: 'chest', rarity: 'boss', weight: 1, label: 'Cofre de Boss' },
  { id: 9, type: 'chest', rarity: 'epic', weight: 0.5, label: 'Cofre Épico' }
];

// Daily wheel prize table — weights sum to 100. Designed around the feedback
// that the 4h wheel feels flat: here a potion is the *expected* outcome (~60%
// of spins grant a consumable), so players actually try the buff loop. Rarity
// dictates probability — common is near-guaranteed, legendary is the jackpot.
// `id` doubles as the wheel's segment index (LuckyWheel maps by array position),
// so keep these ids === array order.
const DAILY_PRIZES = [
  { id: 0, rarity: 'common', weight: 40, type: 'consumable', label: 'Poción Común' },
  { id: 1, value: 250, weight: 22, type: 'coins' },
  { id: 2, rarity: 'rare', weight: 15, type: 'consumable', label: 'Poción Rara' },
  { id: 3, value: 5, weight: 10, type: 'gems', label: '5 Gemas' },
  { id: 4, type: 'chest', rarity: 'level', weight: 6, label: 'Cofre de Nivel' },
  { id: 5, rarity: 'especial', weight: 4, type: 'consumable', label: 'Poción Especial' },
  { id: 6, type: 'chest', rarity: 'boss', weight: 2, label: 'Cofre de Boss' },
  { id: 7, rarity: 'legendary', weight: 1, type: 'consumable', label: 'Poción Legendaria' }
];

function pickPrize(table = ROULETTE_PRIZES) {
  const random = Math.random() * 100;
  let cumulativeWeight = 0;
  let selected = table[0];
  for (const p of table) {
    cumulativeWeight += p.weight;
    if (random <= cumulativeWeight) {
      selected = p;
      break;
    }
  }
  return { ...selected };
}

// Grants the prize to the user. Must be called with a transaction `client` so
// the payout commits atomically with whatever gated the spin (last_spin_at flip,
// ticket consume, or gem deduction). Mutates and returns `result`.
async function grantPrize(client, userId, result) {
  if (result.type === 'coins') {
    await client.query('UPDATE users SET reppy_coins = reppy_coins + $1 WHERE id = $2', [result.value, userId]);
  } else if (result.type === 'gems') {
    await client.query('UPDATE users SET reppy_gems = reppy_gems + $1 WHERE id = $2', [result.value, userId]);
    await client.query(
      "INSERT INTO gem_transactions (user_id, amount, source, description) VALUES ($1, $2, 'roulette', 'Premio de la Ruleta')",
      [userId, result.value]
    );
  } else if (result.type === 'chest') {
    const col = result.rarity === 'level' ? 'level_chests' : (result.rarity === 'boss' ? 'boss_chests' : 'epic_chests');
    await client.query(`UPDATE users SET ${col} = ${col} + 1 WHERE id = $1`, [userId]);
  } else if (result.type === 'consumable') {
    // Daily wheel awards potions of a specific rarity; the 4h wheel only ever
    // sets 'common', so this stays backwards-compatible.
    const rarity = result.rarity || 'common';
    const itemRes = await client.query("SELECT id, name, description FROM items WHERE type = 'consumable' AND rarity = $1 ORDER BY RANDOM() LIMIT 1", [rarity]);
    if (itemRes.rows.length > 0) {
      const item = itemRes.rows[0];
      await client.query(
        `INSERT INTO user_items (user_id, item_id, quantity) VALUES ($1, $2, 1)
         ON CONFLICT (user_id, item_id) DO UPDATE SET quantity = user_items.quantity + 1, is_new = TRUE`,
        [userId, item.id]
      );
      result.item = item;
    } else {
      // Ultimate fallback: 500 coins if no consumable is configured.
      await client.query('UPDATE users SET reppy_coins = reppy_coins + 500 WHERE id = $1', [userId]);
      result.type = 'coins';
      result.value = 500;
    }
  }
  return result;
}

// Helper to get current roulette ticket price
async function getRouletteTicketPrice(userId, basePrice = 5) {
  const userRes = await query('SELECT roulette_tickets_bought_today, last_roulette_ticket_bought_at FROM users WHERE id = $1', [userId]);
  if (userRes.rows.length === 0) return basePrice;
  
  const user = userRes.rows[0];
  let boughtToday = user.roulette_tickets_bought_today || 0;
  const lastBought = user.last_roulette_ticket_bought_at;
  
  if (lastBought) {
    const lastDate = new Date(lastBought).toDateString();
    const today = new Date().toDateString();
    if (lastDate !== today) {
      boughtToday = 0;
    }
  }
  
  return basePrice * Math.pow(2, boughtToday);
}


const router = express.Router();

// Get roulette status (can the user spin today?)
router.get('/status', optionalAuthenticate, async (req, res) => {
  try {
    if (!req.user) {
      return res.json({ canSpin: false });
    }

    const userRes = await query(`
      SELECT last_spin_at,
      (last_spin_at IS NOT NULL AND last_spin_at > NOW() - make_interval(hours => $2)) AS on_cooldown,
      (last_spin_at + make_interval(hours => $2)) AS next_spin_at
      FROM users WHERE id = $1
    `, [req.user.id, SPIN_COOLDOWN_HOURS]);

    const row = userRes.rows[0];
    const onCooldown = row.on_cooldown;

    // Check for tickets
    const ticketRes = await query(`
      SELECT quantity
      FROM user_items ui
      JOIN items i ON ui.item_id = i.id
      WHERE ui.user_id = $1 AND i.name = 'Ticket de Ruleta'
    `, [req.user.id]);

    const ticketCount = ticketRes.rows.length > 0 ? ticketRes.rows[0].quantity : 0;
    const canSpin = !onCooldown || ticketCount > 0;
    const extraSpinCost = await getRouletteTicketPrice(req.user.id);

    res.json({
      canSpin,
      hasTicket: ticketCount > 0,
      ticketCount,
      extraSpinCost,
      lastSpinAt: row.last_spin_at,
      // When the next free spin unlocks (null if it's already available).
      nextSpinAt: onCooldown ? row.next_spin_at : null,
      cooldownHours: SPIN_COOLDOWN_HOURS
    });
  } catch (error) {
    console.error('Error checking roulette status:', error);
    res.status(500).json({ message: 'Error checking status' });
  }
});

// Spin the wheel
router.post('/spin', authenticate, async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await withTransaction(async (client) => {
      // Lock the user row so concurrent spins serialize. This is what stops the
      // double-free-spin race: the first spin flips last_spin_at inside the lock,
      // so the second sees on_cooldown = true and must pay with a ticket.
      const userRes = await client.query(`
        SELECT last_spin_at,
        (last_spin_at IS NOT NULL AND last_spin_at > NOW() - make_interval(hours => $2)) AS on_cooldown
        FROM users WHERE id = $1 FOR UPDATE
      `, [userId, SPIN_COOLDOWN_HOURS]);
      if (userRes.rowCount === 0) return { status: 404, body: { message: 'User not found' } };

      const onCooldown = userRes.rows[0].on_cooldown;
      let usingTicket = false;

      if (onCooldown) {
        // Find a ticket the user actually owns, then consume it atomically. The
        // guarded decrement is the gate — concurrent extra spins can't share one
        // ticket because only one UPDATE can take quantity from N to N-1 per row.
        const ticketRes = await client.query(`
          SELECT ui.item_id
          FROM user_items ui
          JOIN items i ON ui.item_id = i.id
          WHERE ui.user_id = $1 AND i.name = 'Ticket de Ruleta' AND ui.quantity > 0
        `, [userId]);

        if (ticketRes.rowCount === 0) {
          return { status: 400, body: { message: 'La ruleta aún está recargándose. ¡Vuelve en unas horas o compra un Ticket de Ruleta para girar ya!' } };
        }
        const ticketId = ticketRes.rows[0].item_id;
        const consume = await client.query(
          `UPDATE user_items SET quantity = quantity - 1
           WHERE user_id = $1 AND item_id = $2 AND quantity > 0
           RETURNING quantity`,
          [userId, ticketId]
        );
        if (consume.rowCount === 0) {
          return { status: 400, body: { message: 'La ruleta aún está recargándose. ¡Vuelve en unas horas o compra un Ticket de Ruleta para girar ya!' } };
        }
        if (consume.rows[0].quantity <= 0) {
          await client.query('DELETE FROM user_items WHERE user_id = $1 AND item_id = $2', [userId, ticketId]);
        }
        usingTicket = true;
      } else {
        // Claim the free spin by stamping last_spin_at under the lock — this
        // starts the 4h cooldown.
        await client.query('UPDATE users SET last_spin_at = CURRENT_TIMESTAMP WHERE id = $1', [userId]);
      }

      const prize = await grantPrize(client, userId, pickPrize());
      const finalUser = (await client.query('SELECT reppy_coins, reppy_gems FROM users WHERE id = $1', [userId])).rows[0];

      return {
        status: 200,
        body: {
          message: '¡Giro completado!',
          prize,
          new_coins: finalUser.reppy_coins,
          new_gems: finalUser.reppy_gems
        }
      };
    });

    if (result.status !== 200) return res.status(result.status).json(result.body);

    result.body.extraSpinCost = await getRouletteTicketPrice(userId);
    return res.json(result.body);
  } catch (error) {
    console.error('Error spinning roulette:', error);
    res.status(500).json({ message: 'Error al procesar el premio' });
  }
});

// Buy ticket and spin (all-in-one for UI convenience)
router.post('/buy-and-spin', authenticate, async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await withTransaction(async (client) => {
      // Lock the user row, then compute the escalating cost and deduct gems —
      // all inside the lock. The previous version split this across two fake
      // transactions and read gems before deducting, so concurrent requests
      // could both pass the check, both spin, and overspend. Now they serialize.
      const lockRes = await client.query(
        'SELECT reppy_gems, roulette_tickets_bought_today, last_roulette_ticket_bought_at FROM users WHERE id = $1 FOR UPDATE',
        [userId]
      );
      if (lockRes.rowCount === 0) return { status: 404, body: { message: 'User not found' } };
      const u = lockRes.rows[0];

      // Same escalating-price rule as getRouletteTicketPrice, evaluated under lock.
      let boughtToday = u.roulette_tickets_bought_today || 0;
      if (u.last_roulette_ticket_bought_at) {
        const lastDate = new Date(u.last_roulette_ticket_bought_at).toDateString();
        if (lastDate !== new Date().toDateString()) boughtToday = 0;
      }
      const cost = 5 * Math.pow(2, boughtToday);

      if (u.reppy_gems < cost) {
        return { status: 400, body: { message: 'No tienes suficientes gemas para un giro extra' } };
      }

      // Guarded deduction — cannot drive gems negative.
      const deductRes = await client.query(
        'UPDATE users SET reppy_gems = reppy_gems - $1 WHERE id = $2 AND reppy_gems >= $1 RETURNING reppy_gems',
        [cost, userId]
      );
      if (deductRes.rowCount === 0) throw new Error('Insufficient gems at deduction time');

      await client.query(
        "INSERT INTO gem_transactions (user_id, amount, source, description) VALUES ($1, $2, 'SHOP', 'Giro Extra Ruleta')",
        [userId, -cost]
      );

      await client.query(`
        UPDATE users
        SET roulette_tickets_bought_today = CASE
            WHEN last_roulette_ticket_bought_at::date = CURRENT_DATE THEN roulette_tickets_bought_today + 1
            ELSE 1
        END,
        last_roulette_ticket_bought_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [userId]);

      // Spin in the same transaction so the gems spent and the prize won commit
      // or roll back together.
      const prize = await grantPrize(client, userId, pickPrize());
      const finalUser = (await client.query('SELECT reppy_coins, reppy_gems FROM users WHERE id = $1', [userId])).rows[0];

      return {
        status: 200,
        body: {
          message: '¡Giro extra completado!',
          prize,
          new_coins: finalUser.reppy_coins,
          new_gems: finalUser.reppy_gems
        }
      };
    });

    if (result.status !== 200) return res.status(result.status).json(result.body);

    result.body.extraSpinCost = await getRouletteTicketPrice(userId);
    return res.json(result.body);
  } catch (error) {
    console.error('Error in buy-and-spin:', error);
    res.status(500).json({ message: 'Error al procesar el giro extra' });
  }
});

// ---------------------------------------------------------------------------
// Daily Roulette — once every 24h, no tickets/gems. Separate cooldown column
// (last_daily_spin_at) so it never interferes with the 4h wheel.
// ---------------------------------------------------------------------------

router.get('/daily-status', optionalAuthenticate, async (req, res) => {
  try {
    if (!req.user) return res.json({ canSpin: false });

    const userRes = await query(`
      SELECT last_daily_spin_at,
      (last_daily_spin_at IS NOT NULL AND last_daily_spin_at > NOW() - make_interval(hours => $2)) AS on_cooldown,
      (last_daily_spin_at + make_interval(hours => $2)) AS next_spin_at
      FROM users WHERE id = $1
    `, [req.user.id, DAILY_COOLDOWN_HOURS]);

    const row = userRes.rows[0];
    const onCooldown = row.on_cooldown;

    res.json({
      canSpin: !onCooldown,
      lastSpinAt: row.last_daily_spin_at,
      nextSpinAt: onCooldown ? row.next_spin_at : null,
      cooldownHours: DAILY_COOLDOWN_HOURS
    });
  } catch (error) {
    console.error('Error checking daily roulette status:', error);
    res.status(500).json({ message: 'Error checking status' });
  }
});

router.post('/daily-spin', authenticate, async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await withTransaction(async (client) => {
      // Lock the row so concurrent daily spins serialize — same race-proofing
      // pattern as the 4h /spin: stamp the cooldown under the lock before paying.
      const userRes = await client.query(`
        SELECT (last_daily_spin_at IS NOT NULL AND last_daily_spin_at > NOW() - make_interval(hours => $2)) AS on_cooldown
        FROM users WHERE id = $1 FOR UPDATE
      `, [userId, DAILY_COOLDOWN_HOURS]);
      if (userRes.rowCount === 0) return { status: 404, body: { message: 'User not found' } };

      if (userRes.rows[0].on_cooldown) {
        return { status: 400, body: { message: 'La ruleta diaria aún no está disponible. ¡Vuelve mañana!' } };
      }

      await client.query('UPDATE users SET last_daily_spin_at = CURRENT_TIMESTAMP WHERE id = $1', [userId]);

      const prize = await grantPrize(client, userId, pickPrize(DAILY_PRIZES));
      const finalUser = (await client.query('SELECT reppy_coins, reppy_gems FROM users WHERE id = $1', [userId])).rows[0];

      return {
        status: 200,
        body: {
          message: '¡Giro diario completado!',
          prize,
          new_coins: finalUser.reppy_coins,
          new_gems: finalUser.reppy_gems
        }
      };
    });

    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error('Error spinning daily roulette:', error);
    res.status(500).json({ message: 'Error al procesar el premio' });
  }
});

export default router;
