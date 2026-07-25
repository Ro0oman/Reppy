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
- [ ] ⏸️ PREGUNTA **Cofres de nivel incoherentes** — `backend/utils/stats.js:252` (`additionalChests = 0`): ya no se ganan subiendo de nivel pero la ruleta los regala. Decidir: restaurar o renombrar. **Contexto**: el cambio a "1 skill point por nivel" en vez de cofre fue intencional (comentario en `stats.js:249-252`), pero `level_chests` sigue siendo moneda viva (la da la ruleta en `roulette.js`, se abre en `shop.js` `/buy-chest/:type`, la UI lo llama "Cofre de Nivel") → el nombre miente. Opciones: **(A) Renombrar** el cofre a algo genérico ("Cofre de Batalla"/"Cofre Común") en DB + i18n (es/en) + premio de ruleta + UI, manteniéndolo como recompensa de ruleta/tienda [*recomendado*: el cambio a skill points fue deliberado, renombrar es bajo riesgo y no re-infla la recompensa por nivel]. **(B) Restaurar** que subir de nivel otorgue 1 cofre (revertir `additionalChests`), aceptando doble recompensa por nivel (skill point + cofre). **(C)** Quitar el cofre de nivel del todo (de la ruleta y la tienda) si ya no encaja. Recomiendo **(A)**.

## P1 — Rebalance económico (mes 1, empieza por una hoja de cálculo)

> Hoy entrenar aporta solo el ~10-15% del ingreso diario de un jugador con racha. La app premia abrir, no entrenar.

> **Base de datos para decidir**: PR #314 añade `docs/economy-curves-2026-07.md` + `backend/scripts/analyze_economy_curves.js` (curvas reales). Los ⏸️ de abajo referencian esos números. Todos son decisiones de balance — no se implementan hasta que Roman elija.

- [ ] ⏸️ PREGUNTA **Cap a la recompensa de racha** — `backend/utils/stats.js:300`: `streak × 50` sin tope (día 100 = 5.000 monedas/día por 1 rep; ver §4 del informe). **Opciones**: (A) `50 + 5×min(streak,30)` → cap 200/día. (B) hitos discretos 7/30/100 → 150/400/1000. (C) otro número. *Recomiendo (A)*: suave, acotado, fácil. Solo falta que Roman fije la curva.
- [ ] ⏸️ PREGUNTA **Bajar el EV de la ruleta 4h** — `backend/roulette.js` (EV real = 426 monedas/día pasivas, §3) + sincronizar `frontend/src/components/shop/LuckyWheel.vue`. **Opciones**: (A) subir cooldown 4h→6/8h. (B) recortar pesos de premios altos (id 4/5 = 350/600). (C) ambas. *Recomiendo (B)* para no castigar el hábito de abrir, solo el EV. Roman decide el objetivo de monedas/día.
- [ ] ⏸️ PREGUNTA **Domar la bola de nieve de FE** — `backend/utils/damage.js` (`divineBonus = fthLvl × 25` plano/rep, es >80% del daño temprano, §2) + `stats.js:193` (XP de FE = daño → feedback positivo). **Opciones**: (A) bajar el flat (25→~5) y compensar. (B) convertir el flat en un bono %. (C) que FE suba por raids/quests, no por daño. *Recomiendo (A)+(C)*. Cambia el feel del combate → decisión de Roman.
- [ ] ⏸️ PREGUNTA **Nerfear pociones DEX de crit** — poción calisténica `+100 dex` → ~80% crit ×~12 ≈ ×9.8 daño (el crit esperado a nivel alto ya multiplica ×~10, §1), doble que la de ×3.5 que cuesta 12.000. **Opciones**: (A) bajar el `dex_bonus` de la poción. (B) bajar el cap de crit (80%) o la escala `dex×2.5`. (C) subir su precio. *Recomiendo (A)*: es un outlier puntual. Roman fija el número.
- [ ] ⏸️ PREGUNTA **Arreglar la curva de dificultad** — HP enemigo `1+0.05·L` lineal vs daño superlineal → reps-para-matar cae 41→0.01 (§1). **Opciones**: (A) HP escala con el daño esperado del jugador (cuadrático en L). (B) subir mucho `hp_per_level`/`prestige_mult`. *Recomiendo (A)* pero requiere re-derivar la fórmula de HP contra la de daño → decisión + diseño de Roman.
- [ ] ⏸️ PREGUNTA **Prestigio con ROI positivo** — HP ×1.5/vuelta (`config.hp.prestige_mult`) pero rewards ×1.25 (`config.rewards.prestige_mult`): cada NG+ paga peor. **Opciones**: (A) `rewards_mult ≥ hp_mult`. (B) recompensas exclusivas (cosméticos/títulos) en vez de más coins. *Recomiendo (B)* (evita inflación) o (A) como mínimo. Decisión de diseño de Roman.
- [x] **Hoja de cálculo de curvas** (PR #314 mergeada) (daño/HP/monedas por nivel y día) antes de tocar números — hecho: `docs/economy-curves-2026-07.md` + `backend/scripts/analyze_economy_curves.js`.

## P1 — Retención (mes 1, el mayor ROI de toda la auditoría)

> Winback actual = cero: un usuario que falla UN día no recibe nada nunca más. D30 estimado hoy: 3-8%. Con estos dos primeros puntos: 10-15%.

- [x] **Winback cron D3/D7/D14** (PR #317 mergeada) — reutilizar la infra de `backend/utils/streakReminders.js` con query de usuarios sin reps en N días y su dato real ("tenías racha de 12"). *~1 día.*
- [ ] ⏸️ PREGUNTA **"Día de descanso activo"** — la racha castiga descansar (obligatorio en fitness 2-3 días/semana). **Opciones**: (A) botón diario que preserva la racha 1×/semana gratis (nuevo mecanismo + tabla de uso semanal). (B) reconvertir el freeze de 250 monedas en "descanso programado" gratuito 1×/semana. (C) que la racha cuente "días activos de 7" en vez de días consecutivos. *Recomiendo (A)*: claro y generoso, sin tocar la economía del freeze. Cambia la mecánica core de racha → decisión de Roman (y define cuántos descansos/semana).
- [x] **Matar/segmentar el blast de referral** (PR #315 mergeada) — `backend/utils/referralReminders.js` (días 1 y 16 a TODOS): spam que quema el canal push. Solo activos >7 días que nunca refirieron, máx 1 vez.
- [x] **Push "tu rival te adelantó"** (PR #316 mergeada) — la query ya existe en `backend/social_feed.js` `/stats`; dispararla 1×/día. Reutilización pura.
- [ ] ⏸️ PREGUNTA **Reto vs tu semana pasada** — fallback para el cold start social (PvP/retos mueren sin masa crítica); la tabla `reps` ya tiene los datos. **Falta definir producto**: ¿qué es el "reto" mecánicamente? (a) meta = reps de tu semana pasada, con recompensa (¿coins/gems/cofre?) al superarla; (b) ¿semanal con reset los lunes?; (c) ¿UI nueva en Dashboard/Social o solo un push? Los datos existen (query semanal ya usada en `/social-feed/stats`), pero el diseño (recompensa + framing + dónde vive) es decisión de Roman. *Recomiendo*: meta = reps semana previa, recompensa pequeña fija (p. ej. 1 cofre común) al igualar/superar, card en Dashboard.
- [x] **Eventos GA4 de funnel** (PR #318 mergeada) — hoy solo pageviews: añadir `signup`, `first_log`, `push_enabled`, `spin`, `day2_return`. *Una tarde.* Quitar `@vercel/analytics` de `frontend/src/main.js` (muerto tras Coolify).

## P1 — Legal / tema

- [ ] ⏸️ PREGUNTA / 👤 **Renombrar los bosses con IP ajena** — nombres Y arte infringen IP: `backend/index.js` `/db/init` inserta Artorias/Nameless King (Dark Souls), The Ender Dragon (Minecraft), Rathalos (Monster Hunter), Baldur (God of War), Arthas (Warcraft), Malenia (Elden Ring), Sephiroth (FF), Calamity Ganon (Zelda), Diablo — con arte de `static.wikia.nocookie.net`. **Bloqueado por 2 cosas de Roman**: (1) **lore/nombres propios** (creativo) y (2) **arte original** (👤 — no lo puedo generar). *Propuesta de nombres originales* para desbloquear (misma vibe fitness-RPG, sin IP): Abisario el Caído, El Devorador de Descansos, El Rey Sin Nombre, Vórtice Final, La Invicta de la Barra, Coloso Osteo, Ala Rota, Fauces del Averno, Cronarca. Al aprobar nombres + arte lo implemento (rename en `/db/init` + `schema.sql` si aplica + rutas de imagen locales). *No se implementa a ciegas: cambiaría nombres visibles y rompería el arte sin assets nuevos.*

## P2 — Combate con decisiones (el cambio con mejor ratio esfuerzo/impacto del juego)

- [ ] **Ejercicio → tipo de daño vs weakness/resist del enemigo** — la araña débil a empuje, el troll a piernas… De golpe "¿qué entreno hoy?" es una decisión de juego Y fomenta variedad de entrenamiento. El sistema `weakness_stat`/`resist_stat` ya existe en el motor; solo cambia contra qué se compara.
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
- [ ] **Sitemap de atletas** — 200 URLs thin casi idénticas; incluir solo perfiles con actividad mínima.
- [ ] **Engordar los 10 mejores posts a 1.500-2.500 palabras** (empezar por clúster dominadas ES) y **dejar de producir posts de 300 palabras** — el 80% del blog actual es thin content que no rankea.

## P3 — Deuda técnica (a medida que se toque, no big-bang)

- [ ] **Tests + CI mínimo sobre flujos de economía** — hoy `"test": "exit 1"` y cero CI para una app con dinero virtual.
- [ ] 🔨 PR #321 **Race conditions restantes**: `backend/shop.js:255-282` (`/daily/refresh` sin transacción ni guard de gemas) y `backend/reps.js:213-230` (referral pagable 2 veces). El patrón correcto está en `roulette.js`. *(Fix: `withTransaction`+`FOR UPDATE` en el refresh, claim gate atómica en el referral; verificado con Postgres efímero local, 6/6 tests de concurrencia.)*
- [ ] **Unificar las 3 fuentes de esquema** — `/db/init` (index.js:314-640, usa rareza `epic` inexistente), `schema.sql` y `ensureSchemaMigrations()`. Drift garantizado.
- [ ] **Trocear archivos monstruo al tocarlos** — `Dashboard.vue` (1.829), `Inventory.vue` (1.587), `Shop.vue` (1.317), `backend/training.js` (1.147), handler `POST /reps` (~10 responsabilidades).
- [ ] **JWT**: 30 días con `is_admin` embebido y sin revocación — refresh tokens o TTL corto.
- [ ] **`backend/db.js:14`** `ssl: { rejectUnauthorized: false }` (MITM) · **`backend/hevy.js:66`** verificar si la API key se guarda en claro.
- [ ] ⏸️ PREGUNTA **Borrar `api/`** (shim Vercel muerto) y el doble montaje de `apiRouter` en `/api` y `/` (ahora `index.js:293-294`). **⚠️ Hallazgo (routine 2026-07-25)**: el doble montaje NO es redundante. El comentario en `index.js:201-202` lo explica: *Coolify/Traefik quita el prefijo `/api`*, así que en producción el backend recibe rutas **sin** prefijo (`/auth/...`). El mount `app.use('/', apiRouter)` es **load-bearing**: sirve el tráfico ya despojado por Traefik. Quitarlo a ciegas **rompe TODA la API en producción**. El frontend, en cambio, llama siempre con `/api/` (161 usos, 0 llamadas a rutas bare) — verificado. **Opciones**: (A) reconfigurar Traefik/Coolify para que NO quite el prefijo (o enrutar el backend bajo `/api`) y ENTONCES dejar solo el mount `/api` — solución limpia pero requiere cambio de infra + deploy coordinado (acceso de Roman). (B) aceptar que el doble mount es intencional (no es deuda) y solo borrar el shim `api/` + `vercel.json` si ya no se usa Vercel (bajo riesgo, no unifica el montaje). (C) dejarlo todo como está. *Recomiendo (B) ya* (el shim `api/` sí es código muerto: seguían en Coolify, no Vercel) *y (A) más adelante* cuando Roman pueda tocar Traefik. **No se implementa a ciegas: quitar el mount `/` sin (A) tira producción.**
- [x] **`social_feed.js:318`** (PR #319 mergeada) — `page` no numérico → 500 en vez de 400.
- [ ] **`config.path` de campaña sin consumir** — `curse_damage_multiplier`/`blessing_hours` no afectan al gameplay; implementarlo o quitarlo.

---

## Secuencia sugerida

| Cuándo | Qué |
|---|---|
| **Semana 1** | Todo P0 (seguridad + promesas rotas) |
| **Semanas 2-4** | Rebalance económico + winback + día de descanso + GA4 + renombrar bosses |
| **Mes 2** | Dominio + TWA Play Store + suscripción mínima + primeros TikToks |
| **Mes 2-6** | Cadencia de contenido + Product Hunt/HN + outreach + combate con decisiones |
| **Mes 6** | Revisar kill criterion con los datos del funnel |
