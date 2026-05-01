# Plan de Implementación: Dashboard Dual y Planes Estructurados de Calistenia

Este plan detalla los cambios solicitados para ofrecer una experiencia de usuario dividida según el caso de uso del usuario: seguir el rendimiento o seguir un plan de entrenamiento estructurado.

## Objetivos del Plan

### 1. Onboarding Premium Dual
- En el primer paso del onboarding, el usuario elige su modo de uso:
  - **A. Medir mi Rendimiento (Tracker clásico)**.
  - **B. Lograr un objetivo (Plan estructurado)**.
- **Flujo Opción A**: Seleccionar ejercicio favorito, registrar su baseline, y pasar al Dashboard clásico.
- **Flujo Opción B**: Elige un plan estructurado por objetivos:
  - **Mi primera dominada**: Plan de 21 días para conseguir la primera dominada.
  - **Mis primeras 10 dominadas**: Plan de 14 días.
  - **Mis primeras 20 flexiones**: Plan de 14 días.
  - **Primer Muscle-Up**: Plan de 30 días.
  - **Primeros 5 fondos**: Plan de 14 días.

---

### 2. Dos Modos de Vista de Dashboard
- **Modo Tracker Clásico**: El panel tal y como está hoy (heatmap, misiones genéricas, registro rápido).
- **Modo Plan Estructurado**: Una vista de aplicación de entrenamiento clásica (con rutinas guiadas, explicación paso a paso, barra de progreso del plan y botón para abandonar el plan).
- Las misiones diarias en el Dashboard se sustituyen por las rutinas del plan activo.
- Al completar una rutina pautada del plan estructurado, el entrenamiento se publicará automáticamente en el **muro social**.
- **Privacidad**: El usuario podrá poner en privado su perfil desde los ajustes para evitar que se publiquen automáticamente o se vean.

---

### 3. Redirección Post-Login/Post-Signup a Dashboard
- Redirección de `/` a `/:lang/dashboard` y actualización de los botones en `Login.vue` que redirigían a `/social`.

---

### 4. Actualización del Blog y Vínculos de Confianza
- Cada plan mostrará un enlace a una guía para darle confianza y motivación al usuario. Crearemos un artículo o post relevante para la primera dominada.

---

## Plan de Verificación

### Pruebas Manuales
1. Validar la redirección tras login al Dashboard.
2. Comprobar el onboarding dual:
   - Seleccionar la opción A y verificar la visualización del Dashboard clásico.
   - Seleccionar la opción B, activar un plan (p.ej., *Mi primera dominada*), y comprobar el cambio a la vista de entrenamiento estructurado.
3. Completar el entrenamiento del plan activo y verificar que se publica en el muro social automáticamente.
4. Abandonar el plan para volver al Dashboard clásico.
