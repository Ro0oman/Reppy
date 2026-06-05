/**
 * Migración: añade rareza CÓSMICO
 * - Set Nebula Prime (border, title, background)
 * - Poción Omega (consumible super roto)
 *
 * Ejecutar: node backend/add_cosmic_items.js
 */

import { query } from './db.js';

// Precio legendary base ~2500 coins / 60 gems → cósmico x5
const COSMIC_PRICE_COINS = 12500;
const COSMIC_PRICE_GEMS  = 300;

const COSMIC_ITEMS = [
  // ── SET NEBULA PRIME ────────────────────────────────────────────
  {
    name: 'Nebula Prime',
    description: 'Marco CÓSMICO. Creado en el corazón de una nebulosa a 2.000 años luz. Los que lo portan no entrenan — trascienden.',
    type: 'border',
    rarity: 'cosmico',
    css_value: 'frame-cosmico',
    price: COSMIC_PRICE_COINS,
    price_gems: COSMIC_PRICE_GEMS,
    svg_key: null,
    stats: null,
    is_seasonal: false,
  },
  {
    name: 'Void Ascendant',
    description: 'Título CÓSMICO. Más allá de la materia, más allá del dolor. Solo quienes dominan su cuerpo y su mente pueden llevar este nombre.',
    type: 'title',
    rarity: 'cosmico',
    css_value: 'title-cosmico',
    price: COSMIC_PRICE_COINS,
    price_gems: COSMIC_PRICE_GEMS,
    svg_key: null,
    stats: null,
    is_seasonal: false,
  },
  {
    name: 'Galaxy Core',
    description: 'Fondo CÓSMICO. Una galaxia en espiral como fondo de tus entrenamientos. No eres un atleta, eres una fuerza gravitatoria.',
    type: 'background',
    rarity: 'cosmico',
    css_value: 'bg-cosmic',
    price: COSMIC_PRICE_COINS,
    price_gems: COSMIC_PRICE_GEMS,
    svg_key: null,
    stats: null,
    is_seasonal: false,
  },

  // ── POCIÓN OMEGA (consumible super roto) ────────────────────────
  {
    name: 'Poción Omega',
    description: 'CÓSMICO · Consumible. Multiplicador de daño x3 durante 2 horas. Síntesis experimental de energía estelar condensada. No hay precedentes de su potencia.',
    type: 'consumable',
    rarity: 'cosmico',
    css_value: null,
    price: COSMIC_PRICE_COINS,
    price_gems: COSMIC_PRICE_GEMS,
    svg_key: 'potion_omega',
    stats: JSON.stringify({ damage_multiplier: 3.0, duration: 7200 }), // 2h
    is_seasonal: false,
  },
];

async function run() {
  console.log('🌌 Insertando items CÓSMICOS...');
  for (const item of COSMIC_ITEMS) {
    try {
      await query(
        `INSERT INTO items (name, description, type, rarity, css_value, price, price_gems, svg_key, stats, is_seasonal)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (name) DO UPDATE
           SET description = EXCLUDED.description,
               rarity      = EXCLUDED.rarity,
               css_value   = EXCLUDED.css_value,
               price       = EXCLUDED.price,
               price_gems  = EXCLUDED.price_gems,
               stats       = EXCLUDED.stats`,
        [
          item.name,
          item.description,
          item.type,
          item.rarity,
          item.css_value,
          item.price,
          item.price_gems,
          item.svg_key,
          item.stats,
          item.is_seasonal,
        ]
      );
      console.log(`  ✅ ${item.name} (${item.type})`);
    } catch (err) {
      console.error(`  ❌ Error en ${item.name}:`, err.message);
    }
  }
  console.log('🌌 Listo.');
  process.exit(0);
}

run();
