FROM node:lts AS base

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@11.1.2 --activate

# By copying only the package manager manifests here, the deps steps are cached
# unless dependencies or install policy change.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

FROM base AS build-deps
RUN pnpm install --frozen-lockfile

FROM build-deps AS build
COPY . .
RUN pnpm run build

FROM nginx:alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
