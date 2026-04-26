#!/usr/bin/env bash
#
# pre-check.sh — Проверка чистоты рабочей директории перед синхронизацией
#
# Exit 0: рабочая директория чистая
# Exit 1: есть незакоммиченные изменения (список файлов в stdout)

set -uo pipefail

CHANGES=$(git status --porcelain)

if [ -n "$CHANGES" ]; then
    echo "❌ Обнаружены незакоммиченные изменения:"
    echo ""
    echo "$CHANGES"
    echo ""
    echo "Закоммитьте изменения перед запуском синхронизации."
    exit 1
fi

echo "✓ Рабочая директория чистая"
exit 0
