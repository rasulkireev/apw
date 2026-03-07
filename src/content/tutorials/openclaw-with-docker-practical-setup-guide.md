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
description: Deploy OpenClaw with Docker using the prebuilt image, persistent volumes, and a WebSocket-ready proxy. Focused on deployment only.
---

This guide is **deployment-only**.

No model setup walkthrough, no channel setup walkthrough — just what you need to reliably deploy and access OpenClaw.

## 0) What matters most

If you only remember 6 things, remember these:

1. Use a **prebuilt OpenClaw release image** from GitHub releases.
2. Create persistent dirs for config/workspace **before first container start**.
3. Start with: `node /app/dist/index.js gateway --bind lan`.
4. Put OpenClaw behind a proxy with **WebSocket upgrade headers** enabled.
5. Set `controlUi.allowedOrigins` correctly in `openclaw.json`.
6. After deploy, go to **Overview** and save your gateway token; if needed run `openclaw devices list`.

---

## 1) Use a prebuilt image (recommended)

Prefer a pinned release tag from:

- <https://github.com/openclaw/openclaw/releases>

Image format:

```bash
ghcr.io/openclaw/openclaw:<release-tag>
```

Example:

```bash
ghcr.io/openclaw/openclaw:2026.3.2
```

You do **not** need to clone the repo for initial deployment.

---

## 2) Create persistent dirs first (important)

Before creating/running any container:

```bash
mkdir -p data/config data/workspace proxy
sudo chown -R 1000:1000 data/config data/workspace
```

OpenClaw runs as `node` (uid 1000). If ownership is wrong, you'll hit permission issues.

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

Note: model/provider keys are intentionally omitted here. Configure models later via `openclaw onboard`.

---

## 4) Minimal openclaw.json for deployment

Create `data/config/openclaw.json`:

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
- If you are using plain HTTP temporarily, set `allowInsecureAuth: true`.

---

## 5) Deployment path A: Docker Compose (convenient)

Docker Compose is very convenient, but optional.

```yaml
services:
  openclaw:
    image: ghcr.io/openclaw/openclaw:2026.3.2
    container_name: openclaw-gateway
    restart: unless-stopped
    expose:
      - "18789"
    command: ["node", "/app/dist/index.js", "gateway", "--bind", "lan"]
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
docker compose up -d
```

---

## 6) Deployment path B: container runner UI (CapRover, etc.)

If you use a container runner (like CapRover), you usually don’t need Compose.

Set these in UI:

- Image: `ghcr.io/openclaw/openclaw:<release-tag>`
- Startup command:
  - `node /app/dist/index.js gateway --bind lan`
- Persistent mounts:
  - `/home/node/.openclaw`
  - `/home/node/.openclaw/workspace`
- Env var:
  - `OPENCLAW_GATEWAY_TOKEN`
- Proxy/front-door:
  - WebSockets enabled
  - routes traffic to container port `18789`

---

## 7) Enter container and run onboarding

Yes — you can still `docker exec` into a running container even if CMD is:

```json
["node", "/app/dist/index.js", "gateway", "--bind", "lan"]
```

That CMD only controls the main process. `docker exec` is separate.

### Generic

```bash
docker exec -it openclaw-gateway /bin/bash
# if bash is missing:
docker exec -it openclaw-gateway /bin/sh
```

### CapRover-style container name lookup

```bash
docker exec -it "$(docker ps -q --filter "name=srv-captain--openclaw" | head -n 1)" /bin/bash
# fallback:
docker exec -it "$(docker ps -q --filter "name=srv-captain--openclaw" | head -n 1)" /bin/sh
```

Then run:

```bash
openclaw onboard
```

---

## 8) First access after deploy (easy to miss)

After deployment succeeds:

1. Open your public OpenClaw URL.
2. Go to the **Overview** tab.
3. Paste `OPENCLAW_GATEWAY_TOKEN`.
4. Click **Save**.

---

## 9) If access/pairing fails, run devices list

```bash
openclaw devices list
```

If needed:

```bash
openclaw devices approve <requestId>
```

This is one of the most common first-deploy fixes.

---

## 10) Optional later: custom Dockerfile (updates, tooling)

This is **not required** for initial deployment, but useful later when you want custom tooling baked into your image.

```dockerfile
FROM ghcr.io/openclaw/openclaw:2026.3.2

USER root

# Optional: map `openclaw` command explicitly
RUN printf '#!/usr/bin/env sh\nexec node /app/dist/index.js "$@"\n' > /usr/local/bin/openclaw \
 && chmod +x /usr/local/bin/openclaw

# Optional: add build-time packages (example only)
RUN apt-get update \
 && apt-get install -y --no-install-recommends curl jq tmux \
 && rm -rf /var/lib/apt/lists/*

CMD ["node", "/app/dist/index.js", "gateway", "--bind", "lan"]

USER node
```

### Updating later

- Update only the `FROM ghcr.io/openclaw/openclaw:<new-tag>` line.
- Rebuild/redeploy.
- Keep persistent volumes mounted so config/workspace survive.

---

## Final take

Reliable deployment is mostly about:

- prebuilt release image,
- correct start command,
- persistent dirs + ownership,
- websocket-ready proxy,
- token + allowed origins.

If those are right, deploying OpenClaw is straightforward across Docker platforms.
