# GPE Rules — Local Project Guidelines

## Branch Strategy
- **Primary branch**: `phantom-core`
- All development work must target `phantom-core`
- Never push to `main` directly — use PRs for integration

## Security Rules
- **NO hardcoded secrets** — All credentials, API keys, and sensitive data must be sourced from:
  - `.env` file (local development)
  - Environment variables (production)
  - `.env.example` must contain only placeholder values
- **`.env` is gitignored** — Never commit real credentials
- **`auths/` directory is gitignored** — OAuth tokens stored separately
- Review all diffs for accidental secret exposure before committing

## Model Priorities

### For Coding Tasks
**Primary**: `api/gemma-4-31b-it`
- Unlimited TPM — handles large files without rate limits
- 1 500 RPD per key (22 500/day across 15-key farm)
- Best for: code generation, refactoring, file edits

### For Architecture/Complex Reasoning
**Primary**: `cli/gemini-2.5-pro`
- 1000+ reasoning tokens
- Highest intelligence tier
- Best for: system design, complex algorithms, multi-file refactoring

### For Quick Tasks
**Secondary**: `api/gemini-3.1-flash-lite`
- 500 RPD limit
- Fast responses for minor fixes

## Code Style
- **Language**: Go 1.26
- **Formatting**: `gofmt` — run before committing
- **Imports**: Group standard library, third-party, and internal imports
- **Naming**: PascalCase for exported, camelCase for unexported
- **Error handling**: Explicit `if err != nil` — no naked returns

## Git Conventions
- **Commit messages**: Conventional Commits format
  - `feat:`, `fix:`, `docs:`, `infra:`, `refactor:`, `test:`, `chore:`
- **Squash** small related commits before pushing
- **Sign off** commits if required by project policy

## Testing
- Run `go test ./...` before marking coding tasks complete
- New features should include tests in corresponding `*_test.go` files
- Integration tests live in `test/` directory

## Docker & Deployment
- **Container registry**: Docker Hub / GitHub Container Registry
- **Server**: `gphantom.ru` (Cloudflare Tunnel)
- **Database**: Neon PostgreSQL (remote DSN in `.env`)
- **Deployment**: `docker compose up -d` on server
- **Sync**: Use `bash scripts/sync.sh` for local↔server synchronization

## File Structure Rules
- New skills go in `agents_hub/skills/`
- Task files go in `agents_hub/tasks/active/`
- Completed reports go in `agents_hub/reports/`
- Root-level task files (`QWEN_TASKS.md`, `QWEN_REPORT.md`) are deprecated
