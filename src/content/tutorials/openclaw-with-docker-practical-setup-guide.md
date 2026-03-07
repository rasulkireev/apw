---
title: "OpenClaw with Docker: Simple, Repeatable Deployment Guide"
dateCreated: 2026-03-07
dateUpdated: 2026-03-07
icon: ./icons/developer.png
tags:
  - openclaw
  - docker
  - self-hosting
  - caprover
category: OpenClaw
type: tutorial
description: Deploy OpenClaw with Docker using a minimal custom image, persistent volumes, and a WebSocket-ready proxy. Focused on deployment only.
---

This is a **deployment-only** guide for OpenClaw with Docker.

No channel setup deep dive, no model strategy deep dive — just the parts that consistently matter in real deployments:

- container image
- startup command
- persistent volumes
- proxy with WebSockets
- gateway token + control UI access
- pairing fix (`openclaw devices list`)

If you run Docker directly, CapRover, Coolify, or any other Docker-based platform, this structure is the same.

## 0) What actually matters (the short version)

If you only remember 6 things, make it these:

1. **Use persistent volumes** for `/home/node/.openclaw` and `/home/node/.openclaw/workspace`.
2. Start OpenClaw with: `node /app/dist/index.js gateway --bind lan`.
3. Put it behind a proxy with **WebSocket upgrades enabled**.
4. Keep `OPENCLAW_GATEWAY_TOKEN` and `openclaw.json` token in sync.
5. Set `controlUi.allowedOrigins` to your proxy URL (with and without trailing slash).
6. If UI says pairing required, run `openclaw devices list` in the container and approve pending device(s).

---

## 1) Minimal Dockerfile (from our working pattern)

This is the stripped version of what we use in our helper setup.

```dockerfile
FROM ghcr.io/openclaw/openclaw:2026.2.26

USER root

# Map `openclaw` command explicitly (useful in custom images/environments)
RUN printf '#!/usr/bin/env sh\nexec node /app/dist/index.js "$@"\n' > /usr/local/bin/openclaw \
 && chmod +x /usr/local/bin/openclaw

# Command that should run when container starts
CMD ["node", "/app/dist/index.js", "gateway", "--bind", "lan"]

USER node
```

### Why this startup command?

Use the absolute path version:

```bash
node /app/dist/index.js gateway --bind lan
```

It is more reliable than short-path variants in orchestrated environments.

---

## 2) Optional: add a couple build-time packages

Keep this small and intentional.

```dockerfile
# Example: add a few useful tools at build time
RUN apt-get update \
 && apt-get install -y --no-install-recommends curl jq tmux \
 && rm -rf /var/lib/apt/lists/*
```

Why build-time? Because runtime installs are brittle and disappear across redeploys.

---

## 3) Required environment variables

At minimum:

```bash
# .env
OPENCLAW_GATEWAY_TOKEN=replace_with_long_random_hex

# one model provider key (pick your provider)
GEMINI_API_KEY=...
# or OPENAI_API_KEY=...
# or ANTHROPIC_API_KEY=...

# your public proxy URL
CONTROL_UI_ALLOWED_ORIGIN=https://openclaw.yourdomain.com
```

Generate token:

```bash
openssl rand -hex 32
```

---

## 4) openclaw.json (initial setup fields that matter)

Create `openclaw.json` in your persistent config directory.

Example:

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
  },
  "agents": {
    "defaults": {
      "model": {
        "primary": "google/gemini-2.5-flash"
      },
      "workspace": "/home/node/.openclaw/workspace",
      "maxConcurrent": 4,
      "subagents": {
        "maxConcurrent": 8
      }
    }
  }
}
```

### Practical notes

- If you are not on HTTPS yet, temporarily set `allowInsecureAuth: true`.
- Keep `auth.token` equal to your `OPENCLAW_GATEWAY_TOKEN` value.
- Include both origin forms in `allowedOrigins` (with and without trailing slash).

---

## 5) Docker Compose (gateway + proxy with WebSockets)

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
      - GEMINI_API_KEY=${GEMINI_API_KEY}
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
      # if terminating TLS here, also expose 443:443 and add cert config
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

That `Upgrade`/`Connection` setup is what prevents silent websocket failures.

---

## 6) Start it

```bash
mkdir -p data/config data/workspace proxy
# put openclaw.json into ./data/config/openclaw.json
# put nginx config into ./proxy/default.conf

# OpenClaw runs as uid 1000 (node)
sudo chown -R 1000:1000 data/config data/workspace

docker compose build
docker compose up -d
```

---

## 7) Enter container and run onboarding

You can run onboarding directly inside the running container:

```bash
docker exec -it openclaw-gateway openclaw onboard
```

Or open a shell first:

```bash
docker exec -it openclaw-gateway sh
openclaw onboard
```

Again: this guide is deployment-focused; onboarding details depend on your channel/model choices.

---

## 8) First access after deploy (easy to miss)

After deployment succeeds:

1. Open your proxy URL.
2. Go to the **Overview** tab in Control UI.
3. Paste your `OPENCLAW_GATEWAY_TOKEN`.
4. Click **Save**.

If you skip this, it often looks like the gateway is up but UI is unauthorized/disconnected.

---

## 9) Pairing fix: run devices list

If you see pairing/1008-style access errors, check device requests:

```bash
docker exec -it openclaw-gateway openclaw devices list
```

If needed, approve pending request(s):

```bash
docker exec -it openclaw-gateway openclaw devices approve <requestId>
```

This is a very common post-deploy gotcha.

---

## 10) Reverse proxy + domain checklist

- DNS points your domain to the host running proxy.
- Proxy forwards to OpenClaw container port 18789.
- WebSocket upgrade headers are enabled.
- `controlUi.allowedOrigins` matches your exact public URL.
- If using HTTPS, terminate TLS correctly and keep scheme aligned.

---

## 11) CapRover users: same principles, different UI

If deploying on CapRover:

- still use persistent data for config/workspace
- still run startup command with `/app/dist/index.js gateway --bind lan`
- still require websocket-enabled proxy behavior
- still need matching token + allowed origins

CapRover changes *where* you click, not *what* must be true.

---

## Final take

The simplest reliable deployment is:

- minimal image,
- explicit start command,
- persistent volumes,
- websocket-ready proxy,
- correct token + origins.

Get those right and OpenClaw deployment is straightforward across most Docker platforms.
