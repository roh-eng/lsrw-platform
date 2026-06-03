# Security Audit — LSRW Platform

_Last reviewed: 2026-06-01_

> **Update 2026-06-03 (live re-check via `npm run verify`):** Two items below are now
> resolved. The full schema **is applied** — `profiles`, `scores`, and `badges` all
> exist with RLS (so the "profiles, badges pending" note in the table is outdated).
> The `gemini-chat` edge function now **returns 200** (finding #3 fixed), and
> `GEMINI_API_KEY` is blank in `js/config.js`, so the Gemini key stays server-side
> and is **not** exposed in the browser (finding #2 mitigated). Run `npm run verify`
> to re-confirm the live state at any time.

## ✅ What is secure

| Item | Status | Notes |
|---|---|---|
| `js/config.js` | ✅ Git-ignored | Listed in `.gitignore` line 3 — never committed |
| `js/config.example.js` | ✅ Safe | Contains only placeholders, no real keys |
| Keys hardcoded elsewhere | ✅ None found | All secrets live only in `config.js` |
| Git history | ✅ Clean | Project is not a git repo yet — nothing leaked to version control |
| Supabase **anon** key | ✅ Safe to expose | Anon keys are *designed* to be public; protected by Row-Level Security |
| Row-Level Security | ✅ Enabled | `scores` only, until `schema.sql` is fully run (`profiles`, `badges` pending) |
| Edge function secrets | ✅ Server-side | `RESEND_API_KEY`, service-role key live in Supabase secrets, never in frontend |

## 🔴 Critical findings

### 1. The AI was broken by a code bug, NOT a bad key (fixed 2026-06-01)
The Gemini key in `js/config.js` (an `AQ.Ab8...` key) was **verified working** — it
returns real `generateContent` responses against the Generative Language API.
`AQ.Ab8...` is simply the **newer Gemini API-key format**; both it and the classic
`AIza...` format are valid.

The real cause of the broken AI was two code bugs in `js/api/ai.js`:
- `directKeyUsable()` required the key to `startsWith('AIza')`, so it **rejected the
  valid `AQ.` key** and disabled the direct-call path.
- `generate()` only fell back to the direct key on an HTTP **404**. The edge function
  actually returns **401** (see finding #3), so `callEdge()` silently returned an empty
  string and the app quietly degraded to the word-count simulator.

**Fix applied:** accept either key format, and fall back to the direct key on *any*
edge-function failure. The Writing AI evaluation and chatbot now work via the direct path.

### 2. Gemini key is exposed in the browser (frontend static site)
Because this is a no-build static site, **everything in `config.js` is visible** to anyone who opens DevTools → Sources. The Supabase anon key is fine (RLS-protected), but **the Gemini key is not** — a malicious visitor could copy it and burn your quota.

**Mitigations (in order of effort):**
- **Quick:** In Google Cloud Console → Credentials → your API key → **Application restrictions → HTTP referrers**, add only your domain (e.g. `https://yoursite.com/*` and `http://localhost:5501/*`). The key then only works from your site.
- **Quick:** Set **API restrictions → Generative Language API** only, so a stolen key can't touch other Google services.
- **Best (production):** Move Gemini calls into a **Supabase Edge Function** (like `daily-reminder`). The browser calls your function; the function holds the key. The key never reaches the client. See `supabase/functions/` for the pattern. **You already have this function (`gemini-chat`) — but it currently returns 401 (see finding #3).**

### 3. The `gemini-chat` edge function rejects the anon key (401)
The function **is deployed** (a non-existent function returns 404; `gemini-chat` returns
**401 `INVALID_CREDENTIALS`**), but it rejects calls made with the anon key in `config.js`.
Until this is resolved, the app falls back to the direct (browser-side) Gemini call.

Most likely causes:
- The anon key in `config.js` is **stale** — it doesn't match the project's current JWT
  secret (e.g. keys were rotated in the Supabase dashboard). Copy the current anon key
  from **Dashboard → Project Settings → API**.
- The function was deployed **with** JWT verification but you intend it to be public.
  Redeploy with: `supabase functions deploy gemini-chat --no-verify-jwt`.

To use the secure (server-side) path, also set the secret:
`supabase secrets set GEMINI_API_KEY=<your-key>` (either key format works now).

## 🟡 Recommendations before deploying

1. **Rotate the Supabase anon key only if** the service-role key was ever pasted into frontend code (it was not — good).
2. **Never** put the Supabase **service-role** key in `config.js` or any `js/` file. It bypasses RLS. It belongs only in Supabase Edge Function secrets.
3. When you run `git init`, confirm `config.js` stays ignored:
   ```
   git status   # config.js must NOT appear under "changes to be committed"
   ```
4. Keep `.env` and `js/config.js` in `.gitignore` (already done).

## Summary
- **No secrets have leaked.** Your setup is correctly structured for a static site.
- **AI now works** via the direct path (code bugs fixed; the existing key is valid).
- **Recommended next:** restrict the Gemini key by **HTTP referrer** in Google Cloud Console so a copied key can't be abused.
- **For production:** fix the `gemini-chat` edge function (finding #3), set the `GEMINI_API_KEY` secret, then blank out `GEMINI_API_KEY` in `config.js` so the key never ships to the browser.
