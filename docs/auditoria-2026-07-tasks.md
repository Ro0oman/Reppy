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

- [ ] 🔨 PR #305 **Matar `/api/test/*` en producción** — `backend/test.js:9` (`isTestAllowed = true` incondicional) + montaje en `backend/index.js:157`. Cualquier usuario autenticado puede darse coins/gems/cofres/items/stats infinitos. *Esfuerzo: 10 líneas.*
- [ ] 🔨 PR #306 **Autenticar `/pusher/auth`** — `backend/index.js:170-197` acepta `user_id`/`user_name` arbitrarios y autoriza canales private-/presence-. Suplantación de usuarios en realtime. Eliminar también el shim legacy `api/pusher-auth.js` (CORS `*`). *Esfuerzo: 10 líneas.*
- [ ] 🔨 PR #307 **Rate limiting** — no existe en ningún endpoint. Mínimo: `express-rate-limit` en `POST /auth/login` (brute-force) y `POST /reps` (spam). *Esfuerzo: 1-2 h.*
- [ ] 🔨 PR #308 **Tope a `count` y validar `date` en `POST /reps`** — `backend/reps.js:49-103`: hoy acepta `count: 99999999` (monedas/XP/daño infinito) y fechas arbitrarias (rachas retroactivas). Sanity cap + `date` solo hoy/ayer. *Esfuerzo: 1 h.*
- [ ] 🔨 PR #309 **Quitar CORS `*.vercel.app`** — `backend/index.js:92`: cualquiera puede desplegar gratis en vercel.app y pasar el allowlist con `credentials: true`. Ya no estáis en Vercel. *Esfuerzo: 5 min.*

## P0 — Promesas rotas al jugador (bugs de diseño, ~2-4 h en total)

- [ ] **Pagar los `rewards` de nodos de campaña** — `backend/data/campaigns/main-campaign.json` promete 1.000/2.500 coins por trono/finale; `applyCampaignDamage` (campaignEngine) nunca los otorga.
- [ ] **XP de quests de NPC ignorado** — `backend/utils/campaignQuests.js` `claimQuest` paga coins/gems/buff pero el campo `xp` del JSON es letra muerta. Pagarlo o quitarlo del JSON.
- [ ] **Misión `buy_legendary` incompletable** — `backend/shop.js:530` compara `'Legendary'`/`'Calisthenics'` contra rarezas reales `legendary`/`calistenico`. Nunca matchea.
- [ ] **`scripts/seed_rpg_items.js` con rarezas en inglés** (`special`, `calisthenic`) que las queries de cofres (`WHERE rarity = 'especial'`) no encuentran → items huérfanos.
- [ ] **Cofres de nivel incoherentes** — `backend/utils/stats.js:252` (`additionalChests = 0`): ya no se ganan subiendo de nivel pero la ruleta los regala. Decidir: restaurar o renombrar.

## P1 — Rebalance económico (mes 1, empieza por una hoja de cálculo)

> Hoy entrenar aporta solo el ~10-15% del ingreso diario de un jugador con racha. La app premia abrir, no entrenar.

- [ ] **Cap a la recompensa de racha** — `backend/utils/stats.js:300`: `streak × 50` sin tope (día 100 = 5.000 monedas/día por 1 rep). Propuesta: `50 + 5×min(streak,30)` o hitos discretos 7/30/100.
- [ ] **Bajar el EV de la ruleta 4h** (~430 monedas/día por hacer clic) — `backend/roulette.js` + sincronizar `frontend/src/components/shop/LuckyWheel.vue`.
- [ ] **Domar la bola de nieve de FE** — `backend/utils/damage.js:73` (`fthLvl × 25` plano por rep) + `backend/utils/stats.js:193` (XP de FE viene del daño → feedback positivo puro). Hacer el bono % pequeño y que FE suba por otra vía (raids, quests).
- [ ] **Nerfear pociones DEX de crit** — la poción calisténica `+100 dex` → 80% crit ×12 ≈ ×9.8 daño, el doble que la de ×3.5 que cuesta 12.000.
- [ ] **Arreglar la curva de dificultad** — el daño del jugador escala superlineal, el HP enemigo 6%/nivel lineal: los enemigos se derriten más rápido cuanto más avanzas. HP debe escalar con el daño esperado.
- [ ] **Prestigio con ROI positivo** — HP ×1.5/vuelta pero rewards ×1.25: cada NG+ paga peor. `rewards_mult ≥ hp_mult` o exclusivos (cosméticos/títulos).
- [ ] **Hoja de cálculo de curvas** (daño/HP/monedas por nivel y día) antes de tocar números — es una tarde y evita rebalancear a ciegas.

## P1 — Retención (mes 1, el mayor ROI de toda la auditoría)

> Winback actual = cero: un usuario que falla UN día no recibe nada nunca más. D30 estimado hoy: 3-8%. Con estos dos primeros puntos: 10-15%.

- [ ] **Winback cron D3/D7/D14** — reutilizar la infra de `backend/utils/streakReminders.js` con query de usuarios sin reps en N días y su dato real ("tenías racha de 12"). *~1 día.*
- [ ] **"Día de descanso activo"** — la racha castiga descansar (obligatorio en fitness 2-3 días/semana). Botón diario que preserva racha 1×/semana gratis, o convertir el freeze de 250 monedas en descanso programado.
- [ ] **Matar/segmentar el blast de referral** — `backend/utils/referralReminders.js` (días 1 y 16 a TODOS): spam que quema el canal push. Solo activos >7 días que nunca refirieron, máx 1 vez.
- [ ] **Push "tu rival te adelantó"** — la query ya existe en `backend/social_feed.js` `/stats`; dispararla 1×/día. Reutilización pura.
- [ ] **Reto vs tu semana pasada** — fallback para el cold start social (PvP/retos mueren sin masa crítica); la tabla `reps` ya tiene los datos.
- [ ] **Eventos GA4 de funnel** — hoy solo pageviews: añadir `signup`, `first_log`, `push_enabled`, `spin`, `day2_return`. *Una tarde.* Quitar `@vercel/analytics` de `frontend/src/main.js` (muerto tras Coolify).

## P1 — Legal / tema

- [ ] **Renombrar los bosses con IP ajena** — "Malenia, Espada de Miquella" (Elden Ring), "Arthas, El Rey Exánime" (Warcraft), "The Ender Dragon" (Minecraft) + sus artes en `/images/bosses/`. Riesgo legal y señal amateur en el centro del producto. Lore propio.

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
- [ ] **`llms.txt` con slugs ES bajo `/en/blog/`** — `frontend/public/llms.txt:29-38`.
- [ ] **Limpiar `frontend/index.html`** — meta keywords con ~45 términos (línea 14) y bloque `<noscript>` keyword-stuffed (178-230), redundante con SSG.
- [ ] **Sitemap de atletas** — 200 URLs thin casi idénticas; incluir solo perfiles con actividad mínima.
- [ ] **Engordar los 10 mejores posts a 1.500-2.500 palabras** (empezar por clúster dominadas ES) y **dejar de producir posts de 300 palabras** — el 80% del blog actual es thin content que no rankea.

## P3 — Deuda técnica (a medida que se toque, no big-bang)

- [ ] **Tests + CI mínimo sobre flujos de economía** — hoy `"test": "exit 1"` y cero CI para una app con dinero virtual.
- [ ] **Race conditions restantes**: `backend/shop.js:255-282` (`/daily/refresh` sin transacción ni guard de gemas) y `backend/reps.js:213-230` (referral pagable 2 veces). El patrón correcto está en `roulette.js`.
- [ ] **Unificar las 3 fuentes de esquema** — `/db/init` (index.js:314-640, usa rareza `epic` inexistente), `schema.sql` y `ensureSchemaMigrations()`. Drift garantizado.
- [ ] **Trocear archivos monstruo al tocarlos** — `Dashboard.vue` (1.829), `Inventory.vue` (1.587), `Shop.vue` (1.317), `backend/training.js` (1.147), handler `POST /reps` (~10 responsabilidades).
- [ ] **JWT**: 30 días con `is_admin` embebido y sin revocación — refresh tokens o TTL corto.
- [ ] **`backend/db.js:14`** `ssl: { rejectUnauthorized: false }` (MITM) · **`backend/hevy.js:66`** verificar si la API key se guarda en claro.
- [ ] **Borrar `api/`** (shim Vercel muerto) y el doble montaje de `apiRouter` en `/api` y `/` (index.js:228-229).
- [ ] **`social_feed.js:318`** — `page` no numérico → 500 en vez de 400.
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
