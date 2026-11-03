# Rediseño de Reppy con unslop (nov 2026)

Propuesta, sin código tocado. Hecha con la skill [unslop](https://github.com/heydamir/unslop)
(Damir Sokolovsky, CC BY 4.0) sobre las pantallas reales en local: landing (piel Vibe),
panel, comunidad, batalla y tienda (piel Aurora, la de Roman).

Veredicto: **slop fuerte**. Toca el proceso completo, no un pulido.

---

## 1. Auditoría

### El problema de fondo: tres pieles sobre componentes sin limpiar

`operative-os.css`, `aurora.css` y `vibe.css` re-visten la app remapeando tokens, pero los
92 componentes `.vue` siguen llevando su propio estilo a mano. Cada piel nueva tapa el
anterior y ninguna llega a limpiar lo de debajo. Línea base medida con grep en `frontend/src`:

| Señal | Apariciones |
| --- | --- |
| `font-black` / `font-extrabold` | 811 |
| `uppercase` | 760 |
| valores arbitrarios `x-[13px]` | 761 |
| `tracking-widest` / `tracking-[0.2em+]` | 510 |
| `transition-all` | 341 |
| `blur-*` | 176 |
| glows (`glow`, `drop-shadow`, `shadow-[0_0…]`) | 152 |
| `italic` | 135 |
| gradientes | 123 |
| `animate-pulse` / `ping` / `bounce` | 102 |
| `rounded-[N rem]` | 44 |
| `hover:scale` | 41 |
| `bg-clip-text` (texto con degradado) | 10 |

Archivos más cargados: `Inventory.vue`, `Shop.vue`, `Landing.vue`, `AvatarFrame.vue`,
`Codex.vue`, `ActivityCard.vue`, `PvpBattlesTab.vue`, `PvpBattleView.vue`, `Social.vue`.

Además la marca ha cambiado cinco veces en seis meses (azul eléctrico → neón teal/violeta →
Operative azul/cian/naranja → Aurora violeta → Vibe terracota). Un usuario nuevo ve
terracota y crema; Roman ve violeta y obsidiana. No hay una cara de Reppy.

### Landing (`Landing.vue`)
- Titular en negrita 900, cursiva, mayúsculas y con degradado (`MEJORA` naranja→gris, `MAÑANA` gris→cian)
- Badge en píldora sobre el titular: `• VERSIÓN RPG 1.0 · LISTO PARA ENTRENAR`
- Imagen hero de IA, neón cyberpunk (demonio + chico en barra) con borde duro, choca con el fondo crema
- Dos tarjetas flotantes encima de la imagen (`MEJOR DEL DÍA`, `DIFICULTAD: ÉLITE`)
- Cifras sin fuente: `1.2M+ repeticiones`, `450+ bosses`, `4.9/5 puntuación`, y en el texto SEO
  "reduce la tasa de abandono en más de un 60% según nuestros estudios internos"
- Datos que no cuadran: el texto dice STR/DEX/END/VIG/INT/FTH y la tarjeta enseña STR/PWR/END/AGI
- Avatares de relleno `U1 U2 U3 U4`
- Faltan tildes: `proxima`, `repeticion`, `que entrenar` (qué)
- Botones y etiquetas en mayúsculas con tracking ancho (`UNIRSE AHORA`, `OPEN SOURCE`)

### Shell autenticado (`App.vue` + rail derecho)
- Rail izquierdo con etiquetas a 12 px, item activo con caja iluminada
- Rail derecho repite cosas que ya están en el panel (nivel, racha, monedas); `ROMAN // LV.15`
- `1 DÍA` en negrita 900 con marco ámbar brillante
- Fondo con lavado radial violeta/azul detrás de todo

### Panel (`Dashboard.vue`)
- Hero con formas azules difuminadas detrás del nombre del jefe
- Botón principal con degradado violeta→azul (`Registrar 10 Reps`) y otro (`Ver planes`)
- Tres CTAs que compiten en la primera pantalla: `Registrar`, `COMENZAR AVENTURA →`, `Ver planes`
- "Registro rápido" aparece dos veces en la misma pantalla
- `0 / 25 pts · hoy` y `8212 dmg` en formatos distintos

### Comunidad (`Social.vue`, `ActivityCard.vue`)
- `OPERATIVOS EN DIRECTO` en mayúsculas espaciadas, con punto verde parpadeante
- `Vas #1 esta semana 🔥 Nadie te alcanza... por ahora.` (emoji + tono de banner)
- Pestañas `FEED · CLASIFICACIONES · COMBATES · RETOS` en mayúsculas
- Banner de racha con botón degradado
- Feed vacío en desktop: tres cuartos de la pantalla en negro sin estado vacío

### Batalla (`BattleView.vue`, `components/battle/*`)
- Jefe en llamas rojas con glow, título `CALAMITY GANON` en 900
- Botón `ENTRENAR` con degradado violeta→cian
- Etiquetas de ejercicio truncadas (`Dominadas (...`, `Fondos (Est...`)
- `MISIONES COFRES RANKING` pegadas sin espacio, con badges rojos
- Cuatro pociones con punto rojo cada una: todo pide atención, nada destaca

### Tienda / Inventario
- `ARMORY / SUMINISTROS DE COMBATE` (kicker en inglés + español, mayúsculas)
- Pestañas `ARMERÍA` / `PERSONALIZAR` en mayúsculas espaciadas
- Rarezas con glow de color por tarjeta

### Movimiento (global)
- 102 animaciones en bucle sobre cosas que no están vivas
- 341 `transition-all`, 41 `hover:scale` en tarjetas

---

## 2. Dirección

> **Cambio 2026-11-03:** tras la PR 1 Roman lo veía «igual» y pidió rollo souls. La dirección
> pasa de «tiza y hierro» a **«ceniza y brasa»**: fantasía oscura de mazmorra. Neutros de piedra y
> ceniza cálidos (oscuro como modo principal, claro = pergamino), acento brasa de hoguera
> (`#d9822b` oscuro / `#a85a17` claro), oro viejo (`--os-gold`) solo para títulos y marcos,
> Cormorant Garamond 600 para h1/h2 y nombre del jefe, esquinas casi rectas (4/6/8 px), paneles
> con marco doble, viñeta de niebla en los bordes y movimiento más lento (600 ms). Es un estilo
> de género, no copia de ningún juego: nada de logos, fuentes ni frases de Dark Souls.
> El resto de esta sección queda como historia de la primera propuesta.


- **Producto.** Un contador de repeticiones de calistenia que convierte cada serie en daño a un
  jefe compartido, XP y botín, para gente que entrena con su peso y quiere no fallar días.
- **Carácter.** Sudado, exacto, con humor de mazmorra.
- **Mundo.** Un parque de calistenia al caer la tarde: barras de acero, tiza en las manos,
  hierro gastado. Y el cuaderno donde apuntas las series. El RPG vive encima de ese mundo,
  no lo sustituye.
- **Momentos.** (1) El jefe: una ilustración de verdad, con luz propia, es lo único con color
  rico en panel y batalla. (2) La barra de vida compartida del jefe con tu aportación marcada,
  dibujada con cuidado. Todo lo demás, callado.
- **Firma.** Marcas de tiza: las series de hoy se apuntan como palotes de cinco (`|||| `) con
  trazo de tiza. Solo en el registro rápido y en las tarjetas del feed. En ningún otro sitio.

Decisiones que salen de ahí:

- **Una sola piel.** Se borran Operative, Aurora y Vibe como opciones; queda un tema con modo
  claro y oscuro. Se mantiene `users.ui_style` en BD por compatibilidad, pero sin selector.
- **Neutros.** Rampa graphite (casi gris, un pelo cálida hacia el hierro). En claro, la del
  token "warm" para la landing y graphite para la app.
- **Acento.** Terracota `#C4532E` (es el logo que ya ve todo usuario nuevo). En oscuro, versión
  más clara para contraste en texto. Solo en: acción principal, selección, la cifra que importa.
- **Semánticos.** Verde = completado, rojo = peligro, ámbar = racha en riesgo. Las rarezas
  (`common` < `rare` < `especial` < `legendary` < `calistenico`) mantienen su color, pero como
  un punto o un borde fino, nunca como glow.
- **Tipo.** Inter para interfaz (ya está), JetBrains Mono para números (reps, HP, daño, monedas),
  Bricolage Grotesque 500 solo para titulares grandes de landing y nombre del jefe. Pesos 400/500,
  600 como mucho. Fuera Barlow Condensed, Fraunces, cursivas y mayúsculas espaciadas.
- **Iconos.** lucide (ya se usa), 16/18 px, trazo 1.5, color del texto. Los `gi:*` de items se
  quedan dentro de las tarjetas de item, que son contenido, no chrome.

---

## 3. Plan por pasadas (en el orden de la skill)

1. **Espaciado.** Escala de 4 px en todo; fuera los 761 valores arbitrarios. Filas de nav a 36,
   tarjetas a 20–24 de padding, página a 24–32.
2. **Color.** Un solo fichero de tokens (sustituye `athletic-tech.css` + `operative-os.css` +
   `aurora.css` + `vibe.css`). Fuera degradados de superficie, texto con degradado, glows,
   lavados radiales y `blur-*` decorativos.
3. **Iconos.** Emojis de la UI → lucide. Badges rojos por todas partes → un punto discreto solo
   donde hay algo que reclamar.
4. **Copy.** Mayúsculas → caja de frase. Sin exclamaciones ni `🔥`. Titulares que nombran el
   contexto (`Comunidad`, `Calamity Ganon · fase 1 de 4`). Kickers bilingües fuera. Tildes.
   Cifras sin fuente → preguntar y quitar o concretar.
5. **Tipo.** Familias y escala de arriba, `tabular-nums` en todas las cifras, un solo formato.
6. **Layout.** Mismas secciones y orden. Panel con un solo CTA principal arriba. Rail derecho
   fuera en ≤1280 px y sin duplicar datos del panel. Landing con hero partido o escena.
7. **Detalles.** Radios anidados (controles 8–10, tarjetas 12–16, paneles 16–20). Contadores en
   mono apagado. Estado activo = un escalón de superficie + hairline.
8. **Visuales.** Fuera la imagen neón de la landing. Hero = escena del mundo (parque al
   atardecer con la silueta del jefe en el cielo, espacio vacío a la izquierda para el titular)
   + vista real del panel subiendo desde abajo. No hay herramienta de imágenes conectada: dejo
   el prompt y un hueco del tamaño correcto, o se usa un fotograma de los vídeos de jefe que ya
   tienes (`public/video/OrnsteinIdle.mp4`).
9. **Movimiento.** Fuera bucles, `transition-all` y `hover:scale`. Una curva
   `cubic-bezier(0.22, 1, 0.36, 1)`. Se queda lo que explica: el número de daño que sube, la
   barra de vida que baja, la entrada del registro.

---

## 4. Orden de trabajo propuesto (PRs pequeñas, apiladas)

| # | PR | Alcance | Por qué en este orden |
| --- | --- | --- | --- |
| 1 | Tokens únicos | Nuevo fichero de tokens, quitar el selector de piel, `.os-shell` / `.vibe-shell` apuntan al tema único | Todo lo demás se apoya aquí |
| 2 | Shell | `App.vue`: rails, dock, header público | Se ve en todas las vistas |
| 3 | Panel + registro rápido | `Dashboard.vue`, `RepsInput.vue`, `ExerciseSelector.vue`, firma de tiza | Es el bucle principal |
| 4 | Batalla | `BattleView.vue`, `components/battle/*`, `BossHealth.vue` | El momento con color |
| 5 | Comunidad | `Social.vue`, `ActivityCard.vue`, pestañas, estado vacío | El "lobby" diario |
| 6 | Tienda, inventario, cofres, ruleta | `Shop.vue`, `Inventory.vue`, `ChestOpening.vue`, `LuckyWheel.vue` (solo color, ids y pesos intactos) | Los más cargados, menos usados |
| 7 | Perfil, Codex, PvP, retos, ajustes | resto de `pages/` y `modals/` | Cola larga |
| 8 | Landing + blog | `Landing.vue`, `BlogView.vue`, hero nuevo | Va al final para enseñar la app ya rediseñada; ojo con no romper el SEO de `fix-ssg-seo.js` |

Cada PR se valida con JWT propio en local (como siempre) y baja la tabla de la sección 1.
Criterio de cierre: `font-black`, `uppercase` decorativo, `transition-all`, `animate-pulse` sin
motivo, gradientes y glows a cero fuera de los dos momentos.

---

## 5. Preguntas antes de empezar

1. ¿Te vale la dirección (sudado, exacto, humor de mazmorra; tiza y hierro; terracota)?
2. ¿Matamos las tres pieles y nos quedamos con un tema claro/oscuro?
3. Cifras de la landing: `1.2M+ repeticiones`, `450+ bosses`, `4.9/5`, `-60% de abandono`.
   ¿Alguna es real? Las que no, fuera.
4. Hero de la landing: ¿escena generada (necesitaría conectar fal/Replicate/OpenAI images) o
   fotograma de los vídeos de jefe que ya tienes?
