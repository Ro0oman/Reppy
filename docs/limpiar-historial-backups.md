# Sacar `backend/backups/` del historial de git

`backend/backups/2026-04-22T14-07-06-053Z/users.json` (y otros) se versionó en un repo **público**.
Quitar la carpeta del árbol (#357) no la borra del historial: sigue en cualquier commit anterior,
en forks y en clones. **Lo hace Roman**, con el repo sin PR abiertas, porque reescribe todos los SHA.

> Además de reescribir, asume que los datos ya se copiaron. Ver el punto 5.

## 1. Preparación

1. Cerrar o fusionar todas las PR abiertas (sus SHA dejarán de existir).
2. Avisar a quien tenga clones o forks de que tendrán que volver a clonar.
3. Instalar la herramienta: `pip install git-filter-repo`.
4. Clon **nuevo y limpio** (filter-repo se niega a trabajar sobre un clon con historia de trabajo):

```bash
git clone git@github.com:Ro0oman/Reppy.git reppy-limpio
cd reppy-limpio
```

## 2. Reescritura

```bash
git filter-repo --invert-paths --path backend/backups/
```

Comprobar que ya no queda rastro:

```bash
git log --all --oneline -- backend/backups/ | wc -l     # debe ser 0
git rev-list --all --objects | grep backups/             # debe estar vacío
```

## 3. Subida (destructiva)

filter-repo elimina el remoto `origin`; hay que volver a añadirlo:

```bash
git remote add origin git@github.com:Ro0oman/Reppy.git
git push --force --all
git push --force --tags
```

Si `main` tiene protección de rama, desactivarla un momento para el force-push y reactivarla después.

## 4. Después

- Todos los clones antiguos (incluido el de trabajo) se borran y se vuelven a clonar. No hacer `pull`.
- Las ramas de PR cerradas o abiertas contra SHA antiguos quedan huérfanas.
- Coolify: comprobar que sigue desplegando (el commit de `main` ha cambiado).

## 5. Lo que la reescritura NO arregla

- GitHub conserva los commits antiguos accesibles por su SHA y en las vistas de PR. Pedir a **GitHub
  Support** que ejecute una limpieza (*remove cached views / garbage collection*) indicando el repo y
  los SHA afectados.
- Los forks y clones de terceros conservan los datos.
- Por eso, valorar: invalidar sesiones (subir `users.token_version` de todos), avisar a los usuarios
  afectados (emails y hashes de contraseña expuestos) y, si hay tokens de Hevy en los volcados,
  rotarlos o cambiar la clave con la que se cifran.

## 6. Incidente del 2026-10-04

Una rama de trabajo (`fix/b8-cosmeticos-items`) llegó a subir por error el volcado completo de
`backend/backups/2026-10-04…` a GitHub. La rama y la PR se cerraron, pero esos commits cuentan como
expuestos y entran en la limpieza del punto 5.
