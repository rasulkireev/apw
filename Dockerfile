FROM node:20-bullseye AS build

WORKDIR /app

# Build Sharp from source if a prebuilt binary is unavailable.
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    pkg-config \
    libvips-dev \
    && rm -rf /var/lib/apt/lists/*

# Ensure install scripts run and deps are accessible.
ENV PNPM_CONFIG_IGNORE_SCRIPTS=false
ENV PNPM_CONFIG_SHAMEFULLY_HOIST=true
ENV npm_config_unsafe_perm=true

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm rebuild sharp
RUN pnpm run build

FROM nginx:alpine AS runtime

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
