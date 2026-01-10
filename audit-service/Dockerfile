# ---------- Base ----------
FROM node:22-alpine AS base
WORKDIR /usr/src/app

# Prisma needs openssl on Alpine
RUN apk add --no-cache openssl

# ---------- Dependencies ----------
FROM base AS deps

# Copy manifest + lock file (adjust if you use yarn/pnpm)
COPY package.json package-lock.json ./

RUN npm ci

# ---------- Build ----------
FROM base AS build
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---------- Production Image ----------
FROM node:22-alpine AS prod
WORKDIR /usr/src/app
RUN apk add --no-cache openssl curl

COPY package.json ./
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist
COPY prisma ./prisma

ENV NODE_ENV=production
ENV SERVICE_NAME=audit-service

# Generate Prisma Client (in case it wasn't during build)
RUN npx prisma generate
COPY prisma/generated/libquery_engine-linux-musl-arm64-openssl-3.0.x.so.node dist/prisma/generated

# Run migrations on container start, then start Nest
CMD npx prisma migrate deploy && node dist/src/main.js