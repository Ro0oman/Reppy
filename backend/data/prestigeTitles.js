/**
 * Títulos exclusivos de prestigio — la recompensa de cada vuelta de New Game+.
 *
 * Set FIJO de 5: NG+1 → Renacido I … NG+5 → Renacido V. A partir de NG+6 no hay
 * cosmético nuevo (decisión de Roman, 2026-07-27). No se compran, no se venden y
 * no pueden salir de un cofre: viven en `items` con `is_exclusive = TRUE`, que es
 * lo que filtran la tienda, la rotación diaria y las queries de loot por rareza.
 *
 * `css_value` es un NOMBRE DE CLASE CSS (los títulos se pintan con `:class`, no
 * con estilo inline) — definidas en `frontend/src/cosmetics.css`. La escala visual
 * va bronce → plata → oro → carmesí → prismático.
 *
 * Esta lista es la fuente única: la consumen el seed
 * (`backend/scripts/seed_prestige_titles.js`) y el grant de `prestige()`.
 */
export const PRESTIGE_TITLES = [
  {
    prestigeLevel: 1,
    name: 'Renacido I',
    description: 'Completaste la campaña y volviste a empezar. La primera de muchas vueltas.',
    rarity: 'rare',
    cssValue: 'title-renacido-i',
  },
  {
    prestigeLevel: 2,
    name: 'Renacido II',
    description: 'Dos campañas a la espalda. Ya no es casualidad.',
    rarity: 'especial',
    cssValue: 'title-renacido-ii',
  },
  {
    prestigeLevel: 3,
    name: 'Renacido III',
    description: 'Tres vueltas. El camino se te ha quedado corto tres veces.',
    rarity: 'especial',
    cssValue: 'title-renacido-iii',
  },
  {
    prestigeLevel: 4,
    name: 'Renacido IV',
    description: 'Cuatro renacimientos. Muy pocos llegan hasta aquí.',
    rarity: 'legendary',
    cssValue: 'title-renacido-iv',
  },
  {
    prestigeLevel: 5,
    name: 'Renacido V',
    description: 'Cinco vueltas completas. No queda nada de la campaña que no hayas roto.',
    rarity: 'calistenico',
    cssValue: 'title-renacido-v',
  },
];

/** El título que corresponde a una vuelta de prestigio, o null si ya no hay más. */
export function titleForPrestigeLevel(level) {
  return PRESTIGE_TITLES.find((t) => t.prestigeLevel === Number(level)) || null;
}
