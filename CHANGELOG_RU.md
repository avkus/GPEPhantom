# Журнал изменений

Все значимые изменения в этом проекте документируются в данном файле.

Формат основан на [Keep a Changelog](https://keepachangelog.com/ru/1.1.0/),
и этот проект придерживается [Семантического Версионирования](https://semver.org/spec/v2.0.0.html).

---

## [Не выпущено]

### Добавлено
- `agents_hub/` — Структура мультиагентной координации (Фаза 12)
  - `skills/universal_executor.md` — Стандартный протокол выполнения задач для всех агентов
  - `skills/gpe_rules.md` — Локальные правила проекта (ветка, безопасность, приоритеты моделей)
  - `project_context.md` — Обзор архитектуры (GPE-Phantom, Docker, Neon DB, Iowa GCP)
  - `reports/` — Архив отчётов о выполнении задач агентами
  - `tasks/active/` — Ожидающие файлы задач
  - `tasks/archive/` — Завершённые файлы задач
- `MODEL_GUIDE.md` — Полная иерархия моделей Google AI Studio с лимитами (каналы api/cli/vertex/at)
- `scripts/` — Директория для рабочих скриптов
- `CHANGELOG.md` / `CHANGELOG_RU.md` — Журналы изменений

### Изменено
- Перемещён `sync.sh` → `scripts/sync.sh`
- Перемещён `test_cursor.sh` → `scripts/test_cursor.sh`
- Обновлён `.qwen/skills/gpe-sync-manager/SKILL.md` — ссылки на `scripts/sync.sh`
- Обновлена документация проекта в соответствии с новой структурой каталогов

### Удалено
- `QWEN_REPORT.md` (корень) — Содержимое мигрировано в `agents_hub/reports/QWEN_REPORT.md`
- `QWEN_TASKS.md` (корень) — Уже отсутствовал, подтверждено удаление

---

## [11.4] — 2026-04-10

### Добавлено
- **Cloudflare Worker Bridge** — Реализован мост `gphantom-bridge.avkus.workers.dev` для интеграции с Pi Agent
  - Настроена Edge-инъекция сервисных токенов `CF-Access-Client-Id` / `CF-Access-Client-Secret`
  - Автоматическая подмена `User-Agent` и удаление SDK-заголовков трекеров (`x-stainless-*`)
  - Секреты перемещены из локальных конфигов Pi Agent в Cloudflare Secrets
  - Исходный код: `workers/gphantom-bridge/`

---

## [0.1.0] — 2026-04-07

### Добавлено
- `sync.sh` — Скрипт автоматической синхронизации репозитория с интерактивным и автоматическим режимами
- Поддержка Cloudflare Tunnel в `docker-compose.yml`
- `.qwen/skills/gpe-sync-manager/` — Нативный навык управления синхронизацией

### Изменено
- Очистка README: удалена документация на китайском, обновлена структура README

### Инфраструктура
- Мульти-remote настройка Git: `upstream`, `public`, `origin`, `private`
- Основная рабочая ветка: `phantom-core`
- Развёртывание на сервере `gphantom.ru`
- Интеграция Neon PostgreSQL через `PGSTORE_DSN`

---

## Предыстория

Начальный форк из [CLIProxyAPI Plus](https://github.com/router-for-me/CLIProxyAPIPlus) с поддержкой сторонних провайдеров.

Унаследованные ключевые функции upstream:
- Мультипровайдерная маршрутизация (Gemini, Claude, Codex, Kiro, Vertex AI, Qwen, Antigravity, GitLab Duo)
- OAuth-интеграция для CLI-аутентификации
- Псевдонимы моделей и маршрутизация учётных данных (round-robin / fill-first)
- Поддержка WebSocket-стриминга
- Правила манипуляции полезными данными
- Management API со статистикой использования
