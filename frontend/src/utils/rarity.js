/**
 * Fuente ÚNICA de la lógica de rareza del frontend (label, color, clases).
 *
 * Antes esto vivía duplicado en 10+ componentes, cada copia con su propio
 * `switch` y su propia paleta: `legendary` era ámbar en unos sitios, naranja en
 * otros y `primary` en otros; `epic`/`especial` se trataban distinto según el
 * componente, `cosmico` sólo lo conocían dos, y varias copias devolvían strings
 * en español fijo aunque el usuario estuviera en inglés.
 *
 * La paleta canónica es la que ya define `src/cosmetics.css` (`.rarity-*` /
 * `.bg-rarity-*`), no una nueva.
 *
 * IMPORTANTE — rarezas en español: `common` < `rare` < `especial` < `legendary`
 * < `calistenico` (más `cosmico`, por encima de todo). `epic`/`special`/
 * `calisthenic`/`cosmic` son alias que aún llegan de datos viejos y se
 * normalizan aquí; ningún componente debería volver a compararlos a mano.
 */
import { useI18nStore } from '@/stores/i18n';

/** Rarezas canónicas, de menor a mayor. */
export const RARITIES = ['common', 'rare', 'especial', 'legendary', 'calistenico', 'cosmico'];

// Alias que aparecen en datos antiguos (seeds en inglés, columnas sin migrar).
const ALIASES = {
  epic: 'especial',
  special: 'especial',
  calisthenic: 'calistenico',
  cosmic: 'cosmico',
};

/** Normaliza cualquier variante a una rareza canónica. Desconocida → `common`. */
export function normalizeRarity(rarity) {
  const r = String(rarity ?? '').trim().toLowerCase();
  const canonical = ALIASES[r] || r;
  return RARITIES.includes(canonical) ? canonical : 'common';
}

const I18N_KEYS = {
  common: 'rarity_common',
  rare: 'rarity_rare',
  especial: 'rarity_special',
  legendary: 'rarity_legendary',
  calistenico: 'rarity_calisthenic',
  cosmico: 'rarity_cosmico',
};

/** Etiqueta traducida de la rareza (es/en). Nunca devuelve español fijo. */
export function rarityLabel(rarity) {
  const i18n = useI18nStore();
  return i18n.t(I18N_KEYS[normalizeRarity(rarity)]);
}

/** Color hex de la rareza — el mismo que usa `.rarity-*` en cosmetics.css. */
const COLORS = {
  common: '#94a3b8',
  rare: '#60a5fa',
  especial: '#a855f7',
  legendary: '#f59e0b',
  calistenico: '#ccff00',
  cosmico: '#a78bfa', // primera parada del degradado cósmico
};
export function rarityColor(rarity) {
  return COLORS[normalizeRarity(rarity)];
}

/** Clase de texto de `cosmetics.css` (`rarity-legendary`, …). */
export function rarityCssClass(rarity) {
  return `rarity-${normalizeRarity(rarity)}`;
}

/** Clase de fondo+borde de `cosmetics.css` (`bg-rarity-legendary`, …). */
export function rarityBgClass(rarity) {
  return `bg-rarity-${normalizeRarity(rarity)}`;
}

/** Píldora completa (fondo + texto + borde) para badges. */
export function rarityBadgeClass(rarity) {
  return `${rarityBgClass(rarity)} ${rarityCssClass(rarity)}`;
}

/** Sólo el borde, para tarjetas de item. */
const BORDER_CLASSES = {
  common: 'border-white/10',
  rare: 'border-blue-500/40',
  especial: 'border-purple-500/40',
  legendary: 'border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]',
  calistenico: 'border-[#ccff00]/50 shadow-[0_0_12px_rgba(204,255,0,0.2)]',
  cosmico: 'border-pink-400/50 shadow-[0_0_14px_rgba(244,114,182,0.25)]',
};
export function rarityBorderClass(rarity) {
  return BORDER_CLASSES[normalizeRarity(rarity)];
}

/** Color sólido (para halos/glows detrás de una recompensa). */
const GLOW_CLASSES = {
  common: 'bg-slate-400',
  rare: 'bg-blue-400',
  especial: 'bg-purple-500',
  legendary: 'bg-amber-500',
  calistenico: 'bg-[#ccff00]',
  cosmico: 'bg-pink-400',
};
export function rarityGlowClass(rarity) {
  return GLOW_CLASSES[normalizeRarity(rarity)];
}

/** Orden numérico, por si hay que comparar u ordenar por rareza. */
export function rarityRank(rarity) {
  return RARITIES.indexOf(normalizeRarity(rarity));
}

/**
 * Azúcar para `<script setup>`: `const { rarityLabel } = useRarity()`.
 * Todo son funciones puras salvo `rarityLabel`, que lee el store de i18n.
 */
export function useRarity() {
  return {
    RARITIES,
    normalizeRarity,
    rarityLabel,
    rarityColor,
    rarityCssClass,
    rarityBgClass,
    rarityBadgeClass,
    rarityBorderClass,
    rarityGlowClass,
    rarityRank,
  };
}
