# Multi-stage build for TanStack Start (Nitro) app — produces a small final image
# so it fits on disk-constrained servers.

# ---- Build stage ----
FROM oven/bun:1 AS build
WORKDIR /app

# Install dependencies (Bun lockfile is the source of truth for this Lovable project)
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy the rest of the source and build
COPY . .
# Force Nitro to emit a Node server (.output/server/index.mjs) instead of the
# default cloudflare target used by @lovable.dev/vite-tanstack-config.
ENV NITRO_PRESET=node-server
ENV SERVER_PRESET=node-server
RUN bun run build

# ---- Runtime stage ----
FROM node:22-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Only copy the built server output — keeps the final image tiny.
COPY --from=build /app/.output ./.output

EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
