// Copy this file to config.js and fill in your real values.
// config.js is git-ignored so your keys are never committed.
export const config = {
    // Get a Gemini key at https://aistudio.google.com/app/apikey
    // It MUST start with "AIza" — anything else (e.g. "AQ.Ab8...") is the wrong credential type.
    GEMINI_API_KEY: 'AIzaYOUR_GEMINI_API_KEY',

    // From Supabase Dashboard → Project Settings → API
    SUPABASE_URL: 'https://YOUR_PROJECT.supabase.co',

    // Use the **anon/public** key only — NEVER the service_role key (it bypasses RLS).
    SUPABASE_ANON_KEY: 'YOUR_SUPABASE_ANON_KEY'
};
