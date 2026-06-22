# Reppy — Guía del proyecto

App de fitness gamificada (RPG): registras repeticiones/entrenamientos, subes de nivel,
peleas contra bosses, compras items, giras la ruleta, etc.

## Stack y estructura

Monorepo con npm workspaces (`package.json` raíz → `frontend`, `backend`).

- **`frontend/`** — Vue 3 (`<script setup>`) + Vite + Pinia + Vue Router + Tailwind.
  Build con `vite-ssg` (SSR estático para SEO). i18n propio (no vue-i18n).
- **`backend/`** — Express 5 (ESM, `"type": "module"`) + PostgreSQL (`pg`, SQL crudo, sin ORM).
  Auth JWT. Realtime con Pusher. Push con `web-push`. Cron con `node-cron`.
- **`api/`** — shim para el despliegue serverless en Vercel (`vercel.json`).
- **`docs/`** — roadmap de rediseño y notas.

### Arrancar en local
- `dev.bat` (Windows) levanta backend (`nodemon`, puerto 5001) y frontend (`vite`) en dos terminales.
- O por separado: `cd backend && npm run dev` · `cd frontend && npm run dev`.

## Backend

- **`index.js`** — monta todas las rutas bajo `apiRouter` (prefijo `/api/...`). Es el índice
  de qué módulo sirve qué: `/auth`, `/reps`, `/social`, `/shop`, `/boss`, `/roulette`,
  `/training`, `/missions`, `/pvp`, `/challenges`, etc. Cada uno es su propio `*.js` con un router.
- **`db.js`** — `query()` y `withTransaction(cb)`. Usa `withTransaction` + `FOR UPDATE` para
  cualquier cosa con economía/concurrencia (ver el patrón en `roulette.js`).
- **`schema.sql`** — esquema + migraciones idempotentes (`ALTER TABLE ... ADD COLUMN IF NOT EXISTS`).
  Las columnas nuevas de usuario se añaden ahí abajo (~línea 280+).
- **`middleware.js`** — `authenticate` / `optionalAuthenticate`.
- **`archive/`** — scripts de migración/seed de un solo uso (NO se ejecutan en runtime).
  `scripts/` — seeds vigentes (p. ej. `seed_rpg_items.js`).

## Economía e items (importante)

- **Las rarezas son**, de menor a mayor: `common` < `rare` < `especial` < `legendary` < `calistenico`.
  (Ojo: en español, `especial`/`calistenico`, no `epic`/`special`.)
- **Los items reales viven en la tabla `items` de la BD**, NO en los JSON de `backend/data/`.
  `backend/data/editable_items.json` y `item_icon_mapping.json` son **solo mapeos de iconos**
  (iconos `gi:*` de game-icons). La fuente de verdad de los consumibles está en el seed
  `backend/archive/diversify_consumables.js` (pociones: buffs con `stats.duration` + `multiplier`
  o `dex_bonus`, escalando por rareza).
- **Monedas**: `users.reppy_coins`. **Gemas**: `users.reppy_gems` (con log en `gem_transactions`).
- **Cofres**: columnas `level_chests` / `boss_chests` / `epic_chests` en `users`.

## Ruleta (LuckyWheel)

Dos archivos que **deben mantenerse sincronizados**:
- **`backend/roulette.js`** — tabla `ROULETTE_PRIZES` (los `weight` suman 100), `pickPrize()`,
  `grantPrize()`, cooldown `SPIN_COOLDOWN_HOURS = 4`. Endpoints: `/status`, `/spin`,
  `/buy-and-spin`. Cooldown vía `users.last_spin_at`. Giros extra con gemas (precio escala ×2/día).
- **`frontend/src/components/shop/LuckyWheel.vue`** — el array `rewards` debe replicar
  `ROULETTE_PRIZES`: cada `size` = `weight × 3.6` (para llenar 360°) y el `id` debe coincidir
  con el del backend para que la rueda caiga en el segmento correcto.
- **`frontend/src/stores/roulette.js`** — estado Pinia + modal. Se abre con `rouletteStore.openModal()`
  (botón flotante en `App.vue`, también desde `Shop.vue`).

## SEO / blog

Pipeline en el `build` de `frontend`: doble fuente del blog (`backend/blogData.json` →
`frontend/src/blogPosts.json` vía `sync-blog`), `vite-ssg` genera HTML, `scripts/fix-ssg-seo.js`
sobrescribe metadatos. Ver `memory/reppy-seo-setup.md` para detalles.

## Convenciones

- Textos de UI mediante i18n: `frontend/src/locales/{es,en}.js` + `useI18nStore()` → `i18n.t('clave')`.
  No hardcodear strings visibles; añade la clave en **ambos** locales.
- Mensajes de error/labels de cara al usuario suelen ir en español.
- Estilo Tailwind con dark mode (`dark:`). Color de marca: primary (azul eléctrico).
