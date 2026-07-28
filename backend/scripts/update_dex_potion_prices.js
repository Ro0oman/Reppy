import { query } from '../db.js';

// One-shot rebalance de precios de las pociones de DEX (auditoría 2026-07, decidido
// por Roman el 2026-07-27).
//
// Motivo: la poción calisténica "Maestría del Cuerpo" (+100 dex, 24h) a 18.000 monedas
// era un outlier de ratio daño/coste — el crítico escala con DEX (`critMult = 2 + dex*0.1`),
// así que era, con diferencia, la compra más rentable del juego. Sube a 40.000.
// "Sangre de Dragón" (legendary, +50 dex, 6h) sube a 13.000 para no convertirse ella
// en el nuevo outlier un escalón por debajo.
//
// Los items VIVEN EN LA TABLA `items` (ya sembrada); el seed `archive/diversify_consumables.js`
// NO corre en runtime, por eso hace falta este UPDATE además de actualizar el seed.
//
// Idempotente: re-ejecutarlo deja los mismos precios.
//
// Uso: node backend/scripts/update_dex_potion_prices.js
const NEW_PRICES = [
  { name: 'Maestría del Cuerpo', price: 40000 },
  { name: 'Sangre de Dragón', price: 13000 },
];

async function updatePrices() {
  for (const { name, price } of NEW_PRICES) {
    const res = await query(
      `UPDATE items SET price = $2
        WHERE name = $1::text AND type = 'consumable'
        RETURNING id, name, price`,
      [name, price]
    );

    if (res.rowCount === 0) {
      console.warn(`⚠️  No se encontró el consumible "${name}" — nada que actualizar.`);
      continue;
    }
    for (const row of res.rows) {
      console.log(`✅ ${row.name} (id ${row.id}) → ${row.price} monedas`);
    }
  }
}

updatePrices()
  .then(() => {
    console.log('Precios de pociones DEX actualizados.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error actualizando precios:', err);
    process.exit(1);
  });
