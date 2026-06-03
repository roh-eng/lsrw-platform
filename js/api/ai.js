/**
 * AI Evaluation API
 *
 * PRIMARY path (secure): calls the Supabase Edge Function `gemini-chat`,
 * which holds the Gemini key server-side. The key is never exposed in the browser.
 *
 * FALLBACK path (local dev): if the edge function is unreachable for ANY reason
 * (not deployed, auth rejected, misconfigured secret, 5xx) AND a usable key is
 * present in config.js, it calls Google directly.
 * In production, deploy a working function and leave GEMINI_API_KEY blank in config.js.
 *
 * Note: Gemini API keys come in two valid formats — the classic "AIza..." and the
 * newer "AQ.Ab8..." format. Both work as a ?key= query param. We accept either.
 */

import { config } from '../config.js';

const SUPABASE_URL = config.SUPABASE_URL;
const ANON_KEY     = config.SUPABASE_ANON_KEY;
const DIRECT_KEY   = config.GEMINI_API_KEY;

const EDGE_URL = SUPABASE_URL && !SUPABASE_URL.includes('YOUR_')
    ? `${SUPABASE_URL}/functions/v1/gemini-chat`
    : '';

function directKeyUsable() {
    // Accept any real Gemini key ("AIza..." or "AQ.Ab8..."); reject blanks/placeholders.
    return !!DIRECT_KEY && !DIRECT_KEY.includes('YOUR_') && DIRECT_KEY.length > 20;
}

function getMessage(e) {
    return e && typeof e === 'object' && 'message' in e ? String(e.message) : String(e);
}

/* ── Edge-function call (secure, primary) ── */
async function callEdge(prompt) {
    const res = await fetch(EDGE_URL, {
        method: 'POST',
        headers: {
            'Content-Type':  'application/json',
            'apikey':        ANON_KEY,
            'Authorization': `Bearer ${ANON_KEY}`,
        },
        body: JSON.stringify({ prompt }),
    });

    /* Any non-2xx (404 not deployed, 401 bad creds, 5xx) → edge unavailable, fall back */
    if (!res.ok) throw new Error(`EDGE_UNAVAILABLE (HTTP ${res.status})`);

    const data = await res.json().catch(() => ({}));
    if (data.error) throw new Error(`EDGE_UNAVAILABLE (${data.error})`);
    if (!data.text) throw new Error('EDGE_UNAVAILABLE (empty response)');
    return data.text;
}

/* ── Direct Google call (local-dev fallback only) ── */
async function callDirect(prompt) {
    const models = [
        'v1beta/models/gemini-2.5-flash',
        'v1beta/models/gemini-2.0-flash',
        'v1beta/models/gemini-1.5-flash',
    ];
    let lastErr = '';
    for (const m of models) {
        try {
            const res = await fetch(
                `https://generativelanguage.googleapis.com/${m}:generateContent?key=${DIRECT_KEY}`,
                { method: 'POST', headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) }
            );
            if (res.ok) {
                const data = await res.json();
                const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';
                if (text) return text;
                lastErr = `empty response from ${m}`;
                continue;
            }
            /* Any non-OK (404/400/429/5xx incl. transient overload) → try the next model */
            lastErr = `HTTP ${res.status} on ${m}`;
        } catch (e) {
            lastErr = getMessage(e);
        }
    }
    throw new Error(`All Gemini models failed (${lastErr})`);
}

/* ── Unified generate: edge first, then direct fallback ── */
async function generate(prompt) {
    if (EDGE_URL) {
        try {
            return await callEdge(prompt);
        } catch (e) {
            const edgeMsg = getMessage(e);
            /* Edge unreachable/misconfigured — fall back to the direct key if usable (dev) */
            if (directKeyUsable()) {
                console.warn(`Edge function unavailable — ${edgeMsg}. Using direct Gemini call (dev only).`);
                return await callDirect(prompt);
            }
            /* No usable key either → actionable guidance */
            throw new Error(
                `AI unavailable: edge function not reachable (${edgeMsg}) and no usable ` +
                'Gemini key in js/config.js. Fix/deploy the gemini-chat function, or set a ' +
                'valid GEMINI_API_KEY (get one at aistudio.google.com/app/apikey).'
            );
        }
    }
    if (directKeyUsable()) return await callDirect(prompt);
    throw new Error('No AI backend configured. Deploy the gemini-chat function or set a valid Gemini key in js/config.js.');
}

/**
 * Evaluate a writing/speaking task.
 * @returns {Promise<{score:number, feedback:string}>}
 */
export async function evaluateWritingTask(taskContext, userResponse) {
    const prompt = `You are a strict Corporate Communication Evaluator grading a student.

Task: "${taskContext}"

Student response:
"""
${userResponse}
"""

Evaluate on grammar, tone, context accuracy, and clarity.
Responses under 10 words should score below 40.

Reply ONLY with valid JSON — no markdown:
{"score": <0-100>, "feedback": "<2-3 sentences of direct, constructive feedback>"}`;

    try {
        const raw    = await generate(prompt);
        const clean  = raw.replace(/```json/g, '').replace(/```/g, '').trim();
        const result = JSON.parse(clean);
        return {
            score:    Math.max(0, Math.min(100, Number(result.score) || 0)),
            feedback: result.feedback ?? 'Evaluation complete.',
        };
    } catch (err) {
        console.error('AI Evaluation Error:', getMessage(err));
        const base = simulateEvaluation(userResponse);
        return { score: base.score, feedback: `AI unavailable — ${getMessage(err).slice(0, 110)}` };
    }
}

function simulateEvaluation(text) {
    const words = (text ?? '').trim().split(/\s+/).filter(Boolean).length;
    return {
        score:    words >= 50 ? 80 : words >= 25 ? 70 : words >= 10 ? 55 : 40,
        feedback: `AI evaluation unavailable — scored on word count (${words} words).`,
    };
}

/**
 * Chatbot message.
 * @returns {Promise<string>}
 */
export async function sendChatMessage(userMessage) {
    const prompt = `You are a helpful AI Tutor on an LSRW placement-prep platform. Answer concisely in 2-3 sentences. Student asks: "${userMessage}"`;
    try {
        const text = await generate(prompt);
        return text || 'Sorry, I could not generate a response.';
    } catch (err) {
        console.error('AI Chat Error:', getMessage(err));
        return `AI unavailable: ${getMessage(err).slice(0, 90)}`;
    }
}
