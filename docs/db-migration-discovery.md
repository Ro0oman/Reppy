# Discovery — Migración de la BD de Supabase a self-hosted (Fase 1)

> **Estado**: Fase 1 (DISCOVERY) — solo lectura, sin cambios de código ni de infra.
> **Fecha**: 2026-07-26 · **Autor**: routine nocturna (agente autónomo).
> **Alcance**: inventariar qué se usa hoy de Supabase antes de tocar nada, para
> decidir si la migración es trivial o no. Referencia: `docs/auditoria-2026-07-tasks.md`
> → "🗄️ P1 — Migrar la BD de Supabase a self-hosted".

## ⭐ Veredicto de complejidad: **BAJA**

Supabase se usa **exclusivamente como un Postgres gestionado**, alcanzado vía la
librería `pg` + `DATABASE_URL`. **No** hay SDK de Supabase, **ni** Storage, **ni**
Auth, **ni** RLS, **ni** realtime de Supabase, **ni** extensiones de Postgres.
El realtime es Pusher; el auth es JWT propio + Google OAuth; los avatares viven
dentro de la propia BD (data-URI) o como ficheros estáticos del frontend o URLs
de Google.

En la práctica la migración es: **un dump/restore + cambiar `DATABASE_URL` + revisar
el SSL de `db.js`**. No hace falta ningún cambio de código para apuntar a otro Postgres.

> ⚠️ **Pendiente de PROD (solo Roman)**: los puntos (a) tamaño/filas por tabla y
> (c) versión exacta de Postgres requieren acceso a la BD de producción, que esta
> routine NO tiene (prohibido tocar prod). Abajo van las **queries exactas** para
> que Roman las ejecute y rellene esos dos huecos — no cambian el veredicto (BAJA),
> solo dimensionan el dump y confirman la versión destino.

---

## (b) ¿Qué se usa de Supabase más allá de Postgres puro? → **NADA**

Este es el punto que decide la complejidad, y el resultado es un negativo limpio en todo:

| Servicio Supabase | ¿Se usa? | Evidencia |
|---|---|---|
| **Storage** (buckets/objetos) | ❌ No | Sin `multer`, sin `S3`, sin `bucket`, sin `@supabase/storage-js`. Avatares = data-URI en `users.avatar_url` o ficheros estáticos del frontend (ver §e). |
| **Auth** | ❌ No | Auth 100% propio: JWT (`auth.js:14`, `middleware.js`) + Google OAuth (`google-auth-library`, `auth.js:11,43,51`) + bcrypt. Sin `@supabase/auth`, sin `auth.users`. |
| **RLS / Policies** | ❌ No | Sin `POLICY`, `ENABLE ROW LEVEL SECURITY` ni `auth.uid()`. La autorización se hace en la app vía el middleware JWT. |
| **Realtime** | ❌ No | Realtime = **Pusher** (`backend/pusher.js:10-13`, CSP solo permite `*.pusher.com`). Ninguna suscripción a canales realtime de Supabase. |
| **Extensiones PG** | ❌ No | Sin `CREATE EXTENSION`, sin `uuid-ossp`/`pgcrypto`/`gen_random_uuid()`/`citext`/`pg_trgm`/`tsvector`. Ver §2. |
| **SDK `@supabase/*`** | ❌ No | No es dependencia en ningún `package.json` (backend/root/frontend). Solo `pg`. |

### Tipos y features de Postgres realmente usados (todos portables a un Postgres estándar ≥ 12)
- **PKs `SERIAL`** (enteros). **No se usa el tipo UUID en absoluto.** `users.id` es
  `VARCHAR(255)` con el Google ID (`schema.sql:4`); las FKs son `VARCHAR(255)`/`INTEGER`.
- `JSONB` (core de Postgres, p.ej. `schema.sql:99-100,289`), `TIMESTAMP WITH TIME ZONE`,
  `DATE`, `DECIMAL`.
- Índices: btree normales (`index.js:759-761`).
- Nota: `db.js:9` fija un type-parser de cliente para el OID 1082 (DATE→string, evita
  el shift UTC). Es una config del cliente `pg`, no una feature de la BD — se conserva igual.

---

## (d) Referencias a Supabase en el código + env vars

### Todas las apariciones de `supabase` (case-insensitive)
Ninguna es funcional — son comentarios, un log de arranque y scripts archivados:

- `backend/db.js:16` — comentario ("managed Postgres (Supabase) which already enforces TLS").
- `backend/schema.sql:1` — comentario `-- Use this schema for PostgreSQL (Supabase/Neon)`.
- `backend/index.js:148` — comentario del CSP ("user avatars (Supabase/Google)…").
- `backend/archive/apply_schema.js:18` — log de un script archivado (no runtime).
- `backend/backend_debug.log:7` — log de arranque con el host real de prod:
  `aws-1-eu-west-1.pooler.supabase.com` (el **pooler** de conexiones de Supabase).
- `docs/*` — la documentación de planificación.

`frontend/` no tiene **ninguna** referencia a Supabase. No hay cadenas de conexión
hardcodeadas: la URL sale siempre de `process.env.DATABASE_URL`.

### Env vars — la única que cambia en el cutover
- **`DATABASE_URL`** — la única cadena de conexión. Usada en `db.js:12,21,27,29`,
  `migrate_user_items.cjs:6`, `scripts/migrate_avatars.js:9`, `archive/apply_schema.js:13`,
  `tests/economy-concurrency.test.mjs:15`. **Es lo único a cambiar para el cutover.**
- `DB_INIT_SECRET` — protege la ruta `/db/init` (`index.js:382`).
- **No existe ninguna env var de storage/bucket/S3/Supabase** (`SUPABASE_URL`,
  `SUPABASE_KEY`, `S3_*`, `STORAGE_*` → todas ausentes). Negativo limpio: no hay
  nada storage-side que migrar.
- Otras (contexto, no tocan BD): `JWT_SECRET`, `GOOGLE_CLIENT_ID`,
  `PUSHER_APP_ID/KEY/SECRET/CLUSTER`, `VAPID_*`, `HEVY_ENCRYPTION_KEY`/`HEVY_API_KEY`,
  `PORT`, `NODE_ENV`, `FRONTEND_URL`, etc.

### Conexión (`backend/db.js`)
- Un solo `pg.Pool` desde `connectionString: process.env.DATABASE_URL` (`db.js:11-12`).
  Expone `query()` y `withTransaction()` (transacciones reales por cliente, `db.js:51-68`).
- **SSL**: condicional — para hosts no-locales usa `ssl: { rejectUnauthorized: false }`;
  para `localhost`/`127.0.0.1` desactiva SSL (`db.js:21-23`). **A revisar tras migrar**
  (red interna: o sin TLS en red privada, o TLS con CA propio y `rejectUnauthorized:true`).
  Ya está anotado como task en `auditoria-2026-07-tasks.md`.
- **Pooling**: pooling a nivel de app vía `pg.Pool`. El host de prod es el **pooler**
  de Supabase (`backend/backend_debug.log:7`). El puerto (5432 sesión vs 6543
  transacción/pgbouncer) va dentro del secreto `DATABASE_URL`, no en el código.
  ⚠️ **Importante**: como la app usa `withTransaction()` (múltiples sentencias en
  un mismo cliente), si en el destino se pone un pooler por delante, debe ir en
  **modo sesión** (no transaction/pgbouncer) para no romper las transacciones.

---

## (e) ¿Qué se rompe si Supabase desaparece? → **Prácticamente nada**

- **Avatares** — el ítem que se temía "de riesgo", y está limpio. Tres orígenes, todos
  self-contained (viajan en el dump normal o con el build del frontend):
  1. **Presets**: ruta relativa `"/img/avatars/avatar_N.webp"` en `users.avatar_url`
     (`users.js:140`). Los `.webp` viven en `frontend/public/img/avatars/` → van con
     el build del frontend, no en ningún bucket.
  2. **Custom**: **data-URI base64 guardado inline en `users.avatar_url`** (`TEXT`).
     Endpoint `PATCH /avatar` (`users.js:112,159`): recibe `data:image/…`, recomprime
     con `sharp` a 128×128 webp, y hace `UPDATE users SET avatar_url = $1`. Sin escritura
     a disco ni a bucket → viaja en el `pg_dump`.
  3. **Google**: la URL `picture` de Google se guarda tal cual (`auth.js:62`) → apunta al
     CDN de Google, no a Supabase.
- **Auth / sesiones**: JWT propio; nada depende de Supabase Auth.
- **Realtime**: Pusher; independiente.
- **Único artefacto Supabase-específico en runtime**: el **hostname** del pooler dentro
  del secreto `DATABASE_URL`. Cambiar ese secreto = migración apuntada.

---

## (a) y (c) — PENDIENTE: métricas de prod (queries listas para Roman)

Esta routine no tiene acceso a la BD de prod (prohibido). Roman ejecuta estas queries
(solo-lectura) contra Supabase y pega los resultados aquí para cerrar la Fase 1:

### (c) Versión exacta de Postgres
```sql
SELECT version();
SHOW server_version;
```
> Contexto: el sandbox de dev corre PostgreSQL 16. El destino self-hosted debería ser
> la misma major o superior para restaurar el dump sin fricción.

### (a) Tamaño por tabla + nº de filas + crecimiento
```sql
-- Tamaño total de la BD
SELECT pg_size_pretty(pg_database_size(current_database())) AS db_total;

-- Tamaño por tabla (datos + índices + toast), de mayor a menor
SELECT
  n.nspname AS schema,
  c.relname AS tabla,
  pg_size_pretty(pg_total_relation_size(c.oid)) AS total,
  pg_size_pretty(pg_relation_size(c.oid))       AS solo_datos,
  c.reltuples::bigint                            AS filas_aprox
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relkind = 'r' AND n.nspname NOT IN ('pg_catalog','information_schema')
ORDER BY pg_total_relation_size(c.oid) DESC;

-- Conteo exacto de filas en las tablas grandes (ajustar nombres)
SELECT
  (SELECT COUNT(*) FROM users) AS users,
  (SELECT COUNT(*) FROM reps)  AS reps,
  (SELECT COUNT(*) FROM notifications) AS notifications,
  (SELECT COUNT(*) FROM daily_summaries) AS daily_summaries;

-- Crecimiento mensual (ejemplo con reps por mes de creación)
SELECT date_trunc('month', created_at) AS mes, COUNT(*) AS nuevas_filas
FROM reps GROUP BY 1 ORDER BY 1;
```
> Probable candidata a tabla más grande: `reps` (una fila por usuario/día/ejercicio) y,
> si aún no se corrió `scripts/migrate_avatars.js`, `users` por los avatares base64 inline.
> Ese script (solo-BD) reasigna avatares base64 pesados a presets estáticos y **conviene
> correrlo antes del dump** para reducir su tamaño.

---

## Fuentes de esquema (3, todas portables — relevante para la Fase 3)

La BD destino se puede levantar desde cualquiera de estas; las tres convergen en el
mismo esquema Postgres estándar (sin nada Supabase-específico):

1. **`backend/schema.sql`** — el esquema canónico completo (recomendado para levantar
   la BD nueva). Aplicable con `psql -f schema.sql`.
2. **`GET /db/init`** (`index.js:381`, gated por `DB_INIT_SECRET`) — `CREATE/ALTER … IF
   NOT EXISTS` + seeds de algunos ítems/cosméticos.
3. **`ensureSchemaMigrations()`** (`index.js:746`, en el arranque) — migraciones
   idempotentes ligeras.

> Nota: la task "Unificar las 3 fuentes de esquema" (deuda técnica) sigue pendiente y
> es ortogonal a esta migración — pero conviene tenerla en mente al validar la Fase 3.

---

## Próximos pasos (según el plan de tasks)

- **Cerrar Fase 1**: Roman ejecuta las queries (a)/(c) y pega resultados aquí. Con eso,
  Fase 1 queda completa y aprobable.
- **Fase 2 (plan)**: topología (contenedor en Coolify vs servicio aparte en la LAN),
  backups automáticos (`pg_dump` programado + retención + **prueba de restore**, obligatorio
  antes de migrar), estrategia de secretos, plan de cutover con ventana y rollback.
  → Storage NO necesita sustituto (no se usa), lo que simplifica esta fase.
- **Fase 3 (staging en paralelo)**: levantar Postgres self-hosted, cargar `schema.sql`,
  restaurar un dump reciente, arrancar el backend contra la BD local y pasar `npm test`
  (la suite de economía ya corre con `DATABASE_URL` local).
- **Fase 4 (cutover)** 👤: dump final, restore, cambiar `DATABASE_URL` en Coolify, verificar,
  y mantener Supabase intacto ~2 semanas como rollback.
- **SSL de `db.js`**: reevaluar `rejectUnauthorized:false` con Postgres en red interna.
