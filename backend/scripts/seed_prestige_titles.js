import { query } from '../db.js';
import { PRESTIGE_TITLES } from '../data/prestigeTitles.js';

// Siembra los 5 títulos exclusivos de prestigio en la tabla `items`.
//
// Hace falta un seed (y no solo un JSON) porque los cosméticos viven en la BD:
// `users.equipped_title_id` referencia `items(id)`, así que un título que no esté
// en `items` no se puede ni otorgar ni equipar.
//
// Idempotente: `ON CONFLICT (name)` reescribe la definición, así que re-ejecutarlo
// tras retocar textos o estilos actualiza sin duplicar ni tocar quién los tiene.
//
// Uso: node backend/scripts/seed_prestige_titles.js
async function seed() {
  // El seed puede correr antes de que arranque el backend (que es quien aplica la
  // migración), así que se asegura la columna aquí también.
  await query('ALTER TABLE items ADD COLUMN IF NOT EXISTS is_exclusive BOOLEAN DEFAULT FALSE');

  for (const t of PRESTIGE_TITLES) {
    const res = await query(
      `INSERT INTO items (name, description, type, rarity, css_value, price, price_gems, is_exclusive, is_customizable)
       VALUES ($1, $2, 'title', $3, $4, 0, 0, TRUE, TRUE)
       ON CONFLICT (name) DO UPDATE SET
         description = EXCLUDED.description,
         type = EXCLUDED.type,
         rarity = EXCLUDED.rarity,
         css_value = EXCLUDED.css_value,
         price = 0,
         price_gems = 0,
         is_exclusive = TRUE
       RETURNING id, name`,
      [t.name, t.description, t.rarity, t.cssValue]
    );
    console.log(`✅ NG+${t.prestigeLevel} → "${res.rows[0].name}" (item ${res.rows[0].id}, ${t.rarity})`);
  }
}

seed()
  .then(() => {
    console.log(`${PRESTIGE_TITLES.length} títulos de prestigio sembrados.`);
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error sembrando los títulos de prestigio:', err);
    process.exit(1);
  });
