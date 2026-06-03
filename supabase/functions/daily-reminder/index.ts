/**
 * LSRW Daily Streak Reminder — Supabase Edge Function
 *
 * Sends a reminder email to every user whose streak is at risk
 * (last_active_date was yesterday and streak > 0).
 *
 * Deploy:
 *   supabase functions deploy daily-reminder
 *
 * Schedule (Supabase Dashboard → Edge Functions → Cron):
 *   0 18 * * *   <-- fires every day at 6 PM UTC
 *
 * Required secrets (supabase secrets set KEY=value):
 *   SUPABASE_URL              (injected automatically)
 *   SUPABASE_SERVICE_ROLE_KEY (injected automatically)
 *   RESEND_API_KEY            (get a free key at resend.com)
 *   FROM_EMAIL                e.g. noreply@yourdomain.com
 *   APP_URL                   e.g. https://yoursite.netlify.app
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl    = Deno.env.get('SUPABASE_URL')              ?? '';
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const resendApiKey   = Deno.env.get('RESEND_API_KEY')            ?? '';
const fromEmail      = Deno.env.get('FROM_EMAIL')                ?? 'noreply@lsrw.pro';
const appUrl         = Deno.env.get('APP_URL')                   ?? 'https://lsrw.pro';

interface Profile {
    id: string;
    full_name: string | null;
    current_streak: number;
}

/** Extract a readable message from any thrown value */
function getMessage(err: unknown): string {
    if (err && typeof err === 'object' && 'message' in err) {
        return String((err as { message: unknown }).message);
    }
    return String(err);
}

Deno.serve(async (_req: Request): Promise<Response> => {
    /* ── Guard: env vars must be present ── */
    if (!supabaseUrl || !serviceRoleKey) {
        return json({ error: 'SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set.' }, 500);
    }

    try {
        /*
         * FIX: Pass auth options so the client does NOT try to use
         * localStorage (which does not exist in the Deno runtime).
         * Without these options the function crashes immediately.
         */
        const supabase = createClient(supabaseUrl, serviceRoleKey, {
            auth: {
                autoRefreshToken: false,
                persistSession:   false,
            },
        });

        /* Yesterday's date as YYYY-MM-DD */
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().slice(0, 10);

        /* Find users whose streak is at risk (active yesterday, not yet today) */
        const { data: profiles, error: dbError } = await supabase
            .from('profiles')
            .select('id, full_name, current_streak')
            .eq('last_active_date', yesterdayStr)
            .gt('current_streak', 0);

        if (dbError) {
            throw new Error(`DB query failed: ${getMessage(dbError)}`);
        }

        if (!profiles || profiles.length === 0) {
            return json({ message: 'No users to remind today.' });
        }

        let sent = 0;

        for (const profile of profiles as Profile[]) {
            /* Get user email from Supabase Auth admin API */
            const { data: authData, error: authError } =
                await supabase.auth.admin.getUserById(profile.id);

            if (authError) {
                console.warn(`Could not fetch auth user ${profile.id}: ${getMessage(authError)}`);
                continue;
            }

            const email = authData?.user?.email;
            if (!email) continue;

            const firstName  = (profile.full_name ?? 'there').split(' ')[0];
            const streakDays = profile.current_streak;
            const html       = buildEmailHtml(firstName, streakDays, appUrl);

            if (resendApiKey) {
                /* Send via Resend (https://resend.com — free tier: 3 000 emails/month) */
                const res = await fetch('https://api.resend.com/emails', {
                    method:  'POST',
                    headers: {
                        'Authorization': `Bearer ${resendApiKey}`,
                        'Content-Type':  'application/json',
                    },
                    body: JSON.stringify({
                        from:    fromEmail,
                        to:      [email],
                        subject: `🔥 Don't break your ${streakDays}-day streak, ${firstName}!`,
                        html,
                    }),
                });

                if (res.ok) {
                    sent++;
                } else {
                    const body = await res.text();
                    console.error(`Resend failed for ${email} (${res.status}): ${body}`);
                }
            } else {
                /* Dry-run: no Resend key configured */
                console.log(`[DRY RUN] Would email: ${email}  streak=${streakDays}`);
                sent++;
            }
        }

        return json({ success: true, usersReminded: sent, total: profiles.length });

    } catch (err) {
        console.error('Edge function error:', err);
        return json({ error: getMessage(err) }, 500);
    }
});

/* ── Helpers ── */

function json(body: object, status = 200): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}

function buildEmailHtml(name: string, streak: number, url: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#07090d;font-family:Inter,Arial,sans-serif;color:#edf2f7;">
  <div style="max-width:520px;margin:40px auto;padding:0 16px;">

    <div style="background:linear-gradient(135deg,#7263f3,#22d3ee);border-radius:16px;padding:32px;text-align:center;margin-bottom:24px;">
      <p style="margin:0;font-size:2.5rem;">🔥</p>
      <h2 style="margin:8px 0 0;color:white;font-size:1.4rem;font-weight:700;">Streak at risk!</h2>
    </div>

    <div style="background:#0d1117;border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:32px;margin-bottom:16px;">
      <p style="margin:0 0 16px;font-size:1rem;line-height:1.6;">
        Hey <strong>${name}</strong> 👋
      </p>
      <p style="margin:0 0 24px;font-size:1rem;line-height:1.6;color:#94a3b8;">
        You built an incredible
        <strong style="color:#fbbf24;">🔥 ${streak}-day streak</strong> on LSRW.PRO.
        Don't let it end today — complete just <strong>one module</strong> to keep the fire burning!
      </p>

      <div style="background:rgba(251,191,36,0.1);border:1px solid rgba(251,191,36,0.3);border-radius:12px;padding:16px;text-align:center;margin-bottom:24px;">
        <div style="font-size:2.5rem;font-weight:900;color:#fbbf24;font-family:monospace;">${streak} 🔥</div>
        <div style="font-size:.8rem;color:#94a3b8;text-transform:uppercase;letter-spacing:.08em;margin-top:4px;">Day Streak</div>
      </div>

      <a href="${url}"
         style="display:block;background:linear-gradient(135deg,#7263f3,#a855f7);color:white;text-align:center;padding:14px 24px;border-radius:10px;text-decoration:none;font-weight:700;font-size:1rem;">
        Practice Now →
      </a>
    </div>

    <p style="text-align:center;font-size:.75rem;color:#64748b;margin-top:16px;">
      LSRW.PRO · Placement Preparation Platform<br>
      You received this because you have an active streak.
    </p>

  </div>
</body>
</html>`;
}
