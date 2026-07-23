# Reppy — Plan de mejora (auditoría 2026-07-23)

Resultado de una auditoría de 5 ejes: ingeniería, game design, engagement, SEO/growth y mercado.

**Notas**: Producto 7.5 · Engagement 6.5 · Ingeniería 6 · Game design 5.5 · SEO/Growth 4.5 · Negocio 4.5

**Veredicto**: la app NO es cutre — el cuello de botella no es el código, es distribución + balance económico + retención de caídos. Plan: apuesta acotada de 6 meses.

**Kill criterion (revisar ~2027-01-23)**: ~1.000 MAU, D30 > 10%, alguna conversión de pago. Si no → hobby sin mala conciencia.

**Regla de oro durante el plan**: 🧊 congelar rediseños visuales y features nuevas. El producto ya sobra para validar.

---

## P0 — Seguridad (esta semana, explotable HOY en producción)

- [ ] **Matar `/api/test/*` en producción** — `backend/test.js:9` (`isTestAllowed = true` incondicional) + montaje en `backend/index.js:157`. Cualquier usuario autenticado puede darse coins/gems/cofres/items/stats infinitos. *Esfuerzo: 10 líneas.*
- [ ] **Autenticar `/pusher/auth`** — `backend/index.js:170-197` acepta `user_id`/`user_name` arbitrarios y autoriza canales private-/presence-. Suplantación de usuarios en realtime. Eliminar también el shim legacy `api/pusher-auth.js` (CORS `*`). *Esfuerzo: 10 líneas.*
- [ ] **Rate limiting** — no existe en ningún endpoint. Mínimo: `express-rate-limit` en `POST /auth/login` (brute-force) y `POST /reps` (spam). *Esfuerzo: 1-2 h.*
- [ ] **Tope a `count` y validar `date` en `POST /reps`** — `backend/reps.js:49-103`: hoy acepta `count: 99999999` (monedas/XP/daño infinito) y fechas arbitrarias (rachas retroactivas). Sanity cap + `date` solo hoy/ayer. *Esfuerzo: 1 h.*
- [ ] **Quitar CORS `*.vercel.app`** — `backend/index.js:92`: cualquiera puede desplegar gratis en vercel.app y pasar el allowlist con `credentials: true`. Ya no estáis en Vercel. *Esfuerzo: 5 min.*

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

- [ ] **Comprar dominio propio** (`reppy.app` / `reppy.fit`, ~10-40 €/año) + 301 desde `reppy.romandev.app`. Con ~0 tráfico la migración es una tarde; nunca será más barata que ahora.
- [ ] **Play Store vía TWA/Capacitor** (Bubblewrap, $25 una vez) — quien busca "app dominadas" espera acabar en una store. Android primero (calistenia hispana).
- [ ] **TikTok/Shorts 2-3/semana** — el canal principal. Formatos: "mis dominadas dañan al boss", boss comunitario en vivo ("muere cuando la comunidad haga 10.000 flexiones"), progresos de usuarios.
- [ ] **Product Hunt + Show HN** — gratis, pico de un día y backlinks DR alto (lo que le falta al dominio).
- [ ] **Outreach mensual a listículos** — FitCraft, Bitletics, RazFit, MainQuest, AlternativeTo, listas "Habitica alternatives". Un email por sitio = backlink + tráfico de intención perfecta.
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
