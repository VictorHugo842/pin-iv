# 1) base: sistema e libs necessárias
FROM node:20-bullseye AS base

# Instala certificados e ferramentas básicas
RUN apt-get update && apt-get install -y ca-certificates curl git && rm -rf /var/lib/apt/lists/*


WORKDIR /app

# 2) dev: ambiente de desenvolvimento com hot‑reload
FROM base AS dev

COPY package.json package-lock.json ./

# Limpa cache antiga e node_modules
RUN rm -rf node_modules && npm cache clean --force

RUN npm install

COPY . .

EXPOSE 3000
CMD ["npm", "run", "dev"]

# 3) prod: build e serve o app com Next.js
FROM base AS prod

COPY package.json package-lock.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
