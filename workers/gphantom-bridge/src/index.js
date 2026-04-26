// ══════════════════════════════════════════════════════════════════════════════
// GPhantom Bridge — Cloudflare Worker
// Назначение: прозрачный прокси между Pi Agent и GPhantom API через CF Tunnel.
//
// Архитектура доверия:
//   Pi Agent → [Bearer token] → Worker → [Bearer + CF-Access] → api.gphantom.ru
//
// Worker не является точкой доверия — он тонкая прокладка. Реальная авторизация
// происходит на уровне GPhantom API через Bearer token (мастер-ключ).
// CF-Access Service Token нужен исключительно для прохождения CF Tunnel WAF.
// ══════════════════════════════════════════════════════════════════════════════

// ── Константы ────────────────────────────────────────────────────────────────
const WS_TIMEOUT_MS   = 5 * 60 * 1000; // 5 минут — принудительное закрытие мёртвых WS
const STAINLESS_HEADERS = [
    'x-stainless-retry-count',
    'x-stainless-lang',
    'x-stainless-package-version',
    'x-stainless-os',
    'x-stainless-arch',
    'x-stainless-runtime',
    'x-stainless-runtime-version',
];

// ── Валидация env при старте ──────────────────────────────────────────────────
function validateEnv(env) {
    const required = ['TARGET_HOST', 'BROWSER_UA'];
    for (const key of required) {
        if (!env[key]) throw new Error(`Missing required env variable: ${key}`);
    }
    if (!env.CF_ACCESS_CLIENT_ID || !env.CF_ACCESS_CLIENT_SECRET) {
        console.warn('[bridge] CF_ACCESS_CLIENT_ID or CF_ACCESS_CLIENT_SECRET not set — requests may be blocked by WAF');
    }
}

export default {
    async fetch(request, env, ctx) {
        // Падаем немедленно, если критические переменные отсутствуют
        try {
            validateEnv(env);
        } catch (err) {
            console.error('[bridge] Configuration error:', err.message);
            return new Response('Worker misconfigured', { status: 500 });
        }

        const url = new URL(request.url);
        url.hostname  = env.TARGET_HOST;
        url.protocol  = 'https:'; // явно — и для HTTP, и для WS-ветки

        // ── Общая инъекция заголовков ─────────────────────────────────────────
        const newHeaders = new Headers(request.headers);

        if (env.CF_ACCESS_CLIENT_ID && env.CF_ACCESS_CLIENT_SECRET) {
            newHeaders.set('CF-Access-Client-Id',     env.CF_ACCESS_CLIENT_ID);
            newHeaders.set('CF-Access-Client-Secret', env.CF_ACCESS_CLIENT_SECRET);
        }

        newHeaders.set('user-agent', env.BROWSER_UA);
        newHeaders.set('host',       env.TARGET_HOST);

        // Удаляем Stainless SDK fingerprint (Pi Agent / OpenAI SDK артефакты)
        for (const h of STAINLESS_HEADERS) newHeaders.delete(h);

        // ── WebSocket path ────────────────────────────────────────────────────
        const upgradeHeader = request.headers.get('Upgrade');
        if (upgradeHeader && upgradeHeader.toLowerCase() === 'websocket') {
            return handleWebSocket(request, url, newHeaders, env, ctx);
        }

        // ── HTTP path ─────────────────────────────────────────────────────────
        const proxyRequest = new Request(url.toString(), {
            method:   request.method,
            headers:  newHeaders,
            body:     request.method !== 'GET' && request.method !== 'HEAD'
                          ? request.body
                          : null,
            redirect: 'follow',
        });

        try {
            const response = await fetch(proxyRequest);
            // Явно конструируем ответ — не передаём объект response целиком,
            // чтобы избежать проброса нестандартных полей (url, type и т.д.)
            return new Response(response.body, {
                status:     response.status,
                statusText: response.statusText,
                headers:    response.headers,
            });
        } catch (err) {
            // Не раскрываем детали клиенту — только логируем
            console.error('[bridge] HTTP upstream error:', err.message);
            return new Response('Upstream error', { status: 502 });
        }
    },
};

// ── WebSocket handler ─────────────────────────────────────────────────────────
async function handleWebSocket(request, url, baseHeaders, env, ctx) {
    // CF Workers принимает https://, не wss:// — заголовок Upgrade сообщит
    // апстриму о намерении на апгрейд
    url.protocol = 'https:';

    const wsHeaders = new Headers(baseHeaders);
    wsHeaders.set('Upgrade',    'websocket');
    wsHeaders.set('Connection', 'Upgrade');

    // Пробрасываем стандартные WS-заголовки от клиента
    for (const h of [
        'Sec-WebSocket-Key',
        'Sec-WebSocket-Version',
        'Sec-WebSocket-Extensions',
        'Sec-WebSocket-Protocol',
    ]) {
        const v = request.headers.get(h);
        if (v) wsHeaders.set(h, v);
    }

    // ── Сначала коннект к апстриму ────────────────────────────────────────────
    let upstreamWS;
    try {
        const upstreamResp = await fetch(url.toString(), { headers: wsHeaders });
        upstreamWS = upstreamResp.webSocket;
        if (!upstreamWS) {
            console.error('[bridge] Upstream returned no WebSocket, status:', upstreamResp.status);
            return new Response('Upstream WebSocket handshake failed', { status: 502 });
        }
    } catch (err) {
        console.error('[bridge] WS upstream connect error:', err.message);
        return new Response('Upstream error', { status: 502 });
    }

    // ── WebSocketPair и accept() — только после успешного апстрима ───────────
    const { 0: clientSocket, 1: serverSideOfClient } = new WebSocketPair();
    serverSideOfClient.accept();
    upstreamWS.accept();

    // ── Состояние сессии ──────────────────────────────────────────────────────
    let closing = false; // флаг: закрытие уже инициировано

    function safeClose(socket, code, reason) {
        try { socket.close(code, reason); } catch (_) {}
    }

    function closeAll(code = 1001, reason = 'session ended') {
        if (closing) return;
        closing = true;
        safeClose(upstreamWS,        code, reason);
        safeClose(serverSideOfClient, code, reason);
    }

    // ── Таймаут мёртвых соединений ────────────────────────────────────────────
    const timeoutId = setTimeout(() => {
        console.warn('[bridge] WS session timeout, force closing');
        closeAll(1001, 'timeout');
    }, WS_TIMEOUT_MS);

    // ── Двунаправленный пайп ──────────────────────────────────────────────────
    const pipeClientToServer = new Promise((resolve) => {
        serverSideOfClient.addEventListener('message', (evt) => {
            // Guard: не шлём в уже закрытый сокет
            if (closing) return;
            try { upstreamWS.send(evt.data); }
            catch (e) { console.error('[bridge] client→server send error:', e.message); }
        });
        serverSideOfClient.addEventListener('close', (evt) => {
            closeAll(evt.code, evt.reason);
            resolve();
        });
        serverSideOfClient.addEventListener('error', (evt) => {
            console.error('[bridge] client socket error:', evt.message);
            closeAll(1011, 'client error');
            resolve();
        });
    });

    const pipeServerToClient = new Promise((resolve) => {
        upstreamWS.addEventListener('message', (evt) => {
            if (closing) return;
            try { serverSideOfClient.send(evt.data); }
            catch (e) { console.error('[bridge] server→client send error:', e.message); }
        });
        upstreamWS.addEventListener('close', (evt) => {
            closeAll(evt.code, evt.reason);
            resolve();
        });
        upstreamWS.addEventListener('error', (evt) => {
            console.error('[bridge] upstream socket error:', evt.message);
            closeAll(1011, 'upstream error');
            resolve();
        });
    });

    // Держим Worker живым до закрытия обоих сокетов, затем чистим таймаут
    ctx.waitUntil(
        Promise.all([pipeClientToServer, pipeServerToClient])
            .finally(() => clearTimeout(timeoutId))
    );

    return new Response(null, { status: 101, webSocket: clientSocket });
}