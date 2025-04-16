# ## Only use this dockerfile after npm run build command.

# FROM node:18.17.0

# WORKDIR /genuin-webapp-qa

# COPY  . ./.

# # Install project dependencies
# RUN npm install
# RUN npm i sharp

# RUN npm run build

# EXPOSE 4000

# ENV PORT=4000

# CMD [ "npm", "start" ]

FROM node:18.17.0 AS deps

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --omit=dev --ignore-scripts \
    && npm install sharp

FROM node:18.17.0 AS base

WORKDIR /app

ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules

COPY . .

RUN npm run build && rm -rf .next/cache

FROM node:18.17.0-alpine AS production

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=base --chown=nextjs:nodejs /app/public ./public
COPY --from=base --chown=nextjs:nodejs /app/.next ./.next
COPY --from=base --chown=nextjs:nodejs /app/package.json /app/package.json
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules

# This is prevent next to collect anonymous telemetry data
ENV NEXT_TELEMETRY_DISABLED=1 \
    PORT=4000 \
    NODE_ENV=production

# Expose the port
EXPOSE 4000

CMD ["npm", "start"]