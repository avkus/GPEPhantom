# Project Context — GPEPhantom

## Overview
**GPEPhantom** (CLIProxyAPI Plus) is a unified AI proxy server that exposes a single OpenAI-compatible API while routing requests to multiple upstream AI providers. It serves as the central gateway for all AI tooling in the project ecosystem.

## Architecture Components

### GPE-Phantom (Go API Gateway)
- **Language**: Go 1.26
- **Framework**: Gin (HTTP routing)
- **Ports**:
  - `8317` — Main OpenAI-compatible API (`/v1/chat/completions`, `/v1/responses`)
  - `8316` — pprof debug server (localhost only)
- **Key Features**:
  - Multi-provider routing (Gemini, Claude, Codex, Kiro, Vertex AI, Qwen, Antigravity, GitLab Duo)
  - OAuth integration for CLI-based providers
  - Model aliasing and round-robin/fill-first credential routing
  - WebSocket streaming support
  - Payload manipulation (default/override/filter rules)
  - Management API with usage statistics

### Docker Deployment
- **Containerization**: Multi-stage Dockerfile (Go builder → Alpine runtime)
- **Orchestration**: Docker Compose
  - `app` — GPEPhantom service
  - `tunnel` — Cloudflare Tunnel (exposes service publicly)
- **Server**: `gphantom.ru` (behind Cloudflare)
- **Environment variables**: `.env` file (PORT, MASTER_API_KEY, PGSTORE_DSN, CLOUDFLARE_TUNNEL_TOKEN)
- **Build scripts**: `docker-build.ps1` (Windows), `docker-build.sh` (Linux/macOS)

### Neon DB (PostgreSQL)
- **Provider**: Neon (serverless PostgreSQL)
- **Purpose**: Persistent storage for usage statistics, auth tokens, management data
- **Connection**: DSN stored in `.env` (`PGSTORE_DSN`)
- **Driver**: pgx
- **Schema**: Managed by internal store package (`internal/store/`)

### Iowa GCP Node
- **Location**: Iowa (us-central1)
- **Purpose**: Google Cloud Platform node for Vertex AI access and regional proximity
- **Services**:
  - Vertex AI API integration
  - Service account credentials for `vertex/` prefixed models
  - Backup routing when CLI OAuth channels are unavailable

### Cloudflare Worker Bridge
- **URL**: `gphantom-bridge.avkus.workers.dev`
- **Purpose**: Trusted M2M intermediary for Pi Agent integration with GPE-Phantom
- **Problem solved**: Pi Agent's network library hardcodes `User-Agent: OpenAI/JS` and strips custom headers (`CF-Access-Client-Id` / `CF-Access-Client-Secret`), causing WAF 403 Forbidden blocks
- **How it works**:
  1. Pi Agent sends unauthenticated request to Worker
  2. Worker intercepts at the Edge, injects `CF-Access-Client-Id` and `CF-Access-Client-Secret` from Cloudflare Secrets
  3. Worker rewrites `User-Agent` to mimic a modern browser, removes tracking SDK headers (`x-stainless-*`)
  4. GPE-Phantom (`api.gphantom.ru`) receives a properly authorized request that bypasses WAF
- **Security**: Service tokens stored in Cloudflare Secrets, removed from local Pi Agent configs
- **Source code**: `workers/gphantom-bridge/`
- **Configuration**: `wrangler.toml` defines `TARGET_HOST` and `BROWSER_UA`

## Supported Clients

| Client | Access Method | Notes |
|---|---|---|
| Cursor / VS Code / CLI | Direct API Key | Standard OpenAI-compatible requests to `api.gphantom.ru:8317` |
| Pi Agent | Cloudflare Worker Bridge | Requests routed through `gphantom-bridge.avkus.workers.dev` for Edge header injection |

## Provider Channels

| Prefix | Access Method | Authentication | Example Models |
|---|---|---|---|
| `api/` | API Key (Free Tier) | Static API key | `api/gemma-4-31b-it`, `api/gemini-3.1-flash-lite` |
| `cli/` | OAuth (CLI) | Browser-based login | `cli/gemini-2.5-pro`, `cli/gemini-3.1-pro-preview` |
| `vertex/` | Vertex AI | GCP service account | `vertex/gemini-3.1-pro-preview` |
| `at/` | Antigravity | Provider-specific | `at/gemini-3-flash` (Web USA only, bypass BY region) |

## Key Directories

```
cmd/server/              # Main binary entrypoint
internal/
  api/                   # HTTP API handlers
  auth/                  # OAuth & API key authentication
  config/                # YAML configuration parsing
  runtime/               # Request execution & provider routing
  store/                 # PostgreSQL persistence
  translator/            # Protocol translation between providers
  tui/                   # Terminal UI (bubbletea)
  wsrelay/               # WebSocket relay
  managementasset/       # Management panel assets
sdk/                     # Shared SDK utilities
agents_hub/              # Multi-agent task coordination (Phase 12)
  skills/                # Agent skill definitions
  tasks/active/          # Pending task files
  tasks/archive/         # Completed task files
  reports/               # Agent execution reports
auths/                   # OAuth credentials (gitignored)
config.example.yaml      # Configuration reference
docker-compose.yml       # Production deployment
```

## Operational Notes
- **Branch**: `phantom-core` (primary development)
- **Sync**: `sync.sh` handles local↔server synchronization with interactive/auto modes
- **CI/CD**: GoReleaser (multi-platform: linux/windows/darwin/freebsd, amd64/arm64)
- **License**: MIT
- **Repository**: `avkus-labs/GPEPhantom-private`
