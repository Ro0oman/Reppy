# Rediseño del sistema de combate — Campaña RPG

> Documento de seguimiento vivo. Creado 2026-07-08. Estado: **diseño cerrado, implementación no empezada**.
> Decisiones confirmadas por Roman: progresión **individual + raids comunitarios**, coexistencia con
> **feature flag**, senda **permanente por run**, y lanzamiento con la **campaña completa** (3 actos).

---

## 1. Visión

Convertir el boss rotatorio actual en una **campaña RPG de verdad**: un mapa con zonas y nodos,
bestiario de enemigos (esbirros, duendes, esqueletos, zombies, arañas, bandidos…), NPCs que dan
misiones encadenadas, una encrucijada moral (senda oscura vs luminosa) con consecuencias reales,
y prestigio/New Game+ al terminar. Todo **data-driven**: añadir enemigos, zonas o campañas enteras
("campaña God of War") no debe requerir tocar código, solo contenido (JSON seed → BD).

El principio intocable de Reppy se mantiene: **el daño son tus repeticiones**. No hay botón de
atacar; entrenar es atacar.

---

## 2. Auditoría del sistema actual (Fase 1)

### 2.1 Combate hoy (boss comunitario)

- **`backend/boss.js`** — `GET /boss/active` devuelve el boss con menor `order_index` no derrotado.
  Si todos están derrotados, hace un **auto-reset del loop dentro del GET** (advisory lock
  `pg_advisory_xact_lock(919191)`, otorga cofres pendientes antes de wipear `event_participants`).
  Resto de endpoints: claim/open de cofres (normal/épico/legendario/nivel) con el patrón
  "atomic gate" (UPDATE guardado que gasta antes de generar loot) + `/history/:bossId`.
- **`backend/utils/damage.js`** — `calculateDamage(user, reps, type, boss, …)`: multiplicador por
  ejercicio (muscleups 10x … pushups 2x) + bonus por lastre, escalado Dark-Souls por 7 stats
  (str/dex/end/vig/int/fth/cha), crits **por rep**, `weakness_stat` del boss (×1.5+), perks del
  árbol (`power`, `crit_*`, `weakness_hunter`, `execution` <25% HP), buffs de consumibles
  (`damage_multiplier` + expiry en users).
- **Aplicación del daño**: duplicada en **`reps.js` (~línea 127)** y **`training.js` (~línea 225)**.
  Ambos: buscan el boss activo, recalculan daño con weakness, `UPDATE boss_fights ... GREATEST(0, hp-$1)`,
  upsert en `event_participants`, `daily_boss_damage` en users, y si HP llega a 0 →
  `syncBossHealth()` + `grantLastHitBonus` + `broadcastDamage` + `createBossKillEvent`.
  **La edición/borrado de reps ajusta retroactivamente el HP del boss** (reps.js ~660-820).
- **`utils/boss.js`** — `syncBossHealth()`: HP hardcodeado 50000 (×3 épico, ×8 legendario).
- **`utils/bossRewards.js`** — auto-grant idempotente de cofres pendientes; `grantLastHitBonus`
  (golpe de gracia: 1000-2500 coins o item rare/especial).
- **`utils/bossKillEvent.js`** — post en `boss_kill_posts`, push a todos, Pusher `global-events/boss_kill`.
- **`socketManager.js`** — solo Pusher: `broadcastDamage` (global-events/boss_damage), presencia,
  `sendToUser` (private-user-N).
- **Front**: `BattleView.vue` (vista inmersiva /batalla) compone `components/battle/*`
  (RpgTopBar, PlayerCard, BossArena con videos idle/damaged, QuickPotions, BattleActiveBuffs,
  BattleRepsPanel). El daño se registra vía `useRepLogger` (composable compartido con RepsInput y
  QuickLogSheet). Store `stores/boss.js`. Números de daño flotantes vía store `damage`.

### 2.2 Misiones hoy

- Tablas `missions` (catálogo: `goal_type`, `goal_value`, rewards, `is_daily`, `tier`) y
  `user_missions` (progreso + is_active/is_completed/is_claimed).
- `GET /missions` hace el **refill diario dentro del GET** (2 diarias + 1 especial aleatorias);
  `POST /claim` con atomic claim gate + pago en la misma transacción.
- **`utils/missions.js` → `updateMissionProgress(userId, goalType, value, isIncremental)`** es el
  hook de progreso, llamado desde reps.js/training.js con goal_types: `reps`, `damage`, `streak`,
  `night_owl`, `personal_record`, `boss_last_hit`, `use_consumable`, `buy_any`, `social_likes`,
  `spend_coins`, `xp_*`, `complete_N_missions`… (seeds en `archive/seed_massive_missions.js`).
- `rotate_missions.js` (script ops) usa un flag `missions.is_active` global que el flujo por-usuario
  ya no necesita realmente.

### 2.3 Economía relevante

- `users.reppy_coins` / `users.reppy_gems` (+`gem_transactions`); cofres como contadores en users
  (`boss_chests`/`epic_chests`/`legendary_chests`/`level_chests`).
- `items` (rareza: common < rare < especial < legendary < calistenico) + `user_items`.
  Loot de cofres: bandas de probabilidad por rareza moduladas por perks (`chest_luck`, `treasure`,
  `chest_bounty`), fallback a oro si colección completa.
- Perks (`utils/perks.js`): 4 ramas (war/gold/vigor/wisdom), consumidos en damage.js/boss.js/shop.js.

### 2.4 Acoplamientos y riesgos detectados

| # | Riesgo / acoplamiento | Implicación para la campaña |
|---|---|---|
| R1 | **`missions` e `items` NO están en schema.sql** — se crean en scripts de `archive/` y en un lazy-init dentro de `profile.js` | Todas las tablas nuevas VAN a schema.sql (patrón idempotente). No repetir el antipatrón. |
| R2 | **Bloque de daño al boss duplicado** en reps.js y training.js | Extraer `utils/combat.js → applyCombatDamage()` ANTES de añadir el tercer destino (enemigo de campaña). |
| R3 | **GETs con efectos secundarios** (`/boss/active` resetea el loop; `/missions` hace refill) | El motor de campaña solo muta estado vía POST. |
| R4 | **Editar/borrar reps ajusta HP del boss retroactivamente** | Decisión: el daño de campaña es **final** (no se revierte al editar/borrar reps). Documentado como regla de juego. |
| R5 | Lección de la ruleta: constantes duplicadas front/back que hay que sincronizar a mano | El mapa/bestiario se sirve SIEMPRE por API; el front renderiza data-driven (coords, arte, HP). Cero constantes de contenido en el front. |
| R6 | i18n en `locales/{es,en}.js` exigiría tocar código por cada enemigo nuevo | El **contenido lleva sus propias traducciones** (JSONB `{"es":…,"en":…}`); i18n de locales solo para strings del motor/UI. |
| R7 | `updateMissionProgress` es fire-and-forget fuera de transacción y hace N updates | El bus de eventos de progreso nuevo mantiene esa semántica (best-effort post-commit) pero centralizado. |
| R8 | HP del boss hardcodeado (50000) y comunitario | Escalado personal paramétrico por nivel/prestigio (fórmula en config de campaña). |

### 2.5 Qué se reutiliza vs qué se sustituye

**Se reutiliza tal cual:** `calculateDamage` (con enemigo en lugar de boss: mismos campos
`weakness_stat`/`current_hp`/`total_hp`), perks, buffs/pociones, `useRepLogger`, componentes de
batalla (BossArena→EnemyArena con videos idle/damaged, BattleRepsPanel, QuickPotions, PlayerCard),
patrón atomic-gate + `withTransaction`, cofres y su loot, Pusher (`sendToUser`), NEW-badges
(`features.js`), notificaciones y push.

**Se sustituye/demota:** el loop de auto-reset por `order_index` (el boss loop queda como
"raid mundial" paralelo detrás del flag hasta su integración como nodos raid), `rotate_missions.js`
(sin cambios, pero las misiones de NPC van por otra vía), `syncBossHealth` (solo aplica a raids).

---

## 3. Diseño (Fase 2)

### 3.1 Principio rector: motor vs contenido

- **Motor** (código): tablas genéricas, endpoints, routing de daño, resolución de objetivos,
  sendas, prestigio. No conoce ningún enemigo concreto.
- **Contenido** (data): un JSON por campaña en `backend/data/campaigns/<slug>.json`
  (bestiario, zonas, nodos, aristas, NPCs, quests, config de escalado/senda/prestigio) que un seed
  idempotente (`backend/scripts/seed_campaign.js`, upsert por slug, patrón de `seed_rpg_items.js`)
  vuelca a BD. Lanzar la "campaña God of War" = nuevo JSON + arte + `npm run seed:campaign -- god-of-war`.
- Los textos del contenido viajan en JSONB `{"es": "...", "en": "..."}` (ver R6).
- Versionado: `campaigns.version` + seed upsert ⇒ rebalancear contenido = editar JSON + re-seed.

### 3.2 Esquema de BD (todas en schema.sql, idempotentes)

**Contenido (seed):**

```sql
campaigns        (id, slug UNIQUE, name JSONB, description JSONB, status, -- draft|active|archived
                  config JSONB, version INT)
                  -- config: fórmulas de escalado HP/recompensas, multiplicadores de prestigio,
                  --          parámetros de senda (bonos/penalizaciones), arte del mapa
enemy_types      (id, campaign_id NULL→global, slug UNIQUE, family, tier SMALLINT,
                  name JSONB, description JSONB,
                  base_hp INT, weakness_stat, resist_stat,
                  scaling JSONB,   -- {hp_per_level, hp_tier_mult, ...}
                  loot JSONB,      -- {coins:[min,max], xp, chest_chance, drop_table:{rarity:peso}}
                  art JSONB)       -- {image, idle_video, damaged_video} (nombres de archivo, como boss_gif)
campaign_zones   (id, campaign_id, slug, act SMALLINT, name JSONB, theme, order_index,
                  path_required NULL|'light'|'dark', art JSONB, config JSONB)
campaign_nodes   (id, zone_id, slug, type, -- combat|elite|boss|raid|npc|crossroads|treasure
                  enemy_type_id NULL, pack JSONB,      -- {count:3} para grupos (bandidos)
                  npc_id NULL, map_x REAL, map_y REAL, -- coords para el render del mapa
                  requires JSONB,  -- {min_level, path, stat:{str:15}, nodes:[slugs]}
                  rewards JSONB)   -- extra sobre el loot del enemigo (primera vez)
campaign_edges   (id, from_node_id, to_node_id, kind DEFAULT 'main') -- main|side ⇒ grafo, no lista
npcs             (id, campaign_id, slug, name JSONB, faction, -- light|dark|neutral
                  art JSONB, dialogue JSONB)
npc_quests       (id, npc_id, slug UNIQUE, chain_slug, chain_step SMALLINT,
                  name JSONB, description JSONB,
                  objective JSONB, -- ver 3.5
                  time_limit_hours INT NULL,           -- pactos
                  path_required NULL|'light'|'dark',
                  rewards JSONB, penalty JSONB,        -- penalty solo pactos
                  requires_quest_slug NULL)
```

**Estado del jugador:**

```sql
campaign_runs      (id, user_id, campaign_id, prestige_level INT DEFAULT 0,
                    path NULL|'light'|'dark', status, -- active|completed|abandoned
                    started_at, completed_at)
                    -- índice único parcial: un run activo por (user, campaign)
user_node_progress (id, run_id, node_id, status, -- available|engaged|cleared
                    enemy_current_hp INT, enemy_total_hp INT, -- snapshot al engancharse
                    kills INT DEFAULT 0, cleared_at, UNIQUE(run_id, node_id))
user_npc_quests    (id, run_id, quest_id, status, -- offered|accepted|completed|claimed|failed
                    current_value INT DEFAULT 0, deadline_at NULL,
                    UNIQUE(run_id, quest_id))
user_bestiary      (user_id, enemy_type_id, kills INT, first_kill_at,
                    PRIMARY KEY(user_id, enemy_type_id)) -- códex persistente entre prestigios
ALTER TABLE boss_fights ADD COLUMN IF NOT EXISTS campaign_node_id INT NULL; -- nodos raid
```

### 3.3 Bestiario / taxonomía

- **Familias** (data, no enum de código): `minion`, `goblin`, `skeleton`, `zombie`, `spider`,
  `bandit`, `demon`, `knight`… La familia agrupa para objetivos de quest ("mata 10 bandidos"),
  resistencias temáticas y códex.
- **Tiers 1-5**: esbirro → élite → campeón → boss de zona → boss de acto. El tier multiplica HP y
  loot vía `scaling`/`loot` (paramétrico).
- **Debilidad/resistencia por stat**: reutiliza `weakness_stat` de `calculateDamage` tal cual;
  `resist_stat` es el espejo (multiplicador <1, único cambio pequeño en damage.js, aditivo y
  retrocompatible: los bosses actuales no lo tienen).
- **HP personal escalado**: `HP = base_hp × (1 + nivel_jugador × hp_per_level) × hp_tier_mult × prestige_hp_mult^prestigio`,
  calculado y **snapshoteado al engancharse al nodo** (estable mid-fight aunque subas de nivel).
- **Grupos** (`pack`): un nodo "grupo de bandidos" = N kills del mismo enemigo encadenados; la barra
  muestra "Bandido 2/3". Mismo motor, cero código extra.
- Añadir un enemigo = entrada en el JSON + arte en `/public/video` o imagen. **Sin código.**

### 3.4 Mapa y progresión

- El mapa es un **grafo** (`campaign_nodes` + `campaign_edges`), no una lista: caminos principales
  (kind `main`) y secundarios (`side`, opcionales, con loot/quests extra). Coordenadas `map_x/map_y`
  en data ⇒ el front pinta el mapa SVG data-driven (nodos, aristas, arte de zona).
- **Desbloqueo**: un nodo está `available` si algún predecesor en el grafo está `cleared` y se
  cumplen sus `requires` (nivel mínimo, senda, stat check "necesitas STR 15" — usa los `*_lvl` de
  `augmentUserWithLevels`). Los side-paths nunca bloquean el avance principal.
- **Flujo de combate**: `POST /campaign/engage/:nodeId` fija tu objetivo actual (un solo nodo
  `engaged` por run) → entrenas (reps/training) → el daño fluye a TU enemigo → HP 0 ⇒ kill, avanza
  el pack o marca `cleared`, otorga loot, actualiza códex y quests, Pusher `private-user-N` para la
  animación de muerte.
- **Estructura de la campaña 1** (lanzamiento completo): 3 actos, 9-10 zonas, ~35-45 nodos,
  ~18-22 tipos de enemigo, 6-8 NPCs, 2 encrucijadas de senda, 3 raids (uno por acto).
  Acto I: Bosque/aldea (goblins, arañas, bandidos). Acto II: Cripta/ciénaga (esqueletos, zombies) +
  **encrucijada principal**. Acto III: territorio de la senda elegida + boss final.

### 3.5 NPCs y misiones narrativas

- Sistema **separado** de las misiones diarias (otro ciclo de vida: cadenas, deadlines, senda,
  por-run), pero **integrado por el mismo hook de progreso** (ver 3.7).
- **Cadenas por NPC**: `chain_slug` + `chain_step`; al reclamar el paso N se ofrece el N+1.
- **`objective` JSONB** (resuelto genéricamente por el bus de eventos):
  - `{type:'kill', family:'bandit', zone:'act1-camino', count:10}` — muertes filtradas por familia/zona/tier
  - `{type:'reps', exercise:'pullups', count:100}` · `{type:'damage', amount:50000}`
  - `{type:'clear_node', node:'slug'}` · `{type:'stat_check', stat:'str', min_level:15}`
    (misiones "solo para personajes fuertes": el check se evalúa al aceptar)
  - `{type:'streak', days:5}` — misiones de honor
- Los tipos de objetivo son extensibles añadiendo un resolver al bus (única extensión de código
  prevista y localizada).

### 3.6 Sendas / alineamiento moral

- Nodo `crossroads` en Acto II: `POST /campaign/choose-path` fija `campaign_runs.path`
  (**permanente hasta prestigio**; UPDATE guardado `WHERE path IS NULL`).
- La senda filtra zonas/nodos/NPCs/quests vía `path_required`. Contenido exclusivo por senda.
- **Senda oscura (el demonio) — riesgo/recompensa:** *pactos* = quests con `time_limit_hours` y
  `penalty`. Al aceptar arranca `deadline_at`. Completas ⇒ recompensa grande (más coins/gems, mejor
  drop de rarezas altas). Expira ⇒ `failed` + penalización: pérdida de coins (`GREATEST(0, …)`,
  nunca negativo) y/o **maldición** = debuff temporal reutilizando `damage_multiplier < 1` + expiry
  (mecánica ya existente para buffs). Expiración vía barrido `node-cron` (patrón existente) +
  verificación perezosa al consultar.
- **Senda luminosa (la orden) — honor/constancia:** quests ligadas a streak y volumen, sin
  penalización; recompensas estables + *bendiciones* (buffs suaves de duración larga) + cosméticos
  exclusivos (título/borde de caballero). Dark = varianza alta; Light = valor esperado similar con
  varianza baja + exclusivos cosméticos. Ambas sendas ven el boss final (variante temática).

### 3.7 Bus de eventos de progreso (pieza clave de integración)

Nuevo `utils/progressEvents.js` → `emitProgress(userId, event, value, context)`.
reps.js/training.js sustituyen sus llamadas directas a `updateMissionProgress` por el bus, que
fan-out (best-effort, post-commit, como hoy) a:
1. misiones diarias (`updateMissionProgress` intacto — cero regresión),
2. quests de NPC activas (matching contra `objective`),
3. progreso de nodo (kills) y códex.

El `context` lleva `{enemy_family, zone_slug, node_id, exercise_type, …}` para el filtrado.

### 3.8 Prestigio / New Game+

- Al limpiar el nodo final: run `completed` → `POST /campaign/prestige` crea un run nuevo con
  `prestige_level+1` y senda reseteada (guarded: solo si el run activo está completed).
- Multiplicadores desde `campaigns.config` (ej. HP ×1.5^p, recompensas ×1.25^p, cap configurable).
- Persisten entre prestigios: códex/`user_bestiary`, cosméticos, título "Prestigio N" (marco/borde).
  Se resetea: progreso de nodos, quests, senda.
- Historial natural: los runs `completed` quedan en `campaign_runs`.

### 3.9 Raids comunitarios (puente con el sistema actual)

- Nodo `type='raid'` → apunta a un `boss_fights` (columna `campaign_node_id`). El daño a raids
  sigue el flujo comunitario actual (event_participants, cofres, golpe de gracia, boss_kill_posts).
- Para el jugador, limpiar su parte del raid (participar + boss muerto) marca el nodo `cleared`.
- Los bosses actuales (Arthas, Malenia, Coloso) se reconvierten en los raids de acto ⇒ el loop de
  auto-reset se retira al final (el reset pasa a ser por calendario/evento, no por order_index).

### 3.10 Routing del daño (transición)

Con el flag activo y un nodo `engaged`: las reps dañan **tu enemigo de campaña**; si además hay un
raid/boss comunitario activo, **también** le pegan como hoy (sin regresión para la comunidad).
Sin flag: comportamiento actual intacto. Todo dentro de `applyCombatDamage()` (R2).

### 3.11 Endpoints y front

**Backend** `backend/campaign.js` montado en `apiRouter` (`/api/campaign`):
`GET /map` (zonas+nodos+aristas+progreso del run) · `POST /engage/:nodeId` · `POST /choose-path` ·
`GET /npcs/:slug` · `POST /quests/:id/accept|claim` · `POST /prestige` · `GET /bestiary` ·
`GET /status` (run actual, objetivo engaged — lo consume la vista de batalla).

**Frontend** (mobile-first como /batalla):
- `CampaignMapView.vue` (`/campana`) — mapa SVG data-driven por acto, nodos con estado, NEW-badge.
- `NodeBattleView.vue` — clon parametrizado de BattleView: `EnemyArena` (generaliza BossArena:
  props de arte/HP en vez de store del boss), reusa BattleRepsPanel/QuickPotions/useRepLogger.
- `NpcDialogModal.vue`, `PathChoiceModal.vue`, `PrestigeModal.vue`, `BestiaryView.vue`.
- Store `stores/campaign.js`. Flag: clave en `features.js` (`campaign_v1`) + entrada en el dock.
- i18n: SOLO strings del motor en `locales/{es,en}.js`; contenido desde la API (JSONB bilingüe).

---

## 4. Plan de implementación (Fase 3)

Lanzamiento = campaña completa (decisión de Roman), pero construida por hitos internos verificables.
Cada sprint termina con build verde + verificación en preview (JWT propio, ver memoria).

### Sprint 0 — Cimientos (sin cambio de comportamiento) 🔧 ✅ (backend) — 2026-07-08
- [x] Extraer `utils/combat.js → applyBossDamage()` desde reps.js + training.js (R2). Behavior-preserving:
      se conserva la divergencia previa (reps.js emite `createBossKillEvent`, training.js no). Verificado
      sintaxis + grafo de imports. *(Nombre final `applyBossDamage`, no `applyCombatDamage`.)*
- [x] Crear `utils/progressEvents.js` (bus con `emitProgress`/`onProgress`) y migrar todas las llamadas
      a `updateMissionProgress` de reps.js/training.js al bus. Subscriber built-in = misiones (cero regresión).
- [x] Añadir las 11 tablas de 3.2 + `boss_fights.campaign_node_id` a `schema.sql` (idempotentes).
      **Migración aplicada a Supabase prod** (11 tablas + columna verificadas).
- [x] Seed pipeline: `backend/scripts/seed_campaign.js` (upsert por slug) +
      `backend/data/campaigns/main-campaign.json` (Acto I: 1 zona, 3 enemigos, 1 NPC, 4 nodos, 4 aristas,
      1 quest). `npm run seed:campaign`. **Seedeado + idempotencia verificada** (re-run = conteos idénticos).
- [x] Feature flag `campaign_v1` añadido al whitelist de `features.js`.
- [ ] Gating en el front (dock/entrada) — pendiente para Sprint 1 (aún no hay vista de campaña).

### Sprint 1 — Motor de combate personal (jugable en dev) ⚔️ ✅ — 2026-07-08
- [x] `backend/utils/campaignEngine.js`: `scaleEnemyHp`, `ensureActiveRun`, `isNodeUnlocked`,
      `engageNode` (withTransaction + snapshot de HP escalado, idempotente), `loadGraphState`,
      `applyCampaignDamage`. `backend/campaign.js` montado en apiRouter: `/status`, `/map`,
      `/engage/:nodeId`. Fix de cast `$1::varchar` en el INSERT del run (Postgres inferencia).
- [x] Routing de daño: `applyCampaignDamage` llamado desde reps.js/training.js tras `applyBossDamage`
      (una serie golpea raid comunitario Y enemigo de campaña). Kill → loot (coins escalados por
      prestigio + drop por `drop_table` + chest_chance) + `user_bestiary` (códex) + Pusher
      `private-user-N` (`campaign_damage`) + `emitProgress('campaign_kill'/'campaign_clear_node')`
      (forward-compat para quests). resist_stat aplicado (dampen acotado). Packs (kills < count → HP
      reset; >= count → cleared).
- [x] `stores/campaign.js` (fetchStatus/fetchMap/engage/applyLoggedResult) + `CampaignMapView.vue`
      (mapa SVG data-driven: nodos, aristas main/side, estados cleared/engaged/available/locked) +
      `NodeBattleView.vue` (reusa RpgTopBar/PlayerCard/QuickPotions/BattleRepsPanel/useRepLogger) +
      `EnemyArena.vue` (generaliza BossArena: props de arte/HP, nombres bilingües JSONB, emoji por
      familia como placeholder). Rutas `/campana` + `/campana/batalla` (hijas de `/:lang`, por nombre).
      Entrada gated con NEW-badge `campaign_v1` en BattleView. i18n es+en (`campaign_*`).
- [x] Regla R4 documentada en código (`applyCampaignDamage`): el daño de campaña es FINAL, no se
      revierte al editar/borrar reps.

**Verificación Sprint 1:** smoke test del motor end-to-end con ROLLBACK (run→engage→daño→kill→loot→
desbloqueo de sucesores, escalado HP correcto 1200×(1+11×0.06)=1992); endpoints HTTP con JWT propio
(/map, /engage, /status, 403 en nodo bloqueado); preview: mapa renderiza nodos/estados/i18n/nombres
bilingües, y `/campana/batalla` (carga directa) renderiza EnemyArena con el goblin y HP. **Nota:** la
navegación SPA por clic no pudo verificarse en el preview headless por un deadlock de la transición
`mode="out-in"` de App.vue (depende de `transitionend`, que no dispara en pestañas no visibles) —
reproducido idéntico en la ruta preexistente `batalla`, así que es artefacto del entorno, no del código.

### Sprint 2 — Contenido: bestiario + mapa completo 🗺️ ✅ — 2026-07-08
- [x] Bestiario completo: **21 enemigos**, 6 familias (goblin/spider/bandit/minion/skeleton/zombie/
      knight/demon), tiers 1-5, con weakness/resist, loot por tier y escalado. `main-campaign.json` v2.
- [x] **3 actos, 6 zonas, 26 nodos, 25 aristas** (main+side), coords de mapa, requires (min_level/
      nodes/path). Progresión inter-acto vía `requires.nodes`; intra-zona vía aristas. Bosses de acto
      (Colmillo Gris t4, Liche t4) + jefes finales por senda (Serafín t5 luz / Malphas t5 oscuro).
      Nodo `the-crossroads` (encrucijada) al final del Acto II; Acto III con `path_required` (luz/oscuro),
      bloqueado hasta elegir senda en Sprint 4.
- [ ] Arte: imágenes + videos idle/damaged por enemigo. **Pendiente de assets** (no generables aquí):
      el sistema está listo — `enemy_types.art {image, idle_video, damaged_video}`, EnemyArena/Bestiario
      caen a **emoji por familia** como placeholder; basta soltar archivos en `/public/enemies` y `/video`.
- [x] `resist_stat` (aplicado en `applyCampaignDamage`, dampen acotado ≤50%) + packs (Sprint 1).
- [x] `BestiaryView.vue` (`/campana/bestiario`): grid con siluetas, nombres **redactados** para
      no-descubiertos (`???`), contador "N/21", debilidad + kills. Endpoint `GET /campaign/bestiary`
      (redacta name/description de no-descubiertos). Enlace desde la cabecera del mapa. i18n `bestiary_*`.

**Boss finales = bosses existentes (add-on 2026-07-08, pedido por Roman):** cada acto termina con un
boss existente de `boss_fights`, reutilizando su **arte real** (imagen `/images/bosses/*` + vídeos
idle/damaged en `/video/*`): Acto I = **Arthas** (arthasVideo.mp4), Acto II = **Malenia** (antes de la
encrucijada), Acto III Luz = **Coloso Volcánico**, Acto III Oscuro = **Dragón del Fin**. Los jefes
inventados (warlord/liche/serafín/malphas) pasan a **élites** previos. 4 nuevos `enemy_types` (`boss-*`,
art absoluto). EnemyArena ahora sirve rutas `/images/...` (no solo `/enemies/<file>`). El seed **poda**
nodos/aristas huérfanos (reconcilia BD↔JSON). Bestiario 25, 30 nodos. Verificado en preview: la arena
de campaña renderiza a Arthas con su vídeo y HP personal escalado (27.888 = 2800×1,66×tier6).

**Verificación Sprint 2 (JWT propio):** `/map` → 6 zonas/26 nodos/25 aristas, Act III path-gated `locked`
sin senda; `/bestiary` → 21 total, redacción correcta (name null en no-descubiertos, family/tier visibles).
Preview (carga directa): Bestiario "0/21 descubiertos" con siluetas; mapa renderiza las 6 zonas de los 3
actos + botón bestiario, sin errores de consola.

### Sprint 3 — NPCs y quests narrativas 🧙 ✅ — 2026-07-08
- [x] `backend/utils/campaignQuests.js`: `acceptQuest`/`claimQuest` (atomic gates: prereq claimed,
      path, stat_check-at-accept, ON CONFLICT anti-doble-accept, claim gate completed→claimed + payout
      coins/gems + gem_transactions). Estados: available/accepted/completed/claimed/locked/failed.
- [x] Resolvers de `objective` en el bus: `advanceNpcQuests` registrado vía `onProgress` — traduce
      eventos (`campaign_kill`/`reps`/`damage`/`campaign_clear_node`) a progreso de quest con filtros
      (family/zone/tier, exercise). `stat_check` se evalúa al aceptar; guarded UPDATE race-safe.
- [x] Cadenas (`requires_quest_slug` = prereq del paso anterior) + `NpcDialogModal.vue` (diálogo +
      lista de quests con barra de progreso, aceptar/reclamar) + nodos NPC del mapa abren el modal
      (antes "próximamente"). Endpoints `/npcs/:slug`, `/quests/:id/accept|claim`. i18n `quest_*`/`npc_*`.
- [x] Contenido: 5 quests (cadena Élara ×2, cadena Viejo Sabio ×2 [reps + kill], 1 `stat_check` de
      fuerza). NPCs de senda (Aldric/Mephisto) definidos para Acto III (Sprint 4).

**Verificación Sprint 3 (JWT/DB, con limpieza):** smoke test del motor 8/8 (prereq→403, accept,
filtro de familia [goblin no avanza quest de bandido], 3 kills→completada, claim +500c/+5g, cadena
desbloquea paso 2, stat_check auto-completa, doble-claim→400); HTTP `/npcs/hunter-elara` y `/old-sage`
con estados correctos, accept+claim `stat_check` +700c/+6g. Preview: `NpcDialogModal` abre con diálogo
de Élara, 2 quests (Disponible/Bloqueada), botón Aceptar → estado "En curso". Estado de prueba y
coins/gems del dev restaurados tras validar.

### Sprint 4 — Sendas y pactos 😈🕊️ ✅ — 2026-07-08
- [x] `POST /campaign/choose-path` (`choosePath` en campaignEngine: guarded `path IS NULL`, requiere
      haber llegado a la encrucijada, marca el nodo crossroads `cleared` → desbloquea Acto III) +
      `PathChoiceModal.vue` (2 cartas luz/oscuro con consecuencias, aviso de permanencia). El filtrado
      por `path_required` en `/map` y quests ya existía desde S1/S3 (isNodeUnlocked + getNpcWithQuests).
- [x] Pactos: `acceptQuest` fija `deadline_at` para quests con `time_limit_hours`; `sweepExpiredPacts`
      (cron `*/5`) marca `failed` + penaliza (coins `GREATEST(0,…)` + maldición `damage_multiplier`<1
      con expiry, reusando columnas de buff) + notificación + push.
- [x] Bendiciones (senda luz): `claimQuest` aplica `rewards.buff {multiplier, hours}` como buff largo
      de daño (mismas columnas). Cosméticos exclusivos por senda → **follow-up** (requiere seed de items).
- [x] Contenido del Acto III por senda: 4 quests nuevas — Mephisto (oscuro) 2 pactos con deadline+
      penalización+maldición; Sir Aldric (luz) 2 misiones de honor con bendiciones. (v5, 9 quests.)

**Verificación Sprint 4 (JWT/DB + preview, con limpieza):** smoke test 14/14 — choose-path (403 sin
llegar / 200 dark / 400 permanente), pacto (deadline→barrido→failed + penalización −800 coins +
maldición 0.7× activa), bendición (luz→250 reps→completada→claim buff 1.25×/24h). Preview:
`PathChoiceModal` abre desde el nodo encrucijada con ambas cartas; elegir Luminosa → banner "Senda
Luminosa" + encrucijada "Completado". Estado del dev restaurado y `requires` re-seedeado.

### Sprint 5 — Prestigio 🏆 ✅ — 2026-07-08
> **Decisión de Roman (2026-07-08): modelo de raid = INDIVIDUAL.** Los bosses de acto siguen siendo
> enemigos personales (ya reutilizan el arte de los bosses reales). El world boss actual queda como
> "Raid Mundial" **en paralelo, sin integrar**; `boss_fights.campaign_node_id` queda **reservado** para
> una futura integración raid. El loop `order_index` **NO se retira**. Sprint 5 = solo prestigio.
- [x] Detección de campaña completada (data-driven): al limpiar el **finale** (nodo `boss` sin aristas
      salientes **y** no referenciado por `requires.nodes` de ningún otro nodo — ambos checks porque
      las transiciones entre actos usan `requires.nodes`, no aristas) → `campaign_runs.completed_at`.
      El run sigue `active` hasta prestigiar (evita que ensureActiveRun cree uno nuevo).
- [x] `POST /campaign/prestige` (`prestige` en campaignEngine): guarded (requiere `completed_at`),
      archiva el run (`status='completed'`) y crea uno nuevo `prestige_level+1`, path/progreso/quests
      reseteados. Multiplicadores ya cableados (`scaleEnemyHp` HP ×1.5^p, `grantEnemyLoot` recompensas
      ×1.25^p). Códex (`user_bestiary`) persiste. El nivel de prestigio se muestra desde `run.prestige_level`
      (marco/título "Prestigio N" como cosmético = follow-up, no requiere item).
- [x] `PrestigeModal.vue` + CTA "¡Campaña completada!" en el mapa cuando `run.completed`. i18n `prestige_*`.
- [~] Integración raid de `boss_fights` (campaign_node_id) → **descartada por decisión** (modelo Individual).

**Verificación Sprint 5 (JWT/DB + preview, con limpieza):** smoke 11/11 — detección de finale correcta
(arthas/malenia NO finale, coloso/dragón SÍ), limpiar finale marca `completed_at`, prestige→nuevo run
prestige 1 (path null, id nuevo) + run viejo archivado, códex persiste, prestige en run incompleto→400.
Preview: banner "¡Campaña completada!" + PrestigeModal con efectos. Estado del dev restaurado (run a
prestige 0; residuo del kill de prueba —códex+item de Coloso— limpiado; ~1k coins dev inmateriales).

### Ajustes pre-Sprint 6 (pedidos por Roman 2026-07-08) — hechos, PENDIENTES de verificación visual
- [x] **Confirmado: los actos son lineales.** El primer nodo de cada acto exige el finale del anterior
      (`requires.nodes`): Acto II `crypt-gate`←`arthas-throne`; Acto III ← senda elegida en la encrucijada
      (←`malenia-marsh`). Prestigio ya exige el finale (= todos los actos; una senda del Acto III por run).
- [x] **Bug corregido: nodos NPC bloqueaban la progresión** (no se "clearean" al no combatirse, pero
      `bandit-ambush`/`fallen-hall`/`imp-warrens` dependían de ellos). Fix: `markNpcNodeVisited` — visitar
      un NPC (GET /npcs/:slug) lo marca `cleared` si está desbloqueado, abriendo los nodos siguientes.
- [x] **Actos en pestañas con candado** (`CampaignMapView`): tab bar Acto I/II/III; acto bloqueado = 🔒
      (ningún nodo accesible) y no seleccionable; auto-selecciona el acto más avanzado; Acto III filtra
      la zona por la senda elegida. i18n `campaign_act_locked`.

### Sprint 6 — Pulido y lanzamiento 🚀
- [ ] **Test A-Z VISUAL con clicks desde preview** (usuario nuevo, campaña entera por la UI). Se ejecuta
      SOLO cuando Roman lo pida. Ojo deadlock transición `mode="out-in"` en preview headless (ver memoria).
- [ ] Balance de economía (loot de campaña vs tienda/ruleta/cofres — que no infle coins).
- [ ] i18n completo del motor (es+en), push/Pusher, NEW-badges, entrada en dock y Campamento.
- [ ] Verificación end-to-end en preview + móvil; flag `campaign_v1` ON.
- [ ] Actualizar este doc + memoria de sesión.
- Nota: raid/world-boss NO se integra (decisión Individual); el loop `order_index` se queda como está.

### Dependencias
S0 → S1 → (S2 ∥ S3) → S4 → S5 → S6. El arte del bestiario (S2) es el camino crítico no-técnico:
empezar a generarlo desde S0.

---

## 5. Decisiones de arquitectura (registro)

| Decisión | Elección | Motivo |
|---|---|---|
| Progresión | Individual (HP personal escalado) + raids comunitarios | Confirmed por Roman; un mapa por jugador exige HP propio |
| Migración | Coexistencia con feature flag `campaign_v1` | Cero riesgo para el loop actual; democión gradual |
| Senda | Permanente por run; reset solo con prestigio | Peso narrativo + rejugabilidad |
| Alcance lanzamiento | Campaña completa (3 actos) | Confirmed por Roman |
| Contenido | JSON seed → BD, textos bilingües en JSONB | Enemigos/campañas nuevas sin tocar código (R5, R6) |
| Daño retroactivo | El daño de campaña es final (no se ajusta al editar reps) | Evita replicar la complejidad de reps.js:660-820 (R4) |
| Misiones NPC | Sistema propio + bus de progreso compartido con dailies | Ciclos de vida distintos; un solo punto de instrumentación (R7) |
| Estado | Solo POSTs mutan; GETs puros | Corrige el antipatrón actual (R3) |
| Concurrencia | withTransaction + guarded UPDATEs (patrón atomic gate del repo) | Consistencia con roulette/missions/chests |

## 6. Próximos pasos inmediatos

1. Generar el primer borrador de `main-campaign.json` (bestiario Acto I) para validar el formato.
2. Sprint 0 completo (refactor + esquema + seed + flag) — es pequeño y desbloquea todo.
3. Encargar/generar arte del bestiario en paralelo (camino crítico).
