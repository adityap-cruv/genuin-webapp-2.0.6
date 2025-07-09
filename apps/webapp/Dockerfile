# Dockerfile for Genuin Webapp

## Stage 1: Base image with Node.js 20 and pnpm
FROM node:20.12.0-alpine AS base
WORKDIR /app

# Install dependencies required for builds
RUN apk add --no-cache libc6-compat python3 make g++
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@8.15.3 --activate

# Copy package files and full local dependency sources for caching
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
COPY package.json ./
COPY apps/webapp/package.json ./apps/webapp/

# Copy the entire ui and components packages
COPY packages/ui/ ./packages/ui/
COPY packages/components/ ./packages/components/

COPY packages/eslint-config/ ./packages/eslint-config/
COPY packages/tailwind-config/ ./packages/tailwind-config/
COPY packages/typescript-config/ ./packages/typescript-config/
# Note: If 'packages/utils' exists and is a dependency, uncomment the next line
# COPY packages/utils/ ./packages/utils/

# Install ALL dependencies for the entire monorepo to ensure build steps in packages work
# We will prune them later for the runner stage.
RUN pnpm install --frozen-lockfile

# Copy all source files
# Ensure .dockerignore is properly configured to exclude unnecessary files
COPY . .

ARG HOST_NAME
ARG NEXT_PUBLIC_AES_IV
ARG NEXT_PUBLIC_AES_KEY
ARG AUTH_SECRET
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_HOST_URL
ARG NEXT_PUBLIC_RUDDERSTACK_KEY
ARG NEXT_PUBLIC_RUDDERSTACK_URL
ARG GA_MEASUREMENT_ID
ARG NEXT_PUBLIC_RECAPTCHA_CLIENT_KEY
ARG NEXT_PUBLIC_SECRET_STRING
ARG NEXT_PUBLIC_CURRENT_ENV
ARG ONETRUST_KEY
ARG NEXTAUTH_SECRET
ARG NEXT_PUBLIC_BCC_URL
ARG NEXT_PUBLIC_GO_API_URL
ARG NEXT_PUBLIC_REDIRECT_URI
ARG NEXT_PUBLIC_MEDIA_BASE_URL

ENV HOST_NAME=$HOST_NAME
ENV NEXT_PUBLIC_AES_IV=$NEXT_PUBLIC_AES_IV
ENV NEXT_PUBLIC_AES_KEY=$NEXT_PUBLIC_AES_KEY
ENV AUTH_SECRET=$AUTH_SECRET
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_HOST_URL=$NEXT_PUBLIC_HOST_URL
ENV NEXT_PUBLIC_RUDDERSTACK_KEY=$NEXT_PUBLIC_RUDDERSTACK_KEY
ENV NEXT_PUBLIC_RUDDERSTACK_URL=$NEXT_PUBLIC_RUDDERSTACK_URL
ENV GA_MEASUREMENT_ID=$GA_MEASUREMENT_ID
ENV NEXT_PUBLIC_RECAPTCHA_CLIENT_KEY=$NEXT_PUBLIC_RECAPTCHA_CLIENT_KEY
ENV NEXT_PUBLIC_SECRET_STRING=$NEXT_PUBLIC_SECRET_STRING
ENV NEXT_PUBLIC_CURRENT_ENV=$NEXT_PUBLIC_CURRENT_ENV
ENV ONETRUST_KEY=$ONETRUST_KEY
ENV NEXTAUTH_SECRET=$NEXTAUTH_SECRET
ENV NEXT_PUBLIC_BCC_URL=$NEXT_PUBLIC_BCC_URL
ENV NEXT_PUBLIC_GO_API_URL=$NEXT_PUBLIC_GO_API_URL
ENV NEXT_PUBLIC_REDIRECT_URI=$NEXT_PUBLIC_REDIRECT_URI
ENV NEXT_PUBLIC_MEDIA_BASE_URL=$NEXT_PUBLIC_MEDIA_BASE_URL

# Build the application
# The output: 'standalone' option in next.config.js will create a .next/standalone directory
RUN pnpm --filter @genuin/webapp run build

## Stage 2: Runner
FROM node:20.12.0-alpine AS runner

# No need to install pnpm here for standalone output, server.js is used.

# Set to production environment
ENV NODE_ENV=production
# Default port, can be overridden by NEXT_PUBLIC_PORT or PORT env var
ENV PORT=4000

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy the standalone output. This includes server.js, node_modules,
# and app-specific files, but NOT static assets or public files.
COPY --from=base --chown=nextjs:nodejs /app/apps/webapp/.next/standalone /apps/standalone

# Copy static assets from .next/static to the correct location
# This is critical for serving CSS, JS bundles, and other static assets
COPY --from=base --chown=nextjs:nodejs /app/apps/webapp/.next/static/ /apps/standalone/apps/webapp/.next/static/

# Copy public folder for static files (images, fonts, etc.)
COPY --from=base --chown=nextjs:nodejs /app/apps/webapp/public/ /apps/standalone/apps/webapp/public/
# Set proper permissions
USER nextjs

EXPOSE 4000
# Start the Next.js application using the server.js from standalone output
# Adjusted path assuming server.js is within an 'apps/webapp' subdirectory inside the standalone output.
CMD ["node", "/apps/standalone/apps/webapp/server.js"]