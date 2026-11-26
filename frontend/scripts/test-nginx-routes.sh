#!/usr/bin/env bash
# Levanta nginx:alpine con el build SSG (frontend/dist) y frontend/nginx.conf y
# comprueba los códigos HTTP de rutas clave: páginas pre-renderizadas (200),
# rutas SPA dinámicas (200), redirecciones SEO (301) y URLs inexistentes (404,
# no soft 404). Uso (desde frontend/, tras `vite-ssg build`):
#   bash scripts/test-nginx-routes.sh
set -euo pipefail

PORT="${PORT:-8089}"
NAME="reppy-nginx-test"
HERE="$(cd "$(dirname "$0")/.." && pwd)"

docker rm -f "$NAME" >/dev/null 2>&1 || true
docker run -d --name "$NAME" -p "$PORT:80" \
  -v "$HERE/dist:/usr/share/nginx/html:ro" \
  -v "$HERE/nginx.conf:/etc/nginx/conf.d/default.conf:ro" \
  nginx:alpine >/dev/null
trap 'docker rm -f "$NAME" >/dev/null 2>&1 || true' EXIT

docker exec "$NAME" nginx -t

for _ in $(seq 1 20); do
  curl -s -o /dev/null "http://localhost:$PORT/es" && break
  sleep 0.5
done

fail=0
check() { # check <ruta> <código> [Location esperado]
  local path="$1" want="$2" want_loc="${3:-}"
  local out code loc
  out=$(curl -s -o /dev/null -w '%{http_code} %header{location}' "http://localhost:$PORT$path")
  code="${out%% *}"; loc="${out#* }"
  if [[ "$code" != "$want" ]] || [[ -n "$want_loc" && "$loc" != "$want_loc" ]]; then
    echo "FAIL $path → $code $loc (esperado $want $want_loc)"; fail=1
  else
    echo "ok   $path → $code $loc"
  fi
}

# Pre-renderizadas
check /es 200
check /en 200
check /es/contador-dominadas 200
check /en/pull-up-counter 200
check /es/blog 200
check /en/blog/calisthenics-beginner-manual 200
check /es/blog/manual-inicio-calistenia 200
check /robots.txt 200
check /sitemap.xml 200

# SPA dinámicas (F5 dentro de la app no puede dar 404)
check /es/dashboard 200
check /en/campana/batalla 200
check /es/profile/123 200
check /en/pvp/abc 200
check /es/atleta/usuario-no-prerenderizado 200
check /en/athlete/usuario-no-prerenderizado 200
check /join 200
check /social 200

# Redirecciones SEO
check / 301 /es
check /en/contador-dominadas 301 /en/pull-up-counter
check /es/pull-up-counter 301 /es/contador-dominadas
check /en/reppy-vs-otras-apps-calistenia 301 /en/reppy-vs-calisthenics-apps
check /es/free-rpg-pull-up-counter 301 /en/free-rpg-pull-up-counter
check /en/atleta/pepe 301 /en/athlete/pepe
check /es/athlete/pepe 301 /es/atleta/pepe
check /es/contador-dominadas/ 301 /es/contador-dominadas
check /en/blog/Manual 301 /en/blog/calisthenics-beginner-manual
check /en/blog/guia-recompensas-cofres-bosses 301 /en/blog/chests-bosses-rewards-guide

# 404 reales (antes: 200 con la home ES)
check /en/esto-no-existe 404
check /es/blog/slug-que-no-existe 404
check /cualquier/cosa 404
check /assets/no-existe.js 404

exit $fail
