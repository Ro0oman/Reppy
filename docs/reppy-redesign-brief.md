# Reppy — Brief funcional para rediseño (descripción ciega)

> **Para quien diseña:** Este documento describe **qué hace** la aplicación y **qué necesita
> lograr el usuario** en cada parte. **No** describe dónde va cada botón, ni jerarquías visuales,
> ni navegación concreta: eso es exactamente lo que quiero que propongas tú desde cero. Trátalo
> como un inventario de capacidades y de "trabajos que el usuario viene a hacer". Siéntete libre
> de agrupar, dividir, priorizar o reinventar la estructura como creas mejor.

---

## 1. Qué es Reppy

Reppy es una app de fitness (calistenia: dominadas, flexiones, fondos, muscle-ups, dominadas
lastradas) convertida en un **RPG**. La idea central e intocable:

> **El daño son tus repeticiones.** No hay botón de "atacar". Entrenar en la vida real *es* la
> acción de juego. Cada repetición que registras se convierte en experiencia, en monedas, en daño
> a enemigos y en progreso.

El usuario registra lo que entrena y, a cambio, sube de nivel a un personaje, mejora atributos tipo
RPG, pelea contra jefes, avanza por una campaña, compite en rankings, colecciona cosméticos y
mantiene una racha diaria. Es a la vez un **tracker serio de entrenamiento** y un **juego**.

**Tono de marca:** deportivo, "elite", energético, con estética gamer/RPG y un guiño a lo militar/
sci-fi en los textos ("operativos", "protocolo", "sistema"). Color de marca: **azul eléctrico
(primary)**. Soporta modo claro y oscuro. Bilingüe (español / inglés). Es una web app responsive,
usada mucho en **móvil**, sin necesidad de instalar nada.

**Los dos tipos de usuario** (se eligen en el onboarding):
- **"Quiero lograr una meta"** → quiere que la app le guíe con planes/rutinas de progresión
  (ej. "mi primera dominada", "mis primeras 10 dominadas").
- **"Solo quiero registrar"** → ya entrena, solo quiere contar reps, rankings y el tracking RPG.

---

## 2. Economía y recursos (transversal a toda la app)

El usuario acumula y gasta varios recursos. El diseño necesita poder mostrarlos y comunicarlos con
claridad en cualquier momento:

- **Reppy Coins (RC)** — moneda principal. Se gana con cada rep, misiones y rachas. Se gasta en la
  tienda (equipo, cosméticos, pociones) y en giros extra de ruleta.
- **Reppy Gems (gemas)** — moneda premium, más rara. Se gana en eventos, cofres y logros. Compra
  items míticos/legendarios y giros extra.
- **Cofres** — se abren en el inventario y sueltan items, monedas o gemas. Tipos: cofre de nivel,
  cofre de boss, cofre épico, cofre legendario. Vienen de subir de nivel, derrotar jefes y drops.
- **XP y nivel global** — cada rep da experiencia; el personaje tiene un nivel global.
- **Items** con rareza, de menor a mayor: **común < raro < especial < legendario < calisténico**.

---

## 3. Sistema de identidad / personaje RPG

Cada usuario **es** un personaje. Necesita poder ver y entender su progresión:

- **7 atributos** que suben con distintos comportamientos (esto es el corazón del RPG y conviene
  que el usuario entienda cómo subir cada uno):
  - **Fuerza (STR)** — sube haciendo ejercicios explosivos/lastrados; aumenta daño base.
  - **Destreza (DEX / agilidad)** — sube con muscle-ups y dominadas lastradas; aumenta probabilidad
    y daño de golpes críticos.
  - **Resistencia (END)** — sube acumulando volumen de reps; escala daño por volumen.
  - **Vigor (VIG)** — sube manteniendo la racha diaria; da resiliencia y estabilidad de críticos.
  - **Inteligencia (INT)** — sube **leyendo las guías del blog**; da un bonus global de XP a todo.
  - **Fe (FTH)** — sube participando en peleas de boss; daño "divino" extra.
  - **Carisma (CHA)** — sube interactuando en la comunidad (likes, comentarios); multiplicador de daño.
- Cada atributo tiene su nivel, su barra de XP hacia el siguiente nivel, una descripción de qué hace
  y una acción recomendada de "cómo subirlo".
- El usuario necesita entender **cómo se calcula su daño**: reps × multiplicador del ejercicio ×
  escalado por atributos + críticos + debilidad del enemigo + buffs de pociones + perks. Hay que
  poder comunicar esto (una especie de "manual de combate").
- **Perfil / avatar:** foto de avatar, nombre visible, nombre de usuario único, nivel, título
  equipado, borde de avatar, fondo. Perfil propio y **perfil público de otros atletas**.

---

## 4. Registrar entrenamiento (el acto central, se hace constantemente)

Es la acción más repetida de toda la app. El usuario debe poder registrar reps de forma
rapidísima, desde varios contextos:

- Elegir **tipo de ejercicio** (dominadas, flexiones, fondos, muscle-ups, dominadas lastradas, y
  ejercicios importados). En lastradas, indicar el **peso añadido**.
- Introducir un **número de repeticiones** y confirmar.
- Al registrar, ocurre feedback inmediato de recompensa: XP ganada, monedas, subida de atributos,
  números de daño flotantes sobre el enemigo, posibles subidas de nivel, avance de misiones.
- Puede registrarse desde: un panel rápido en cualquier parte, dentro de la vista de batalla, dentro
  de un plan/rutina guiada, o como "registro libre".
- El historial de registros recientes debe ser consultable (fecha, ejercicio, cantidad), y editable/
  borrable (editar una rep pasada reajusta retroactivamente parte del estado).

---

## 5. Progreso y estadísticas de entrenamiento

El lado "tracker serio". El usuario quiere ver su constancia y volumen:

- **Mapa de calor tipo GitHub** de actividad (qué días entrenó, intensidad por color), filtrable por
  ejercicio y por año. Es una feature emblemática.
- **Racha activa** (días seguidos entrenando) — muy importante emocionalmente. Además existe la
  posibilidad de **congelar la racha** (gastar monedas para no perderla un día).
- Métricas: total de reps, objetivo diario y progreso hacia él, mejor mes, tonelaje total movido
  (reps × resistencia), reps por ejercicio ("maestría por ejercicio"), evolución en el tiempo.
- **Objetivo diario** configurable por el usuario.

---

## 6. Planes y rutinas guiadas

Para el usuario que quiere que le guíen:

- **Planes de progresión** hacia una meta concreta (ej.: "mi primera dominada" = 21 misiones con
  agarre, escápulas, remos, negativas, asistidas; "mis primeras 10 dominadas" = 28 misiones, etc.).
- Cada plan es una secuencia de **días/misiones de entrenamiento** con tipo de trabajo (base técnica,
  volumen suave, test de control, fuerza submáxima, control excéntrico, densidad, escalera de
  luchador, test final…).
- El usuario puede ver **"tu misión de hoy"**, empezarla, completar el entrenamiento del día, o
  hacer un registro libre al margen del plan.
- Puede haber **rutinas personalizadas creadas por el propio usuario**, además de las predefinidas.
- Integración opcional con **Hevy** (importar entrenamientos desde esa app externa).

---

## 7. Combate: jefes comunitarios (boss fights)

Un evento global donde toda la comunidad pega al mismo jefe:

- Aparece un **boss** con muchísima vida (personajes de videojuegos con descripciones humorísticas
  sobre gimnasio). Tiene arte/vídeos (idle y de recibir daño), una barra de vida enorme, y una
  **debilidad por atributo**.
- **Cada rep que registras le hace daño** (según tu build). La barra baja en **tiempo real** para
  todos (realtime).
- El usuario ve: su daño histórico, su daño de hoy, si va Top 1 ("dominación"), el daño requerido,
  ranking de participantes.
- Cuando el boss cae, **todos los participantes ganan un cofre** de recompensa. Quien da el golpe
  final ("golpe de gracia") recibe un bonus especial y se genera un post de comunidad.
- Hay una **vista de batalla inmersiva** donde se combina: personaje del jugador, arena del boss con
  vídeo, panel para registrar reps, pociones rápidas, buffs activos. También un "manual de combate"
  que explica cómo hacer más daño.
- Hay una secuencia/backlog de jefes (Artorias, Ender Dragon, Rathalos, Malenia, Sephiroth, Diablo…).

## 7b. Combate: Campaña RPG (modo más nuevo, individual)

Una campaña RPG personal por jugador (coexiste con los boss comunitarios):

- **Mapa con zonas y nodos** organizado en **3 actos**, como un grafo (caminos principales y
  secundarios). Cada nodo es un combate, un grupo de enemigos, un jefe, un NPC, una encrucijada, un
  cofre o un raid. Los nodos se desbloquean al limpiar anteriores y cumplir requisitos (nivel mínimo,
  senda elegida, o incluso un stat mínimo tipo "necesitas Fuerza 15").
- **Bestiario** de ~21+ enemigos de varias familias (goblins, arañas, bandidos, esqueletos, zombies,
  caballeros, demonios…), con tiers de dificultad, debilidades y resistencias. Hay una vista de
  **bestiario/códex** donde los no descubiertos aparecen como silueta con "???" y un contador de
  cuántos has descubierto.
- El jugador **"engancha" un nodo** (fija su objetivo actual) y entonces sus reps hacen daño a *su*
  enemigo, con HP escalado a su nivel. Al matarlo: loot, avance en el mapa, actualización del códex.
- **NPCs con misiones narrativas encadenadas** (diálogos, quests con objetivos como "mata 10
  bandidos", "haz 100 dominadas", "limpia el nodo X"), con recompensas.
- **Encrucijada moral**: en el acto II el jugador elige **senda luminosa** (honor/constancia,
  recompensas estables, bendiciones = buffs, cosméticos de caballero) o **senda oscura** (pactos =
  quests con cuenta atrás y riesgo: gran recompensa si cumples, penalización/maldición si expira).
  La elección es **permanente** hasta prestigiar. Filtra contenido del acto III.
- **Prestigio / New Game+**: al terminar la campaña, reinicias con dificultad y recompensas
  multiplicadas, conservando el códex y un título de "Prestigio N".
- Reusa la misma vista de batalla inmersiva pero con "arena de enemigo" en vez de boss.

---

## 8. PvP — duelos entre usuarios

Combate directo 1 contra 1:

- Retar a otro usuario desde su perfil a un **duelo**. El otro acepta o rechaza; hay retos
  entrantes, retos enviados, peleas activas e historial.
- Configurar el duelo: **vida objetivo**, **límite de tiempo**, **ejercicios permitidos**, incluso
  un fondo de batalla personalizado.
- Durante el duelo, ambos registran reps que se convierten en daño; se ve el marcador en tiempo real,
  HP restante, tiempo. Resultado: victoria / derrota / empate.
- Hay un sistema **antitrampa** que evita series imposibles o spam.

---

## 9. Misiones y desafíos

- **Misiones diarias** (se renuevan cada día): objetivos como "haz 50 reps hoy", "mantén la racha",
  "haz 10.000 de daño a un boss", más un desafío especial. Barra de progreso y **reclamar recompensa**
  al completarlas. Cuenta atrás hasta el próximo reset.
- Además hay un gran catálogo de **logros/misiones de mayor tier** (acumula 5000 reps, ten 5 amigos,
  lee 5 artículos, gasta 50.000 monedas, sube de nivel dos veces en un día, da el golpe de gracia a
  un boss, etc.).

---

## 10. Tienda

Donde se gastan monedas y gemas:

- **Cosméticos**: títulos de honor, bordes de avatar, avatares, fondos de interfaz, fondos de post,
  packs de bienvenida (bundles). Muchos con rareza y algunos estacionales/de evento (sets legendarios
  temáticos: maná, lava, glitch…).
- **Equipo RPG**: armas, armaduras, cascos con stats.
- **Consumibles / pociones**: buffs temporales (multiplicador de daño, etc.) con duración.
- **Cofres premium**.
- **Mercader diario / ofertas limitadas** que rotan, con un item legendario que puede aparecer.
- Al comprar equipo se muestra un **análisis de combate** (cómo cambian tus stats).
- Vista previa de cosméticos antes de comprar.

## 10b. Ruleta de la suerte (Lucky Wheel)

- Una **ruleta gratis cada 4 horas** que da monedas, cofres, pociones, gemas o items (con cooldown
  visible). Se pueden comprar **giros extra** con gemas (el precio escala).
- Existe además una **ruleta diaria** (1 vez al día) con mejores recompensas.

---

## 11. Inventario

- Ver todos los items poseídos (cosméticos, equipo, consumibles), con su rareza.
- **Equipar** cosméticos (título, borde, avatar, fondo, fondo de post) y equipo RPG.
- **Abrir cofres** (animación de recompensa) de los distintos tipos.
- **Activar consumibles/pociones** para buffs temporales.
- Marcador de items "nuevos" (badge NEW) no vistos aún.

---

## 12. Social / comunidad

El "lobby" al que llega el usuario recurrente. Es donde ve qué hace la gente:

- **Muro/feed social**: publicaciones de entrenamientos (resúmenes diarios de lo que alguien
  entrenó), posts de jefes derrotados, records. Se puede dar **like** y **comentar** (esto además
  sube Carisma). Los posts pueden llevar fondos cosméticos.
- **Rankings/leaderboard global** y **entre amigos**, filtrables por hoy / semana / mes / año /
  histórico. Muestra posición, nivel, reps.
- **Operativos en vivo**: usuarios activos ahora mismo (presencia en tiempo real).
- **Buscar y añadir amigos** ("inner circle"); ver sus perfiles y progreso.
- **Estado del raid/boss** visible desde aquí.
- Compartir un entrenamiento (link, redes).

---

## 13. Notificaciones y tiempo real

- Centro de **notificaciones**: alguien te comentó, te dio like, te retó a PvP, un boss fue
  derrotado, recordatorios de racha, referidos, pactos expirados, etc.
- **Notificaciones push** (navegador) opt-in, desactivables.
- Muchísimo del estado es **en tiempo real** (barra de vida de boss, presencia de usuarios, golpes
  recibidos en PvP, muertes de enemigos) — el diseño debe contemplar estados "vivos" y animados.

---

## 14. Otras áreas

- **Blog / guías**: artículos de entrenamiento y calistenia. **Leerlos sube Inteligencia (INT)**, o
  sea que leer es una mecánica de juego, no solo contenido. Lista de artículos, artículo individual,
  compartir, relacionados. También cumple función de SEO (páginas públicas).
- **Onboarding**: bienvenida, elección de tipo de usuario (meta vs registro libre), explicación de la
  misión, el daño, la armería, la conexión social.
- **Autenticación**: login/registro con email+contraseña o con Google. Sesión que puede expirar.
- **Ajustes de perfil**: nombre visible, avatar (subir imagen), objetivo diario, **privacidad**
  (perfil privado = oculto de rankings), historial de transacciones de monedas, **borrar cuenta**.
- **Sistema de referidos**: código propio, link de invitación (`/join?ref=…`), recompensa al referir.
- **Panel de admin** (solo administradores): gestión interna.
- **Páginas públicas de aterrizaje (landing / SEO)**: home comercial con hero, features, cómo
  funciona, FAQ, ranking en vivo, y contadores públicos de ejercicios (contador de dominadas,
  flexiones, fondos) que funcionan sin cuenta.

---

## 15. Resumen del "core loop" (para que el diseño lo refuerce)

1. El usuario entra → ve qué ha hecho la comunidad (feed) y su estado.
2. Va a entrenar → **registra reps** (acción rapidísima, se hace muchas veces al día).
3. Cada rep → XP, monedas, daño a boss/campaña/PvP, avance de misiones, sube atributos, mantiene racha.
4. Con lo ganado → tienda, ruleta, cofres, cosméticos, sube de nivel el personaje.
5. Compite → rankings, PvP, jefes, campaña.
6. Vuelve mañana para no perder la racha y seguir la progresión. Las notificaciones lo traen de vuelta.

**Prioridades emocionales que el diseño debería transmitir:** que registrar reps sea inmediato y
gratificante; que la racha se sienta valiosa; que el progreso (nivel, atributos, mapa de calor) se
vea claro; que el combate se sienta épico y "vivo"; que la identidad (avatar, títulos, cosméticos)
sea algo de lo que presumir.

---

*Fin del brief. Recuerda: no asumas la disposición actual — propón la estructura, navegación y
jerarquía visual que consideres mejor para estas capacidades.*
