FROM node:lts AS base
WORKDIR /app

# Install system dependencies required for Sharp
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files
COPY package.json pnpm-lock.yaml ./

FROM base AS build-deps
RUN pnpm install --frozen-lockfile

FROM build-deps AS build
COPY . .
RUN pnpm run build

FROM base AS runtime

# Install only production dependencies including Sharp
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

COPY --from=build /app/dist ./dist

ENV HOST=0.0.0.0
ENV PORT=4321
EXPOSE 4321
CMD ["node", "./dist/server/entry.mjs"]
