---
title: "OpenClaw with Docker: Simple, Repeatable Deployment Guide"
dateCreated: 2026-03-07
dateUpdated: 2026-03-07
icon: ./icons/lobster.svg
tags:
  - openclaw
  - docker
  - self-hosting
  - caprover
category: OpenClaw
type: tutorial
description: Deploy OpenClaw with Docker using a small custom Dockerfile, persistent volumes, and a WebSocket-ready proxy. Focused on deployment only.
---

This guide is **deployment-only**.

No model setup walkthrough, no channel setup walkthrough — just what you need to reliably deploy and access OpenClaw.

## 0) What matters most

If you only remember 6 things, remember these:

1. Build a tiny custom Dockerfile from a pinned OpenClaw release image.
2. Use persistent storage for `/home/node/.openclaw` and `/home/node/.openclaw/workspace`.
3. Start with: `node /app/dist/index.js gateway --bind lan`.
4. Put OpenClaw behind a proxy with **WebSocket upgrade headers** enabled.
5. Set `controlUi.allowedOrigins` correctly in `openclaw.json`.
6. After deploy, open **Overview** and save your gateway token; if needed run `openclaw devices list`.

---

## 1) Create a small custom Dockerfile first

Use a pinned release tag from:

- <https://github.com/openclaw/openclaw/releases>

Create `Dockerfile`:

```dockerfile
FROM ghcr.io/openclaw/openclaw:2026.3.2

USER root

# Ensure `openclaw` command exists consistently in your custom image
RUN printf '#!/usr/bin/env sh\nexec node /app/dist/index.js "$@"\n' > /usr/local/bin/openclaw \
 && chmod +x /usr/local/bin/openclaw

CMD ["node", "/app/dist/index.js", "gateway", "--bind", "lan"]

USER node
```

### Why map the `openclaw` command?

In practice, this avoids path/entrypoint ambiguity across different Docker runners and makes post-deploy commands (`openclaw devices list`, `openclaw onboard`, etc.) predictable.

---

## 2) Prepare persistent paths and ownership

Before first container start, prepare storage and permissions.

Example (local Compose bind mounts):

```bash
mkdir -p data/config data/workspace proxy
sudo chown -R 1000:1000 data/config data/workspace
```

Important notes:

- `data/...` can be anywhere on your host, not necessarily this exact path.
- Your container must have access to those host paths via Compose mounts or your runner’s volume settings.
- Docker Compose can auto-create missing bind-mount dirs, but creating them yourself is still better for explicit ownership/permission control.

---

## 3) Required environment variables

Minimal env for deployment:

```bash
OPENCLAW_GATEWAY_TOKEN=replace_with_long_random_hex
CONTROL_UI_ALLOWED_ORIGIN=https://openclaw.yourdomain.com
```

Generate token:

```bash
openssl rand -hex 32
```

Model credentials are intentionally omitted here; set them later during onboarding.

---

## 4) Minimal openclaw.json for deployment

Create `openclaw.json` in your config volume/path (for example `data/config/openclaw.json`):

```json
{
  "gateway": {
    "mode": "local",
    "bind": "lan",
    "port": 18789,
    "auth": {
      "mode": "token",
      "token": "REPLACE_WITH_SAME_GATEWAY_TOKEN"
    },
    "trustedProxies": ["10.0.0.0/8", "172.16.0.0/12"],
    "controlUi": {
      "allowedOrigins": [
        "https://openclaw.yourdomain.com",
        "https://openclaw.yourdomain.com/"
      ],
      "allowInsecureAuth": false
    }
  }
}
```

### Notes

- Keep `gateway.auth.token` equal to `OPENCLAW_GATEWAY_TOKEN`.
- Include origin with and without trailing slash.
- If you are on plain HTTP temporarily, set `allowInsecureAuth: true`.

---

## 5) Deployment path A: Docker Compose (convenient)

Compose is convenient, but optional.

`docker-compose.yml`:

```yaml
services:
  openclaw:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: openclaw-gateway
    restart: unless-stopped
    expose:
      - "18789"
    environment:
      - OPENCLAW_GATEWAY_TOKEN=${OPENCLAW_GATEWAY_TOKEN}
    volumes:
      - ./data/config:/home/node/.openclaw
      - ./data/workspace:/home/node/.openclaw/workspace

  proxy:
    image: nginx:1.27-alpine
    container_name: openclaw-proxy
    restart: unless-stopped
    depends_on:
      - openclaw
    ports:
      - "80:80"
      # add 443 and TLS config if terminating TLS here
    volumes:
      - ./proxy/default.conf:/etc/nginx/conf.d/default.conf:ro
```

`proxy/default.conf`:

```nginx
server {
  listen 80;
  server_name _;

  location / {
    proxy_pass http://openclaw:18789;

    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";

    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    proxy_read_timeout 3600;
    proxy_send_timeout 3600;
  }
}
```

Start:

```bash
docker compose up -d --build
```

---

## 6) Deployment path B: container runner UI (CapRover, etc.)

If you use a container runner (like CapRover), you usually don’t need Compose.

Set these in UI:

- Build/deploy from your Dockerfile, or use equivalent runner build mechanism.
- Persistent mounts:
  - `/home/node/.openclaw`
  - `/home/node/.openclaw/workspace`
- Env var:
  - `OPENCLAW_GATEWAY_TOKEN`
- Proxy/front-door:
  - WebSockets enabled
  - route traffic to container port `18789`

### Do you still need a startup command in CapRover UI?

If your Dockerfile already sets:

```dockerfile
CMD ["node", "/app/dist/index.js", "gateway", "--bind", "lan"]
```

then **usually no** — Dockerfile CMD is enough.

Use a CapRover startup override only if you intentionally want to override CMD, or if your specific deployment setup is ignoring/replacing it.

---

## 7) First access after deploy (easy to miss)

After deployment succeeds:

1. Open your public OpenClaw URL.
2. Go to the **Overview** tab.
3. Paste `OPENCLAW_GATEWAY_TOKEN`.
4. Click **Save**.

---

## 8) If access/pairing fails, run devices list

```bash
openclaw devices list
```

If needed:

```bash
openclaw devices approve <requestId>
```

This is one of the most common first-deploy fixes.

---

## 9) Optional later: add build-time packages + update image tags

This is for later optimization, not initial deployment.

```dockerfile
FROM ghcr.io/openclaw/openclaw:2026.3.2

USER root

RUN printf '#!/usr/bin/env sh\nexec node /app/dist/index.js "$@"\n' > /usr/local/bin/openclaw \
 && chmod +x /usr/local/bin/openclaw

# Optional deps (example only)
RUN apt-get update \
 && apt-get install -y --no-install-recommends curl jq tmux \
 && rm -rf /var/lib/apt/lists/*

CMD ["node", "/app/dist/index.js", "gateway", "--bind", "lan"]

USER node
```

For OpenClaw upgrades later, usually just bump the `FROM ghcr.io/openclaw/openclaw:<tag>` line and redeploy.

---

## Final take

Reliable deployment is mostly about:

- tiny custom Dockerfile from a pinned release image,
- correct startup command,
- persistent storage + ownership,
- websocket-ready proxy,
- token + allowed origins.

If those are right, OpenClaw deployment is straightforward across Docker platforms.
