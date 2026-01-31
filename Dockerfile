FROM node:lts AS base

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

# By copying only the package.json and pnpm-lock.yaml here, the deps steps are
# cached unless dependencies change.
COPY package.json pnpm-lock.yaml ./

FROM base AS build-deps
RUN pnpm install --frozen-lockfile

FROM build-deps AS build
COPY . .
RUN pnpm run build

FROM nginx:alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
