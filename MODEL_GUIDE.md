# 🏛️ Google AI Studio Limits Cheat Sheet

**Prefix: `api/`** — Models accessible via API Key (Free Tier)

> Use this guide for configuring mapping and model selection in Roo Code / Claude Code.

---

## 📊 API Key Models (Free Tier)

| Model (Phantom ID) | RPM | TPM | RPD (Daily Limit) | Features / Purpose |
|---|---|---|---|---|
| `api/gemma-4-31b-it` | 15 | **Unlimited** | 1 500 | **TOP 1**: Ideal for coding, no text size limit. |
| `api/gemma-4-26b-a4b-it` | 15 | **Unlimited** | 1 500 | **TOP 2**: Slightly faster than 31B, same limits. |
| `api/gemini-3.1-flash-lite` | 15 | 250K | 500 | Stable workhorse for minor fixes. |
| `api/gemma-3-27b` | 30 | 15K | 14 400 | Bulk tasks: Huge daily limit, but very low TPM (a few pages/min). |
| `api/gemini-2.5-flash-lite` | 10 | 250K | 20 | Very low daily limit — nearly useless. |
| `api/gemini-3-flash` | 5 | 250K | 20 | Almost unusable due to 20 RPD limit. |
| `api/gemini-embedding-2` | 100 | 30K | 1 000 | **Embeddings only**: Vectorization and search (dimensionality 3072). |

---

## ⚠️ Critical Notes (MEMORIZE THIS)

### ❌ PRO Models DO NOT WORK
The quota list clearly shows: **Gemini 3.1 Pro**, **Gemini 2.5 Pro**, **Gemini 3 Pro** have limits of **0 / 0 / 0**.  
Through a regular API key (Free Tier), **they will never work**.  
For these models, you need either:
- **Vertex AI** (paid GCP channel)
- **CLI OAuth** (browser-based authentication)
- **Antigravity** (alternative access method)

### 🎮 Gemma 4 is a Cheat Code
**Unlimited TPM** means you can feed it files of any size (within the 128k context window) without "Rate limit reached" errors.  
**1 500 requests per day per key** = **22 500 requests/day** across your farm of 15 keys.

### 🔧 Gemma 3 is for "Small Stuff"
**14 400 RPD** is enormous, but **15K TPM** is very low (only a couple pages of text per minute).  
Suitable for short queries and quick questions.

---

## 🚀 Your "Golden Stack" for Working

| Task | Recommended Model | Notes |
|---|---|---|
| **Coding (Roo Code)** | `api/gemma-4-31b-it` | Your primary powerhouse for code generation. |
| **Thinking (Reasoning)** | `cli/gemini-2.5-flash` or `at/gemini-3-flash` | Where you saw reasoning tokens. |
| **Google Search / Grounding** | Any model with Search grounding limit (1.5K RPD) | Use for web-augmented queries. |

---

## 🏛️ Complete Model Inventory (All Channels)

### Access Types Explained
- **`api/`** — API Key (Free Tier)
- **`cli/`** — OAuth via CLI browser login (unlocks Pro models)
- **`vertex/`** — Vertex AI (paid GCP channel, ~$140/month)
- **`at/`** — Antigravity (Web USA only, bypasses BY region restrictions)

### Full Hierarchy

| Model (Prefix/ID) | Access Type | Reasoning (Thoughts) | Purpose |
|---|---|---|---|
| `cli/gemini-2.5-pro` | OAuth (CLI) | ✅ **1000+ tokens** | **TOP 1**: Most powerful intelligence for complex code. |
| `cli/gemini-3.1-pro-preview` | OAuth (CLI) | ✅ **High** | **TOP 2**: Newest logic, architecture tests. |
| `vertex/gemini-3.1-pro-preview` | Vertex AI | ✅ Medium (~300) | **Reserve**: Paid channel ($140), when CLI sleeps. |
| `api/gemma-4-31b-it` | API Key | ❌ NO | **Bulk**: Fast writing of simple functions. |
| `api/gemini-3.1-flash-lite` | API Key | ❌ NO | **Economy**: Minor fixes, 500 RPD limit. |
| `at/gemini-3-flash` | Antigravity | ❌ NO | **Regional bypass**: Web USA only, bypasses BY region restrictions. |

---

## 🚀 Global Mapping (Global Rewrite)

To avoid typing long IDs in Roo Code, create **Beautiful Aliases** in the admin panel under the **Global Rewrite** tab.

### Recommended Alias Scheme

| Alias | Maps To | Use Case |
|---|---|---|
| `think-pro` | `cli/gemini-2.5-pro` | For the heaviest tasks requiring maximum intelligence. |
| `think-flash` | `cli/gemini-2.5-flash` | For quick debugging with reasoning thoughts. |
| `fast-code` | `api/gemma-4-31b-it` | For primary coding work (your daily driver). |

---

## 💡 Quick Reference

### When to Use Which Model

| Situation | Choose | Why |
|---|---|---|
| Writing complex feature | `think-pro` (`cli/gemini-2.5-pro`) | Maximum reasoning depth. |
| Quick bug fix | `fast-code` (`api/gemma-4-31b-it`) | Fast, unlimited TPM for large files. |
| Explaining code | `think-flash` (`cli/gemini-2.5-flash`) | Good balance of speed + intelligence. |
| Bulk text processing | `api/gemma-4-31b-it` | Unlimited TPM, won't hit rate limits. |
| Simple Q&A (100s/day) | `api/gemma-3-27b` | 14 400 RPD daily buffer. |
| Production deployment | `vertex/gemini-3.1-pro-preview` | Paid, stable, always available. |

---

## 📝 Notes

- **RPD** = Requests Per Day
- **RPM** = Requests Per Minute
- **TPM** = Tokens Per Minute
- All API Key models use the `api/` prefix in GPEPhantom configuration
- OAuth models (`cli/`) require periodic re-authentication via browser
- Vertex models (`vertex/`) require GCP service account credentials

---

*Last updated: 8 апреля 2026 г.*  
*Based on current quota inventory from Google AI Studio Free Tier*
