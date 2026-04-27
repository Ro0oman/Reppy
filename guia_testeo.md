# Guía de Testeo - Reppy

Esta guía te explica cómo ejecutar los tests automatizados que hemos configurado y cómo realizar pruebas manuales seguras.

## 1. Tests Automatizados (Playwright)

Hemos configurado **Playwright** para simular un usuario real, loguear ejercicios, equipar items y verificar el daño.

### Cómo ejecutarlos:
1. Asegúrate de que tanto el **backend** como el **frontend** estén corriendo (`npm run dev` en ambas carpetas).
2. En una nueva terminal, en la raíz del proyecto, ejecuta:
   ```powershell
   npx playwright test
   ```
3. Si quieres ver el test en acción (abriendo el navegador), ejecuta:
   ```powershell
   npx playwright test --headed
   ```
4. Al finalizar, verás un reporte en HTML:
   ```powershell
   npx playwright show-report
   ```

## 2. Limpieza de Datos de Prueba

Después de los tests, es importante limpiar los usuarios de prueba y **revertir su daño al Boss**. He creado un script específico para esto.

### Cómo limpiar:
En la carpeta `backend`, ejecuta:
```powershell
node scripts/cleanup_test_users.js
```
Este script:
- Busca usuarios que empiecen con `TEST_USER_`.
- Reclama su daño al Boss (devolviendo el HP al Boss actual).
- Borra los registros de reps y el perfil del usuario.

## 3. Testeo Manual Seguro

Si quieres probar algo manualmente sin afectar permanentemente el juego:

1. **Crea un usuario** con un nombre que empiece por `TEST_USER_` (ej. `TEST_USER_ROMA`).
2. **Realiza tus pruebas**: Loguea reps, compra items, etc.
3. **Verifica el Daño**: Observa si los números coinciden con lo esperado.
4. **Limpia**: Ejecuta el script de limpieza mencionado arriba para que el daño al Boss sea revertido.

## 4. Endpoints de Utilidad (Modo Test)

He habilitado una "puerta trasera" para tests en el backend (solo activa en desarrollo). Puedes usarla desde la consola del navegador (`F12`) mientras estás logueado:

### Darte Monedas:
```javascript
fetch('/api/test/add-coins', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
  body: JSON.stringify({ amount: 5000 })
});
```

### Darte un Item específico:
```javascript
fetch('/api/test/add-item', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
  body: JSON.stringify({ itemName: 'Espada de Dragón' })
});
```

> [!IMPORTANT]
> Recuerda ejecutar siempre el script de limpieza `cleanup_test_users.js` después de tus sesiones de testeo para mantener la salud del Boss real.
