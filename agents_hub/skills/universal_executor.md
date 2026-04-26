# Universal Executor — GPEPhantom Local Override

> This file extends the global skill `~/.qwen/skills/universal-tasks-executor/SKILL.md`.
> All agents operating in this project MUST follow the global protocol first,
> then apply these local overrides.

## Global Skill Reference

The execution protocol (task picking, locking, reporting, archiving) is defined in:
```
~/.qwen/skills/universal-tasks-executor/SKILL.md
```
**Do not duplicate that logic here.** This file only contains GPEPhantom-specific context.

## Local Overrides for GPEPhantom

### Hub Structure (this project)
```
agents_hub/
├── project_context.md          # GPEPhantom architecture (Go, Gin, Docker, Neon DB)
├── skills/
│   ├── universal_executor.md   # ← YOU ARE HERE (local overrides)
│   └── gpe_rules.md            # Branch, security, code style, git conventions
├── tasks/
│   ├── active/                 # Pending tasks
│   ├── in_progress/            # Locked by an agent
│   ├── failed/                 # Failed after retries
│   └── archive/                # Completed
└── reports/                    # Per-agent report files
```

### Required Context Files
Before executing ANY task in this project, you MUST read:
1. `agents_hub/project_context.md` — architecture, providers, deployment
2. `agents_hub/skills/gpe_rules.md` — branch strategy, security, code style, testing

### Project-Specific Rules
- **Primary branch:** `phantom-core` (NOT `main`)
- **Language:** Go 1.26 with `gofmt`
- **Test command:** `go test ./...`
- **Deploy:** `docker compose up -d` on `gphantom.ru`
- **Secrets:** NEVER hardcode. Use `.env` or environment variables only
- **Report file convention:** `agents_hub/reports/<AGENT_ID>_REPORT.md`

### Deprecated Patterns (DO NOT USE)
- ❌ `QWEN_TASKS.md` at project root → use `agents_hub/tasks/active/`
- ❌ `QWEN_REPORT.md` at project root → use `agents_hub/reports/`
- ❌ Direct push to `main` → all work targets `phantom-core`
