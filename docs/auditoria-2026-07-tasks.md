# Reppy — Plan de mejora (auditoría 2026-07-23)

Resultado de una auditoría de 5 ejes: ingeniería, game design, engagement, SEO/growth y mercado.

**Notas**: Producto 7.5 · Engagement 6.5 · Ingeniería 6 · Game design 5.5 · SEO/Growth 4.5 · Negocio 4.5

**Veredicto**: la app NO es cutre — el cuello de botella no es el código, es distribución + balance económico + retención de caídos. Plan: apuesta acotada de 6 meses.

**Kill criterion (revisar ~2027-01-23)**: ~1.000 MAU, D30 > 10%, alguna conversión de pago. Si no → hobby sin mala conciencia.

**Regla de oro durante el plan**: 🧊 congelar rediseños visuales y features nuevas. El producto ya sobra para validar.

---

## 🤖 Protocolo de agentes autónomos (routines nocturnas)

**Este fichero en `origin/main` es la memoria compartida entre runs** (cada run es una sesión nueva sin memoria de las anteriores). Los agentes procesan las tasks de arriba a abajo — el orden del fichero es la prioridad.

Estados de una task:

- `- [ ]` — pendiente: cualquier agente puede cogerla.
- `- [ ] 🔨 PR #N` — implementada en una PR abierta pendiente de review de Roman. Los agentes NO la reimplementan; solo verifican o continúan esa PR.
- `- [ ] ⏸️ PREGUNTA: ...` — bloqueada esperando decisión de Roman (la pregunta, 2-3 opciones y una recomendación van escritas inline). Los agentes la saltan sin repetir la pregunta.
- `- [x]` — hecha y mergeada.
- `👤` — acción personal de Roman (compras, cuentas, grabar contenido, enviar emails). Los agentes nunca la ejecutan; como mucho preparan material de apoyo en una PR si es trivial hacerlo.

Protocolo de cada run:

1. **Sincronizar**: leer este fichero en `origin/main` + `gh pr list --state open` + ramas `night/*` remotas.
2. **Verificar antes de crear**: PRs `night/*` a medias → retomarlas y terminarlas. Terminadas sin verificar → verificar (build de frontend si se tocó frontend, `node --check` en backend, revisión lógica del diff) y dejar veredicto como comentario en la PR.
3. **Bucle hasta que muera la sesión** — para cada task pendiente, en orden:
   - **Implementable sin decisiones** → rama `night/<slug-corto>` desde `origin/main`, implementar, verificar, abrir PR contra `main`, y actualizar ESTE fichero en `main` con `🔨 PR #N` (commit directo a main SOLO de este fichero).
   - **Requiere decisión de producto** → NO implementar a ciegas: escribir el `⏸️ PREGUNTA: ...` en este fichero (commit a main) y pasar a la siguiente.
   - **`👤` o `⏸️`** → saltar.
   - Push temprano y frecuente, WIP incluido: si la sesión muere a medias, lo pusheado lo retoma el siguiente run.
4. **A `main` solo se commitea este fichero (estado). Código, SIEMPRE por PR. Nunca mergear PRs** — las revisa y mergea Roman.
5. **Convenciones**: manda `CLAUDE.md` (i18n en ambos locales es/en, rarezas en español, `withTransaction` + `FOR UPDATE` en economía).
6. **Verificación — intentar SIEMPRE el test de integración local en el sandbox**: instalar/arrancar PostgreSQL efímero (`apt-get install postgresql` o Docker, lo que el entorno permita), cargar `backend/schema.sql`, arrancar el backend con env dummy — solo hacen falta `DATABASE_URL` (al Postgres local) y `JWT_SECRET` (cualquier string): Pusher, VAPID/web-push, Google OAuth y Hevy tienen guards y degradan con un warning sin crashear, así que NO inventar claves para ellos y probar con `curl` los endpoints tocados (crear usuario de prueba vía `/api/auth`, generar JWT, ejercitar el flujo). Si el entorno no permite levantar Postgres → degradar a `npm run build` (frontend), `node --check` (backend) y revisión lógica. En la PR, decir SIEMPRE qué nivel de verificación se consiguió: `integración local` / `solo build+sintaxis`. PROHIBIDO testear contra https://reppy.romandev.app o la BD de producción: ese entorno corre el código viejo de main y tiene datos y usuarios reales.
7. 🧊 Nada fuera de la lista: ni rediseños, ni refactors oportunistas, ni features nuevas.
8. **Si NO quedan tasks accionables** (todas están `[x]`, `🔨`, `⏸️` o `👤`) → el run se convierte en **auditor**: elige el eje menos recientemente auditado de estos cinco — ingeniería/seguridad, game design/economía, engagement/retención, SEO/rendimiento web, deuda técnica — (el registro de auditorías está al final de esta sección), re-audita el código actual A FONDO en ese eje (mismo nivel de exigencia que la auditoría original de este fichero: leer código real, citar archivo:línea, severidad, sin peloteo), y añade las tasks nuevas que encuentre en una sección `## 🔍 Backlog propuesto (auditoría <eje> <fecha>)` al final del fichero, cada una marcada `⏸️ PENDIENTE DE APROBACIÓN` con justificación de una línea. Después actualiza el registro de abajo y termina el run — las tasks propuestas NO se implementan hasta que Roman las apruebe (les quite el ⏸️ y las mueva a su sección de prioridad).

**Registro de auditorías por eje** (actualizar al auditar): ingeniería/seguridad 2026-07-23 · game design/economía 2026-07-23 · engagement/retención 2026-07-23 · SEO/growth 2026-07-23 · deuda técnica 2026-07-23.

**Flujo de mañana (Roman)**: revisar/mergear PRs `night/*`, marcar `[x]` las mergeadas, responder las `⏸️` (editando aquí o diciéndoselo a Claude en sesión local, que quitará el emoji) → la noche siguiente se implementan.

---

## P0 — Seguridad (esta semana, explotable HOY en producción)

- [x] **Matar `/api/test/*` en producción** (PR #305 mergeada) — `backend/test.js:9` (`isTestAllowed = true` incondicional) + montaje en `backend/index.js:157`. Cualquier usuario autenticado puede darse coins/gems/cofres/items/stats infinitos. *Esfuerzo: 10 líneas.*
- [x] **Autenticar `/pusher/auth`** (PR #306 mergeada) — `backend/index.js:170-197` acepta `user_id`/`user_name` arbitrarios y autoriza canales private-/presence-. Suplantación de usuarios en realtime. Eliminar también el shim legacy `api/pusher-auth.js` (CORS `*`). *Esfuerzo: 10 líneas.*
- [x] **Rate limiting** (PR #307 mergeada) — no existe en ningún endpoint. Mínimo: `express-rate-limit` en `POST /auth/login` (brute-force) y `POST /reps` (spam). *Esfuerzo: 1-2 h.*
- [x] **Tope a `count` y validar `date` en `POST /reps`** (PR #308 mergeada) — `backend/reps.js:49-103`: hoy acepta `count: 99999999` (monedas/XP/daño infinito) y fechas arbitrarias (rachas retroactivas). Sanity cap + `date` solo hoy/ayer. *Esfuerzo: 1 h.*
- [x] **Quitar CORS `*.vercel.app`** (PR #309 mergeada) — `backend/index.js:92`: cualquiera puede desplegar gratis en vercel.app y pasar el allowlist con `credentials: true`. Ya no estáis en Vercel. *Esfuerzo: 5 min.*

## P0 — Promesas rotas al jugador (bugs de diseño, ~2-4 h en total)

- [x] **Pagar los `rewards` de nodos de campaña** (PR #312 mergeada) — `backend/data/campaigns/main-campaign.json` promete 1.000/2.500 coins por trono/finale; `applyCampaignDamage` (campaignEngine) nunca los otorga.
- [x] **XP de quests de NPC ignorado** (PR #313 mergeada) — `backend/utils/campaignQuests.js` `claimQuest` paga coins/gems/buff pero el campo `xp` del JSON es letra muerta. Pagarlo o quitarlo del JSON. *(Se optó por pagarlo en `cha_xp`, la bolsa de XP persistente que ya usa training.js.)*
- [x] **Misión `buy_legendary` incompletable** (PR #310 mergeada) — `backend/shop.js:530` compara `'Legendary'`/`'Calisthenics'` contra rarezas reales `legendary`/`calistenico`. Nunca matchea.
- [x] **`scripts/seed_rpg_items.js` con rarezas en inglés** (PR #311 mergeada) (`special`, `calisthenic`) que las queries de cofres (`WHERE rarity = 'especial'`) no encuentran → items huérfanos.
- [ ] **Cofres de nivel: renombrar a genérico** ✅DECIDIDO (2026-07-25: opción A) — renombrar "Cofre de Nivel" → nombre genérico ("Cofre de Batalla") en DB + i18n (es/en) + premio de ruleta (`roulette.js`) + UI. Se mantiene como recompensa de ruleta/tienda; NO se restaura el cofre por subir de nivel (`additionalChests` sigue en 0). Coherencia i18n en ambos locales.

## P1 — Rebalance económico (mes 1, empieza por una hoja de cálculo)

> Hoy entrenar aporta solo el ~10-15% del ingreso diario de un jugador con racha. La app premia abrir, no entrenar.

> **Base de datos para decidir**: PR #314 añade `docs/economy-curves-2026-07.md` + `backend/scripts/analyze_economy_curves.js` (curvas reales). Los ⏸️ de abajo referencian esos números. Todos son decisiones de balance — no se implementan hasta que Roman elija.

- [ ] **Cap a la recompensa de racha** ✅DECIDIDO (2026-07-25: opción A) — `backend/utils/stats.js:300`: cambiar `streak × 50` por **`50 + 5×min(streak,30)`** (cap 200 monedas/día). Verificar que no rompe ningún otro cálculo que dependa de la recompensa de racha.
- [x] **EV de la ruleta 4h: SIN CAMBIOS** ✅DECIDIDO (2026-07-25) — Roman decide dejar la ruleta 4h como está. No tocar `roulette.js` ni `LuckyWheel.vue` por este motivo.
- [ ] **Domar la bola de nieve de FE** ✅DECIDIDO (2026-07-25: opción A+C) — `backend/utils/damage.js`: bajar el bono plano `divineBonus = fthLvl × 25` → **`fthLvl × 5`**. Y romper el bucle daño→FE de `stats.js:193`: que la XP de FE NO venga del daño infligido, sino de participar en raids/quests (definir la nueva fuente al implementar). Cambio de feel del combate — PR revisable, no auto-merge.
- [ ] **Nerfear pociones DEX de crit: subir precio** ✅DECIDIDO (2026-07-25: opción C) — NO tocar el `dex_bonus` ni el cap de crit; en su lugar **subir mucho el precio** de la poción calisténica `+100 dex` para que deje de ser un ratio daño/coste outlier. Fuente: seed `backend/archive/diversify_consumables.js` (precio del consumible por rareza). Roman fija el precio final al implementar (sugerencia: ×3-4 el actual).
- [ ] **Arreglar la curva de dificultad** ✅DECIDIDO (2026-07-25: opción A) — que el HP enemigo escale con el **daño esperado del jugador** (cuadrático en nivel), no `1+0.05·L` lineal, para que las reps-para-matar se mantengan estables al avanzar en vez de caer 41→0.01. Requiere re-derivar la fórmula de HP contra la de daño (usar `docs/economy-curves-2026-07.md` de PR #314 como base). Diseño delicado → PR revisable.
- [ ] **Prestigio con ROI positivo** ✅DECIDIDO (2026-07-25: opción B) — no subir `rewards.prestige_mult` (evitar inflación de monedas); en su lugar dar **recompensas exclusivas cosméticas** (títulos/marcos/efectos exclusivos de prestigio) por cada vuelta de NG+. Definir qué cosméticos y engancharlos al evento de prestigio. Feature de contenido → PR revisable.
- [x] **Hoja de cálculo de curvas** (PR #314 mergeada) (daño/HP/monedas por nivel y día) antes de tocar números — hecho: `docs/economy-curves-2026-07.md` + `backend/scripts/analyze_economy_curves.js`.

## P1 — Retención (mes 1, el mayor ROI de toda la auditoría)

> Winback actual = cero: un usuario que falla UN día no recibe nada nunca más. D30 estimado hoy: 3-8%. Con estos dos primeros puntos: 10-15%.

- [x] **Winback cron D3/D7/D14** (PR #317 mergeada) — reutilizar la infra de `backend/utils/streakReminders.js` con query de usuarios sin reps en N días y su dato real ("tenías racha de 12"). *~1 día.*
- [ ] **"Día de descanso activo"** ✅DECIDIDO (2026-07-25: opción A) — botón diario que **preserva la racha 1×/semana gratis** (sin coste en monedas, aparte del freeze de 250 que se mantiene). Requiere nuevo mecanismo + tabla/columna de uso semanal del descanso (reset semanal). No toca la economía del freeze. i18n es/en. Cambia la mecánica core de racha → PR revisable. *(1 descanso gratis/semana; ajustar si hace falta.)*
- [x] **Matar/segmentar el blast de referral** (PR #315 mergeada) — `backend/utils/referralReminders.js` (días 1 y 16 a TODOS): spam que quema el canal push. Solo activos >7 días que nunca refirieron, máx 1 vez.
- [x] **Push "tu rival te adelantó"** (PR #316 mergeada) — la query ya existe en `backend/social_feed.js` `/stats`; dispararla 1×/día. Reutilización pura.
- [ ] **Reto vs tu semana pasada (versión completa)** ✅DECIDIDO (2026-07-25) — meta = tus **reps de la semana previa**; al igualar/superarla, recompensa fija pequeña (**1 cofre común/de batalla**); **card en el Dashboard** mostrando progreso vs semana pasada; reset semanal (lunes). Reutiliza la query semanal ya usada en `/social-feed/stats`. Es la única "feature nueva" aprobada del backlog. i18n es/en. PR revisable.
- [x] **Eventos GA4 de funnel** (PR #318 mergeada) — hoy solo pageviews: añadir `signup`, `first_log`, `push_enabled`, `spin`, `day2_return`. *Una tarde.* Quitar `@vercel/analytics` de `frontend/src/main.js` (muerto tras Coolify).

## P1 — Legal / tema

- [ ] ⏸️ / 👤 **Renombrar los bosses con IP ajena** — APLAZADO (2026-07-25: Roman decide dejarlo para después). Riesgo legal asumido mientras tanto. Nombres Y arte infringen IP: `backend/index.js` `/db/init` inserta Artorias/Nameless King (Dark Souls), The Ender Dragon (Minecraft), Rathalos (Monster Hunter), Baldur (God of War), Arthas (Warcraft), Malenia (Elden Ring), Sephiroth (FF), Calamity Ganon (Zelda), Diablo — con arte de `static.wikia.nocookie.net`. Bloqueado por: (1) nombres/lore propios (creativo, Roman), (2) arte original (👤). *Nombres propuestos si se retoma*: Abisario el Caído, El Devorador de Descansos, El Rey Sin Nombre, Vórtice Final, La Invicta de la Barra, Coloso Osteo, Ala Rota, Fauces del Averno, Cronarca. **Los agentes nocturnos NO cogen esta task.**

## P2 — Combate con decisiones (el cambio con mejor ratio esfuerzo/impacto del juego)

- [ ] ⏸️ PREGUNTA **Ejercicio → tipo de daño vs weakness/resist del enemigo** — la araña débil a empuje, el troll a piernas… De golpe "¿qué entreno hoy?" es una decisión de juego Y fomenta variedad de entrenamiento. **Investigado (routine 2026-07-25, último run)**: el motor está a ~90% pero HOY la weakness NO mira el ejercicio. `calculateDamage(user, reps, type, boss, …)` (`backend/utils/damage.js:24`) ya recibe `type` = el `exercise_type` logueado (call sites en `reps.js:111/671`, `training.js:199`), pero el bono de weakness (`damage.js:130-137`) lo ignora: compara `boss.weakness_stat` contra el **nivel de stat** del usuario (`${w}_lvl`), premiando "tener el stat alto", no "haber hecho el ejercicio que explota la debilidad". Y `resist_stat` se lee de la BD (`campaign.js:43/60/198`) pero **no se usa en ningún sitio** de la fórmula de daño (0 referencias en `damage.js`) → mecánica muerta. El mapeo ejercicio→stat ya existe (en `utils/rewards.js`, cada ejercicio enruta a `str_xp`/`pwr_xp`/…). **Falta decidir (balance)**: (1) la tabla ejercicio→tipo-de-daño (¿empuje=str? ¿tracción=? ¿piernas=end/vig?); (2) cuánto bonifica pegar la debilidad y cuánto penaliza `resist_stat` (números); (3) si esto **reemplaza** el bono actual por nivel-de-stat o **se suma** (doble feedback). **Opciones**: (A) reemplazar el bono nivel-de-stat por "stat-del-ejercicio-actual coincide con `weakness_stat` → ×bonus; coincide con `resist_stat` → ×penal", activando de paso `resist_stat`. (B) mantener el bono por nivel Y añadir un bono/penal extra por ejercicio-vs-weakness/resist. (C) no tocar combate. *Recomiendo (A)*: cumple la promesa de la task ("qué entreno hoy" pasa a importar), da vida a `resist_stat` y no infla (reemplaza, no acumula). Necesita que Roman fije la tabla de mapeo + los multiplicadores. No se implementa a ciegas: cambia la fórmula de daño y el feel del combate.
- [ ] **Boss comunitario como evento con cadencia** — `backend/utils/boss.js`: HP hardcodeado 50.000 (escalado por usuarios calculado y descartado), un veterano lo funde en una sesión y se auto-resetea dentro de un GET. Darle horario, anticipación y anuncio.
- [ ] **Integridad competitiva mínima** — soft-cap diario de reps con rendimientos decrecientes + badge "verificado" para datos de Hevy + leaderboards separados verificado/manual.

## P2 — Distribución (mes 2-6, el experimento que decide todo)

- [ ] 👤 **Comprar dominio propio** (`reppy.app` / `reppy.fit`, ~10-40 €/año) + 301 desde `reppy.romandev.app`. Con ~0 tráfico la migración es una tarde; nunca será más barata que ahora.
- [ ] **Play Store vía TWA/Capacitor** (Bubblewrap, $25 una vez) — quien busca "app dominadas" espera acabar en una store. Android primero (calistenia hispana).
- [ ] 👤 **TikTok/Shorts 2-3/semana** — el canal principal. Formatos: "mis dominadas dañan al boss", boss comunitario en vivo ("muere cuando la comunidad haga 10.000 flexiones"), progresos de usuarios.
- [ ] 👤 **Product Hunt + Show HN** — gratis, pico de un día y backlinks DR alto (lo que le falta al dominio).
- [ ] 👤 **Outreach mensual a listículos** — FitCraft, Bitletics, RazFit, MainQuest, AlternativeTo, listas "Habitica alternatives". Un email por sitio = backlink + tráfico de intención perfecta.
- [ ] **Suscripción mínima (~€3-4/mes)** — cofres/giros extra, cosméticos, stats avanzadas. Aunque la compren 3 personas: se necesita el dato de conversión. NUNCA vender poder (mata el PvP/rankings). Hoy no hay ni Stripe.

## P2 — SEO fixes (mantenimiento, no canal principal)

- [ ] **Soft-404 global** — cualquier URL inventada devuelve 200 con la home (canonical a `/es`). Fallback 404 real o `noindex` en el catch-all del router + config Traefik/Coolify.
- [ ] **`/` → 301 a `/es`** (hoy 200 con canonical).
- [ ] 🔨 PR #322 **`llms.txt` con slugs ES bajo `/en/blog/`** — `frontend/public/llms.txt:29-38`. *(Fix: los 10 enlaces EN ahora usan el `slugEn` real de `blogPosts.json`, coincidiendo con las rutas SSG de `vite.config.js:110`.)*
- [ ] 🔨 PR #320 **Limpiar `frontend/index.html`** — meta keywords con ~45 términos (línea 14) y bloque `<noscript>` keyword-stuffed (178-230), redundante con SSG.
- [ ] ⏸️ PREGUNTA **Sitemap de atletas** — 200 URLs thin casi idénticas; incluir solo perfiles con actividad mínima. **Investigado (routine 2026-07-25, último run)**: el generador (`frontend/scripts/generate-sitemap.js:141-168`) tira de `/api/profile/top-public?limit=100`, que YA filtra `total_reps > 0` y excluye cuentas de test (`isTestAthlete`). O sea el umbral efectivo hoy es "≥1 rep de por vida" → sigue metiendo perfiles casi vacíos (thin). "Actividad mínima" pide subir ese listón, pero el número exacto es una decisión SEO (más URLs = más superficie indexable pero más thin content que no rankea; menos = páginas más sólidas). **Opciones**: (A) subir el umbral a `total_reps >= 50` (y/o `current_level >= 3`) en la query de `top-public` (`backend/profile.js:106`) — un solo `WHERE`, bajo riesgo. (B) exigir además **actividad reciente** (algún rep en los últimos ~30-60 días) para no indexar perfiles muertos — requiere una columna/JOIN de last-activity. (C) dejarlo como está (`>0`). *Recomiendo (A) con `total_reps >= 50`* como primer corte simple; (B) si más adelante importa la frescura. Necesita que Roman fije el número. No se implementa a ciegas: cambia qué perfiles se exponen a Google.
- [ ] **Engordar los 10 mejores posts a 1.500-2.500 palabras** (empezar por clúster dominadas ES) y **dejar de producir posts de 300 palabras** — el 80% del blog actual es thin content que no rankea.

## P3 — Deuda técnica (a medida que se toque, no big-bang)

- [ ] 🔨 PR #323 **Tests + CI mínimo sobre flujos de economía** — hoy `"test": "exit 1"` y cero CI para una app con dinero virtual. *(Fix: suite `node:test` — math de recompensas + invariantes de concurrencia de las races de #321 contra Postgres — y workflow CI GitHub Actions con servicio `postgres:16`, `node --check` sweep y build SSG. Los tests legacy `tests/*.test.js` quedan fuera del scope, necesitan DB migrada.)*
- [ ] 🔨 PR #321 **Race conditions restantes**: `backend/shop.js:255-282` (`/daily/refresh` sin transacción ni guard de gemas) y `backend/reps.js:213-230` (referral pagable 2 veces). El patrón correcto está en `roulette.js`. *(Fix: `withTransaction`+`FOR UPDATE` en el refresh, claim gate atómica en el referral; verificado con Postgres efímero local, 6/6 tests de concurrencia.)*
- [ ] **Unificar las 3 fuentes de esquema** — `/db/init` (index.js:314-640, usa rareza `epic` inexistente), `schema.sql` y `ensureSchemaMigrations()`. Drift garantizado.
- [ ] **Trocear archivos monstruo al tocarlos** — `Dashboard.vue` (1.829), `Inventory.vue` (1.587), `Shop.vue` (1.317), `backend/training.js` (1.147), handler `POST /reps` (~10 responsabilidades).
- [ ] **JWT**: 30 días con `is_admin` embebido y sin revocación — refresh tokens o TTL corto.
- [ ] ⏸️ PREGUNTA **`backend/db.js:14`** `ssl: { rejectUnauthorized: false }` (MITM). **Hevy verificado (routine 2026-07-25)**: la API key **NO** se guarda en claro — `hevy.js:66` cifra con `encryptHevyKey` (AES-256-GCM, `utils/hevyCrypto.js`) y descifra al leer; esa mitad está resuelta. Caveats menores: (1) `decryptHevyKey` trata como plaintext cualquier valor sin prefijo `hvy1:` (backwards-compat → claves legacy previas a este cifrado siguen en claro hasta reconectar); (2) la clave de cifrado cae a `JWT_SECRET` y, si falta, a un default hardcodeado de dev — conviene fijar `HEVY_ENCRYPTION_KEY` en prod. **Queda `db.js` SSL**: poner `rejectUnauthorized:true` sin el CA correcto rompe la conexión al Postgres gestionado. **Opciones**: (A) obtener el CA del proveedor y usar `ssl:{ ca, rejectUnauthorized:true }`. (B) si el Postgres vive en la misma red privada de Docker/Coolify que el backend, el riesgo MITM es bajo y `rejectUnauthorized:false` es aceptable — documentarlo y cerrar. (C) forzar `sslmode` según el `DATABASE_URL`. *Recomiendo (B) si es red interna* (lo más probable en Coolify), *(A) si el Postgres es externo*. Necesita el dato de infra de Roman.
- [ ] ⏸️ PREGUNTA **Borrar `api/`** (shim Vercel muerto) y el doble montaje de `apiRouter` en `/api` y `/` (ahora `index.js:293-294`). **⚠️ Hallazgo (routine 2026-07-25)**: el doble montaje NO es redundante. El comentario en `index.js:201-202` lo explica: *Coolify/Traefik quita el prefijo `/api`*, así que en producción el backend recibe rutas **sin** prefijo (`/auth/...`). El mount `app.use('/', apiRouter)` es **load-bearing**: sirve el tráfico ya despojado por Traefik. Quitarlo a ciegas **rompe TODA la API en producción**. El frontend, en cambio, llama siempre con `/api/` (161 usos, 0 llamadas a rutas bare) — verificado. **Opciones**: (A) reconfigurar Traefik/Coolify para que NO quite el prefijo (o enrutar el backend bajo `/api`) y ENTONCES dejar solo el mount `/api` — solución limpia pero requiere cambio de infra + deploy coordinado (acceso de Roman). (B) aceptar que el doble mount es intencional (no es deuda) y solo borrar el shim `api/` + `vercel.json` si ya no se usa Vercel (bajo riesgo, no unifica el montaje). (C) dejarlo todo como está. *Recomiendo (B) ya* (el shim `api/` sí es código muerto: seguían en Coolify, no Vercel) *y (A) más adelante* cuando Roman pueda tocar Traefik. **No se implementa a ciegas: quitar el mount `/` sin (A) tira producción.**
- [x] **`social_feed.js:318`** (PR #319 mergeada) — `page` no numérico → 500 en vez de 400.
- [ ] ⏸️ PREGUNTA **`config.path` de campaña sin consumir** — `curse_damage_multiplier`/`blessing_hours` no afectan al gameplay; implementarlo o quitarlo. **Investigado (routine 2026-07-25)**: la *elección* de senda (`run.path`) SÍ funciona — gatea nodos vía `requires:{path:"light"|"dark"}` en `main-campaign.json`. Lo muerto son los **efectos numéricos** del bloque `path` (JSON líneas 13-15): `dark → curse_damage_multiplier:0.75`, `light → blessing_hours:24`. `campaignEngine.js` no los lee en ningún sitio (0 referencias a curse/blessing/multiplier). **Opciones**: (A) **implementarlos** — aplicar `curse_damage_multiplier` al daño en/desde combate de campaña y `blessing_hours` como buff temporal al elegir la senda light. Es un cambio de balance (cuánto y sobre qué daño) → decisión de Roman. (B) **quitarlos** del JSON (dejar las sendas como pura ramificación de nodos, sin efecto de stats) — cleanup inocuo pero pierde la intención de diseño "ninguna senda es gratuita". *Recomiendo (A) si las sendas deben sentirse distintas mecánicamente* (encaja con el lore del JSON), *(B) si no*. No se implementa a ciegas: (A) toca la fórmula de daño de campaña.

---

## Secuencia sugerida

| Cuándo | Qué |
|---|---|
| **Semana 1** | Todo P0 (seguridad + promesas rotas) |
| **Semanas 2-4** | Rebalance económico + winback + día de descanso + GA4 + renombrar bosses |
| **Mes 2** | Dominio + TWA Play Store + suscripción mínima + primeros TikToks |
| **Mes 2-6** | Cadencia de contenido + Product Hunt/HN + outreach + combate con decisiones |
| **Mes 6** | Revisar kill criterion con los datos del funnel |
