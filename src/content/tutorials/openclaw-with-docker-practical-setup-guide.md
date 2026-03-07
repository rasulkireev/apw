---
title: "OpenClaw with Docker: A Practical Setup Guide"
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
description: A practical, production-minded guide for deploying OpenClaw with Docker Compose, with optional notes for CapRover and other reverse proxy setups.
---

If you want to run OpenClaw in a clean, repeatable way, Docker is a great option.

This guide is intentionally **tool-agnostic**: the same setup principles apply whether you deploy with plain Docker Compose, CapRover, or another platform that can run Docker containers.

## What you are setting up

At a high level, a stable OpenClaw Docker deployment has four parts:

1. **Gateway container** (the OpenClaw server)
2. **CLI access** (for onboarding, auth, and management)
3. **Persistent storage** (config/workspace/session state)
4. **Network edge** (local port or reverse proxy with TLS)

If you get those four right, the rest is mostly provider/channel configuration.

## Prerequisites

- Docker Engine (or Docker Desktop)
- Docker Compose v2
- At least 2 GB RAM available for build + runtime
- A domain and TLS setup if you want remote access

## Recommended path (official and fastest)

The official OpenClaw Docker workflow uses the repo’s setup script.

### 1) Clone OpenClaw and run setup

```bash
git clone https://github.com/openclaw/openclaw.git
cd openclaw
./docker-setup.sh
```

What this does for you:

- builds (or pulls) the OpenClaw image
- runs onboarding
- starts gateway via Docker Compose
- generates and stores gateway token

When it finishes, open:

- `http://127.0.0.1:18789/`

Then paste your token into the Control UI.

### 2) Verify health

```bash
curl -fsS http://127.0.0.1:18789/healthz
curl -fsS http://127.0.0.1:18789/readyz
```

If both return success, your core service is up.

### 3) Get dashboard URL/token again anytime

```bash
docker compose run --rm openclaw-cli dashboard --no-open
```

Useful when reconnecting a browser or rotating sessions.

## Optional: use prebuilt image instead of local build

If you want faster startup on fresh servers, use the official GHCR image:

```bash
export OPENCLAW_IMAGE="ghcr.io/openclaw/openclaw:latest"
./docker-setup.sh
```

## Persistence (don’t skip this)

For real usage, make sure OpenClaw state survives restarts/redeploys.

The setup persists OpenClaw config/workspace under:

- `~/.openclaw/`
- `~/.openclaw/workspace`

You can also persist all `/home/node` using a named Docker volume:

```bash
export OPENCLAW_HOME_VOLUME="openclaw_home"
./docker-setup.sh
```

## Reverse proxy setup (generic)

If exposing OpenClaw outside localhost:

1. Put it behind a reverse proxy (Nginx, Caddy, Traefik, CapRover ingress, etc.)
2. Terminate TLS at the proxy
3. Ensure **WebSocket upgrade headers** are correctly forwarded
4. Restrict inbound IPs if possible

If WebSocket forwarding is wrong, the UI typically shows disconnect/pairing issues.

## Security baseline

- Keep tokens/secrets in environment variables, not in repo files.
- Restrict dashboard exposure (private network, VPN, or auth proxy if possible).
- Keep Docker host patched.
- Use least-privilege mounts (`:ro` where possible).
- Only enable insecure/private WebSocket overrides when you explicitly need them.

## Optional: sandboxing for safer tool execution

You can run non-main session tools in sandboxed Docker containers.

Enable during setup:

```bash
export OPENCLAW_SANDBOX=1
./docker-setup.sh
```

This is useful when you want stronger isolation between gateway and tool execution.

## CapRover-specific notes (from real deployments)

You can absolutely run OpenClaw under CapRover. Keep these in mind:

- Treat CapRover as the **orchestration + TLS edge** layer; OpenClaw still needs stable volume mounts.
- Make sure your app/domain config preserves WebSocket upgrades.
- Keep Docker/CapRover versions reasonably current to avoid API compatibility surprises during migration/restore operations.
- After DNS cutovers or migrations, validate `/healthz`, dashboard connect, and one end-to-end tool call before calling deployment complete.

## Common pitfalls and quick fixes

### “Disconnected” / “pairing required” in UI

- Regenerate dashboard URL:

```bash
docker compose run --rm openclaw-cli dashboard --no-open
```

- Confirm device status:

```bash
docker compose run --rm openclaw-cli devices list
```

### Permission errors on `.openclaw` paths

The container runs as uid `1000` (`node` user). Ensure mounted folders are writable by uid 1000.

### Host can’t reach gateway

Confirm bind mode/network assumptions in your deployment. In Docker Compose workflows, `lan` bind mode is usually the expected default for host access.

## Ops checklist for production-ish stability

- [ ] Health checks wired (`/healthz`, `/readyz`)
- [ ] Persistent volumes verified
- [ ] Reverse proxy + WebSocket forwarding confirmed
- [ ] TLS active
- [ ] Backup/restore path for OpenClaw config tested
- [ ] One channel integration tested end-to-end
- [ ] Upgrade plan documented (image tag strategy + rollback)

## Final take

If you’re deploying OpenClaw with Docker through *any* platform, optimize for these first:

1. repeatable bootstrapping,
2. persistent state,
3. clean networking/TLS,
4. observable health.

Once those are solid, OpenClaw is straightforward to operate, whether on a laptop, VPS, or a managed Docker platform like CapRover.
