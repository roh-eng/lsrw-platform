import fs from 'fs';
import path from 'path';

// Text formatting for console
const reset = '\x1b[0m';
const red = '\x1b[31m';
const green = '\x1b[32m';
const yellow = '\x1b[33m';
const bold = '\x1b[1m';
const cyan = '\x1b[36m';

console.log(`\n${bold}🚀 LSRW Platform Deployment Pre-Flight Check${reset}\n`);

async function runChecks() {
    let configPath = path.join(process.cwd(), 'js', 'config.js');
    let hasConfig = fs.existsSync(configPath);
    let SUPABASE_URL = '';
    let SUPABASE_ANON_KEY = '';
    let GEMINI_API_KEY = '';

    console.log(`${bold}1. Configuration Check${reset}`);
    if (!hasConfig) {
        console.log(`  ${red}❌ FAILED:${reset} js/config.js is missing. You MUST upload this file to your hosting provider or the app will be blank.`);
        console.log(`     (Note: It is .gitignored by design. Do not commit it to GitHub. Set it as an environment variable or manually upload it to Vercel/Netlify/etc.)\n`);
    } else {
        console.log(`  ${green}✅ PASSED:${reset} js/config.js exists locally.`);
        try {
            // Very simple parsing since it's an ES module
            const configText = fs.readFileSync(configPath, 'utf8');
            const urlMatch = configText.match(/SUPABASE_URL\s*:\s*['"`](.*?)['"`]/);
            const keyMatch = configText.match(/SUPABASE_ANON_KEY\s*:\s*['"`](.*?)['"`]/);
            const geminiMatch = configText.match(/GEMINI_API_KEY\s*:\s*['"`](.*?)['"`]/);
            
            if (urlMatch) SUPABASE_URL = urlMatch[1];
            if (keyMatch) SUPABASE_ANON_KEY = keyMatch[1];
            if (geminiMatch) GEMINI_API_KEY = geminiMatch[1];

            if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
                console.log(`  ${red}❌ FAILED:${reset} Could not parse SUPABASE_URL or SUPABASE_ANON_KEY from js/config.js.`);
                return; // Stop if we can't ping supabase
            }
        } catch (err) {
            console.log(`  ${red}❌ ERROR:${reset} Failed to read js/config.js: ${err.message}`);
        }
    }

    if (!SUPABASE_URL) {
        console.log(`\n${yellow}Skipping Supabase tests since credentials are missing.${reset}\n`);
        return;
    }

    const headers = {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
    };

    console.log(`\n${bold}2. Supabase Database Schema Check${reset}`);
    
    // Check tables
    const tables = ['scores', 'profiles', 'badges'];
    let allTablesPassed = true;
    for (let table of tables) {
        try {
            const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=id&limit=1`, { headers });
            
            if (res.ok) {
                console.log(`  ${green}✅ PASSED:${reset} Table '${table}' exists.`);
            } else {
                allTablesPassed = false;
                const errText = await res.text();
                if (errText.includes("relation") && errText.includes("does not exist")) {
                     console.log(`  ${red}❌ FAILED:${reset} Table '${table}' DOES NOT EXIST.`);
                } else {
                     console.log(`  ${red}❌ FAILED:${reset} Table '${table}' check returned: ${res.status} ${res.statusText}`);
                }
            }
        } catch (e) {
            console.log(`  ${red}❌ ERROR:${reset} Network error checking table '${table}': ${e.message}`);
        }
    }

    if (!allTablesPassed) {
        console.log(`\n     ${yellow}ACTION REQUIRED:${reset} You need to run the full \`data/schema.sql\` in the Supabase SQL editor.`);
        console.log(`     If 'profiles' or 'badges' are missing, core features (streaks, leaderboard, saving) will fail silently.\n`);
    }

    console.log(`\n${bold}3. AI Edge Function Check (gemini-chat)${reset}`);
    try {
        const body = JSON.stringify({ prompt: "Reply with OK" });
        const res = await fetch(`${SUPABASE_URL}/functions/v1/gemini-chat`, {
            method: 'POST',
            headers,
            body
        });

        if (res.status === 404) {
            console.log(`  ${yellow}⚠️ WARNING:${reset} gemini-chat function is NOT deployed (404 Not Found).`);
            console.log(`     Run: supabase functions deploy gemini-chat --no-verify-jwt`);
        } else if (res.status === 401) {
            console.log(`  ${red}❌ FAILED:${reset} gemini-chat function returned 401 (INVALID_CREDENTIALS or JWT required).`);
            console.log(`     Run: supabase functions deploy gemini-chat --no-verify-jwt`);
        } else if (res.status === 200) {
            console.log(`  ${green}✅ PASSED:${reset} gemini-chat function is deployed and reachable!`);
        } else if (res.status === 500) {
            console.log(`  ${yellow}⚠️ WARNING:${reset} gemini-chat returned 500. It might be missing the GEMINI_API_KEY secret.`);
            console.log(`     Run: supabase secrets set GEMINI_API_KEY=your_key`);
        } else {
             console.log(`  ${yellow}⚠️ WARNING:${reset} gemini-chat function returned ${res.status}. Check logs in Supabase.`);
        }
    } catch (e) {
         console.log(`  ${red}❌ ERROR:${reset} Failed to connect to Edge Function: ${e.message}`);
    }

    console.log(`\n${bold}4. Frontend Hardcoded Keys Check${reset}`);
    if (GEMINI_API_KEY && GEMINI_API_KEY.length > 5) {
        console.log(`  ${yellow}⚠️ WARNING:${reset} GEMINI_API_KEY is still hardcoded in js/config.js.`);
        console.log(`     Once edge function works, remove it so it's not exposed to the browser.`);
    } else {
         console.log(`  ${green}✅ PASSED:${reset} No Gemini key hardcoded in frontend config.`);
    }
    
    console.log(`\n${cyan}Done! Review the warnings above before launching.${reset}\n`);
}

runChecks();
