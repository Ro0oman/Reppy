import { query } from './db.js';

/**
 * One-time data fix for issue #224: four combat-gear items were created with
 * price = 0 AND price_gems = 0, which let them be acquired for free when they
 * surfaced as a daily deal. Assign prices following the existing per-rarity
 * convention (see other head/weapon/armor items).
 *
 *   node fix_unpriced_items.js
 */

// id → { price (coins), price_gems }
const PRICES = {
  791: { price: 100,   price_gems: 0   }, // armor / common      (Harrapos de Entrenamiento)
  793: { price: 1000,  price_gems: 0   }, // head  / especial    (Casco de Élite)
  794: { price: 3000,  price_gems: 50  }, // weapon/ legendary   (Espada de Dragón)
  795: { price: 10000, price_gems: 100 }, // armor / calistenico (Armadura del Dios Calisténico)
};

async function fix() {
  console.log('--- FIX UNPRICED ITEMS (#224) ---');
  for (const [id, p] of Object.entries(PRICES)) {
    const before = await query('SELECT name, COALESCE(price,0) price, COALESCE(price_gems,0) gems FROM items WHERE id = $1', [id]);
    if (before.rows.length === 0) { console.log(`#${id}: NOT FOUND, skipping`); continue; }
    const b = before.rows[0];
    // Only fix items that are actually unpriced, so re-running is safe.
    if (b.price > 0 || b.gems > 0) {
      console.log(`#${id} "${b.name}": already priced (${b.price}c/${b.gems}g), skipping`);
      continue;
    }
    await query('UPDATE items SET price = $1, price_gems = $2 WHERE id = $3', [p.price, p.price_gems, id]);
    console.log(`#${id} "${b.name}": 0/0 → ${p.price}c/${p.price_gems}g`);
  }
  console.log('✅ Done.');
  process.exit(0);
}

fix().catch((e) => { console.error('❌ Failed:', e); process.exit(1); });
