## 📊 Contexto

Análisis del archivo `network/localhost.har` tras aplicar la primera ronda de optimizaciones de rendimiento (commit `bd81d69`). Las pruebas se realizaron el 2026-04-28 en entorno local (`localhost:5173`).

**Resumen global post-optimización:**

| Métrica | Antes | Después | Estado |
|---|---|---|---|
| `/api/users/me` repeticiones | 6x | **2x** | ✅ Resuelto |
| Egress total (aprox) | ~15 MB | **9.26 MB** | ✅ −38% |
| `/api/boss/active` repeticiones | — | **3x** | 🔴 Pendiente |
| TTFB `/api/profile/:id` | >1s | **991ms** | 🔴 Sin mejora |
| Bundle `lucide-vue-next.js` | — | **1.2 MB** | 🔴 Pendiente |

---

## 🔴 Issue #1 — `/api/boss/active` se llama 3 veces por carga

**Datos HAR:**
```
3x  | http://localhost:5173/api/boss/active
Avg TTFB: 273ms
Coste acumulado: ~820ms innecesarios por sesión
```

**Causa probable:** Tres componentes distintos (posiblemente `BossCard`, `BossView` y algún widget del dashboard) montan de forma independiente y cada uno dispara su propia llamada sin coordinación entre stores.

**Solución propuesta:** Aplicar el mismo patrón de throttle + fetchPromise que en `auth.js`:
```js
// En el store del boss (frontend/src/stores/boss.js o similar)
state: () => ({
  lastFetch: 0,
  fetchPromise: null,
  boss: null,
}),
actions: {
  async fetchActiveBoss(force = false) {
    if (this.fetchPromise) return this.fetchPromise;
    const now = Date.now();
    if (!force && this.lastFetch && now - this.lastFetch < 10000) {
      return this.boss;
    }
    this.fetchPromise = (async () => {
      try {
        const res = await axios.get('/api/boss/active');
        this.boss = res.data;
        this.lastFetch = Date.now();
        return this.boss;
      } finally {
        this.fetchPromise = null;
      }
    })();
    return this.fetchPromise;
  }
}
```

**Ahorro estimado:** 2 peticiones eliminadas × 273ms = ~546ms ahorrados + reducción de carga en DB por sesión.

---

## 🔴 Issue #2 — TTFB de `/api/profile/:id` sigue en ~991ms

**Datos HAR:**
```
991.12 ms (avg TTFB) | http://localhost:5173/api/profile/113903862264612270084?type=all
2x repeticiones
```

**Contexto:** Se optimizó el Bundle Sync Protocol en `backend/profile.js` usando `unnest` para agrupar inserciones en lote. Sin embargo, el TTFB no bajó significativamente respecto a la captura anterior.

**Causas posibles a investigar (por orden de sospecha):**

1. **`autoGrantPendingChests()`** — se ejecuta en `/api/users/me` pero ¿también se llama desde `/api/profile/:id`? Si es así, puede estar bloqueando la respuesta con lógica de DB adicional.
2. **JOINs sin índices** — la query `type=all` puede estar realizando seq scans en tablas grandes (`reps`, `user_inventory`, `friendships`).
3. **Doble llamada desde el cliente** — el perfil se pide 2 veces por sesión; posiblemente un watcher reactivo + `onMounted` disparando en paralelo.

**Diagnóstico sugerido — añadir timing granular:**
```js
// En backend/profile.js
router.get('/:id', async (req, res) => {
  const t0 = Date.now();
  // ... sección 1: datos del usuario
  console.log('[PROFILE] user query:', Date.now() - t0, 'ms');
  // ... sección 2: reps/stats
  console.log('[PROFILE] reps query:', Date.now() - t0, 'ms');
  // ... sección 3: inventario/cosmetics
  console.log('[PROFILE] inventory query:', Date.now() - t0, 'ms');
  // ... total
  console.log('[PROFILE] TOTAL:', Date.now() - t0, 'ms');
});
```

**Índices a verificar en Supabase/Postgres:**
```sql
-- Revisar si existen estos índices:
SELECT indexname FROM pg_indexes WHERE tablename IN ('reps', 'user_inventory', 'friendships', 'users');

-- Crear si faltan:
CREATE INDEX IF NOT EXISTS idx_reps_user_id ON reps(user_id);
CREATE INDEX IF NOT EXISTS idx_user_inventory_user_id ON user_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_users ON friendships(user_id_1, user_id_2);
```

---

## 🔴 Issue #3 — Bundle JS masivo: lucide + date-fns = 2.5 MB sin tree-shaking

**Datos HAR:**
```
1219.25 KB | lucide-vue-next.js       ← librería de iconos completa
 898.19 KB | date-fns_locale.js       ← todos los locales de date-fns
 392.18 KB | date-fns.js
```
**Total JS pesado: ~2.5 MB** cargados en el primer acceso.

### Lucide — Tree-shaking

Verificar el patrón actual en los componentes:
```js
// ❌ MAL — importa los 1400+ iconos completos
import * as Icons from 'lucide-vue-next'
import LucideIcons from 'lucide-vue-next'

// ✅ BIEN — Vite hace tree-shaking automático con named imports
import { Dumbbell, Trophy, Sword, ChevronRight } from 'lucide-vue-next'
```

**Comando para auditar todos los imports actuales:**
```bash
grep -r "lucide-vue-next" frontend/src --include="*.vue" --include="*.js" -l
grep -r "from 'lucide-vue-next'" frontend/src --include="*.vue" -h | sort | uniq
```

### date-fns — Solo cargar locale `es`

```js
// ❌ MAL
import { es, en, fr, de } from 'date-fns/locale'

// ✅ BIEN — solo el locale necesario
import { es } from 'date-fns/locale/es'
```

**Ahorro estimado:** Potencial reducción del bundle inicial de ~2.5 MB → < 600 KB. Impacto directo en LCP y TTI en conexiones lentas/móvil.

**Herramienta de medición:**
```bash
npx vite-bundle-visualizer
# Genera dist/stats.html con un treemap interactivo del bundle
```

---

## 🟡 Issue #4 — `/api/notifications` con 427ms de TTFB

**Datos HAR:**
```
426.67 ms (avg TTFB) | http://localhost:5173/api/notifications
```

El throttle del store de notifications se implementó, por lo que la llamada ya no se repite. Pero el primer fetch sigue siendo lento.

**Acción:** Ejecutar `EXPLAIN ANALYZE` en la query principal de `backend/notifications.js`:
```sql
EXPLAIN ANALYZE
SELECT * FROM notifications
WHERE user_id = $1
ORDER BY created_at DESC
LIMIT 20;
```

Si hay un `Seq Scan` en lugar de `Index Scan`, crear índice:
```sql
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id, created_at DESC);
```

---

## 🟡 Issue #5 — Verificar Cache-Control en Vercel para assets estáticos

**Datos HAR (dev local, sin cache):**
```
578.87 KB | images/pvp/neon_gym.webp    (re-descargado en cada sesión en dev)
459.00 KB | images/pvp/default.webp
167.99 KB | images/pvp/forest_temple.webp
147.47 KB | images/pvp/steel_dungeon.webp
```

En producción (Vercel), los assets del bundle tienen `immutable` automático, pero los archivos de `/public/images/` puede que no. Verificar `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/images/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    },
    {
      "source": "/img/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

---

## 📋 Checklist de Tareas

- [ ] **#1** Implementar throttle + `fetchPromise` en el store de boss
- [ ] **#1** Identificar qué 3 componentes disparan `fetchActiveBoss` y consolidar
- [ ] **#2** Añadir logs de timing granular en `backend/profile.js`
- [ ] **#2** Verificar índices en `reps`, `user_inventory`, `friendships` con `pg_indexes`
- [ ] **#2** Confirmar si `/api/profile/:id` llama a `autoGrantPendingChests` (y si es necesario)
- [ ] **#3** Auditar todos los imports de `lucide-vue-next` — convertir a named imports
- [ ] **#3** Auditar imports de `date-fns/locale` — cargar solo `es`
- [ ] **#3** Ejecutar `npx vite-bundle-visualizer` y documentar tamaños antes/después
- [ ] **#4** `EXPLAIN ANALYZE` en query de `notifications` — añadir índice si hay seq scan
- [ ] **#5** Verificar/añadir headers `Cache-Control` en `vercel.json` para `/images/**` y `/img/**`

---

## 🛠️ Herramientas de diagnóstico

```bash
# Analizar cualquier HAR nuevo con el script existente
node scratch/analyze_har.js

# Visualizar bundle de producción (genera dist/stats.html)
npx vite-bundle-visualizer

# Ver imports de lucide en todo el proyecto
grep -rn "lucide-vue-next" frontend/src --include="*.vue"

# Conectar a DB y analizar queries lentas
node backend/debug_full.js
```

**HAR de referencia:** `network/localhost.har` (capturado 2026-04-28 ~00:32, commit `bd81d69`)
