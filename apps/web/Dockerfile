# syntax=docker/dockerfile:1

FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app

ARG API_BACKEND=route
ARG FASTAPI_BASE_URL=http://localhost:8000
ENV NEXT_TELEMETRY_DISABLED=1
ENV API_BACKEND=$API_BACKEND
ENV FASTAPI_BASE_URL=$FASTAPI_BASE_URL

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ARG API_BACKEND=route
ARG FASTAPI_BASE_URL=http://localhost:8000
ENV API_BACKEND=$API_BACKEND
ENV FASTAPI_BASE_URL=$FASTAPI_BASE_URL

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
