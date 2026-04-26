---
name: GPE-Sync-Manager
description: |
  Automates synchronization of the GPEPhantom multi-remote Git repository setup. Use this skill whenever the user asks to sync, update, or synchronize the project repositories, merge upstream changes, push to public/private remotes, or run the sync.sh script. Also trigger when the user mentions "обнови проект", "синхронизируй репозиторий", "sync", "fetch upstream", or anything related to keeping the GPEPhantom forks in sync. Supports two modes: local (update VAIO workstation) and server (update gphantom.ru via SSH). This skill handles the multi-remote setup (upstream, public, origin, private) with the phantom-core working branch.
---

# GPE-Sync-Manager

## Контекст

Этот навык управляет синхронизацией репозитория GPEPhantom между remote-репозиториями в двух режимах.

### Remote-репозитории

| Remote     | Назначение                              | Пример URL                          |
|------------|-----------------------------------------|-------------------------------------|
| `upstream` | Оригинальный репозиторий (только чтение) | `router-for-me/CLIProxyAPIPlus`     |
| `public`   | Публичный форк                          | `avkus/GPEPhantom`                  |
| `origin`   | Приватный рабочий репозиторий           | `avkus-labs/GPEPhantom-private`     |
| `private`  | Приватный форк (для merge на сервере)   | `avkus-labs/GPEPhantom-private.git` |

### Режимы работы

| Параметр        | Local (VAIO)                          | Server (gphantom.ru)                     |
|-----------------|---------------------------------------|------------------------------------------|
| **Где работает**| Локальная машина (`E:\AI-Ecosystem\GPEPhantom`) | Удалённый сервер через SSH (`ssh.gphantom.ru`) |
| **Цель**        | Обновить рабочую станцию из upstream  | Обновить сервер из приватного origin     |
| **Скрипт**      | `scripts/sync.sh`                     | SSH-команды + `scripts/sync.sh` на сервере |
| **Интерактивность** | Да (prompt для коммита)          | Нет (auto-commit через `INTERACTIVE=false`) |

- **Рабочая ветка**: `phantom-core`
- **SSH-хост**: `ssh.gphantom.ru`
- **Путь на сервере**: `~/GPEPhantom`

## Правила выполнения

### Правило 1: Определи режим работы

Спроси у пользователя или определи по контексту, какой режим нужен:

- **"обнови локально" / "sync local"** → Local mode
- **"обнови сервер" / "sync server"** → Server mode
- **Неясно** → Спроси: «Обновить локальную версию или сервер?»

### Правило 2: Local mode — обновление рабочей станции

```bash
# 1. Pre-check
bash .qwen/skills/gpe-sync-manager/scripts/pre-check.sh

# 2. Основная синхронизация (автоматически определит интерактивность)
bash scripts/sync.sh
```

`scripts/sync.sh` в Local mode (`INTERACTIVE=true`):
1. Проверка незакоммиченных изменений → prompt для коммита
2. `git fetch upstream`
3. `git push public upstream/main:main -f`
4. `git push origin upstream/main:main -f`
5. `git checkout phantom-core` + `git merge upstream/main`
6. `git push origin phantom-core`

### Правило 3: Server mode — обновление сервера

```bash
# 1. Pre-check на сервере
ssh ssh.gphantom.ru "cd ~/GPEPhantom && git status --porcelain"

# 2. Если есть изменения — авто-коммит (неинтерактивный режим)
ssh ssh.gphantom.ru "cd ~/GPEPhantom && git add -A && git commit -m \"hotfix: server-side changes \$(date +'%Y-%m-%d %H:%M')\""

# 3. Подтянуть изменения из private remote
ssh ssh.gphantom.ru "cd ~/GPEPhantom && git pull origin phantom-core"
```

Если на сервере нет remote `private`, добавь его:
```bash
ssh ssh.gphantom.ru "cd ~/GPEPhantom && git remote add private git@github.com:avkus-labs/GPEPhantom-private.git"
```

Для полной синхронизации с merge из `private/phantom-core`:
```bash
ssh ssh.gphantom.ru "cd ~/GPEPhantom && git fetch private phantom-core && git merge private/phantom-core --no-edit"
```

При конфликтах — разреши в пользу `--theirs` (версия из private):
```bash
ssh ssh.gphantom.ru "cd ~/GPEPhantom && git checkout --theirs <conflicted-file> && git add <conflicted-file> && git commit -m \"merge: resolve conflict\""
```

### Правило 4: При конфликтах — останов и запрос инструкций

Если возникают конфликты слияния:

1. **Немедленно останови выполнение**
2. Выведи список конфликтных файлов: `git diff --name-only --diff-filter=U`
3. Запроси инструкции у пользователя
4. **Не продолжай**, пока пользователь не разрешит конфликты или не даст указаний

### Правило 5: Формируй финальный ответ по шаблону

После успешного завершения сформируй отчёт по шаблону:

📄 `examples/success-report.md`

Не отклоняйся от структуры шаблона. Добавь вывод `git log --oneline -5` в конец отчёта.

## Обработка ошибок

| Ситуация                          | Действие                                                                 |
|-----------------------------------|--------------------------------------------------------------------------|
| `upstream` remote не настроен     | Предупреди: нужен `git remote add upstream <url>`                        |
| `private` remote нет на сервере   | Добавь: `git remote add private git@github.com:avkus-labs/GPEPhantom-private.git` |
| Сбой сети при fetch/SSH           | Повтори один раз, затем сообщи о проблеме соединения                     |
| Push отклонён (auth/permissions)  | Укажи, какой remote не прошёл, предложи проверить credentials            |
| Конфликт слияния                  | Остановись, покажи конфликтные файлы, запроси инструкции                 |
| Всё уже синхронизировано          | Сообщи: «Всё уже синхронизировано, изменений нет»                        |

## Проверка результата

```bash
# Local
git log --oneline --graph --all --decorate -10

# Server
ssh ssh.gphantom.ru "cd ~/GPEPhantom && git log --oneline --graph --all --decorate -10"
```
