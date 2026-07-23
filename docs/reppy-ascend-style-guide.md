# Reppy Ascend — Design System v1.0

> **Estado:** fuente de verdad visual y de UX para la interfaz autenticada de Reppy.
>
> **Promesa:** *cada repetición escribe tu leyenda.*

Ascend no es una capa de fantasía sobre un tracker. Es un RPG de entrenamiento en el que el trabajo físico real desbloquea aventura, poder, mundo e identidad. La interfaz debe parecer un juego atractivo antes de explicar que registra ejercicio; al usarla, debe comportarse con la claridad y velocidad de una herramienta deportiva excelente.

Este documento es normativo. Cuando una pantalla nueva no esté descrita, se aplican los principios, tokens y patrones de este sistema; no se inventa un estilo paralelo.

---

## 0. Decisiones que quedan cerradas

| Decisión | Regla |
| --- | --- |
| Dirección | **Dark fantasy ilustrada**, sobria y coleccionable. No medieval histórica, no sci-fi, no cyberpunk. |
| Densidad | Rica, pero ordenada. La información vive en paneles y listas; no en un mosaico de tarjetas idénticas. |
| Acción principal | Una por pantalla/zona. Siempre es inequívoca y tiene tratamiento de oro. |
| Acción central de Reppy | Registrar reps. Nunca queda a más de una interacción de distancia. |
| Personalidad | Legendaria, disciplinada, cálida. Nunca edgelord, paródica o excesivamente épica. |
| Fondo | Oscuro y material; piedra, niebla, bosque, ruina, brasas. Nunca negro plano con cards flotantes. |
| Recompensa | Se siente como loot: causa → impacto → recompensa → estado persistente. |
| Móvil | Una aventura de bolsillo, no un desktop estrechado. |

### Los cinco principios

1. **El entrenamiento es la magia.** Las reps son el hechizo, el golpe y la llave. No simular un botón de ataque separado.
2. **Todo tiene lugar en el mundo.** Una misión, un objeto, un atributo o un social event debe pertenecer a un realm, una quest o una fellowship.
3. **La claridad vence al ornamento.** La fantasía se expresa en marco, arte, nomenclatura y feedback; no en hacer ilegibles los controles.
4. **La progresión se ve.** Barras, mapas, nodos, nivel, build y loot deben mostrar avance real, no esconderlo en submenús.
5. **El jugador es coleccionable.** Su avatar, título, equipamiento y título de prestigio deben componer una ficha memorable y compartible.

---

## 1. Gramática del producto

### Vocabulario de UI

Usar términos de juego con moderación y consistencia. La utilidad debe ser obvia incluso para quien no juega RPGs.

| Producto / sistema | Nombre Ascend | Ejemplo |
| --- | --- | --- |
| Dashboard | `REALM` o `HALL` | `THE ASCENT HALL` |
| Registro de reps | `RECORD REPS` | `RECORD 12 REPS` |
| Rutina guiada | `TRAINING QUEST` | `QUEST: FIRST PULL-UP` |
| Misión diaria | `DAILY QUEST` | `COMPLETE 50 REPS` |
| Boss global | `WORLD HUNT` | `HUNT: THE WARDEN` |
| Campaña individual | `PATH OF ASCENT` | `ACT II · ASHEN PASS` |
| Amigos | `FELLOWSHIP` | `YOUR FELLOWSHIP` |
| Perfil | `HERO CARD` | `ROMAN · LV.42` |
| Inventario | `ARMOURY` | `ARMOURY / NEW LOOT` |
| Tienda | `THE MERCHANT` | `MERCHANT'S ROTATION` |
| Blog | `FIELD LIBRARY` | `READ TO GAIN WISDOM` |
| Racha | `THE FLAME` | `19 DAYS · FLAME BURNS` |
| Stats | `ATTRIBUTES` | `ENDURANCE 31` |

**Nunca sacrificar claridad por el vocabulario.** `RECORD REPS` es correcto; `STRIKE THE WARDEN WITH THE STRENGTH OF YOUR SOUL` no lo es para un CTA.

### Tono de copy

- Frases cortas, activas y humanas: “Your next legend begins with one rep.”
- Las instrucciones dan acción: “Record 12 pull-ups to continue.”
- Los estados explican consecuencia: “Requires Strength 15 to enter.”
- La épica es un acento, no una pared de texto.
- Recompensar esfuerzo antes que ego: “You showed up. The flame holds.”

| Situación | Correcto | Evitar |
| --- | --- | --- |
| Sin entrenamiento | `One set is enough to begin.` | `Your destiny awaits, chosen one.` |
| Racha | `19 days. The flame still burns.` | `UNSTOPPABLE GOD OF DISCIPLINE!!!` |
| Fallo de quest | `This path closes at reset. Try again tomorrow.` | `You have failed the realm.` |
| Level up | `Level 43 unlocked. Your Endurance grew.` | `LEVEL UP` sin consecuencia |

---

## 2. Foundations: tokens innegociables

### 2.1 Color

La paleta se basa en **noche, piedra, metal viejo y luz de aventura**. El oro significa decisión/recompensa, el musgo significa progreso/vida, la brasa significa presión y peligro.

```css
:root {
  /* Surfaces */
  --ascend-void: #080908;
  --ascend-abyss: #10100f;
  --ascend-stone-950: #171711;
  --ascend-stone-900: #1c1b18;
  --ascend-stone-800: #25231d;
  --ascend-stone-700: #2f2c25;
  --ascend-border: #625943;
  --ascend-border-strong: #806e4b;

  /* Text */
  --ascend-text: #f4ead5;
  --ascend-text-soft: #d8cdb8;
  --ascend-text-muted: #b9aa90;
  --ascend-text-disabled: #766d5d;

  /* Signals */
  --ascend-gold: #e7bd63;
  --ascend-gold-light: #ffe49b;
  --ascend-gold-deep: #b6883d;
  --ascend-moss: #82bd66;
  --ascend-moss-deep: #34583c;
  --ascend-ember: #df6642;
  --ascend-ember-deep: #b43f2d;
  --ascend-danger: #d94a48;
  --ascend-arcane: #8e83e9; /* solo rareza / magia */
}
```

| Color | Significado | Usos permitidos | Usos prohibidos |
| --- | --- | --- | --- |
| Oro `gold` | La elección, recompensa, valor | CTA, XP, loot, selección, título, borde de avatar | Párrafos, fondos completos de página |
| Musgo `moss` | Progreso sano, completado, presencia | Quest completa, nodo limpio, atributos, online | Error, aviso temporal |
| Brasa `ember` | Peligro, presión, vida enemiga, countdown | HP enemigo, boss, racha, urgencia | CTA primaria general |
| Arcano `arcane` | Rareza especial, magia | Ítems épicos, perks, contenido de hechizo | Navegación normal |
| Rojo `danger` | Acción destructiva, error | Borrar, abandonar, error crítico | HP de boss (usar ember) |

**Regla de proporción visual:** 78% superficies oscuras, 14% texto/metal/papel, 6% color de señal, 2% luz intensa. Si el oro ocupa más del 10% de una pantalla, ha dejado de ser valioso.

### 2.2 Tipografía

Solo tres familias. Cargar `Cinzel` y `DM Sans`; `IM Fell English` es decorativa y se limita a citas, capítulos o captions.

```css
:root {
  --font-display: "Cinzel", Georgia, serif;
  --font-ui: "DM Sans", system-ui, sans-serif;
  --font-flavour: "IM Fell English", Georgia, serif;
}
```

| Token | Tamaño / line-height | Familia | Uso |
| --- | --- | --- | --- |
| `--ascend-rune` | 10px / 1.2 | Cinzel 700 | Label de contexto, en mayúsculas. |
| `--ascend-meta` | 11px / 1.4 | DM Sans 500 | Tiempo, estado, requisito. |
| `--ascend-body` | 13–14px / 1.5 | DM Sans 400 | Descripción, ayuda y textos. |
| `--ascend-card-title` | 16–18px / 1.15 | Cinzel 700 | Paneles y filas clave. |
| `--ascend-page-title` | 28–36px / 1 | Cinzel 800 | Título de ruta. |
| `--ascend-hero-title` | 40–56px / .9 | Cinzel 800 | Boss, capítulo, campaña. |
| `--ascend-stat` | 24–40px / .9 | Cinzel 800 | Nivel, racha, HP, count. |

Reglas:

- `Cinzel` se usa para **nombres, títulos y decisiones**, no para texto funcional largo ni formularios.
- Labels de contexto: mayúsculas, tracking `0.11em–0.15em`, color oro/muted.
- Números de daño, XP y nivel siempre con tabular numbers: `font-variant-numeric: tabular-nums`.
- No usar texto en mayúsculas de más de 22 caracteres para un botón móvil.
- El texto de sistema no baja de 12px en móvil.

### 2.3 Espaciado, forma y elevación

```css
:root {
  --ascend-space-1: 4px;
  --ascend-space-2: 8px;
  --ascend-space-3: 12px;
  --ascend-space-4: 16px;
  --ascend-space-5: 20px;
  --ascend-space-6: 24px;
  --ascend-space-8: 32px;
  --ascend-space-10: 40px;
  --ascend-space-14: 56px;
  --ascend-radius-sm: 2px;
  --ascend-radius-md: 4px;
  --ascend-radius-lg: 8px;
  --ascend-shadow-panel: inset 0 1px 0 rgba(255,255,255,.04), 0 12px 30px rgba(0,0,0,.18);
  --ascend-shadow-raised: 0 5px 0 #6b4c22, 0 10px 20px rgba(0,0,0,.28);
}
```

- Paneles: radio 0–4px. El mundo se percibe construido en piedra, madera y metal, no en plástico blando.
- Chips, avatares, orbes y nodos de mapa sí pueden ser circulares.
- Una sombra es una capa de peso, no un blur flotante. Mantenerla oscura, corta y direccional.
- Usar un borde de 1px en todos los paneles relevantes; un borde oro significa foco/selección, no decoración.

### 2.4 Texturas y fondos

La textura es ambiental, nunca un obstáculo para legibilidad.

| Superficie | Receta |
| --- | --- |
| App base | `void` + viñeta radial verde/ámbar muy tenue. |
| Panel | gradiente `stone-800 → stone-900` + borde `border`. |
| Hero de boss | arte/escena ilustrada + overlay oscuro 30–55% + viñeta. |
| Mapa | pergamino oscuro o terreno ilustrado, con nodos de alto contraste. |
| Merchant | piedra cálida / tela profunda; nunca blanco puro. |

No usar: estética de pergamino envejecido como fondo de **toda** la app, texto con textura, 3D cromado, iconos con ocho gradientes, cristales translúcidos masivos.

---

## 3. Arquitectura de layout

### Desktop (≥ 1180px)

```
┌──────────────────────── top bar ────────────────────────────────┐
│ BRAND · ROUTES                                  resources · hero │
├───────────────────────┬─────────────────────────┬───────────────┤
│                       │                         │               │
│  MAIN REALM           │    PRIMARY CONTENT      │  HERO CARD    │
│  title + context      │    hero / list / map    │  build        │
│                       │                         │  flame        │
│                       │    support modules      │  fellowship   │
│                       │                         │               │
└───────────────────────┴─────────────────────────┴───────────────┘
```

- App max width: `1440px`.
- Top bar: 76–84px de alto.
- Page shell: `padding: 28px 34px 32px`.
- Columna de contenido: flexible; hero card: `288–320px`.
- El `HeroCard` se mantiene a la derecha en rutas estándar. En Battle, Campaign Map y PvP puede ocultarse o convertirse en overlay.
- Máximo dos columnas de módulos bajo el objetivo principal. Nunca tres columnas de cards pequeñas.

### Tablet (768–1179px)

- Reducir la top bar a marca + navegación esencial + recursos.
- Hero card se convierte en un bloque horizontal antes del contenido secundario.
- Las columnas de apoyo pasan a una.

### Mobile (< 768px)

```
┌────────────────────────┐
│ brand / resources       │
│ route context           │
│ page title              │
│ primary hero / mission  │
│ primary action          │
│ essential supporting UI │
│                         │
│  bottom navigation      │
└────────────────────────┘
```

- Side hero card desaparece como columna. Nivel, racha y recursos viven en un `HeroSummary` compacto desplegable.
- CTA de reps persiste como bottom sheet/command bar solo en contextos de entrenamiento o batalla.
- La navegación inferior tiene 4 destinos: `REALM`, `TRAIN`, `ARMOURY`, `HERO`. Social/Fellowship vive dentro de Realm o Hero.
- Minimum touch target: `44×44px`; `52px` para `Record reps`.
- El arte del boss nunca cubre los controles ni el texto vital.

### Orden obligatorio de una página

1. Context label (`ACT I · VERDANT TRIAL`).
2. Título / estado actual.
3. Objetivo dominante y su feedback.
4. Acción principal.
5. Módulos de apoyo.
6. Historial, contenido extenso o configuración.

---

## 4. Componentes canónicos

### 4.1 `AscendPanel`

El contenedor base. No crear “cards” ad hoc.

```vue
<AscendPanel tone="stone" padded>
  <AscendRune>Today's quests</AscendRune>
  <!-- contenido -->
</AscendPanel>
```

| Prop | Valores | Uso |
| --- | --- | --- |
| `tone` | `stone` / `raised` / `inset` / `danger` | Material o importancia. |
| `padded` | boolean | 16px móvil / 18–20px desktop. |
| `selected` | boolean | Borde oro y anillo de foco. |
| `interactive` | boolean | Añade hover y cursor, no cambia material. |

```css
.ascend-panel {
  background: linear-gradient(135deg, var(--ascend-stone-800), var(--ascend-stone-900));
  border: 1px solid var(--ascend-border);
  box-shadow: var(--ascend-shadow-panel);
}
.ascend-panel[data-selected="true"] {
  border-color: var(--ascend-gold);
  box-shadow: 0 0 0 1px rgba(231,189,99,.2), var(--ascend-shadow-panel);
}
```

### 4.2 `AscendRune`

El pequeño label contextual que une el producto.

```vue
<AscendRune tone="gold">World hunt · sector 03</AscendRune>
```

- Tamaño 10px, `Cinzel 700`, uppercase, tracking 0.13em.
- `gold` para categoría/acción, `moss` para completado/vivo, `muted` para metadato.
- No apilar dos runes seguidos. Uno por grupo semántico.

### 4.3 `AscendButton`

| Variante | Tratamiento | Cuándo |
| --- | --- | --- |
| `gold` | oro gradiente, borde claro, sombra material | Acción primaria: registrar, entrar, reclamar, comprar. |
| `stone` | panel raised, borde fuerte | Acción secundaria: ver mapa, abrir codex. |
| `text` | texto oro, sin contenedor | Navegación o acción ligera. |
| `danger` | borde rojo oscuro, fondo contenido | Abandonar, borrar. |

```vue
<AscendButton variant="gold" icon="sword">Record reps</AscendButton>
```

Reglas:

- Cada vista tiene máximo un botón `gold` visible por región.
- Alto: 48px normal, 54–56px `primaryHero`, 44px móvil mínimo.
- Texto Cinzel 700, 13–16px, sin más de dos palabras excepto cuando aporte claridad (`CLAIM REWARD`).
- `gold` usa icono a la derecha; no necesita icono si es `Record reps` en el command bar.
- Disabled conserva el contenido y especifica requisito: `REQUIRES STRENGTH 15`.

### 4.4 `AscendMissionFrame`

El motor visual de la app. Se utiliza para **un** objetivo que importa ahora.

**Anatomía obligatoria:**

```text
RUNE: WORLD HUNT / ACT / TRAINING QUEST
Title: Nombre de enemigo, misión o meta
1 frase de consecuencia
Estado: HP, series, progreso o tiempo
Reward preview (si aplica)
Gold CTA
```

| Variante | Visual | Métrica dominante | CTA |
| --- | --- | --- | --- |
| `world-hunt` | Arte de boss, escena y overlay | HP colectivo + daño propio | `ENTER THE FRAY` |
| `campaign` | Nodo/escena de mapa | HP enemigo o progreso nodo | `BEGIN ENCOUNTER` |
| `training-quest` | Arte de movimiento o ilustración | sets/reps restantes | `RECORD SET` |
| `daily` | Sellos y recompensa | quest progress / reset | `CONTINUE QUEST` |

No usar un mission frame para anuncios, promociones ni contenido pasivo.

### 4.5 `RepCommand`

La interacción más crítica. Es un componente de entrada, no un modal genérico.

```text
Exercise selector            [ Pull-ups v ]
Step control                 [ − ]  12  [ + ]
Optional weighted input      + kg
Live consequence             +240 XP · est. 1,860 DMG
[ RECORD REPS ]
```

Reglas no negociables:

- Recuerda el último ejercicio y la última cantidad; no obliga a seleccionar repetidamente.
- `−` y `+` miden mínimo 48px; el valor es 56–72px y usa `Cinzel`.
- Al registrar, bloquear solo durante la confirmación de red; reflejar estado optimista si el sistema lo permite.
- El resultado aparece donde ocurrió: `+ XP`, `+ RC`, daño en el enemigo y update de quest.
- El CTA no dice `Attack`; siempre `RECORD REPS` / `RECORD SET`.

### 4.6 `HealthBar` y `ProgressBar`

No intercambiar sus semánticas.

| Barra | Color de fill | Qué significa |
| --- | --- | --- |
| `HealthBar enemy` | ember → ember deep | Vitalidad de enemigo. |
| `ProgressBar quest` | moss | Progreso sano hacia un objetivo. |
| `ExperienceBar` | gold | XP / nivel. |
| `AttributeBar` | moss | Atributo de la build. |
| `TimerBar` | gold → ember | Tiempo limitado próximo a expirar. |

- Alto: 12px hero, 6px panel, 4px atributo.
- Toda barra tiene label y valor textual. Ejemplo: `WARDEN'S VIGOUR · 38,000 / 100,000`.
- Fill no menor de 2px aunque esté a 0%; mostrar `0 / 100` explícitamente.

### 4.7 `QuestRow`

```text
[ seal ]  Quest title                         36 / 50
          Qué cuenta para esta quest           optional chevron
```

- 52–64px alto según haya descripción.
- Un sello a la izquierda: `moss` completo, oro activo, stone bloqueado.
- El valor a la derecha se alinea siempre; valores numéricos tabulares.
- Al completar, no desaparecer de la lista: pasa a estado muto + sello musgo + `DONE`.

### 4.8 `AttributeStrip`

```text
END   [████████████░]   31
```

- Mostrar máximo tres atributos en hero card; abrir `FULL BUILD` para siete.
- Código de atributo 10px Cinzel oro; valor 11–13px Cinzel.
- Al tocar/click: tooltip accesible que explica cómo subirlo y qué afecta.
- Nunca usar gráficos de radar para decidir progresión: son decorativos y difíciles de comparar.

### 4.9 `HeroCard`

Es la ficha de identidad persistente, no una mini cuenta de usuario.

**Orden:** avatar → nombre + nivel → título → XP → 3 atributos → flame → fellowship activity.

- Avatar 52–64px con borde oro. Puede tener borde cosmético por encima, sin perder contraste.
- Título usa badge de piedra/moss/oro según rareza; no pill redondeada de SaaS.
- El valor emocional es la flame, no una gran lista de números.

### 4.10 `LootCard`

Para chest opening, drop y compra. Debe tener una sola pieza de arte/icono, rareza inequívoca y efecto tangible.

| Rareza | Borde / halo | Tono |
| --- | --- | --- |
| Common | stone / muted | material corriente |
| Rare | moss | verdant |
| Special | gold | reliquia |
| Legendary | ember + gold | artefacto solar |
| Calisthenic | arcane + gold | reliquia del ascenso |

No cambiar el fondo entero por el color de rareza. La paleta base sigue siendo piedra.

### 4.11 `MapNode`

| Estado | Forma | Tratamiento |
| --- | --- | --- |
| Locked | piedra oscura / candado | texto de requisito bajo el nodo |
| Available | nodo moss con pulso leve | camino iluminado hacia el nodo |
| Current | oro, anillo doble | label y CTA en panel inferior |
| Cleared | sello moss | recompensa reclamada / estrella |
| Boss | ember + oro, tamaño 1.4× | icono/arte de boss y HP |

Los caminos se conectan detrás de los nodos. Nunca representar el mapa como una lista de cards a menos que sea modo accesible alternativo.

---

## 5. Patrones de cada ruta

### Dashboard / Realm (`/:lang/dashboard`)

**Pregunta que responde:** “¿Qué debo hacer ahora?”

1. Saludo y capítulo actual.
2. `AscendMissionFrame` priorizando en orden: batalla en curso → nodo enganchado → training quest → daily quest.
3. `TodayQuests` y `PathOfAscent` en una fila desktop / secuencia móvil.
4. Hero card / resumen de la build.

No incluir: feed completo, catálogo de tienda, tabla de rankings grande, seis gráficas.

### Battle / World Hunt (`/:lang/batalla`)

**Pregunta que responde:** “¿Cómo contribuyo y qué está ocurriendo?”

```
boss art + health bar
weakness / countdown / community activity
damage feedback layer
RepCommand (fijo, sin ocultar)
own damage / ranking / buffs (secundario)
```

- El arte puede ocupar 40–55% del alto desktop; en móvil, 22–30%.
- La vida del boss es siempre visible.
- Debilidad tiene icono + nombre + explicación de una línea.
- Buffs se muestran como iconos de 32px con tooltip; no como una barra de pills.
- Ranking es panel plegable móvil.

### Campaign Map (`/:lang/campana`)

**Pregunta que responde:** “¿Qué camino he construido y cuál es la siguiente prueba?”

- Mapa interactivo como superficie dominante; panel `CurrentQuest` anclado abajo/izquierda desktop y bottom sheet móvil.
- Cada acto define su paleta ambiental propia usando **solo** overlays/arte: Verdant (moss), Ashen (ember), Astral (arcane). Los tokens de UI no cambian.
- Al seleccionar nodo, no navegar todavía: abrir panel de contexto con requisitos, reward y CTA.
- El nodo fijado en el dashboard coincide con el nodo `Current` del mapa.

### Node Battle / PvP

- Reutilizar Battle layout y `RepCommand`.
- PvP añade rival, timer y score como lecturas secundarias. No sacrificar el HP por el marcador.
- Diferenciar los dos participantes con retrato/colores de capa, no rojo vs verde exclusivamente; sigue accesible para daltonismo.

### Missions (`/:lang/missions`)

- Primero: `Claimable` (si existe). Segundo: daily quests. Tercero: logros por categoría.
- Las categorías son estanterías/questboards con icono y conteo, no tabs pill genéricas.
- Cada recompensa se previsualiza en la quest row. `CLAIM` es oro, uno por fila solo cuando esté listo.

### Armoury / Inventory (`/:lang/inventory`)

**Pregunta que responde:** “¿Qué poseo y qué me hace más fuerte?”

- Nav local: `EQUIPPED / LOOT / CHESTS / CONSUMABLES / COSMETICS`.
- Inspector de ítem a la derecha desktop y bottom sheet móvil.
- La vista equipada parte del avatar/bust del héroe con slots de equipo claros.
- Cada item explica efecto de juego en lenguaje concreto: `+4% world hunt damage`, no solo `Power +12`.

### Merchant / Shop (`/:lang/shop`)

- Cabecera de rotación: `THE MERCHANT LEAVES IN 03:12:09`.
- Una oferta destacada (`MerchantFeature`) grande; debajo 2–4 módulos por intención.
- Al comprar, mostrar comparación de build antes del confirm final solo si cambia stats; cosméticos se prueban en preview.
- Gemas tienen estilo elegante, no brillante tipo casino. Lucky Wheel es una actividad aparte, con probabilidad/no sorpresa oscura si aplica.

### Fellowship / Social (`/:lang/social`)

**Pregunta que responde:** “¿Qué historias están ocurriendo en mi mundo?”

- Feed de eventos, no feed de tarjetas uniformes: entrenamiento, kill, record, cofre, duelo.
- Cada evento tiene icono/heráldica, atleta, consecuencia y acción ligera.
- Ranking es “Hall of Champions” con top 3 visual y tabla semántica debajo.
- Presencia en vivo = punto moss + texto `TRAINING NOW`; no contar como una notificación.

### Hero / Profile (`/:lang/profile`)

- Cabecera de gran identidad: avatar, nivel, título, banner equipado y 3 stats de firma.
- En perfil propio: `EDIT HERO`, `VIEW FULL BUILD`, `SHARE CARD`.
- En perfil ajeno: `FOLLOW`, `CHALLENGE`, `VIEW QUEST HISTORY`.
- La página pública debe degradar con elegancia: ninguna información privada por decoración.

### Field Library / Blog

- Arte editorial más claro que la app de juego, pero con marco Ascend.
- La lectura aporta `WISDOM / INT`; mostrar progreso al final del artículo, nunca interrumpir la lectura.
- No volver a un blog de cards coloridas: usar cubierta, categoría, tiempo y recompensa de conocimiento.

---

## 6. Iconografía y arte

### Iconos

- Usar iconos de silueta, grabado o game-icons existentes con stroke/relleno coherentes.
- Tamaños: 16px inline, 20px acción, 24–28px navegación, 32px buff, 44–64px arte de item.
- Iconos de navegación siempre con label visible en desktop o tooltip accesible; en móvil, label de barra inferior.
- No mezclar Lucide line icons, emojis y game-icons en el mismo bloque. Elegir game-icons/silhouette como sistema principal.

### Dirección de arte

| Asset | Dirección |
| --- | --- |
| Bosses | Ilustración dark fantasy de alto contraste, silueta reconocible, fondo ambiental, hueco para copy. |
| Enemigos campaña | Bestiario coherente; misma perspectiva, iluminación y marco de carta. |
| Héroes | Portrait semi-ilustrado o avatar cosmético; no foto recortada dentro de un mundo pintado sin tratamiento. |
| Ítems | Ilustración aislada sobre fondo oscuro/neutral, con buena silueta a 48px. |
| Backgrounds | Bosque, ruina, ceniza, cielo nocturno; detalle bajo detrás de texto. |

**Prohibido:** usar material con copyright de juegos/franquicias como arte de producción. Si se usan referencias internas para prototipar, sustituir antes de lanzar por arte original/licenciado.

### Ornamentación

- Usar reglas finas, separadores metálicos y sellos para jerarquía.
- Máximo una textura ambiental y una pieza de arte dominante por viewport.
- Nunca poner filigrana, runas, bordes tallados y brillo oro simultáneamente: uno de esos detalles debe liderar.

---

## 7. Estados, feedback y motion

### Estados de interfaz

| Estado | Patrón |
| --- | --- |
| Loading | Skeleton de piedra + shimmer oro muy sutil; conservar estructura final. |
| Empty | Ilustración/silueta pequeña + frase de avance + CTA concreto. |
| Locked | Panel oscuro, candado, requisito claro y cómo conseguirlo. |
| Complete | Sello moss, valor final, reward disponible o `CLAIMED`. |
| Error | Franja danger con lenguaje humano + acción de recuperación. |
| Offline | Banner muted: `THE REALM IS OUT OF SIGHT. YOUR SET IS SAVED LOCALLY.` |

### Recompensa: secuencia estándar

1. El usuario pulsa `RECORD REPS`.
2. Botón entra en `Recording…` durante la confirmación, sin desplazar layout.
3. Daño emerge sobre enemigo / nodo: `1,860` ember, crítico oro.
4. XP y monedas entran desde el botón a sus contadores con trayectoria corta.
5. Quest row y barras actualizan.
6. Si hay un evento mayor (level, loot, kill), se abre `RewardReveal` una vez acabada la secuencia base.

### Motion tokens

```css
:root {
  --ascend-ease-out: cubic-bezier(.2,.8,.2,1);
  --ascend-ease-impact: cubic-bezier(.15,.9,.25,1.15);
  --ascend-duration-fast: 120ms;
  --ascend-duration-base: 180ms;
  --ascend-duration-slow: 320ms;
  --ascend-duration-reveal: 520ms;
}
```

- Hover de panel: translateY(-1px), borde más claro; 180ms.
- CTA oro: elevación 1–2px al hover; al press baja a `translateY(3px)` y pierde shadow material.
- Daño: escala de 0.85→1, asciende 16px, se desvanece en 500ms.
- Loot legendario: halo y partículas máximas 900ms; no loops infinitos.
- Map nodes disponibles: pulso de opacidad cada 2.4s, uno por vez si hay varios.

### Reduced motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
  }
}
```

La confirmación textual nunca se elimina. El usuario sigue viendo `+240 XP`, `Quest complete` o `Level 43`.

---

## 8. Accesibilidad obligatoria

- Contraste AA para copy y controles; oro claro sobre stone oscuro debe alcanzar 4.5:1 si es texto pequeño.
- Nunca comunicar rareza o estado solo por color: añadir nombre (`LEGENDARY`), icono y/o patrón de borde.
- Focus visible: `outline: 2px solid var(--ascend-gold-light); outline-offset: 3px;`.
- Los tooltips de atributos, buffs y rarezas deben ser accesibles por teclado y touch.
- Los paneles de mapa tienen vista alternativa semántica de lista de nodos con estado/requisitos.
- `aria-live="polite"` para resumen de rewards; no anunciar cada tick de daño.
- Los visuales de boss tienen `alt` contextual o se marcan decorativos si el nombre y estado ya están en el DOM.
- No bloquear el progreso con drag, hover o precisión de puntero.

---

## 9. Implementación Vue: estructura propuesta

Crear la capa Ascend sin duplicar la lógica de stores existentes. Los componentes solo presentan estado y emiten acciones.

```
frontend/src/
├── styles/
│   ├── ascend-tokens.css
│   ├── ascend-foundation.css
│   └── ascend-motion.css
├── components/ascend/
│   ├── AscendPanel.vue
│   ├── AscendRune.vue
│   ├── AscendButton.vue
│   ├── AscendMissionFrame.vue
│   ├── AscendRepCommand.vue
│   ├── AscendHealthBar.vue
│   ├── AscendQuestRow.vue
│   ├── AscendAttributeStrip.vue
│   ├── AscendHeroCard.vue
│   ├── AscendLootCard.vue
│   ├── AscendMapNode.vue
│   └── AscendRewardReveal.vue
└── components/layout/
    ├── AscendAppShell.vue
    ├── AscendTopbar.vue
    └── AscendMobileNav.vue
```

### Componente y datos

| Componente | Lee | Emite |
| --- | --- | --- |
| `AscendRepCommand` | training store, damage store, boss/campaign target | `record` |
| `AscendMissionFrame` | boss/campaign/missions normalizados | `primary-action` |
| `AscendHeroCard` | auth, profile, streak, stats | `open-profile`, `open-build` |
| `AscendQuestRow` | missions | `claim`, `open` |
| `AscendRewardReveal` | rewards / socket events | `dismiss`, `equip` |
| `AscendMapNode` | campaign store | `select-node` |

Normalizar antes de pintar. Ejemplo de contrato para un mission frame:

```ts
type MissionFrameModel = {
  kind: 'world-hunt' | 'campaign' | 'training-quest' | 'daily'
  rune: string
  title: string
  description: string
  art: { src: string; alt: string }
  status: { label: string; current: number; total: number; tone: 'enemy' | 'quest' | 'xp' }
  reward?: { label: string; icon: string }
  cta: { label: string; disabled?: boolean; requirement?: string }
}
```

No permitir que cada página invente props de color o un HTML distinto para representar exactamente el mismo concepto.

### Tailwind

Si se mantiene Tailwind, registrar tokens como colores semánticos y no escribir hexadecimales en templates:

```js
// tailwind.config.cjs
theme: {
  extend: {
    colors: {
      ascend: {
        void: '#080908', stone: '#1c1b18', panel: '#25231d',
        border: '#625943', gold: '#e7bd63', moss: '#82bd66', ember: '#df6642',
      },
    },
    fontFamily: {
      ascend: ['Cinzel', 'serif'],
      ui: ['DM Sans', 'sans-serif'],
    },
  },
}
```

Permitido: `bg-ascend-panel`, `text-ascend-gold`.

No permitido: `bg-[#1c1b18]`, `text-[#e7bd63]` repetido dentro de los componentes de producto.

---

## 10. Orden de adopción y definición de terminado

### Fase 1 — el core loop

1. `AscendAppShell`, tokens, topbar y mobile nav.
2. Dashboard con `AscendMissionFrame`, `QuestRow`, HeroCard y RepCommand.
3. Battle y Node Battle con rep feedback, health bars y rewards.

**Terminado cuando:** un atleta puede entrar, saber su objetivo, registrar reps y entender exactamente qué cambió sin abandonar la superficie Ascend.

### Fase 2 — deseo de progresar

4. Campaign Map + node inspector.
5. Missions + reward reveal.
6. Armoury + equip preview.

**Terminado cuando:** el usuario puede visualizar qué le falta, qué gana y cómo su build cambia por entrenar.

### Fase 3 — mundo compartido

7. Fellowship/social y Hall of Champions.
8. Profile/hero card público, retos PvP.
9. Merchant y Lucky Wheel ajustados a Ascend.

**Terminado cuando:** el usuario puede ver actividad relevante de otros atletas sin que el feed opaque su propia aventura.

### Checklist de aprobación por pantalla

- [ ] ¿El objetivo de la pantalla puede leerse en 3 segundos?
- [ ] ¿Existe un único CTA oro dominante por región?
- [ ] ¿El usuario sabe si las reps afectarán a boss, nodo, quest o duelo?
- [ ] ¿Los valores críticos tienen texto además de barras/color?
- [ ] ¿Los componentes vienen de la librería Ascend y no de una card nueva improvisada?
- [ ] ¿El tono y el arte pertenecen al mismo realm Ascend?
- [ ] ¿En móvil la acción clave sigue siendo alcanzable sin navegar?
- [ ] ¿Focus, contraste, estado vacío/loading/error y reduced motion están cubiertos?

Una vista que no pase los ocho puntos no se considera Ascend terminada.

---

## 11. Anti-patrones explícitos

| No hacer | Hacer en su lugar |
| --- | --- |
| Cards blancas/redondeadas sobre fondo oscuro | `AscendPanel` de piedra con borde material |
| Un CTA azul genérico | CTA oro material con copy concreto |
| Fantasía solo en nombres | Arte, mapa, items, state changes y nomenclatura coherentes |
| Fondo de pergamino detrás de todo | Fondo oscuro; pergamino solo para mapa, carta o artefacto específico |
| Doce colores para rarezas, stats y estados | Oro, musgo, brasa y arcano con semántica fija |
| Avatar, XP, coins, gems y ocho badges compitiendo arriba | Hero card jerarquizada; resources compactos en topbar |
| Ocultar `Record reps` tras varios clics | Command bar o entrada persistente en los contextos relevantes |
| Copiar UI de un RPG de consola | Diseñar para móvil/web: datos legibles, acciones rápidas, sesiones cortas |
| Animación épica en cada interacción | Impacto reservado para daño, loot, level-up, kill y unlock |

---

## 12. La prueba decisiva

Si se quitan el logo y las palabras, la interfaz debe seguir comunicar:

> “Es un mundo de fantasía donde el esfuerzo físico real te hace avanzar.”

Y si se quitan el arte, oro y ornamento, el flujo debe seguir comunicar:

> “Sé qué hacer ahora, puedo registrar mis reps en segundos y entiendo mi progreso.”

Las dos frases deben ser ciertas a la vez. Ese es Reppy Ascend.
