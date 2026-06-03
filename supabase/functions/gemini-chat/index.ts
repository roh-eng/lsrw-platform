/**
 * Gemini Proxy — Supabase Edge Function (official @google/genai SDK)
 *
 * Keeps the Gemini API key SERVER-SIDE so it is never exposed in the browser.
 * The frontend calls this function; this function calls Google.
 *
 * Deploy:
 *   supabase functions deploy gemini-chat --no-verify-jwt
 *
 * Set the secret (either key format works — "AIza..." or "AQ.Ab8..."):
 *   supabase secrets set GEMINI_API_KEY=<your-real-key>
 *
 * Request:  { "prompt": "user text" }
 * Response: { "text": "...", "model": "..." }  |  { "error": "..." }
 */

import { GoogleGenAI } from 'npm:@google/genai';

const KEY = Deno.env.get('GEMINI_API_KEY') ?? '';

/* Try newest → oldest; first model that succeeds wins */
const MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];

const CORS = {
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: object, status = 200): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { ...CORS, 'Content-Type': 'application/json' },
    });
}

Deno.serve(async (req: Request): Promise<Response> => {
    /* CORS preflight */
    if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
    if (req.method !== 'POST')    return json({ error: 'Method not allowed' }, 405);

    /* Validate the secret — accept either Gemini key format ("AIza..." or "AQ.Ab8...") */
    if (!KEY || KEY.length < 20 || KEY.includes('YOUR_')) {
        return json({
            error: 'GEMINI_API_KEY secret is missing or invalid. ' +
                   'Set it with: supabase secrets set GEMINI_API_KEY=<your-key>'
        }, 500);
    }

    /* Parse prompt */
    let prompt = '';
    try {
        const body = await req.json();
        prompt = String(body?.prompt ?? '').slice(0, 8000);
    } catch {
        return json({ error: 'Invalid JSON body.' }, 400);
    }
    if (!prompt) return json({ error: 'No prompt provided.' }, 400);

    /* Call Gemini via the official SDK, with model fallback */
    const ai = new GoogleGenAI({ apiKey: KEY });
    let lastErr = '';

    for (const model of MODELS) {
        try {
            const response = await ai.models.generateContent({ model, contents: prompt });
            const text = response.text ?? '';
            if (text) return json({ text: text.trim(), model });
            lastErr = `empty response from ${model}`;
        } catch (e) {
            lastErr = e instanceof Error ? e.message : String(e);
            /* model unavailable / not found → try the next one */
        }
    }

    return json({ error: `All Gemini models failed. Last: ${lastErr}` }, 502);
});
