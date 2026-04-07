# GPEPhantom (CLIProxyAPI Plus) - Project Context

## Project Overview

**GPEPhantom** is a deployment of **CLIProxyAPI Plus** — an enhanced version of [CLIProxyAPI](https://github.com/router-for-me/CLIProxyAPI) that adds support for third-party AI providers. It acts as a unified proxy server for multiple AI coding assistants and LLM APIs, exposing a single OpenAI-compatible interface (`/v1/chat/completions`, `/v1/responses`, etc.) while routing requests to various upstream providers.

### Key Features
- **Multi-Provider Support**: Gemini, Claude, Codex (OpenAI), Kiro (AWS), Vertex AI, Qwen, iFlow, GitHub Copilot, Kimi, Amp (ampcode), Kilocode, Antigravity, GitLab Duo
- **OpenAI-Compatible API**: Exposes standard OpenAI endpoints so any OpenAI-compatible client can work with any supported provider
- **OAuth Integration**: Built-in OAuth login flows for providers like Gemini CLI, Codex, Kiro, etc.
- **Model Aliasing & Routing**: Map upstream model names to client-visible aliases; round-robin or fill-first credential routing
- **Management API**: Remote management panel with usage statistics, configuration, and monitoring
- **Cloudflare Tunnel Support**: Built-in tunnel support for exposing the proxy publicly
- **WebSocket API**: Real-time streaming support via WebSocket
- **Payload Manipulation**: Configure default/override/filter rules for request payloads per model

### Architecture
```
cmd/server/          # Main server entrypoint
internal/
  api/               # API layer
  auth/              # Authentication (OAuth, API keys, provider auth)
  config/            # Configuration loading and management
  runtime/           # Request execution and routing
  store/             # Persistent storage (PostgreSQL)
  managementasset/   # Management panel assets
  tui/               # Terminal UI (bubbletea-based)
  wsrelay/           # WebSocket relay
  translator/        # Protocol translation between providers
sdk/                 # SDK for API handlers and utilities
```

## Technologies

- **Language**: Go 1.26
- **Web Framework**: Gin
- **Terminal UI**: Charmbracelet (bubbletea, bubbles, lipgloss)
- **Database**: PostgreSQL (via pgx)
- **WebSocket**: gorilla/websocket
- **Compression**: brotli, klauspost/compress
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GoReleaser (multi-platform builds for linux/windows/darwin/freebsd on amd64/arm64)

## Building and Running

### Prerequisites
- Go 1.26+
- Docker & Docker Compose (for containerized deployment)
- Git (for version injection)

### Local Development Build

```bash
# Build the Go binary
go build -o CLIProxyAPIPlus ./cmd/server/

# Run with config
./CLIProxyAPIPlus --config config.yaml
```

### Docker Build (Recommended)

**Windows (PowerShell):**
```powershell
.\docker-build.ps1
# Option 1: Use pre-built image
# Option 2: Build from source
```

**Linux/macOS (Bash):**
```bash
./docker-build.sh
# Option 1: Use pre-built image
# Option 2: Build from source

# With usage statistics preservation:
./docker-build.sh --with-usage
```

### Docker Compose

```bash
# Start services
docker compose up -d

# View logs
docker compose logs -f

# Rebuild and restart
docker compose up -d --build
```

### Environment Variables (`.env`)
```env
PORT=8317
MASTER_API_KEY=your_secret_key
PGSTORE_DSN=postgres://user:pass@neon-db-url/dbname?sslmode=require
CLOUDFLARE_TUNNEL_TOKEN=
```

### Configuration (`config.yaml`)

See `config.example.yaml` for a comprehensive configuration reference. Key sections:
- **Server**: host, port, TLS settings
- **Authentication**: API keys, auth directory
- **Providers**: gemini-api-key, codex-api-key, claude-api-key, kiro, openai-compatibility, vertex-api-key, ampcode, etc.
- **Routing**: strategy (round-robin/fill-first), retry settings
- **Management**: remote management, secret key, control panel
- **Payload**: default/override/filter rules for model parameters

## Testing

```bash
# Run all tests
go test ./...

# Test specific package
go test ./internal/...

# Cursor/Claude integration test
./test_cursor.sh
```

## Project Structure

| Path | Description |
|------|-------------|
| `cmd/server/` | Main server binary entrypoint |
| `cmd/fetch_antigravity_models/` | Utility to fetch Antigravity model lists |
| `cmd/mcpdebug/` | MCP debugging utility |
| `cmd/protocheck/` | Protocol checking utility |
| `internal/api/` | HTTP API handlers and routing |
| `internal/auth/` | Provider authentication (OAuth, API keys) |
| `internal/config/` | YAML configuration parsing |
| `internal/runtime/` | Request execution and provider routing |
| `internal/store/` | PostgreSQL-backed persistent storage |
| `internal/translator/` | Protocol translation between providers |
| `internal/tui/` | Terminal user interface |
| `internal/managementasset/` | Management panel asset handling |
| `internal/wsrelay/` | WebSocket relay for streaming |
| `sdk/` | Shared SDK utilities and API handlers |
| `auths/` | OAuth credential storage (gitignored) |
| `docs/` | Documentation |
| `examples/` | Example configurations and usage |
| `assets/` | Static assets |
| `test/` | Test fixtures and integration tests |

## Development Conventions

- **Go Modules**: Dependencies managed via `go.mod`/`go.sum`
- **No CGO**: Builds use `CGO_ENABLED=0` for static binaries
- **Version Injection**: Build metadata injected via ldflags (`main.Version`, `main.Commit`, `main.BuildDate`)
- **Git Tags**: Versioning via git tags; GoReleaser handles release builds
- **Contributing**: This Plus fork only accepts PRs related to third-party provider support. Core changes should go to the [mainline CLIProxyAPI](https://github.com/router-for-me/CLIProxyAPI)

## Key Files

| File | Purpose |
|------|---------|
| `config.example.yaml` | Comprehensive configuration reference with all options documented |
| `docker-compose.yml` | Production deployment with app + Cloudflare tunnel |
| `Dockerfile` | Multi-stage build (Go builder → Alpine runtime) |
| `.goreleaser.yml` | Release automation config (multi-platform) |
| `docker-build.ps1` / `docker-build.sh` | Interactive build scripts with version injection |
| `gitlab-duo-codex-parity-plan.md` | Development plan for GitLab Duo provider feature parity |
| `.env.example` | Required environment variables template |

## Ports

- **8317**: Main API server (OpenAI-compatible endpoints)
- **8316**: pprof debug server (optional, localhost only)

## License

MIT License — see [LICENSE](LICENSE)
