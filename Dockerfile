FROM node:22 AS base

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@11.1.2 --activate

# By copying only the package manager manifests here, the deps steps are cached
# unless dependencies or install policy change.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

FROM base AS build-deps
RUN pnpm install --frozen-lockfile

FROM build-deps AS build
COPY . .
ARG PUBLIC_POSTHOG_KEY
ARG PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
ARG INDEXNOW_REVISION=local
RUN pnpm run build

FROM nginx:alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx/redirects.conf /etc/nginx/conf.d/redirects.conf
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/generated/canonical-locations.conf /etc/nginx/canonical-locations.conf
RUN nginx -t

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
