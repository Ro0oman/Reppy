# Reppy Operative OS — guía de estilo

> **Idea rectora:** Reppy no es una app que “muestra entrenamiento”. Es la consola desde la que un atleta ejecuta una misión en vivo. Las repeticiones son el input de combate.

Esta guía define el lenguaje visual para toda interfaz autenticada de Reppy: dashboard, batalla, campaña, misiones, tienda, inventario, perfil y social. Debe hacer que cada pantalla se sienta como parte de una misma operación, aunque su función cambie.

## 1. La sensación que debe producir

**Precisa, activa, exigente y personal.** La interfaz tiene que hacer que el usuario perciba tres cosas de inmediato:

1. *Estoy en una misión concreta ahora.* Hay un objetivo, un estado y una próxima acción.
2. *Mi entrenamiento tiene consecuencias.* Las reps producen daño, XP, recursos o progreso visibles.
3. *Esto está vivo.* El raid, la racha, la actividad de amigos y los temporizadores no son decoración; son señales del mundo compartido.

La referencia mental es una mezcla de HUD de operación, equipamiento deportivo de alto rendimiento y RPG moderno. No es una fantasía medieval; tampoco una app SaaS suave o un cyberpunk de neón.

### Principios de diseño

- **La acción antes que la información.** La acción principal de una vista debe ser obvia sin leer una lista de cards.
- **Una misión por encima de todo.** Cada pantalla responde a “¿qué debería hacer el atleta ahora?”.
- **Telemetría, no ornamentación.** Líneas, etiquetas, barras y números existen para explicar estado, no para rellenar.
- **Densidad con aire.** La interfaz puede contener datos, pero los grupos tienen jerarquía, bordes y márgenes claros.
- **La recompensa debe sentirse física.** Ganar algo activa movimiento, contraste y cambio de estado; no solo un toast silencioso.
- **El jugador es una build.** Atributos, equipamiento, racha y título deben sentirse como partes de una identidad operativa.

## 2. Fundaciones visuales

### Paleta: Signal on Obsidian

Los colores de señal se reservan para significado. El azul no es un relleno indiscriminado: es una orden o un sistema activo.

| Token | Valor | Uso |
| --- | --- | --- |
| `--os-void` | `#05070B` | Fondo de aplicación y zonas inmersivas. |
| `--os-ink` | `#080C13` | Superficie base. |
| `--os-panel` | `#0D131E` | Panel, card y HUD. |
| `--os-panel-raised` | `#121C2B` | Elemento elevado, selector, hover. |
| `--os-line` | `#27364D` | Divisor y borde discreto. |
| `--os-line-strong` | `#415675` | Contorno de bloque importante. |
| `--os-blue` | `#1B68FF` | Acción primaria, sistema activo. |
| `--os-cyan` | `#61D9FF` | Lectura activa, telemetría, dato destacado. |
| `--os-orange` | `#FF6A32` | Urgencia, racha, alerta temporal. |
| `--os-success` | `#45E991` | Confirmación, misión completada, presencia. |
| `--os-danger` | `#FF4D61` | Daño recibido, fallo, borrado. |
| `--os-text` | `#F3F6FB` | Texto principal. |
| `--os-muted` | `#8995AA` | Texto secundario y metadatos. |

Reglas:

- El fondo debe ser casi negro, pero nunca negro plano puro. Construye profundidad con `void → ink → panel`.
- El azul primario solo se usa en una acción dominante por región. Si hay cinco botones azules, no hay jerarquía.
- El cian representa **lectura o señal**, no acciones peligrosas. Úsalo en XP, daño, números de sistema y foco.
- El naranja es escaso: racha, cuenta atrás, energía limitada o recompensa de urgencia.
- Las rarezas de items conservan su color propio, pero se presentan sobre superficies Operative OS; no crean una segunda estética.

### Tipografía

Usar dos voces, no muchas.

| Rol | Familia | Peso / casing | Uso |
| --- | --- | --- | --- |
| Display | `Barlow Condensed`, fallback `Arial Narrow` | 700–800, mayúsculas | Títulos, números grandes, CTA, nombres de boss. |
| Interface | `Inter` | 400–700 | Copy, navegación, formularios, explicaciones. |
| Telemetría | `DM Mono`, fallback `ui-monospace` | 400–500, mayúsculas | Labels, timestamps, estados, contadores. |

Escala recomendada:

```css
--type-kicker: 0.6875rem; /* 11px */
--type-meta: 0.75rem;     /* 12px */
--type-body: 0.875rem;    /* 14px */
--type-title: 1.25rem;    /* 20px */
--type-section: 1.75rem;  /* 28px */
--type-display: clamp(2.75rem, 6vw, 5.5rem);
```

- Un label de telemetría siempre precede a una lectura o un título: `GLOBAL RAID / SECTOR 03`.
- Los números que importan pueden ser enormes. No aumentes todo: aumenta solo el número que debe cambiar la decisión del usuario.
- No uses mayúsculas para párrafos ni explicaciones largas.

### Forma, bordes y textura

- Radio estándar: **0–4px**. La interfaz es técnica y modular, no juguetona.
- Los paneles importantes pueden usar un corte sutil en una esquina mediante `clip-path`, pero nunca en todo.
- Los bordes de 1px (`--os-line`) estructuran. Un borde azul/cian señala selección o estado vivo.
- Usa una retícula muy tenue, mapa topográfico o ruido fino exclusivamente en fondos grandes. Debe desaparecer si el usuario no presta atención.
- La transparencia es limitada. `rgba()` sirve para HUDs superpuestos; no conviertas todas las cards en cristal.

## 3. Layout y jerarquía

### Estructura desktop

```
┌ rail ┐ ┌──────── contenido operativo ────────┐ ┌ telemetry ┐
│      │ │ contexto + misión / acción           │ │ perfil    │
│ nav  │ │ módulos de apoyo                      │ │ build     │
│      │ │                                       │ │ actividad │
└──────┘ └──────────────────────────────────────┘ └───────────┘
```

- **Rail izquierdo (72–84px):** navegación por iconos. Un único destino activo, con fondo azul oscuro y barra lateral cian.
- **Contenido:** máximo de 1440px, padding 24–32px. El primer bloque es siempre el contexto y la misión.
- **Rail derecho (260–300px):** identidad del atleta, build, racha y señales sociales. Es opcional en vistas muy inmersivas.
- Las rutas de batalla, campaña y PvP pueden ocultar los rails, pero conservan la misma escala de paneles y telemetría.

### Estructura móvil

- No miniaturizar el desktop. Convertir la misión en una secuencia vertical.
- Barra inferior de cuatro destinos: `CONTROL`, `COMBAT`, `SQUAD`, `PROFILE`.
- La acción de reps debe vivir en la zona cómoda del pulgar, siempre visible o a una interacción de distancia.
- Los paneles secundarios se resuelven como drawers o secciones plegables, no como una columna interminable.
- En móvil, mantener un objetivo dominante y como máximo dos módulos de apoyo antes del siguiente scroll.

### Espaciado y grid

Base de 4px. Usar `8, 12, 16, 20, 24, 32, 40, 56`.

- Separación dentro de un módulo: 12–16px.
- Separación entre módulos relacionados: 16px.
- Separación entre secciones de página: 24–32px.
- Nunca usar espaciado para “decorar”: si un bloque no necesita aire para ser leído, no lo añadas.

## 4. Componentes base

### A. Mission frame

Es el componente más importante. Debe existir en dashboard, campaña, plan guiado, misión diaria y raid.

**Anatomía:** label de contexto → nombre/objetivo → estado visual (barra, mapa, enemigo o progreso) → consecuencia → CTA principal.

```text
GLOBAL RAID / SECTOR 03
THE WARDEN
Weakness: ENDURANCE
[ barra de estado ]
+12,480 YOUR DAMAGE TODAY
[ LOG REPS ]
```

Variantes:

- `boss`: salud comunitaria, debilidad, daño personal, presencia en vivo.
- `campaign`: nodo fijado, requisitos, recompensa y progreso del acto.
- `guided`: ejercicio de hoy, series restantes, objetivo técnico.
- `daily`: misión, recompensa y tiempo hasta reset.

No usarlo para contenido pasivo como artículos o ajustes.

### B. Command button

Botón rectangular, texto display en mayúsculas, 44px mínimo de alto (52–56px para CTA de reps).

| Tipo | Tratamiento | Ejemplos |
| --- | --- | --- |
| Primary | Fondo azul, texto blanco, sombra azul baja | `LOG REPS`, `START MISSION`, `CLAIM REWARD` |
| Secondary | Borde fuerte, fondo panel raised | `VIEW BUILD`, `OPEN CODEX` |
| Quiet | Texto muted/cian, sin caja | `VIEW HISTORY` |
| Danger | Borde o fondo rojo, confirmación explícita | `DELETE SET` |

El hover aumenta claridad y eleva 1–2px; nunca uses animación de rebote. El estado disabled debe explicar por qué (`REQUIRES LV. 12`).

### C. Telemetry label

Texto mono de 10–11px, tracking de 1–1.4px, mayúsculas. Es el pegamento del sistema.

Buenos ejemplos: `COMBAT INPUT`, `STREAK INTEGRITY`, `SQUAD ACTIVE NOW`, `NEXT RESET 03:12:09`.

Evitar labels abstractos como `INFORMACIÓN`, `DATOS`, `ESTADÍSTICAS` cuando se puede decir qué mide exactamente.

### D. Data strip

Fila con una métrica legible y un estado. Útil para atributos, misiones, historial y economía.

```text
END   [█████████░] 31
01 · Pull-up volume                  36 / 50
REPPY COINS                           2,480 RC
```

Primero el nombre, después la barra/valor, al extremo derecho el número o estado. Mantener 44px de alto mínimo en las filas interactivas.

### E. Status chip

No usar pills redondeadas genéricas. Usar rectángulos de 0–2px de radio y texto mono.

- `LIVE`: punto naranja pulsante + borde azul oscuro.
- `COMPLETE`: verde con check.
- `LOCKED`: muted, icono de candado y requisito explícito.
- `NEW`: cian sobre fondo azul oscuro.

### F. Reward reveal

Una recompensa usa una secuencia, no un modal de marketing:

1. La acción confirma en menos de 150ms.
2. El valor ganado aparece próximo a su origen (`+240 XP`, `+12 RC`, `CRIT ×1.8`).
3. Las barras afectadas avanzan.
4. Si hay recompensa relevante, se abre una capa de recompensa con una única acción clara.

Los cofres y level-ups son excepciones de alto impacto: pueden tomar pantalla y sonido, con salida fácil y `prefers-reduced-motion` respetado.

### G. Build panel

Agrupa: avatar, nivel, título, racha y atributos fundamentales. En una misma pantalla no mostrar necesariamente los siete atributos completos: mostrar 3 clave + `VIEW FULL BUILD`.

El perfil no es un formulario de cuenta. Visualmente debe parecer una ficha de personaje operativo.

## 5. Patrones por producto

| Vista | Misión dominante | Señal secundaria | Acción primaria |
| --- | --- | --- | --- |
| Dashboard | Boss/nodo/plan actual | Racha y protocolo de hoy | Log reps |
| Batalla | Enemigo y vida | Buffs, daño, ranking | Log reps |
| Campaña | Nodo fijado o próximo nodo | Mapa y requisitos | Enganchar / iniciar |
| Misiones | La recompensa más próxima | Reset y progreso | Reclamar / abrir |
| Tienda | Oferta rotativa o item elegido | Monedas/gemas | Comprar |
| Inventario | Item nuevo o cofre | Build comparativa | Equipar / abrir |
| Social | Actividad del squad | Raid global y ranking propio | Publicar / reaccionar |
| Perfil | Build del atleta | Récords y progreso | Retar / seguir |

### Battle mode

- La arena y el enemigo ocupan espacio emocional; las controls deben permanecer deterministas y legibles sobre ella.
- HP es la lectura dominante. Debajo: debilidad, daño propio, buffs y tiempo.
- El input no puede estar escondido detrás de un modal ni requerir elegir el ejercicio cada vez si el usuario repite el anterior.
- Los efectos visuales no pueden ocultar ni desplazar controles durante una serie.

### Tienda e inventario

- Organizar por **intención** (`EQUIP`, `COSMETICS`, `BUFFS`, `CHESTS`) y no por una pared de tarjetas.
- El ítem seleccionado abre un “loadout inspector”: visual, rareza, efecto, comparación y CTA.
- La rareza añade señal en borde/halo, no un fondo estridente que rompa la paleta.

### Social

- Tratar el feed como un registro de actividad de la escuadra, no como una red social genérica.
- Cada post muestra un “evento”: entrenamiento, record, boss kill, cofre o duelo. El formato y la consecuencia son más importantes que el avatar.
- Likes/comentarios siguen siendo discretos; el evento y la persona son protagonistas.

## 6. Motion y sonido

### Motion

- Duraciones: `120ms` para estado, `180–240ms` para panel y CTA, `350–500ms` para recompensa importante.
- Curva: `cubic-bezier(.2,.8,.2,1)`; evitar elástico/bouncy.
- El cambio de una barra se anima en anchura; el daño aparece y se disipa hacia arriba 12–20px.
- Un punto `LIVE` puede respirar muy despacio. No usar pulsos simultáneos en más de tres zonas.
- `prefers-reduced-motion` debe eliminar transiciones decorativas, contadores y partículas sin eliminar la confirmación textual.

### Sonido

- Un clic seco de interfaz para confirmaciones, impacto más denso para daño, brillo corto para recompensa.
- Sonido desactivable globalmente. Nunca autoplay en landing ni bucles que compitan con música del usuario.

## 7. Accesibilidad y claridad

- Contraste mínimo AA: `--os-text` sobre `--os-panel`; texto muted solo para información no crítica.
- No comunicar estado solo con color: `LIVE` tiene texto y punto, `LOCKED` tiene icono y requisito.
- Todo control táctil: 44×44px mínimo; en el contador de reps, 48×48px.
- Los números animados se anuncian de forma resumida a lector de pantalla (`12 reps logged. 240 XP gained.`), no frame a frame.
- La tipografía display tiene función visual; la información esencial siempre usa Inter legible.

## 8. Anti-patrones: lo que rompe Operative OS

| Evitar | Sustituir por |
| --- | --- |
| Una cuadrícula de cards idénticas, redondeadas y sin prioridad | Un mission frame y módulos de apoyo con tamaño desigual |
| Gradientes arcoíris o morados de “gaming” | Obsidiana, azul de sistema y acentos de señal muy escasos |
| Iconos sin labels en acciones complejas | Icono + texto; labels de telemetría donde aporte contexto |
| Modal para cada pequeña confirmación | Feedback in situ y modal solo para decisiones o recompensas relevantes |
| Navegación con más de 6–7 destinos visibles | Rail con destinos núcleo y “more” contextual |
| Decoración sci-fi sin información | Líneas, grid y retículas al servicio de estado, jerarquía o agrupación |
| Ocultar el registro de reps para mostrar contenido | Mantener `LOG REPS` como acción persistente o de acceso inmediato |

## 9. Base técnica sugerida

Definir los tokens una vez en `frontend/src/operative-os.css` y cargarlo después de las variables de tema actuales. Las clases son nombres de intención, no detalles de color:

```css
:root {
  --os-void: #05070b;
  --os-panel: #0d131e;
  --os-line: #27364d;
  --os-blue: #1b68ff;
  --os-cyan: #61d9ff;
  --os-orange: #ff6a32;
  --os-text: #f3f6fb;
  --os-muted: #8995aa;
  --os-ease: cubic-bezier(.2,.8,.2,1);
}

.os-panel { background: var(--os-panel); border: 1px solid var(--os-line); }
.os-label { color: var(--os-cyan); font: 500 11px/1.2 var(--font-mono); letter-spacing: 1.2px; text-transform: uppercase; }
.os-command { min-height: 52px; background: var(--os-blue); color: #fff; font: 700 1.2rem var(--font-display); letter-spacing: .06em; text-transform: uppercase; }
```

Crear primero estos componentes Vue compartidos:

1. `OsMissionFrame.vue`
2. `OsCommandButton.vue`
3. `OsTelemetryLabel.vue`
4. `OsDataStrip.vue`
5. `OsStatusChip.vue`
6. `OsBuildPanel.vue`
7. `OsRewardReveal.vue`

El orden de adopción recomendado es: **dashboard → battle/PvP → misión/campaña → inventario/tienda → social/perfil → landing pública**. Así se transforma antes el loop central y no se desperdicia el lenguaje visual en páginas periféricas.

## 10. Checklist antes de aprobar una vista

- [ ] ¿La misión o el objetivo de esta visita se entiende en tres segundos?
- [ ] ¿Hay una acción dominante y solo una?
- [ ] ¿El estado relevante se expresa en texto/número, no solo en decoración?
- [ ] ¿El azul está reservado para lo activo y el naranja para urgencia?
- [ ] ¿El layout evita la cuadrícula uniforme de cards?
- [ ] ¿La experiencia móvil conserva un input de reps inmediato?
- [ ] ¿La animación confirma una consecuencia sin estorbar?
- [ ] ¿El contraste, el foco y reduced motion están resueltos?

Si una pantalla cumple estos ocho puntos, se sentirá como Reppy Operative OS aunque su función sea nueva.
