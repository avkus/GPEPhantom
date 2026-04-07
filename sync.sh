#!/usr/bin/env bash
#
# sync.sh — Автоматическая синхронизация репозитория GPEPhantom
#
# Обновляет публичный форк, приватный main и рабочую ветку phantom-core
# из оригинального upstream-репозитория.
#
# Использование: bash sync.sh

set -euo pipefail

# [NEW] Проверка на интерактивность
INTERACTIVE=false
if [ -t 0 ]; then INTERACTIVE=true; fi

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║   GPEPhantom Repository Sync Manager                   ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# --- Шаг 1: Проверка незакоммиченных изменений ---
if [ -n "$(git status --porcelain)" ]; then
    if [ "$INTERACTIVE" = true ]; then
        # Интерактивная логика (для локальной работы)
        echo -e "${YELLOW}[1/6] Проверка рабочих изменений...${NC}"
        echo -e "${RED}⚠  У вас есть незакоммиченные изменения:${NC}"
        git status --short
        echo ""
        read -r -p "Хотите сначала сделать коммит? (y/n): " answer
        case "$answer" in
            [yY]*)
                read -r -p "Введите сообщение коммита: " message
                if [ -z "$message" ]; then
                    message="Sync update $(date +'%Y-%m-%d %H:%M')"
                fi
                git add -A && git commit -m "$message"
                echo -e "${GREEN}✓ Коммит создан${NC}"
                ;;
            *)
                echo -e "${RED}✗ Синхронизация отменена. Закоммитьте изменения и попробуйте снова.${NC}"
                exit 1
                ;;
        esac
    else
        # ЛОГИКА ДЛЯ СЕРВЕРА: Авто-коммит
        echo -e "${YELLOW}[1/6] Обнаружены изменения. Авто-коммит...${NC}"
        git add -A
        git commit -m "hotfix: server-side changes $(date +'%Y-%m-%d %H:%M')"
        echo -e "${GREEN}✓ Авто-коммит создан${NC}"
    fi
else
    echo -e "${GREEN}✓ Рабочая директория чистая${NC}"
fi

# --- Шаг 2: Fetch upstream ---
echo -e "${YELLOW}[2/6] Получение изменений из upstream...${NC}"
if ! git remote | grep -q "upstream"; then
    echo -e "${RED}✗ Remote 'upstream' не настроен. Добавьте его:${NC}"
    echo "   git remote add upstream <upstream-url>"
    exit 1
fi

git fetch upstream
echo -e "${GREEN}✓ Upstream получен${NC}"

# --- Шаг 3: Push в публичный форк ---
echo -e "${YELLOW}[3/6] Обновление публичного форка (public/main)...${NC}"
if git remote | grep -q "public"; then
    git push public upstream/main:main -f
    echo -e "${GREEN}✓ Публичный форк обновлён${NC}"
else
    echo -e "${YELLOW}⚠ Remote 'public' не найден, пропущено${NC}"
fi

# --- Шаг 4: Push в приватный origin main ---
echo -e "${YELLOW}[4/6] Обновление приватного main (origin/main)...${NC}"
git push origin upstream/main:main -f
echo -e "${GREEN}✓ Приватный main обновлён${NC}"

# --- Шаг 5: Merge в рабочую ветку ---
echo -e "${YELLOW}[5/6] Слияние upstream/main в phantom-core...${NC}"

# Проверка, находимся ли уже в phantom-core
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "phantom-core" ]; then
    # Проверяем, существует ли ветка локально, если нет — создаём из origin
    git checkout phantom-core || git checkout -b phantom-core origin/phantom-core
fi

# Проверка, есть ли уже актуальные изменения
if git merge-base --is-ancestor upstream/main phantom-core; then
    echo -e "${GREEN}✓ phantom-core уже включает все изменения из upstream${NC}"
else
    if git merge upstream/main --no-edit 2>&1; then
        echo -e "${GREEN}✓ Слияние прошло успешно${NC}"
    else
        echo -e "${RED}✗ Возникли конфликты при слиянии!${NC}"
        echo ""
        echo -e "${RED}Конфликтные файлы:${NC}"
        git diff --name-only --diff-filter=U
        echo ""
        echo "Разрешите конфликты вручную, затем выполните:"
        echo "  git add <файлы>"
        echo "  git commit"
        echo "  git push origin phantom-core"
        exit 1
    fi
fi

# --- Шаг 6: Push рабочей ветки ---
echo -e "${YELLOW}[6/6] Отправка phantom-core в origin...${NC}"
git push origin phantom-core
echo -e "${GREEN}✓ Рабочая ветка отправлена${NC}"

# --- Итоговый отчёт ---
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   ✅ Синхронизация завершена!                          ║${NC}"
echo -e "${GREEN}╠════════════════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}║   • Публичный форк (public/main) обновлён              ║${NC}"
echo -e "${GREEN}║   • Приватный main (origin/main) обновлён              ║${NC}"
echo -e "${GREEN}║   • Рабочая ветка (phantom-core) синхронизирована      ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Показать последние коммиты
echo -e "${CYAN}Последние коммиты:${NC}"
git log --oneline --graph --all --decorate -8
