# Backend de Reppy — imagen Node estándar (Debian).
# Usamos node:22 (no slim) porque sharp trae libvips prebuilt y aquí instala sin problemas.
FROM node:22

# libvips/sharp funcionan con los binarios prebuilt que trae sharp; no hace falta compilar.
WORKDIR /app

# Instalamos dependencias primero para aprovechar la cache de capas de Docker.
# No hay package-lock.json propio del backend (monorepo), así que usamos npm install.
COPY package.json ./
RUN npm install --omit=dev --no-audit --no-fund

# Copiamos el resto del código del backend.
COPY . .

ENV NODE_ENV=production
ENV PORT=5001
EXPOSE 5001

CMD ["node", "index.js"]
