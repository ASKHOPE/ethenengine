# Production Dockerfile powered by Bun Runtime
FROM oven/bun:1-alpine AS builder
WORKDIR /app
COPY package.json tsconfig*.json ./
RUN bun install --frozen-lockfile || bun install
COPY src ./src
COPY public ./public
RUN bun build src/index.ts --target=bun --outfile=dist/index.js

FROM oven/bun:1-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY package.json ./
RUN bun install --production
COPY public ./public
COPY src ./src

EXPOSE 3000
CMD ["bun", "run", "src/index.ts"]
