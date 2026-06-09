# archive/ — scripts históricos de un solo uso

Estos scripts ya cumplieron su función (migraciones aplicadas, fixes de datos
puntuales, seeds, debug, asignación de iconos, rebalanceos…). **No forman parte
de la app en ejecución** — ningún módulo vivo (alcanzable desde `index.js`) los
importa. Se conservan aquí como referencia histórica; siguen en el historial de
git de todos modos.

Si alguna vez necesitas re-ejecutar uno, ten en cuenta que sus imports relativos
asumen que vive en `backend/` (p. ej. `./db.js`); desde `archive/` habría que
ajustarlos a `../db.js`.

Para cambios de esquema nuevos, **no** crees otro script suelto aquí: usa el
sistema de migraciones ordenadas (Track 3 del plan de refinamiento).
