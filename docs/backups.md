# Backups de la base de datos

Estado a 2026-10-04: no hay backup automático, cifrado ni restauración probada. El único script
(`backup_db.js`, ya retirado) volcaba 7 tablas de 55 dentro del repo. Este documento es la propuesta;
**la puesta en marcha es de Roman**.

## 1. Qué se usa

| Herramienta | Para qué |
|---|---|
| `pg_dump -Fc` | Backup principal en producción: completo, comprimido y restaurable con `pg_restore`. |
| `backend/scripts/backup_full.mjs` | Respaldo portable (JSON por tabla + `_schema.json`) cuando no hay `pg_dump`. Exige `BACKUP_DIR` fuera del repo. |

Los volcados contienen emails, hashes de contraseña y tokens cifrados de Hevy. **Nunca dentro del repo,
nunca en una PR.** `backend/backups/` está en `.gitignore`.

## 2. Automatización propuesta (diaria, con retención)

Opción recomendada: Coolify → *Databases* → la instancia de Postgres → **Backups** → programación
diaria (p. ej. `0 4 * * *`), con S3 compatible como destino (Backblaze B2, Cloudflare R2 o similar).
Coolify ya hace `pg_dump` y gestiona la retención (configurar: 7 diarios + 4 semanales + 6 mensuales).

Si la base no está gestionada por Coolify, tarea programada en el servidor:

```bash
# /etc/cron.d/reppy-backup — cada día a las 04:00
0 4 * * * root pg_dump -Fc "$DATABASE_URL" | age -r "$AGE_PUBLIC_KEY" > /var/backups/reppy/reppy-$(date +\%F).dump.age \
  && find /var/backups/reppy -name '*.dump.age' -mtime +30 -delete \
  && rclone copy /var/backups/reppy remote:reppy-backups --max-age 2d
```

- **Cifrado:** `age` con clave pública en el servidor; la clave privada vive solo en el gestor de
  contraseñas de Roman (si se pierde, los backups no se pueden abrir).
- **Copia fuera del servidor:** `rclone` a un bucket distinto del proveedor de la base.
- **Aviso de fallo:** que el cron avise (healthchecks.io o similar) si no hay volcado en 26 h.

## 3. Cómo probar una restauración (mensual)

Nunca contra producción. En una máquina con Postgres:

```bash
createdb reppy_restore_test
age -d -i clave-privada.txt reppy-AAAA-MM-DD.dump.age | pg_restore -d reppy_restore_test --no-owner
psql reppy_restore_test -c "SELECT count(*) FROM users;"
psql reppy_restore_test -c "SELECT count(*) FROM reps;"
dropdb reppy_restore_test
```

Dar por buena la restauración solo si los recuentos coinciden (±lo ocurrido desde el backup) con
`_manifest.json` o con las consultas equivalentes en producción. Anotar fecha y resultado aquí.

| Fecha | Backup probado | Resultado |
|---|---|---|
| — | — | Sin simulacro todavía |

## 4. Uso del script portable

```bash
cd backend
BACKUP_DIR=D:/Reppy-backups DATABASE_URL="postgres://..." node scripts/backup_full.mjs
```

Crea `D:/Reppy-backups/<timestamp>/` con un JSON por tabla, `_schema.json` y `_manifest.json`.
Sale con código 1 si alguna tabla falla. **Ojo con `DATABASE_URL`:** `db.js` carga `backend/.env`; si estás en
`backend/`, apunta a producción. Es lectura, pero hazlo a propósito.
