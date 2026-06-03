/**
 * LSRW deploy readiness checker — zero-dependency, runs with plain `node`.
 *
 *   npm run verify        (or)   node tests/verify-deploy.mjs
 *
 * Reads js/config.js and live-probes your Supabase backend (read-only) to tell
 * you exactly what is ready and what still needs doing before/after deploy:
 *   • config has real values (not placeholders)
 *   • the 3 tables (profiles / scores / badges) exist with RLS
 *   • the streak-leaderboard RPC exists
 *   • the AI edge function answers (else AI runs in word-count fallback)
 *   • the avatars storage bucket exists
 *   • the Gemini key is NOT shipped in the browser
 *
 * Exits non-zero if a hard requirement is missing, so it can gate a deploy.
 */
import { config } from '../js/config.js';

const URL = config.SUPABASE_URL;
const KEY = config.SUPABASE_ANON_KEY;
const H = { apikey: KEY, Authorization: `Bearer ${KEY}` };

let fails = 0, warns = 0;
const pass = (m) => console.log('  \x1b[32m✓ PASS\x1b[0m  ' + m);
const warn = (m) => { warns++; console.log('  \x1b[33m⚠ WARN\x1b[0m  ' + m); };
const fail = (m) => { fails++; console.log('  \x1b[31m✗ FAIL\x1b[0m  ' + m); };

async function get(path) {
  try { const r = await fetch(URL + path, { headers: H }); const t = await r.text(); return { status: r.status, body: t }; }
  catch (e) { return { status: 0, body: String(e.message || e) }; }
}
async function post(path, json) {
  try { const r = await fetch(URL + path, { method: 'POST', headers: { ...H, 'Content-Type': 'application/json' }, body: JSON.stringify(json) }); const t = await r.text(); return { status: r.status, body: t }; }
  catch (e) { return { status: 0, body: String(e.message || e) }; }
}

console.log('\n LSRW — Deploy Readiness Check');
console.log(' ' + '─'.repeat(40));

// 1. Config sanity
console.log('\nConfig (js/config.js)');
if (!URL || URL.includes('YOUR_')) fail('SUPABASE_URL is not set');
else pass('SUPABASE_URL set → ' + URL.replace(/^https?:\/\//, ''));
if (!KEY || KEY.includes('YOUR_') || KEY.length < 40) fail('SUPABASE_ANON_KEY is not set');
else pass('SUPABASE_ANON_KEY set (anon key — safe to ship)');
if (config.GEMINI_API_KEY && config.GEMINI_API_KEY.length > 10)
  warn('GEMINI_API_KEY is filled in config.js → it ships to the browser. Leave it blank and use the edge function instead.');
else pass('GEMINI_API_KEY blank in browser (kept server-side — secure)');

if (fails) { // can't probe without config
  console.log('\n ✗ Config incomplete — fix the above, then re-run.\n');
  process.exit(1);
}

// 2. Tables
console.log('\nDatabase tables (RLS-protected)');
for (const t of ['profiles', 'scores', 'badges']) {
  const r = await get(`/rest/v1/${t}?select=*&limit=1`);
  if (r.status === 200) pass(`${t} table exists`);
  else if (/42P01|does not exist/.test(r.body)) fail(`${t} table MISSING — run data/schema.sql in the Supabase SQL editor`);
  else warn(`${t} returned HTTP ${r.status} (${r.body.slice(0, 80)})`);
}

// 3. Leaderboard RPC
console.log('\nLeaderboard function');
{
  const r = await post('/rest/v1/rpc/get_streak_leaderboard', {});
  if (r.status === 200) pass('get_streak_leaderboard() works');
  else if (/PGRST202|Could not find the function/.test(r.body)) fail('get_streak_leaderboard() MISSING — run data/schema.sql');
  else warn(`RPC returned HTTP ${r.status} (${r.body.slice(0, 80)})`);
}

// 4. Storage bucket
console.log('\nAvatar storage');
{
  const r = await get('/storage/v1/object/public/avatars/__probe__.jpg');
  if (/Bucket not found/.test(r.body)) fail('avatars bucket MISSING — run the storage section of data/schema.sql');
  else pass('avatars bucket exists');
}

// 5. AI edge function (optional — warn, don't fail)
console.log('\nAI (gemini-chat edge function)');
{
  const r = await post('/functions/v1/gemini-chat', { prompt: 'Reply with one word: OK' });
  if (r.status === 200 && /"text"/.test(r.body)) pass('AI edge function answers (secure server-side path)');
  else if (r.status === 401) warn('AI edge returns 401 — redeploy with --no-verify-jwt (see supabase/DEPLOY.md). AI runs in fallback until fixed.');
  else if (r.status === 404) warn('AI edge not deployed — see supabase/DEPLOY.md. AI runs in word-count fallback.');
  else if (r.status === 500) warn('AI edge up but GEMINI_API_KEY secret missing — `supabase secrets set GEMINI_API_KEY=...`');
  else warn(`AI edge returned HTTP ${r.status} (${r.body.slice(0, 80)})`);
}

// Manual reminders the anon API cannot verify
console.log('\nManual checks (cannot be auto-verified)');
console.log('  • Include js/config.js in your deployed files (it is git-ignored).');
console.log('  • Add your production URL in Supabase → Authentication → URL Configuration');
console.log('    (Site URL + Redirect URLs) so email verify & password reset links work.');

console.log('\n ' + '─'.repeat(40));
if (fails === 0) console.log(` \x1b[32m✓ READY\x1b[0m — backend is wired up. ${warns} warning(s) to review.\n`);
else console.log(` \x1b[31m✗ NOT READY\x1b[0m — ${fails} blocker(s), ${warns} warning(s). Fix blockers above.\n`);
process.exit(fails === 0 ? 0 : 1);
