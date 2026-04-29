# 📋 Reppy: Major Deployment & QA Checklist

Este documento detalla todas las pruebas críticas que deben realizarse antes de un **Major Deployment** para asegurar que la mecánica base de Reppy siga funcionando correctamente.

---

## 🔐 1. Autenticación y Onboarding
El flujo de entrada es vital. Si falla, perdemos usuarios.

- [ ] **Registro Manual**: Crear una cuenta desde cero con nombre, email y contraseña.
- [ ] **Registro Duplicado**: Intentar registrarse con un email ya existente (debe dar error controlado).
- [ ] **Login Manual**: Cerrar sesión e ingresar de nuevo con las credenciales creadas.
- [ ] **Google Login**: Verificar que el login social funciona y vincula correctamente el perfil.
- [ ] **Persistencia**: Refrescar la página (`F5`) y verificar que la sesión se mantiene activa.

## 📊 2. Dashboard y Loop de Juego
La funcionalidad principal: registrar ejercicio y ver el impacto.

- [ ] **Selector de Ejercicios**: Cambiar entre Dominadas, Flexiones, Fondos, etc. Verificar que la UI se ajusta.
- [ ] **Logueo de Reps**:
    - [ ] Registrar reps estándar (ej. 10 pullups).
    - [ ] Registrar reps con lastre (verificar que el peso adicional se guarda).
- [ ] **Cálculo de Daño (Preview)**: Verificar que al poner un número, el indicador de "Impacto Estimado" cambia según el equipo actual.
- [ ] **Feedback Visual**: Verificar que aparece el "Toast" de confirmación y suena el efecto de golpe.
- [ ] **Actualización de Stats**: El círculo de progreso diario y el total de reps deben actualizarse inmediatamente.
- [ ] **Boss HP**: Verificar que el HP del Boss actual baja tras registrar el ejercicio.

## ⚔️ 3. Armería e Inventario (RPG Core)
El sistema de progresión y personalización.

- [ ] **Tienda (Nexus Shop)**:
    - [ ] Comprar un item (Bordes, Títulos, Armas). Verificar que las monedas se deducen correctamente.
    - [ ] **Packs (Bundles)**: Comprar un pack/bundle y verificar que todos los items incluidos se añaden al inventario correctamente.
    - [ ] Intentar comprar algo sin dinero (debe mostrar error de fondos).
- [ ] **Cofres (Recompensas)**:
    - [ ] **Cofres de Nivel**: Recibir un cofre de nivel (vía API o subiendo de nivel) y verificar la animación de apertura y el loot.
    - [ ] **Cofres de Boss**: Recibir un cofre de Boss y verificar que los items se añaden al inventario.
- [ ] **Inventario (Armería)**:
    - [ ] **Enlazar (Equipar)**: Activar un arma o armadura. Verificar que el texto de la base de stats en el Dashboard sube.
    - [ ] **Desvincular**: Quitarse equipo y verificar que los stats bajan.
    - [ ] **Consumibles**: Activar una poción. Verificar que el temporizador aparece en el Dashboard y el multiplicador de daño se aplica.
- [ ] **Personalización**: Cambiar Título, Marco y Avatar. Verificar que se ven reflejados en el Header.

## 📱 4. Feed Social y Comunidad
La interacción entre usuarios.

- [ ] **Publicación Automática**: Tras loguear una serie, debe aparecer un nuevo post en el Social Feed.
- [ ] **Interacción**:
    - [ ] Dar "Cheer" (Ánimo) a un post.
    - [ ] Escribir un comentario y verificar que aparece.
- [ ] **Privacidad**: Poner el perfil en "Privado" en ajustes y verificar que los nuevos posts no aparecen en el Global Feed (si aplica).
- [ ] **Rankings**: Entrar al Leaderboard y verificar que la posición es coherente con las reps totales.

## 📈 5. Analíticas y Persistencia
Datos históricos del usuario.

- [ ] **Heatmap**: Verificar que los cuadros de actividad se pintan en el color correcto según el volumen.
- [ ] **Historial de Actividad**:
    - [ ] Editar una entrada antigua y verificar que el cambio persiste.
    - [ ] Eliminar una entrada y verificar que el total de reps del Dashboard se recalcula.
- [ ] **Sincronización de Niveles**: Verificar que al ganar XP, la barra de nivel del Header progresa.

## 🛠️ 6. Performance y UX Final
- [ ] **Responsividad**: Abrir la web en modo móvil (iPhone SE/iPhone 12) y verificar que no hay "overflow" horizontal.
- [ ] **Modales de Bienvenida**: Verificar que los modales de actualización (Overhaul) solo aparecen la primera vez que se entra tras el despliegue.
- [ ] **Audio**: Activar/Desactivar sonido en el perfil y probar si se respeta la preferencia.

---

## 🚀 Proceso de Despliegue Recomendado (Checklist de Dev)

1. **Staging Check**: Desplegar en una rama de preview (Vercel/Neon preview branches).
2. **Smoke Test**: Ejecutar `npx playwright test` en el entorno de staging.
3. **DB Migration**: Si hay cambios en el esquema, ejecutar los `ALTER TABLE` necesarios en la DB de producción ANTES de desplegar el código.
4. **Deploy a Producción**.
5. **Post-Deploy Sanity Check**: Realizar el registro de un `TEST_USER_PROD` manual para verificar que el flujo completo en vivo no tiene fallos críticos.
6. **Cleanup**: Ejecutar `node scripts/cleanup_test_users.js` conectando a la DB de producción para eliminar rastro de las pruebas de Sanity.
