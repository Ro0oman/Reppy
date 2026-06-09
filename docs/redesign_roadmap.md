# Plan de rediseno Reppy

Documento vivo para seguir el avance del rediseno orientado a uso diario, retencion y calidad percibida.

Ultima actualizacion: 2026-05-30

## Leyenda

- [x] Hecho y verificado
- [ ] Pendiente
- En cada fase, marcar el check cuando el cambio este implementado y validado en vivo.

## Estado actual

- [x] Fundamentos: sistema de tokens azul unificado, fondo calmado, tarjetas y botones base.
- [x] Glows naranjas sustituidos por el token visual nuevo.
- [x] Navegacion movil IA: dock core-loop con FAB central "Registrar".
- [x] Misiones visible en la navegacion principal.
- [x] Comercio movido a Perfil: Tienda e Inventario.
- [x] Cabecera movil mas baja.
- [x] Ruleta calmada.
- [x] Routing diario: abrir con sesion activa lleva a Comunidad.
- [x] Login o alta lleva a Dashboard.
- [x] Onboarding "al grano": usuario nuevo registra primera serie inmediatamente.
- [x] Modal de plan guiado diferido a una visita posterior.
- [x] Flujo verificado en vivo: usuario nuevo -> primera serie -> Dashboard sin modal de plan.
- [x] Feed: cabecera mas limpia con CTA Registrar.
- [x] Feed: tarjetas con jerarquia mejorada, nombre como titular, sin emojis y numeros mas nitidos.

## Fase A: Rematar el feed de Comunidad

Objetivo: que el feed enganche y se lea de un vistazo.

Archivo principal: `frontend/src/components/ActivityCard.vue`

- [x] A1. Quitar mayusculas y bajar densidad de los badges de ranking.
- [x] A1. Priorizar racha y rango global.
- [x] A1. Agrupar el resto de badges en un "+N" expandible.
- [x] A2. Acortar timestamp: pasar de `formatDistanceToNowStrict` largo a textos tipo "hace 14 h".
- [x] A3. Suavizar etiquetas de accion: "Ver build", "Retar", "Compartir" en caja normal y menor peso visual.
- [x] A4. Empty state del feed en espanol y acogedor en `frontend/src/components/SocialFeed.vue`.

Criterio de aceptacion:

- [x] Una tarjeta cabe en pantalla movil.
- [x] Se entiende quien hizo que en menos de 2 segundos.
- [x] No hay ruido de mayusculas.

## Fase B: Racha con aversion a la perdida

Objetivo: dar una razon emocional para volver cada dia.

- [x] B1. Subir la racha a protagonista en Dashboard.
- [x] B1. Subir la racha a protagonista en la cabecera de Comunidad.
- [x] B1. Mostrar numero de dias y estado, por ejemplo "en riesgo si no entrenas hoy".
- [x] B2. Estado "en riesgo": si hoy no hay registro y quedan menos de X horas, mostrar banner o indicador claro.
- [x] B3. Congelar racha gastando monedas, limitado a 1 uso por semana.
- [x] B3. Crear endpoint backend `/api/streak/freeze`.
- [x] B3. Anadir columna o modelo necesario para registrar congelaciones de racha.
- [x] B4. Microcelebracion al mantener racha con confeti sutil usando `canvas-confetti`.

Criterio de aceptacion:

- [x] El usuario ve claramente su racha.
- [x] El usuario entiende que pierde algo si no entrena.
- [x] El usuario puede proteger la racha con monedas.

Riesgo: medio, toca backend. Verificar con cuenta de prueba local.

## Fase C: Dashboard log-first y pulido

Objetivo: registrar comodo y que la pantalla respire.

Archivo principal: `frontend/src/components/Dashboard.vue`

- [x] C1. Reordenar Dashboard para que el registro quede arriba del todo.
- [x] C1. Mover el bloque real `ref="repsInputSection"`, no una copia.
- [x] C1. Verificar en vivo despues del cambio.
- [x] C2. Conectar el FAB "Registrar" con `?log=1`.
- [x] C2. Leer el query param y ejecutar `scrollToRepsInput`.
- [x] C2. Activar `highlightRepsInput` al aterrizar desde el FAB.
- [x] C3. Cambiar tipografia del titulo "PANEL" de italic/uppercase a caja normal.
- [x] C3. Limpiar tipografia de cabeceras de seccion.
- [x] C4. Revisar orden final: header -> registro -> objetivo diario/racha -> boss -> heatmap/historial.

Criterio de aceptacion:

- [x] Un usuario recurrente registra en 2 toques o menos desde que abre.
- [x] No hay que hacer scroll para encontrar el input de registro.

## Fase D: Notificaciones push con proposito

Objetivo: que los usuarios vuelvan sin depender de la memoria.

- [x] D1. Push de racha en riesgo.
- [ ] D1. Push cuando alguien te supera o te reta.
- [ ] D1. Push cuando un amigo entrena.
- [ ] D1. Push de boss nuevo o a punto de caer.
- [x] D2. Pedir permiso de push despues de la primera racha o registro, no al entrar.
- [ ] D3. Backend: jobs o triggers para cada evento.
- [x] D3. Empezar por cron diario de racha en riesgo.

Criterio de aceptacion:

- [ ] Llega un push real en cada uno de los 4 casos.

## Fase E: Modulos de FOMO en el feed

Objetivo: reforzar el enganche social.

- [ ] E1. Banda superior en Comunidad: "Marcos te supero esta semana - vas 2o".
- [ ] E1. CTA de la banda hacia registrar.
- [ ] E1. Mostrar "N entrenando ahora" usando `LivePresence` si encaja.
- [ ] E2. Reacciones rapidas, no solo like.
- [ ] E3. Resaltar cambios de ranking de amigos.
- [ ] E3. Resaltar PRs de amigos.
- [ ] E4. Endpoint para devolver quien te supero y tu posicion.

Criterio de aceptacion:

- [ ] El feed comunica algo que el usuario siente que no quiere perderse.

## Fase F: Pase de consistencia visual clean/sporty

Objetivo: que Reppy se sienta coherente y de calidad.

- [ ] F1. Quitar sistematicamente `italic + uppercase + font-black` por defecto en titulos.
- [ ] F1. Revisar Profile.
- [ ] F1. Revisar Shop.
- [ ] F1. Revisar Inventory.
- [ ] F1. Revisar Missions.
- [ ] F1. Revisar Codex.
- [ ] F2. Unificar radios a una escala nueva de 16 a 20 px.
- [ ] F2. Reducir mezcla de `rounded-[3rem]`, `rounded-[2.5rem]` y `rounded-[2rem]`.
- [ ] F3. Unificar microinteracciones de registro.
- [ ] F3. Unificar feedback de subida de nivel.
- [ ] F3. Unificar feedback de dano al boss.
- [ ] F4. Revisar mezcla espanol/ingles en strings de UI.
- [ ] F4. Decidir tono de copys como "SINCRONIZA CON LA ELITE".

## Fase G: Rendimiento movil

Objetivo: fluidez en redes lentas y moviles modestos.

- [ ] G1. Trocear componentes monoliticos.
- [ ] G1. Revisar `Inventory` por tamano.
- [ ] G1. Revisar `Shop` por tamano.
- [ ] G1. Revisar `ActivityCard` por tamano.
- [ ] G2. Auditar coste de `backdrop-blur`.
- [ ] G2. Auditar animaciones infinitas.
- [ ] G3. Revisar tamano de bundle de la landing y confirmar lazy loading.

## Fase H: Instrumentacion de metricas

Objetivo: medir activacion y retencion.

Referencia: `NORTH_STAR_METRICS.md`

- [ ] H1. Disparar evento `activation.first_rep_logged`.
- [ ] H1. Disparar evento `quickstart_seen`.
- [ ] H1. Disparar evento `quickstart_completed`.
- [ ] H1. Disparar eventos `retention.return_*`.
- [ ] H2. Crear cuadro minimo de Activacion, D1 y D7.

Nota: sin esto, se optimiza a ciegas.

## Fase I: Limpieza y deuda tecnica

- [ ] I1. Borrar cuentas de prueba locales `redesign_test_*@test.local`.
- [ ] I1. Borrar cuentas de prueba locales `algrano_*@test.local`.
- [ ] I2. Revisar bug latente en `Profile.vue`: import `Swentry` de lucide no existe.
- [ ] I3. Quitar imports o efectos muertos del migrador de tema antiguo.
- [ ] I3. Revisar `theme_migrator.py`.
- [ ] I3. Revisar restos de azul/naranja antiguos.

## Orden recomendado por ROI en retencion

1. Fase A: cerrar feed.
2. Fase B: racha.
3. Fase C: Dashboard log-first.
4. Fase E y Fase D: FOMO social y push.
5. Fases F, G, H e I: consistencia, rendimiento, medicion y limpieza.

## Verificacion

Para cada cambio:

- [ ] Crear o reutilizar cuenta de prueba desechable.
- [ ] Navegar el preview en movil, idealmente 375 x 812.
- [ ] Validar el flujo con backend local.
- [ ] Capturar o revisar visualmente antes de marcar el check.
- [ ] Marcar el item como completado solo cuando este implementado y verificado.
