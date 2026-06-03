# Deploying the `gemini-chat` edge function (the secure path)

Goal: hold the Gemini API key **server-side** so it never ships to the browser.
After this, you blank out `GEMINI_API_KEY` in `js/config.js` and the app calls the
function instead of Google directly.

Your project ref: **`lmshdzmngedixexixziy`**
Run all commands from the project root (`d:\lsrw-platform`).

---

## 1. Run the Supabase CLI (no install needed — uses npx)

```powershell
npx supabase@latest login
```
This opens a browser / asks for an access token. Log in with your Supabase account.

```powershell
npx supabase@latest link --project-ref lmshdzmngedixexixziy
```
This creates `supabase/config.toml`. If it asks for a database password you can press
Enter to skip — it isn't needed for deploying functions.

## 2. Deploy the function as PUBLIC

The function is a public AI proxy (no logged-in user required), so disable JWT
verification — this is what fixes the current **401 INVALID_CREDENTIALS**:

```powershell
npx supabase@latest functions deploy gemini-chat --no-verify-jwt
```

> Durable alternative: after `link`, add this to `supabase/config.toml` so you never
> need the flag again, then just `deploy`:
> ```toml
> [functions.gemini-chat]
> verify_jwt = false
> ```

## 3. Set the Gemini key as a server-side secret

Use the **same key value** that is currently in `js/config.js` → `GEMINI_API_KEY`
(both `AIza...` and `AQ.Ab8...` formats are accepted):

```powershell
npx supabase@latest secrets set GEMINI_API_KEY=PASTE_THE_KEY_FROM_config.js
```

## 4. Verify it works (should return 200 with text)

```powershell
$body = '{"prompt":"Reply with one word: OK"}'
curl.exe -s -X POST `
  "https://lmshdzmngedixexixziy.supabase.co/functions/v1/gemini-chat" `
  -H "apikey: <your-anon-key-from-config.js>" `
  -H "Authorization: Bearer <your-anon-key-from-config.js>" `
  -H "Content-Type: application/json" `
  -d $body
```
Expect: `{"text":"OK","model":"gemini-2.5-flash"}`

## 5. Remove the key from the browser

Once step 4 returns 200, edit `js/config.js`:

```js
GEMINI_API_KEY: '',   // now lives only in the Supabase secret — never shipped to the browser
```

`js/api/ai.js` will then use the edge function exclusively. The key is no longer in
any client-side file. Done — this is the production-secure setup.

---

### Troubleshooting
- **Still 401 after deploy:** confirm you used `--no-verify-jwt` (or the `config.toml`
  block). Re-deploy.
- **`{"error":"GEMINI_API_KEY secret is missing or invalid"}`:** the secret wasn't set
  (step 3) — secrets apply on the next invocation, no redeploy needed.
- **`npx` can't find supabase:** install via Scoop instead —
  `scoop install supabase` (see https://github.com/supabase/cli#install-the-cli).
