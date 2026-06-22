# Dockerfile for Genuin Webapp

## Stage 1: Base image with Node.js 20 and pnpm
FROM node:20.12.0-alpine AS base
WORKDIR /app

# Install dependencies required for builds
RUN apk add --no-cache libc6-compat python3 make g++
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@8.15.3 --activate

# ── Dependency layer (cached until package files change) ──────────────────────
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
COPY package.json ./
COPY apps/webapp/package.json ./apps/webapp/

COPY packages/ui/ ./packages/ui/
COPY packages/components/ ./packages/components/
COPY packages/eslint-config/ ./packages/eslint-config/
COPY packages/tailwind-config/ ./packages/tailwind-config/
COPY packages/typescript-config/ ./packages/typescript-config/
COPY scripts/ ./scripts/

# This layer is cached as long as pnpm-lock.yaml doesn't change
RUN pnpm install --frozen-lockfile

# ── Source layer (cache busts when source changes) ────────────────────────────
COPY . .

# Disable telemetry — avoids network call during build
ENV NEXT_TELEMETRY_DISABLED=1

# ── Build with secret — env file never baked into any layer ──────────────────
# Secret is mounted at /run/secrets/env_file only during this RUN step
# It is NOT stored in the image, NOT visible in docker history, NOT in logs
RUN --mount=type=secret,id=env_file,target=apps/webapp/.env.production.local \
    pnpm --filter @genuin/webapp run build

## Stage 2: Runner ─────────────────────────────────────────────────────────────
FROM node:20.12.0-alpine AS runner

ENV NODE_ENV=production
ENV PORT=4000
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=base --chown=nextjs:nodejs /app/apps/webapp/.next/standalone /apps/standalone
COPY --from=base --chown=nextjs:nodejs /app/apps/webapp/.next/static/ /apps/standalone/apps/webapp/.next/static/
COPY --from=base --chown=nextjs:nodejs /app/apps/webapp/public/ /apps/standalone/apps/webapp/public/

USER nextjs
EXPOSE 4000
CMD ["node", "/apps/standalone/apps/webapp/server.js"]