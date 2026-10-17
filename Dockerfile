FROM node:22-alpine AS base

# ── Install app deps ───────────────────────────────
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# ── Install migration script deps ─────────────────
FROM base AS script-deps
WORKDIR /app/scripts
COPY scripts/package.json scripts/yarn.lock* ./
RUN yarn install --production --frozen-lockfile

# ── Build ─────────────────────────────────────────
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN yarn run build

# ── Production runner ─────────────────────────────
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Migration runner and SQL files
COPY --from=script-deps --chown=nextjs:nodejs /app/scripts/node_modules ./scripts/node_modules
COPY --chown=nextjs:nodejs scripts/migrate.js ./scripts/migrate.js
COPY --chown=nextjs:nodejs supabase/migrations/ ./supabase/migrations/
COPY --chown=nextjs:nodejs certs/ ./certs/

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
