# Reppy — Plan de mejora (auditoría 2026-07-23)

Resultado de una auditoría de 5 ejes: ingeniería, game design, engagement, SEO/growth y mercado.

**Notas**: Producto 7.5 · Engagement 6.5 · Ingeniería 6 · Game design 5.5 · SEO/Growth 4.5 · Negocio 4.5

**Veredicto**: la app NO es cutre — el cuello de botella no es el código, es distribución + balance económico + retención de caídos. Plan: apuesta acotada de 6 meses.

**Kill criterion (revisar ~2027-01-23)**: ~1.000 MAU y D30 > 10%. Si no → hobby sin mala conciencia.

**❌ MONETIZACIÓN DESCARTADA (decisión de Roman, 2026-07-26)**: Reppy NO se monetiza de ninguna forma — ni suscripción, ni compras, ni cosméticos de pago, ni ads. No proponer monetización en futuras auditorías; ignorar cualquier recomendación de los informes originales en esa dirección. La conversión de pago YA NO es parte del kill criterion.

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

**Registro de auditorías por eje** (actualizar al auditar): ingeniería/seguridad 2026-07-26 · game design/economía 2026-07-23 · engagement/retención 2026-07-23 · SEO/growth 2026-07-23 · deuda técnica 2026-07-23.

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
- [x] **Cofres de nivel: renombrar a genérico** ✅DECIDIDO (2026-07-25: opción A) — renombrar "Cofre de Nivel" → nombre genérico ("Cofre de Batalla") en DB + i18n (es/en) + premio de ruleta (`roulette.js`) + UI. Se mantiene como recompensa de ruleta/tienda; NO se restaura el cofre por subir de nivel (`additionalChests` sigue en 0). Coherencia i18n en ambos locales.

## P1 — Rebalance económico (mes 1, empieza por una hoja de cálculo)

> Hoy entrenar aporta solo el ~10-15% del ingreso diario de un jugador con racha. La app premia abrir, no entrenar.

> **Base de datos para decidir**: PR #314 añade `docs/economy-curves-2026-07.md` + `backend/scripts/analyze_economy_curves.js` (curvas reales). Los ⏸️ de abajo referencian esos números. Todos son decisiones de balance — no se implementan hasta que Roman elija.

- [x] **Cap a la recompensa de racha** ✅DECIDIDO (2026-07-25: opción A) — `backend/utils/stats.js:300`: cambiar `streak × 50` por **`50 + 5×min(streak,30)`** (cap 200 monedas/día). Verificar que no rompe ningún otro cálculo que dependa de la recompensa de racha.
- [x] **EV de la ruleta 4h: SIN CAMBIOS** ✅DECIDIDO (2026-07-25) — Roman decide dejar la ruleta 4h como está. No tocar `roulette.js` ni `LuckyWheel.vue` por este motivo.
- [x] (Parte A) **Domar la bola de nieve de FE** ✅DECIDIDO (2026-07-25: opción A+C) — `backend/utils/damage.js`: bajar el bono plano `divineBonus = fthLvl × 25` → **`fthLvl × 5`**. Y romper el bucle daño→FE de `stats.js:193`: que la XP de FE NO venga del daño infligido, sino de participar en raids/quests (definir la nueva fuente al implementar). Cambio de feel del combate — PR revisable, no auto-merge.
  - **Parte A (bono plano ×25→×5) → PR #326** (también aplica a `baseDivine` para no descuadrar el desglose base/gear). Sin impacto retroactivo (solo cambia el daño futuro).
  - **Parte C ⏸️ PREGUNTA (aparcada por el agente 2026-07-26)**: cambiar la fuente de `fth_xp` NO es aislable. `stats.js:193` (`fth_xp = daño/50`) alimenta `rawTotalXP` (`stats.js:235`) → `total_xp` → **el NIVEL GLOBAL** (`stats.js:240-241`), y `recalculateUserStats` recalcula desde el historial y **permite que el nivel baje**. Poner FTH = "participación" (nº mucho menor que daño/50 para veteranos) **desnivelaría retroactivamente a TODOS los usuarios** en su siguiente log (y el nivel global realimenta daño, leaderboards, etc.). Opciones: **(A)** implementar la nueva fuente + añadir un término de compensación para que `total_xp` no caiga (p. ej. congelar el `fth_xp` histórico actual como un `fth_legacy_xp` de solo-lectura y sumar la participación encima) — conserva niveles pero es más código; **(B)** aceptar el reseteo/desnivel como parte del rebalance y comunicarlo; **(C)** dejar FTH ligado al daño pero SOLO el bono plano nerfeado (Parte A) ya rompe la mayor parte del bucle → quizá la Parte C no haga falta. **Recomendación del agente: (C)** — la Parte A ya corta la realimentación dominante (el término plano) sin tocar niveles; medir antes de arriesgar un desnivel masivo. Roman decide.
- [ ] **Nerfear pociones DEX de crit: subir precio a 40.000** ✅DECIDIDO+NÚMERO (2026-07-26, Claude) — subir el precio de la poción calisténica `+100 dex` de ~12.000 a **40.000 monedas** (×3.3) en el seed `backend/archive/diversify_consumables.js` (y en `items` si ya está sembrada, vía migración/update). Deja de ser outlier de ratio daño/coste. Accionable ya.
  - **⏸️ PREGUNTA (agente 2026-07-26)**: dos cosas sin cerrar. **(1) Precio exacto**: la poción es *"Maestría del Cuerpo"* (`calistenico`, +100 dex, 24h), **precio actual 18.000 coins**. ×3 = 54.000 · ×4 = 72.000. **(2) Mecanismo**: el seed `archive/diversify_consumables.js` está archivado y **NO se ejecuta en runtime** — editarlo NO cambia el precio en producción (los items viven en la tabla `items`, ya sembrada). Para que tenga efecto real hace falta un one-shot `UPDATE items SET price=$1 WHERE name='Maestría del Cuerpo'` (patrón como `backend/tmp/update_prices_pg.js`), aparte de actualizar el seed para futuras siembras. **Recomendación del agente: ×4 (72.000) + script de migración one-shot + actualizar el seed**; y decidir si subir también proporcionalmente *"Sangre de Dragón"* (legendary, +50 dex, 6.000) para no crear un nuevo outlier un escalón abajo, o dejarla. **Roman confirma precio(s) y si autoriza el `UPDATE` a la tabla `items` de prod → la noche siguiente se implementa.**
- [ ] **Arreglar la curva de dificultad** ✅DECIDIDO+NÚMERO (2026-07-26, Claude) — HP enemigo pasa de lineal `1+0.05·L` a **cuadrático**: `hp_scale = 1 + 0.05·L + 0.005·L²` (casa con el daño superlineal del jugador). **Objetivo de calibración**: que matar un enemigo estándar cueste ~25-40 reps a CUALQUIER nivel (usar `docs/economy-curves-2026-07.md` para afinar el 0.005). ADEMÁS poner **tope al multiplicador de crit** (el auditor señaló crit sin tope): cap del daño de crit a ×3 sobre el golpe base. Toca `damage.js` (crit) + la fórmula de HP (`campaignEngine.js`/`boss.js`). PR revisable.
  - **⏸️ PREGUNTA (agente 2026-07-26)**: la fórmula vive en `scaleEnemyHp` (`backend/utils/campaignEngine.js:28`): `base·(1 + lvl·0.05)·tierMult·prestigeMult`. Dos bloqueos antes de derivar coeficientes: **(1) La curva de daño está EN OBRAS ahora mismo** — PR #325 (racha), PR #326 (divino ×25→×5) y la Parte C de FE (fuente de `fth_xp`, ⏸️) cambian el daño; fijar el HP contra una curva que va a moverse sería fitting a un blanco móvil. Hay que derivar el HP **después** de que aterrice el rebalance de daño. **(2) Un HP cuadrático NO basta para estabilizar las reps-para-matar en todo el rango**: el `analyze_economy_curves.js` muestra que el daño esperado-con-crítico es ~cúbico porque `critMult = 2 + dex·0.1` crece **sin tope** (nivel 100: dmg noCrit 50.695 vs expCrit 496.811, ~10× solo por crítico). Un `L²` de HP seguiría al término multiplicativo de nivel/FE pero no a la explosión de crítico. → Para "estables de verdad" probablemente haga falta **también** capar `critMult` (fuera del scope actual) o aceptar estabilidad solo en el tramo medio. **Recomendación del agente**: (a) mergear primero #325/#326 y decidir la Parte C de FE; (b) luego derivar `scaleEnemyHp` como `base·(1 + a·L + b·L²)·tierMult·prestigeMult` fijando reps-to-kill≈objetivo en el tramo 1–50 con la curva de daño final; (c) decidir aparte si capar el crítico. **Roman**: ¿objetivo de reps-para-matar (constante ~N, o subiendo suave)? ¿autorizas tocar el crítico o solo el HP? El HP se snapshotea al engage, así que el cambio NO afecta batallas ya empezadas.
- [ ] **Prestigio con ROI positivo: cosméticos exclusivos** ✅DECIDIDO+CONTENIDO (2026-07-26, Claude) — crear **6 cosméticos `prestige_only`** (nueva flag/columna en `items` o cosmetics), otorgados **1 por vuelta de prestigio** (NG+1 → el 1º, NG+2 → el 2º…): (1) Título «El Reencarnado», (2) Marco «Aura de Prestigio», (3) Efecto de partículas «Brasas Eternas», (4) Título «Sin Fin», (5) Marco «Halo Carmesí», (6) Efecto «Estela Dorada». No comprables con monedas/gemas (exclusividad = el gancho). Sembrar en un seed + gate en el evento de prestigio. PR revisable.
  - **⏸️ PREGUNTA (agente 2026-07-26)**: el enganche técnico es fácil (`prestige()` en `campaignEngine.js:328` ya calcula `newLevel`; bastaría un `INSERT INTO user_inventory(user_id, cosmetic_id)` con el cosmético de esa vuelta). Lo que falta son **3 decisiones de Roman**: **(1) Contenido** (creativo, es la recompensa entera): nombres + `css_value` (gradientes/efectos) + `type` de cada cosmético. Propuesta de arranque: títulos `Renacido I…V` con gradientes escalando (dorado→plateado→prismático) — Roman aprueba/reemplaza. **(2) Exclusividad**: la tabla `cosmetics` no tiene marca de "no comprable"; hoy todo cosmético tiene `price` y sale en la tienda. Hay que añadir un flag (`is_exclusive BOOLEAN` / `source='prestige'`) y **excluirlo de la query de la tienda**, o convención `price = -1`. → decisión de diseño de schema. **(3) Mecanismo de siembra**: los cosméticos viven en la tabla `cosmetics` (mismo caso que las pociones) → hace falta migración/seed que corra en prod, no solo un JSON. **(4) ¿Un cosmético por nivel de prestigio (infinito) o un set fijo (p. ej. 5) y luego repetir/monedas?** **Recomendación**: set fijo de 5 títulos exclusivos + flag `is_exclusive` + grant en `prestige()`. Roman confirma nombres/estilos y el flag → se implementa.
- [x] **Hoja de cálculo de curvas** (PR #314 mergeada) (daño/HP/monedas por nivel y día) antes de tocar números — hecho: `docs/economy-curves-2026-07.md` + `backend/scripts/analyze_economy_curves.js`.

## P1 — Retención (mes 1, el mayor ROI de toda la auditoría)

> Winback actual = cero: un usuario que falla UN día no recibe nada nunca más. D30 estimado hoy: 3-8%. Con estos dos primeros puntos: 10-15%.

- [x] **Winback cron D3/D7/D14** (PR #317 mergeada) — reutilizar la infra de `backend/utils/streakReminders.js` con query de usuarios sin reps en N días y su dato real ("tenías racha de 12"). *~1 día.*
- [x] **"Día de descanso activo"** ✅DECIDIDO (2026-07-25: opción A) — botón diario que **preserva la racha 1×/semana gratis** (sin coste en monedas, aparte del freeze de 250 que se mantiene). Requiere nuevo mecanismo + tabla/columna de uso semanal del descanso (reset semanal). No toca la economía del freeze. i18n es/en. Cambia la mecánica core de racha → PR revisable. *(1 descanso gratis/semana; ajustar si hace falta.)*
- [x] **Matar/segmentar el blast de referral** (PR #315 mergeada) — `backend/utils/referralReminders.js` (días 1 y 16 a TODOS): spam que quema el canal push. Solo activos >7 días que nunca refirieron, máx 1 vez.
- [x] **Push "tu rival te adelantó"** (PR #316 mergeada) — la query ya existe en `backend/social_feed.js` `/stats`; dispararla 1×/día. Reutilización pura.
- [x] **Reto vs tu semana pasada (versión completa)** ✅DECIDIDO (2026-07-25) — meta = tus **reps de la semana previa**; al igualar/superarla, recompensa fija pequeña (**1 cofre común/de batalla**); **card en el Dashboard** mostrando progreso vs semana pasada; reset semanal (lunes). Reutiliza la query semanal ya usada en `/social-feed/stats`. Es la única "feature nueva" aprobada del backlog. i18n es/en. PR revisable.
- [x] **Eventos GA4 de funnel** (PR #318 mergeada) — hoy solo pageviews: añadir `signup`, `first_log`, `push_enabled`, `spin`, `day2_return`. *Una tarde.* Quitar `@vercel/analytics` de `frontend/src/main.js` (muerto tras Coolify).

## P1 — Legal / tema

- [ ] ⏸️ / 👤 **Renombrar los bosses con IP ajena** — APLAZADO (2026-07-25: Roman decide dejarlo para después). Riesgo legal asumido mientras tanto. Nombres Y arte infringen IP: `backend/index.js` `/db/init` inserta Artorias/Nameless King (Dark Souls), The Ender Dragon (Minecraft), Rathalos (Monster Hunter), Baldur (God of War), Arthas (Warcraft), Malenia (Elden Ring), Sephiroth (FF), Calamity Ganon (Zelda), Diablo — con arte de `static.wikia.nocookie.net`. Bloqueado por: (1) nombres/lore propios (creativo, Roman), (2) arte original (👤). *Nombres propuestos si se retoma*: Abisario el Caído, El Devorador de Descansos, El Rey Sin Nombre, Vórtice Final, La Invicta de la Barra, Coloso Osteo, Ala Rota, Fauces del Averno, Cronarca. **Los agentes nocturnos NO cogen esta task.**

## P2 — Combate con decisiones (el cambio con mejor ratio esfuerzo/impacto del juego)

- [ ] 🔨 PR #336 **Combate: ejercicio → daño vs weakness/resist** ✅DECIDIDO+TABLA (2026-07-26, Claude; opción B) — MANTENER el bono por nivel de stat Y AÑADIR un multiplicador por el ejercicio logueado. **Mapeo grupo-muscular (Hevy `primary_muscle_group`, ver `backend/data/hevy_exercise_templates.json`) → stat del juego**: **STR** = chest, lats, upper_back, lower_back, triceps, biceps, forearms, traps, shoulders · **VIG** = quadriceps, hamstrings, glutes, calves, abductors, adductors · **END** = abdominals, cardio, full_body, neck, other. (DEX/INT/FTH/CHA no mapean a músculo — los cubre el bono por nivel existente.) **Multiplicadores** (ADEMÁS del bono actual): stat-del-ejercicio == `weakness_stat` → **×1.4**; == `resist_stat` → **×0.7** (esto ACTIVA `resist_stat`, hoy muerto); si no, ×1.0. Toca `damage.js:130-137` + necesita saber el grupo/stat del ejercicio logueado (los ejercicios de Reppy ya tienen `stat_type`; los importados de Hevy mapean vía grupo). PR revisable.
- [ ] ⏸️ PREGUNTA (agente 2026-07-26) **Boss comunitario como evento con cadencia** — `backend/utils/boss.js`: HP hardcodeado 50.000 (escalado por usuarios calculado y descartado), un veterano lo funde en una sesión y se auto-resetea dentro de un GET. Darle horario, anticipación y anuncio.
  - **⏸️ PREGUNTA**: `syncBossHealth` calcula `activeUsers` (COUNT distinct reps últimos 7 días) pero lo **descarta**: `newTotalHp = 50000` fijo, escalado solo por flags `is_legendary`(×8)/`is_epic`(×3); se llama al matar un boss (`combat.js`) → auto-reset inmediato, sin ventana ni anuncio. `boss_fights` ya tiene columnas `start_date`/`end_date` sin uso real. Faltan **3 decisiones de Roman**: **(1) Cadencia** — ¿boss siempre activo (hoy) o ventanas programadas (p.ej. 1 boss/semana vie–dom via `node-cron`)? **(2) Fórmula de HP** — ¿reactivar el escalado por `activeUsers` para que un veterano no lo funda solo (p.ej. `max(50000, activeUsers × N)`), con qué N? **(3) Anuncio** — ¿push existente + countdown en Dashboard reusando `start_date`/`end_date`? **Recomendación**: ventana semanal + `HP = max(50000, activeUsers × 400)` + countdown en Dashboard + push de anticipación. Roman fija cadencia y N.
- [ ] ⏸️ PREGUNTA (agente 2026-07-26) **Integridad competitiva mínima** — soft-cap diario de reps con rendimientos decrecientes + badge "verificado" para datos de Hevy + leaderboards separados verificado/manual.
  - **⏸️ PREGUNTA**: bloqueo técnico clave — la tabla `reps` **NO distingue origen**: Hevy y manual hacen upsert a la MISMA fila (`UNIQUE user_id,date,exercise_type`); solo `hevy_imported_workouts` registra las importaciones aparte. Los leaderboards (`leaderboard.js`/`profile.js`/`social_feed.js`) ordenan por reps sin filtro de origen, y no hay soft-cap. Faltan decisiones: **(1) Soft-cap** (no necesita schema, es puro cálculo de recompensa en `reps.js`/`rewards.js`): umbral + curva, p.ej. 100% hasta 200 reps/día · 50% 200–400 · 10% >400 — ¿números? **(2) Badge "verificado"**: requiere **columna nueva de origen en `reps`** (`source`/`verified`) capturada en `reps.js` (manual) y `hevyIngest.js` (hevy); derivarlo de `hevy_imported_workouts` es frágil por el merge de filas. ¿Autorizas el cambio de schema? **(3) Leaderboards separados**: depende de (2). **Recomendación**: implementar SOLO el soft-cap primero (sin schema); posponer badge + leaderboards separados a un segundo PR que añada `reps.source`. Roman fija números del soft-cap y si autoriza la columna.

## P2 — Distribución (mes 2-6, el experimento que decide todo)

- [ ] 👤 **Comprar dominio propio** (`reppy.app` / `reppy.fit`, ~10-40 €/año) + 301 desde `reppy.romandev.app`. Con ~0 tráfico la migración es una tarde; nunca será más barata que ahora.
- [ ] **Play Store vía TWA/Capacitor** (Bubblewrap, $25 una vez) — quien busca "app dominadas" espera acabar en una store. Android primero (calistenia hispana).
- [ ] 👤 **TikTok/Shorts 2-3/semana** — el canal principal. Formatos: "mis dominadas dañan al boss", boss comunitario en vivo ("muere cuando la comunidad haga 10.000 flexiones"), progresos de usuarios.
- [ ] 👤 **Product Hunt + Show HN** — gratis, pico de un día y backlinks DR alto (lo que le falta al dominio).
- [ ] 👤 **Outreach mensual a listículos** — FitCraft, Bitletics, RazFit, MainQuest, AlternativeTo, listas "Habitica alternatives". Un email por sitio = backlink + tráfico de intención perfecta.

## P2 — SEO fixes (mantenimiento, no canal principal)

- [ ] 🔨 PR #338 (parcial) **Soft-404 global** — cualquier URL inventada devuelve 200 con la home (canonical a `/es`). Fallback 404 real o `noindex` en el catch-all del router + config Traefik/Coolify. **PR #338 hace la parte code-side (`noindex` en la ruta `not-found` del router)**; queda 👤/infra el **404 real por status HTTP** (config Traefik/Coolify), que no es implementable desde el código.
- [ ] **`/` → 301 a `/es`** (hoy 200 con canonical).
- [x] **`llms.txt` con slugs ES bajo `/en/blog/`** — `frontend/public/llms.txt:29-38`. *(Fix: los 10 enlaces EN ahora usan el `slugEn` real de `blogPosts.json`, coincidiendo con las rutas SSG de `vite.config.js:110`.)*
- [x] **Limpiar `frontend/index.html`** (PR #320 mergeada) — meta keywords con ~45 términos (línea 14) y bloque `<noscript>` keyword-stuffed (178-230), redundante con SSG.
- [x] **Sitemap de atletas: umbral ≥50 reps** ✅DECIDIDO (2026-07-25: opción A) — subir el filtro de `top-public` a `total_reps >= 50` en `backend/profile.js:106` (un WHERE). Solo perfiles con actividad real se exponen a Google. Bajo riesgo, accionable ya.
- [ ] **Engordar los 10 mejores posts a 1.500-2.500 palabras** (empezar por clúster dominadas ES) y **dejar de producir posts de 300 palabras** — el 80% del blog actual es thin content que no rankea.

## P3 — Deuda técnica (a medida que se toque, no big-bang)

- [x] **Tests + CI mínimo sobre flujos de economía** — hoy `"test": "exit 1"` y cero CI para una app con dinero virtual. *(Fix: suite `node:test` — math de recompensas + invariantes de concurrencia de las races de #321 contra Postgres — y workflow CI GitHub Actions con servicio `postgres:16`, `node --check` sweep y build SSG. Los tests legacy `tests/*.test.js` quedan fuera del scope, necesitan DB migrada.)*
- [x] **Race conditions restantes**: `backend/shop.js:255-282` (`/daily/refresh` sin transacción ni guard de gemas) y `backend/reps.js:213-230` (referral pagable 2 veces). El patrón correcto está en `roulette.js`. *(Fix: `withTransaction`+`FOR UPDATE` en el refresh, claim gate atómica en el referral; verificado con Postgres efímero local, 6/6 tests de concurrencia.)*
- [ ] **Unificar las 3 fuentes de esquema** — `/db/init` (index.js:314-640, usa rareza `epic` inexistente), `schema.sql` y `ensureSchemaMigrations()`. Drift garantizado.
- [ ] **Trocear archivos monstruo al tocarlos** — `Dashboard.vue` (1.829), `Inventory.vue` (1.587), `Shop.vue` (1.317), `backend/training.js` (1.147), handler `POST /reps` (~10 responsabilidades).
- [ ] **JWT**: 30 días con `is_admin` embebido y sin revocación — refresh tokens o TTL corto.
- [x] (comentario; `HEVY_ENCRYPTION_KEY` sigue 👤 infra) **SSL de db.js: documentar y cerrar** ✅DECIDIDO (2026-07-25: opción B) — dejar `rejectUnauthorized:false` (la conexión a Supabase ya va por TLS; solo no se valida el CA — riesgo bajo). Añadir comentario en `backend/db.js:13` explicando el porqué. ADEMÁS (caveat del agente): fijar `HEVY_ENCRYPTION_KEY` en Coolify (hoy cae a `JWT_SECRET`/default de dev). La Hevy key ya se cifra AES-256-GCM ✓. Accionable ya.
- [x] **Borrar shim `api/` + vercel.json** ✅DECIDIDO (2026-07-25: opción B) — borrar el directorio `api/` (shim Vercel muerto, ya estáis en Coolify) y `vercel.json`. ⚠️ NO TOCAR el doble montaje de `apiRouter` en `/` y `/api` (`index.js:293-294`): es LOAD-BEARING (Traefik quita el prefijo /api; quitar el mount `/` tira producción). Accionable ya.
- [x] **`social_feed.js:318`** (PR #319 mergeada) — `page` no numérico → 500 en vez de 400.
- [ ] 🔨 PR #337 (dark ✅ PR #332) **Sendas de campaña: falta la bendición (light)** ✅DECIDIDO+NÚMERO (2026-07-26, Claude) — la parte `dark` (maldición −25%) ya está mergeada (#332). Falta implementar la **bendición de la Senda de Luz**: al elegir senda luz, aplicar **`blessing_damage_mult = 1.20` (+20% daño de campaña) durante 24h** (usar el mecanismo existente `users.damage_multiplier`/`damage_multiplier_expiry`; añadir `light.blessing_damage_mult: 1.20` al `config.path.light` del `main-campaign.json`). Espejo temporal de la maldición dark. Toca `campaignEngine.js`. PR revisable.
  - **Parte `dark` → PR #332**: `applyCampaignDamage` ya lee `config.path.dark.curse_damage_multiplier` (0.75, del JSON, no hardcodeado) y aplica −25% al daño de campaña en la senda oscura.
  - *(Resuelto 2026-07-26: bendición = +20% daño campaña 24h vía `light.blessing_damage_mult: 1.20`; ver task de arriba.)*

---

## Secuencia sugerida

| Cuándo | Qué |
|---|---|
| **Semana 1** | Todo P0 (seguridad + promesas rotas) |
| **Semanas 2-4** | Rebalance económico + winback + día de descanso + GA4 + renombrar bosses |
| **Mes 2** | Dominio + TWA Play Store + primeros TikToks |
| **Mes 2-6** | Cadencia de contenido + Product Hunt/HN + outreach + combate con decisiones |
| **Mes 6** | Revisar kill criterion con los datos del funnel |

---

## 🗄️ P1 — Migrar la BD de Supabase a self-hosted (decisión de Roman, 2026-07-26)

> **Objetivo**: dejar de depender de Supabase. La BD pasa a estar autoalojada (misma máquina/red que Coolify, `192.168.18.175`). Roman lo quiere como plan a futuro, con discovery previo — NO empezar a migrar sin completar la fase 1 y que él apruebe el plan.

- [ ] **Fase 1 — DISCOVERY (hacer primero, es solo lectura + documento)** — inventariar antes de tocar nada, y volcarlo en `docs/db-migration-discovery.md`: (a) tamaño real de la BD por tabla + nº de filas + crecimiento mensual; (b) TODO lo que hoy se usa de Supabase más allá de Postgres puro (¿Storage para avatares?, ¿Auth?, ¿RLS?, ¿realtime?, ¿extensiones como `pgcrypto`/`uuid-ossp`?) — esto es lo que decide si la migración es trivial o no; (c) versión exacta de Postgres en Supabase; (d) dónde se referencia Supabase en el código (grep `supabase`) y en env vars; (e) qué se rompe si desaparece (avatares subidos, `avatar_url` apuntando a Supabase Storage…). **Entregable: el documento + un veredicto de complejidad (baja/media/alta).**
- [ ] **Fase 2 — Plan de migración (documento, tras aprobar fase 1)** — elegir topología (Postgres en contenedor de Coolify vs servicio aparte en la misma LAN), definir: backups automáticos (pg_dump programado + retención + prueba de restore, ESTO ES OBLIGATORIO antes de migrar), estrategia de secretos, y el plan de cutover con ventana y rollback. Incluir cómo se sustituye Supabase Storage si se usa (p. ej. MinIO o disco local servido por el backend).
- [ ] **Fase 3 — Postgres local en paralelo (sin cortar nada)** — levantar el Postgres self-hosted, cargar `schema.sql`, restaurar un dump reciente, y validar contra él: arrancar el backend apuntando a la BD local en un entorno de staging + pasar la suite de tests de economía (`npm test` con `DATABASE_URL` local). Producción sigue en Supabase.
- [ ] **Fase 4 — Cutover** 👤 (requiere Roman: ventana de mantenimiento + cambiar env vars en Coolify) — dump final, restore, cambiar `DATABASE_URL`, verificar, y mantener Supabase intacto ~2 semanas como rollback antes de dar de baja.
- [ ] **Al migrar, revisar el SSL de `db.js`** — hoy `rejectUnauthorized:false` está justificado por ser Supabase externo (decisión B ya documentada). Con Postgres en la red interna, reevaluar: o red privada sin TLS, o TLS con CA propio y `rejectUnauthorized:true`. Enlaza con la task de SSL ya cerrada.

## 🩸 P1 — Curva de daño: progresión exponencial + ruido por boss (investigado 2026-07-26)

> **Investigación hecha con datos reales de producción (solo-lectura)** sobre `LilAlexandru` (glvl 12, 7.332 reps), aislando el MISMO ejercicio (dips, ~45 reps por sesión) a lo largo de 3 meses. Datos de `reps.boss_damage_dealt` / `base_damage` / `gear_bonus` / `is_crit` / `boss_fight_id`.
>
> **Hallazgo 1 — la progresión NO es lineal, es explosiva**: `base_damage` por sesión de dips pasó de **3.122 (29-abr) → 13.299 (19-jun) → 101.207 (24-jun) → 223.720 (17-jul)**: ×72 en 3 meses, con un salto ×7,6 en 5 días entre el 19 y el 24 de junio. Compatible con el bucle de feedback ya identificado: la XP de FTH viene del daño infligido → más FTH → más daño → más FTH. El nerf del bono plano (#326, ×25→×5) ataca solo una parte; **el bucle (`stats.js:193`, "Parte C") sigue vivo** y es la causa de la explosión.
>
> **Hallazgo 2 — ruido de ±4× por la lotería de `weakness_stat` del boss**: el bono de debilidad compara contra el NIVEL de stat del usuario, y sus stats están muy desiguales (`str_xp` 27.495 · `end_xp` 36.660 · pero `vig_xp` 450 · `int_xp` 0 · `fth_xp` 2.287). Resultado: pelear contra Baldur (weakness `int`, stat 0) o Arthas (weakness `vig`, stat ~0) da un daño mucho menor que contra Malenia/Ornstein (weakness `str`, su stat fuerte). Sesiones consecutivas del mismo ejercicio dan 1.451 → 3.232 → 6.094 → 3.915 dmg/rep según qué boss toque. **Esto es lo que hace que "parezca que no hay progresión" y que a veces "el daño parezca bajo".**
>
> **Hallazgo 3 — `is_crit` NO explica el swing** (15-jun con crit dio 173/rep y 10-jun sin crit dio 208/rep), así que el crítico es un factor menor frente a los dos de arriba. Descartado también que sea el nerf de FE de #326: el último dato es del 25-jul y #326 se mergeó el 26-jul.

- [ ] **Romper el bucle daño→FTH→daño (Parte C del nerf de FE)** — es la causa raíz de la progresión explosiva. Que la XP de FTH NO venga del daño infligido (`backend/utils/stats.js:193`) sino de otra fuente (participación en raids/quests, como ya se decidió). ⚠️ Ojo: desnivela a todos los usuarios existentes → pensar si hace falta recalcular/normalizar stats ya acumulados. PR revisable.
- [ ] **Suavizar la lotería de weakness del boss** — que el daño no varíe ×4 según qué boss esté activo. Opciones a evaluar al implementar: (a) que el bono de debilidad tenga un suelo (nunca reducir por debajo de X% del daño base), (b) que la debilidad mire el ejercicio logueado y no solo el nivel de stat (enlaza con la task de combate ejercicio→daño ya decidida, que precisamente arregla esto), (c) rotar bosses cuyas debilidades cubran stats que los jugadores realmente entrenan (hoy hay bosses con weakness `int`, stat que nadie sube). **Recomendado: (b) + (a)**, porque (b) ya está aprobado.
- [ ] **Exponer al jugador de qué depende su daño** — parte de la percepción de "daño bajo" es falta de feedback: no se ve por qué un día pegas 6.094/rep y otro 1.451. Mostrar en la UI de batalla el desglose (base · gear · debilidad del boss · crítico) para que la progresión se sienta.

## 🔍 Backlog propuesto (auditoría ingeniería/seguridad 2026-07-26)

> Re-auditoría del eje ingeniería/seguridad por la routine nocturna (todas las tasks accionables estaban ya en 🔨/⏸️/👤). Hallazgos con evidencia real; **NO implementar hasta que Roman los apruebe** (quite el ⏸️ y los mueva a su sección de prioridad). Nota positiva sin peloteo: las queries usan parámetros `$n`; las interpolaciones `${col}`/`${column}` (`roulette.js:78`, `shop.js:605/649`) vienen de allowlists server-side → **no se detectó superficie de inyección SQL**.

- [ ] (PR #333 mergeada) ✅APROBADO(2026-07-26) — **[ALTA] Deadlock latente en `getStreakStatus`/`freezeStreakForToday`**. `getStreakStatus` (`backend/utils/streak.js:64`) hace `ALTER TABLE users ADD COLUMN IF NOT EXISTS last_jackpot_week` en una conexión aparte del pool, y `freezeStreakForToday` (`backend/utils/streak.js:131`) lo llama DENTRO de una txn con `SELECT … FOR UPDATE users`. En PG16 el `ADD COLUMN IF NOT EXISTS` toma `ACCESS EXCLUSIVE` aunque sea no-op → choca con el `FOR UPDATE`; como la conexión de la txn queda `idle in transaction`, el detector de deadlock de PG no lo ve y **cuelga indefinidamente**. Verificado este run con Postgres efímero + `pg_stat_activity`. *Fix: sacar los `ALTER` de `getStreakStatus` (migración única, no por request) o no llamar a `getStreakStatus` dentro de una txn con lock. (PR #327 ya evita el patrón en el día de descanso, pero el freeze de pago sigue afectado.)*
- [ ] (PR #333 mergeada) ✅APROBADO(2026-07-26) — **[MEDIA] Migración de esquema en el hot path**. `getStreakStatus` ejecuta 2 sentencias DDL (`ensureStreakFreezeTable` + `ALTER users`) en CADA `/streak/status` y en cada recalc de stats. El DDL toma locks de tabla, es innecesario en runtime y es la causa raíz del deadlock de arriba. *Fix: mover estas migraciones a `schema.sql`/arranque y quitarlas del path de request.*
- [ ] (PR #334 mergeada) ✅APROBADO(2026-07-26) — **[MEDIA] `/auth/signup` y `/auth/google` sin rate limiting**. Solo `/auth/login` tiene limiter (`backend/auth.js:154`). `/signup` (`auth.js:105`) es no-autenticado y hace `bcrypt.hash(password, 10)` por request → vector de **DoS por CPU** (spam de altas) + creación masiva de cuentas + enumeración de emails (respuestas distintas `ERR_USER_EXISTS`/`ERR_GOOGLE_ONLY`). *Fix: limiter por IP en `/signup` y `/google` (reutilizar `utils/rateLimiters.js`).*
- [ ] (PR #335 mergeada) ✅APROBADO(2026-07-26) — **[BAJA-MEDIA] Endpoints económicos mutantes sin rate limit**. `roulette` `/spin`,`/buy-and-spin`,`/daily-spin`; `shop` `/buy/:id`,`/buy-chest/:type`,`/daily/refresh`. Tienen guardas económicas (cooldowns, checks de saldo con `FOR UPDATE`), pero sin limiter un cliente puede martillearlos (p. ej. `/daily/refresh` en bucle) y cargar la BD. *Fix: limiter suave por usuario en los mutantes de economía.*


Añadir iconos mas representativos con respecto a los enemigos de la campaña 