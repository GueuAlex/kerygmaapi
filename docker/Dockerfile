# ---- Base Node Image ----
  FROM node:20-alpine AS base

  WORKDIR /app
  
  # Install pnpm globally
  RUN npm install -g pnpm
  
  # ---- Development Dependencies ----
  FROM base AS dependencies
  COPY package.json pnpm-lock.yaml ./
  RUN pnpm install --frozen-lockfile
  
  # ---- Development Stage ----
  FROM dependencies AS development
  COPY . .
  EXPOSE 3000
  CMD ["pnpm", "start:dev"]
  
  # ---- Build Stage ----
  FROM dependencies AS build
  COPY . .
  RUN pnpm build
  
  # Vérifier que le build s'est bien passé
  RUN ls -la /app/dist && test -f /app/dist/main.js
  
  # ---- Production Stage ----
  FROM node:20-alpine AS production
  
  WORKDIR /app
  
  # Install pnpm and curl for healthcheck
  RUN npm install -g pnpm && apk add --no-cache curl
  
  # Copy package files
  COPY package.json pnpm-lock.yaml ./
  
  # Install production dependencies only
  RUN pnpm install --prod --frozen-lockfile
  
  # Copy built application
  COPY --from=build /app/dist ./dist
  
  # Copy environment template (will be overridden by docker-compose)
  COPY environments/prod/.env .env
  
  EXPOSE 3000
  
  # Healthcheck
  HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1
  
  CMD ["node", "dist/main.js"]