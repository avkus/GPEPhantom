# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- `agents_hub/` — Multi-agent task coordination structure (Phase 12)
  - `skills/universal_executor.md` — Standard task execution protocol for all agents
  - `skills/gpe_rules.md` — Local project rules (branch, security, model priorities)
  - `project_context.md` — Architecture overview (GPE-Phantom, Docker, Neon DB, Iowa GCP)
  - `reports/` — Agent execution report archive
  - `tasks/active/` — Pending task files
  - `tasks/archive/` — Completed task files
- `MODEL_GUIDE.md` — Complete Google AI Studio model hierarchy with limits (api/cli/vertex/at channels)
- `scripts/` — Operational scripts directory
- `CHANGELOG.md` — This file

### Changed
- Moved `sync.sh` → `scripts/sync.sh`
- Moved `test_cursor.sh` → `scripts/test_cursor.sh`
- Updated `.qwen/skills/gpe-sync-manager/SKILL.md` to reference `scripts/sync.sh`
- Updated project documentation to reflect new directory structure

### Removed
- `QWEN_REPORT.md` (root) — Content migrated to `agents_hub/reports/QWEN_REPORT.md`
- `QWEN_TASKS.md` (root) — Already absent, confirmed removed

---

## [0.1.0] — 2026-04-07

### Added
- `sync.sh` — Automated repository synchronization script with interactive/non-interactive modes
- Cloudflare Tunnel support in `docker-compose.yml`
- `.qwen/skills/gpe-sync-manager/` — Native sync management skill

### Changed
- README cleanup: removed CN docs, updated README structure

### Infrastructure
- Multi-remote Git setup: `upstream`, `public`, `origin`, `private`
- Primary development branch: `phantom-core`
- Server deployment at `gphantom.ru`
- Neon PostgreSQL integration via `PGSTORE_DSN`

---

## Pre-history

Initial fork from [CLIProxyAPI Plus](https://github.com/router-for-me/CLIProxyAPIPlus) with third-party provider support.

Key upstream features inherited:
- Multi-provider routing (Gemini, Claude, Codex, Kiro, Vertex AI, Qwen, Antigravity, GitLab Duo)
- OAuth integration for CLI-based authentication
- Model aliasing and credential routing (round-robin / fill-first)
- WebSocket streaming support
- Payload manipulation rules
- Management API with usage statistics
