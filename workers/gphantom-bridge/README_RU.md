# Обходная архитектура GPhantom Zero Trust

Мы успешно установили высокопрофессиональное, безопасное и постоянное соединение между **Pi Agent** и **GPhantom API** с использованием Cloudflare Zero Trust и Workers.

## Финальная архитектура

### Проблема
Встроенная сетевая библиотека Pi agent жестко кодирует `User-Agent` (`OpenAI/JS`) и удаляет пользовательские заголовки Cloudflare Access (`CF-Access-Client-Id` / `Secret`), что приводило к блокировке всех запросов WAF Cloudflare с ошибкой `403 Forbidden`.

### Решение: Мост Cloudflare Worker
Вместо запуска ненадежного локального скрипта, мы развернули серверless-мост непосредственно на edge: **`gphantom-bridge.avkus.workers.dev`**.

1. **Pi Agent** -> отправляет стандартный неаутентифицированный запрос к Worker.
2. **Worker** -> перехватывает запрос на edge.
3. **Инъекция заголовков** -> Worker безопасно внедряет сервисные токены `CF-Access` (хранящиеся в Cloudflare Secrets) и переписывает `User-Agent`, маскируя его под современный браузер.
4. **GPhantom API** -> получает идеально отформатированный авторизованный запрос, который обходит WAF и обрабатывает AI completion.

## Детали конфигурации

### Репозиторий кода Worker
Исходный код вашего Cloudflare worker надежно хранится в вашем репозитории по пути:
`e:\AI-Ecosystem\The-Phantom-Nexus\GPEPhantom\workers\gphantom-bridge`

### Pi Agent `models.json`
Файл конфигурации (`C:\Users\andre\.pi\agent\models.json`) был обновлен:
- **Base URL**: `https://gphantom-bridge.avkus.workers.dev/v1`
- **Секреты удалены**: Токены Cloudflare больше не хранятся в открытом виде локально.
- **Модели**: Все 22 активные модели были корректно префиксированы (`api/`, `cli/`, `vertex/`, `at/`).

## Очистка
Теперь вы можете безопасно удалить временный локальный скрипт-перехватчик:
```powershell
rm C:\Users\andre\.pi\agent\gphantom_bridge.js
```
