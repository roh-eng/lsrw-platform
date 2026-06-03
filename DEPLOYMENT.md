# LSRW Platform — Deployment Checklist

Your final checklist before pointing real users at the app.

The frontend is a **static site** (HTML/CSS/JS, no build step) backed by **Supabase**.
Host it anywhere static: Netlify, Vercel, Cloudflare Pages, GitHub Pages, or Supabase Hosting.

---

## ✅ Live status (verified 2026-06-03 with `npm run verify`)

Your backend is **already set up**. A live, read-only probe confirmed:

| Component | Status |
|---|---|
| `profiles` / `scores` / `badges` tables (RLS on) | ✅ live |
| `get_streak_leaderboard()` RPC | ✅ live |
| `avatars` storage bucket | ✅ live |
| `gemini-chat` AI edge function | ✅ live — returns 200, Gemini key stays server-side |
| Content data banks (`npm test`) | ✅ 0 errors |
| Tailwind CSS | ✅ compiled & minified to `css/tailwind.css` (no CDN) |

So the two original "blockers" from earlier drafts are **done**: the schema is fully
applied, and AI is **not** in fallback mode — the chatbot and AI grading work through
the secure edge function (no Gemini key ships to the browser).

Re-check any time:

```bash
npm run verify   # live-probes Supabase tables, RPC, storage, AI function
npm test         # validates all exam question banks
```

---

## 🔴 The only 2 things left to do (when you deploy)

These cannot be auto-verified through the public anon key — you must do them by hand.

### 1. Ship `js/config.js` with your files
`js/config.js` is git-ignored, so a **git-connected deploy (Vercel/Netlify/GitHub
Pages) will leave it out** → the app can't reach Supabase → blank screen.
- **Direct upload (drag-drop / CLI / FTP):** just include `js/config.js`. Easiest.
- **Git-connected host:** recreate `js/config.js` on the host (it only holds the
  Supabase URL + the public anon key, which are safe to ship).

### 2. Whitelist your production URL in Supabase
Dashboard → **Authentication → URL Configuration**:
- Set **Site URL** to your domain (e.g. `https://lsrw.pro`).
- Add `https://lsrw.pro/*` to **Redirect URLs**.
- **Why:** signup verification and password-reset links use `window.location.origin`.
  If the prod URL isn't whitelisted, those email links are rejected.

---

## 🚀 Deploy steps

1. `npm run verify` → confirm **READY**.
2. `npm test` → confirm content checks pass.
3. Upload the folder (must include `index.html`, `css/`, `js/` **with `config.js`**,
   `images/`, `favicon.svg`).
4. Set Supabase Site URL + Redirect URLs to the new domain.
5. Open the site → sign up → finish one module → confirm the dashboard updates.

---

## 🟢 Recommended (not required)

1. **Tailwind is now compiled (done).** The Play CDN + inline config were replaced
   with a real build — `css/tailwind.css` (≈21 KB minified) is committed, so no
   build runs at deploy time. **If you change any class names** in `index.html` or
   `js/**`, rebuild with `npm run build:css` (or keep `npm run watch:css` running
   while developing) and redeploy the updated `css/tailwind.css`.
2. **Run `npm test` + `npm run verify` in your release routine** so content or
   backend regressions can't ship silently.
3. **If you ever put the Gemini key back in `config.js`,** restrict it by HTTP
   referrer in Google Cloud Console so a copied key can't be abused.

---

## Related docs
- `supabase/DEPLOY.md` — how the secure `gemini-chat` AI function was set up.
- `SECURITY.md` — security review (keys, RLS, what is / isn't safe to expose).
- `data/schema.sql` — full database schema (already applied to the live project).
