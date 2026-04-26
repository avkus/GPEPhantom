# Walkthrough - GPhantom Zero Trust Architecture

We have successfully established a highly professional, secure, and permanent connection between the **Pi Agent** and the **GPhantom API** using Cloudflare Zero Trust and Workers.

## Final Architecture

### The Problem
The Pi agent's built-in networking library hardcodes a `User-Agent` (`OpenAI/JS`) and strips custom Cloudflare Access headers (`CF-Access-Client-Id` / `Secret`), which caused Cloudflare's WAF to block all requests with a `403 Forbidden`.

### The Solution: Cloudflare Worker Bridge
Instead of running a fragile local script, we deployed a serverless bridge directly to the edge: **`gphantom-bridge.avkus.workers.dev`**.

1. **Pi Agent** -> Sends a standard, unauthenticated request to the Worker.
2. **Worker** -> Intercepts the request at the edge.
3. **Header Injection** -> The Worker securely injects the `CF-Access` Service Tokens (stored securely in Cloudflare Secrets) and rewrites the `User-Agent` to disguise it as a modern browser.
4. **GPhantom API** -> Receives a perfectly formatted, authorized request that bypasses the WAF and processes the AI completion.

## Configuration Details

### Worker Code Repository
The source code for your Cloudflare worker is safely stored in your repository at:
`e:\AI-Ecosystem\The-Phantom-Nexus\GPEPhantom\workers\gphantom-bridge`

### Pi Agent `models.json`
The configuration file (`C:\Users\andre\.pi\agent\models.json`) has been updated:
- **Base URL**: `https://gphantom-bridge.avkus.workers.dev/v1`
- **Secrets Removed**: Cloudflare tokens are no longer stored in plain text locally.
- **Models**: All 22 active models have been correctly prefixed (`api/`, `cli/`, `vertex/`, `at/`).

## Cleanup
You can now safely delete the temporary local interceptor script:
```powershell
rm C:\Users\andre\.pi\agent\gphantom_bridge.js
```
