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

FROM node:22-bookworm-slim AS runtime
RUN apt-get update && apt-get install -y --no-install-recommends nginx tini \
    && rm -rf /var/lib/apt/lists/* /etc/nginx/sites-enabled/default
WORKDIR /app
COPY --from=build /app/dist /app/dist
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/package.json /app/package.json
COPY --from=build /app/dist/client /usr/share/nginx/html
COPY nginx/redirects.conf /etc/nginx/conf.d/redirects.conf
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/generated/canonical-locations.conf /etc/nginx/canonical-locations.conf
COPY scripts/start-production.sh /app/start-production.sh
RUN nginx -t
ENV HOST=127.0.0.1 PORT=4321 NODE_ENV=production
EXPOSE 80
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["bash", "/app/start-production.sh"]
