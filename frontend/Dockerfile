# Frontend de Reppy — build con vite-ssg y servido estático con nginx.
# IMPORTANTE: el contexto de build debe ser la RAÍZ del repo (no /frontend),
# porque `sync-blog` copia backend/blogData.json durante el build.
# En Coolify: Base Directory = /  y  Dockerfile Location = /frontend/Dockerfile

# ---- Stage 1: build ----
FROM node:22 AS build
WORKDIR /app

# Instalamos dependencias del monorepo (workspaces). Necesitamos devDependencies
# (vite, vite-ssg, tailwind, resvg...) así que NO usamos --omit=dev.
COPY package.json package-lock.json ./
COPY frontend/package.json frontend/package.json
COPY backend/package.json backend/package.json
RUN npm install --no-audit --no-fund

# Copiamos el resto del repo (incluye backend/blogData.json para sync-blog).
COPY . .

# El script build de la raíz hace `cd frontend && npm run build` (vite-ssg + SEO).
RUN npm run build

# ---- Stage 2: serve ----
FROM nginx:alpine
COPY --from=build /app/frontend/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
