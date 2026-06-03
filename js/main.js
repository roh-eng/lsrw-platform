/**
 * LSRW Platform — Main Entry Point v4
 * Features: sliding split-panel auth, plant growth, avatar upload, streak, badges
 */

import { initAuth, login, signup, logout, updatePassword, getProfile, sendPasswordReset } from './auth/auth.js';
import { startListening } from './modules/listening.js';
import { startSpeaking }  from './modules/speaking.js';
import { startReading }   from './modules/reading.js';
import { startWriting }   from './modules/writing.js';
import { sendChatMessage }  from './api/ai.js';
import { getRecentScores }  from './api/scores.js';
/* getStreakData is available via getProfile — no separate import needed */
import { getUserBadges, BADGE_DEFS } from './api/badges.js';
import { getAvatar, MALE_IMG, FEMALE_IMG, MALE_SVG, FEMALE_SVG } from './avatars.js';
import { supabase }                        from './api/supabase.js';

const app = document.getElementById('app');
function esc(s) { const d = document.createElement('div'); d.textContent = String(s ?? ''); return d.innerHTML; }

/* ── Count-up animation for [data-count] values (dynamic aesthetics, reduced-motion aware) ── */
function animateCounters(root = document) {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    root.querySelectorAll('[data-count]').forEach(el => {
        const target = Number(el.dataset.count) || 0;
        const suffix = el.dataset.suffix || '';
        if (reduce || target === 0) { el.textContent = target + suffix; return; }
        const dur = 800, t0 = performance.now();
        const tick = now => {
            const p = Math.min(1, (now - t0) / dur);
            const eased = 1 - Math.pow(1 - p, 3); /* easeOutCubic */
            el.textContent = Math.round(target * eased) + suffix;
            if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    });
}

/* ── Make role="button" elements keyboard-activatable (Enter / Space) ── */
function enableCardKeyboard(root = document) {
    root.querySelectorAll('[role="button"]').forEach(el => {
        el.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.click(); }
        });
    });
}

/* ── Badge toast — also exposed on window so scores.js can trigger it ── */
function showBadgeToast(id) {
    const def = BADGE_DEFS[id]; if (!def) return;
    let tc = document.getElementById('btc');
    if (!tc) { tc = document.createElement('div'); tc.id = 'btc'; tc.style.cssText = 'position:fixed;bottom:100px;right:28px;z-index:9998;display:flex;flex-direction:column;gap:.65rem;align-items:flex-end;'; document.body.appendChild(tc); }
    const t = document.createElement('div');
    t.className = 'badge-toast';
    t.innerHTML = `<span style="font-size:1.4rem;">${def.icon}</span><div><div style="font-size:.68rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em;">Badge Unlocked!</div><div style="font-weight:700;">${esc(def.name)}</div></div>`;
    tc.appendChild(t);
    setTimeout(() => { t.style.cssText += ';opacity:0;transform:translateX(32px);transition:all .4s;'; setTimeout(() => t.remove(), 400); }, 4000);
}
/* Make toast callable from any module without circular imports */
window.__lsrwBadgeToast = showBadgeToast;

/* ── Theme ── */
function initTheme() {
    const saved = localStorage.getItem('lsrw_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
}

function toggleTheme() {
    const cur  = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('lsrw_theme', next);
    document.querySelectorAll('.theme-icon').forEach(el => {
        el.innerHTML = next === 'dark'
            ? '<i data-lucide="sun"  size="15"></i>'
            : '<i data-lucide="moon" size="15"></i>';
        lucide.createIcons(el);
    });
}

function themeBtn() {
    const isDark = (document.documentElement.getAttribute('data-theme') || 'dark') === 'dark';
    return `<button class="btn btn-ghost btn-icon" onclick="window.__lsrwToggleTheme()" title="Toggle theme">
        <span class="theme-icon"><i data-lucide="${isDark ? 'sun' : 'moon'}" size="15"></i></span>
    </button>`;
}
window.__lsrwToggleTheme = toggleTheme;

/* ── Leaderboard ── */
async function fetchLeaderboard() {
    if (!supabase) return [];
    try {
        const { data, error } = await supabase.rpc('get_streak_leaderboard');
        if (error) throw error;
        return data || [];
    } catch (err) {
        console.error('Leaderboard fetch error:', err.message);
        return [];
    }
}

/* ── PDF / Print export ── */
function exportPDF() {
    const prev = document.title;
    document.title = 'LSRW Analytics Report';
    window.print();
    document.title = prev;
}

/* ── Badge sharing ── */
function shareOnLinkedIn(badgeName, badgeIcon) {
    const text = encodeURIComponent(
        `${badgeIcon} I just earned the "${badgeName}" badge on LSRW.PRO! Improving my communication skills for placement. #LSRW #PlacementPrep #CommunicationSkills`
    );
    const url = encodeURIComponent('https://lsrw.pro');
    window.open(
        `https://www.linkedin.com/shareArticle?mini=true&url=${url}&summary=${text}&title=Badge+Unlocked!`,
        '_blank', 'width=620,height=540'
    );
}

function shareOnWhatsApp(badgeName, badgeIcon) {
    const text = encodeURIComponent(
        `${badgeIcon} I just earned the "${badgeName}" badge on LSRW.PRO!\nImproving my Listening, Speaking, Reading & Writing skills for placements. Check it out: https://lsrw.pro`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
}

window.__shareLinkedIn = shareOnLinkedIn;
window.__shareWhatsApp = shareOnWhatsApp;

/* =========================================================
   PLANT GROWTH STAGES  (seed → sprout → seedling → plant → tree)
   ========================================================= */
const PLANT_STAGES = [
    {
        name: 'Seed',       emoji: '🌰', color: '#92400e', bgColor: 'rgba(146,64,14,0.1)', border: 'rgba(146,64,14,0.25)',
        range: '0 attempts', nextAt: 1,
        svg: `<svg viewBox="0 0 120 100" xmlns="http://www.w3.org/2000/svg">
          <rect x="0" y="65" width="120" height="35" rx="4" fill="#3d2b1a"/>
          <line x1="15" y1="73" x2="35" y2="73" stroke="#5c3a1e" stroke-width="1" stroke-dasharray="3,2" opacity=".6"/>
          <line x1="80" y1="76" x2="108" y2="76" stroke="#5c3a1e" stroke-width="1" stroke-dasharray="3,2" opacity=".6"/>
          <ellipse cx="60" cy="70" rx="11" ry="7" fill="#8b6914"/>
          <ellipse cx="60" cy="68.5" rx="5.5" ry="3.5" fill="#a07820" opacity=".65"/>
          <path d="M57 76 Q53 83 50 87" stroke="#6b4226" stroke-width="1.5" fill="none" stroke-linecap="round"/>
          <path d="M63 76 Q67 83 70 87" stroke="#6b4226" stroke-width="1.5" fill="none" stroke-linecap="round"/>
          <circle cx="60" cy="53" r="2.5" fill="#7263f3" opacity=".45"/>
          <circle cx="60" cy="44" r="1.8" fill="#7263f3" opacity=".3"/>
          <circle cx="60" cy="36" r="1.2" fill="#7263f3" opacity=".18"/>
        </svg>`
    },
    {
        name: 'Sprout',     emoji: '🌱', color: '#15803d', bgColor: 'rgba(21,128,61,0.1)', border: 'rgba(21,128,61,0.25)',
        range: '1–10 attempts', nextAt: 10,
        svg: `<svg viewBox="0 0 120 100" xmlns="http://www.w3.org/2000/svg">
          <rect x="0" y="68" width="120" height="32" rx="4" fill="#3d2b1a"/>
          <line x1="60" y1="68" x2="60" y2="40" stroke="#4a9e5c" stroke-width="3.5" stroke-linecap="round"/>
          <ellipse cx="48" cy="50" rx="12" ry="7" fill="#5ab068" transform="rotate(-30,48,50)" opacity=".95"/>
          <ellipse cx="72" cy="50" rx="12" ry="7" fill="#5ab068" transform="rotate(30,72,50)" opacity=".95"/>
          <ellipse cx="60" cy="40" rx="7" ry="4.5" fill="#6dcf80"/>
          <circle cx="60" cy="40" r="3" fill="#a8e6b4" opacity=".5"/>
        </svg>`
    },
    {
        name: 'Seedling',   emoji: '🪴', color: '#16a34a', bgColor: 'rgba(22,163,74,0.1)', border: 'rgba(22,163,74,0.25)',
        range: '11–30 attempts', nextAt: 30,
        svg: `<svg viewBox="0 0 120 100" xmlns="http://www.w3.org/2000/svg">
          <rect x="0" y="72" width="120" height="28" rx="4" fill="#3d2b1a"/>
          <path d="M60 72 Q57 55 60 24" stroke="#3d8b4a" stroke-width="4" fill="none" stroke-linecap="round"/>
          <path d="M59 57 Q46 48 36 45" stroke="#3d8b4a" stroke-width="2.5" fill="none" stroke-linecap="round"/>
          <path d="M61 57 Q74 48 84 45" stroke="#3d8b4a" stroke-width="2.5" fill="none" stroke-linecap="round"/>
          <ellipse cx="32" cy="43" rx="11" ry="6.5" fill="#4caf50" transform="rotate(-18,32,43)"/>
          <ellipse cx="88" cy="43" rx="11" ry="6.5" fill="#4caf50" transform="rotate(18,88,43)"/>
          <ellipse cx="48" cy="32" rx="10" ry="6" fill="#43a047" transform="rotate(-32,48,32)"/>
          <ellipse cx="72" cy="32" rx="10" ry="6" fill="#43a047" transform="rotate(32,72,32)"/>
          <ellipse cx="60" cy="24" rx="9" ry="5.5" fill="#66bb6a"/>
        </svg>`
    },
    {
        name: 'Young Plant', emoji: '🌿', color: '#15803d', bgColor: 'rgba(21,128,61,0.1)', border: 'rgba(21,128,61,0.3)',
        range: '31–75 attempts', nextAt: 75,
        svg: `<svg viewBox="0 0 120 100" xmlns="http://www.w3.org/2000/svg">
          <rect x="0" y="74" width="120" height="26" rx="4" fill="#3d2b1a"/>
          <path d="M60 74 Q55 56 60 16" stroke="#2e7d32" stroke-width="4.5" fill="none" stroke-linecap="round"/>
          <path d="M58 62 Q41 50 30 47" stroke="#2e7d32" stroke-width="3" fill="none" stroke-linecap="round"/>
          <path d="M62 62 Q79 50 90 47" stroke="#2e7d32" stroke-width="3" fill="none" stroke-linecap="round"/>
          <path d="M59 44 Q43 35 33 31" stroke="#2e7d32" stroke-width="2.5" fill="none" stroke-linecap="round"/>
          <path d="M61 44 Q77 35 87 31" stroke="#2e7d32" stroke-width="2.5" fill="none" stroke-linecap="round"/>
          <ellipse cx="26" cy="45" rx="12" ry="7" fill="#388e3c" transform="rotate(-14,26,45)"/>
          <ellipse cx="94" cy="45" rx="12" ry="7" fill="#388e3c" transform="rotate(14,94,45)"/>
          <ellipse cx="29" cy="29" rx="11" ry="6.5" fill="#43a047" transform="rotate(-24,29,29)"/>
          <ellipse cx="91" cy="29" rx="11" ry="6.5" fill="#43a047" transform="rotate(24,91,29)"/>
          <ellipse cx="47" cy="20" rx="10" ry="6" fill="#4caf50" transform="rotate(-38,47,20)"/>
          <ellipse cx="73" cy="20" rx="10" ry="6" fill="#4caf50" transform="rotate(38,73,20)"/>
          <ellipse cx="60" cy="14" rx="9" ry="5.5" fill="#66bb6a"/>
          <circle cx="60" cy="14" r="4.5" fill="#ff80ab"/>
          <circle cx="60" cy="14" r="2" fill="#ffcc02"/>
        </svg>`
    },
    {
        name: 'Mighty Tree', emoji: '🌳', color: '#166534', bgColor: 'rgba(22,101,52,0.1)', border: 'rgba(22,101,52,0.3)',
        range: '75+ attempts', nextAt: null,
        svg: `<svg viewBox="0 0 120 100" xmlns="http://www.w3.org/2000/svg">
          <rect x="0" y="78" width="120" height="22" rx="4" fill="#3d2b1a"/>
          <path d="M15 78 Q17 70 19 78" stroke="#4caf50" stroke-width="1.5" fill="none"/>
          <path d="M98 78 Q100 71 102 78" stroke="#4caf50" stroke-width="1.5" fill="none"/>
          <path d="M54 78 Q52 62 54 44" stroke="#5d4037" stroke-width="9" fill="none" stroke-linecap="round"/>
          <path d="M66 78 Q68 62 66 44" stroke="#4e342e" stroke-width="8" fill="none" stroke-linecap="round"/>
          <path d="M55 78 Q44 81 33 84" stroke="#4e342e" stroke-width="3.5" fill="none" stroke-linecap="round"/>
          <path d="M65 78 Q76 81 87 84" stroke="#4e342e" stroke-width="3.5" fill="none" stroke-linecap="round"/>
          <ellipse cx="60" cy="50" rx="48" ry="30" fill="#1b5e20"/>
          <ellipse cx="50" cy="42" rx="32" ry="22" fill="#2e7d32"/>
          <ellipse cx="72" cy="38" rx="30" ry="20" fill="#388e3c"/>
          <ellipse cx="60" cy="30" rx="34" ry="20" fill="#43a047"/>
          <ellipse cx="50" cy="24" rx="22" ry="15" fill="#4caf50"/>
          <ellipse cx="72" cy="21" rx="20" ry="14" fill="#4caf50"/>
          <ellipse cx="60" cy="14" rx="24" ry="13" fill="#66bb6a"/>
          <circle cx="38" cy="34" r="3.5" fill="#ff80ab"/>
          <circle cx="82" cy="30" r="3.5" fill="#ff80ab"/>
          <circle cx="54" cy="20" r="3" fill="#ff4081"/>
          <circle cx="70" cy="18" r="3" fill="#ff4081"/>
          <circle cx="43" cy="48" r="4.5" fill="#e53935" opacity=".9"/>
          <circle cx="77" cy="44" r="4.5" fill="#e53935" opacity=".9"/>
          <circle cx="23" cy="40" r="1.8" fill="#ffd700" opacity=".8"/>
          <circle cx="97" cy="35" r="1.8" fill="#ffd700" opacity=".8"/>
          <circle cx="14" cy="56" r="1.2" fill="#7263f3" opacity=".65"/>
          <circle cx="106" cy="50" r="1.2" fill="#7263f3" opacity=".65"/>
        </svg>`
    },
];

function getPlantStage(attempts) {
    if (attempts <= 0)  return PLANT_STAGES[0];
    if (attempts <= 10) return PLANT_STAGES[1];
    if (attempts <= 30) return PLANT_STAGES[2];
    if (attempts <= 75) return PLANT_STAGES[3];
    return PLANT_STAGES[4];
}

function renderPlantCard(totalAttempts) {
    const stage   = getPlantStage(totalAttempts);
    const stageIdx = PLANT_STAGES.indexOf(stage);
    const progress = stage.nextAt
        ? Math.min(100, Math.round(((totalAttempts - (stageIdx === 0 ? 0 : [0,1,11,31,76][stageIdx])) / (stage.nextAt - (stageIdx === 0 ? 0 : [0,1,11,31,76][stageIdx]))) * 100))
        : 100;
    const nextStageName = stage.nextAt ? PLANT_STAGES[stageIdx + 1]?.name : null;

    return `
    <div class="card" style="background:${stage.bgColor};border-color:${stage.border};padding:1.75rem;text-align:center;position:relative;overflow:hidden;">
        <div style="position:absolute;top:-20px;right:-20px;width:90px;height:90px;background:${stage.bgColor};border-radius:50%;filter:blur(20px);pointer-events:none;"></div>
        <p style="font-size:.72rem;font-weight:700;color:${stage.color};text-transform:uppercase;letter-spacing:.07em;margin-bottom:.75rem;">Your Growth Journey</p>
        <div style="width:88px;height:80px;margin:0 auto .75rem;">${stage.svg}</div>
        <div style="font-size:1.05rem;font-weight:800;color:var(--text-bright);margin-bottom:.2rem;">${stage.name}</div>
        <div style="font-size:.78rem;color:var(--text-muted);margin-bottom:1rem;">${totalAttempts} module${totalAttempts !== 1 ? 's' : ''} completed</div>
        ${stage.nextAt ? `
            <div class="progress-bar" style="height:5px;margin-bottom:.4rem;">
                <div class="progress-fill" style="width:${progress}%;background:${stage.color};"></div>
            </div>
            <div style="font-size:.7rem;color:var(--text-muted);">${progress}% → ${nextStageName}</div>
        ` : `<div style="font-size:.78rem;color:${stage.color};font-weight:700;">🏆 Maximum growth!</div>`}
    </div>`;
}

/* Avatar helper — uses real PNG (with SVG fallback) + optional custom URL */
function getAvatarImg(gender, avatarUrl = null) {
    return getAvatar(gender, avatarUrl);
}

/**
 * Upload a custom avatar.
 * Strategy:
 *   1. Compress image client-side to ≤ 300×300 JPEG (≈ 20 KB as base64).
 *   2. Try Supabase Storage bucket "avatars" (if bucket exists → public URL).
 *   3. Fall back to storing base64 data-URL directly in profiles.avatar_url.
 *      No bucket needed for the fallback — works out of the box.
 */
async function uploadCustomAvatar(file) {
    /* Step 1 — compress to a small base64 JPEG */
    const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error('Could not read file.'));
        reader.onload  = ev => {
            const img = new Image();
            img.onerror = () => reject(new Error('Could not process image.'));
            img.onload  = () => {
                const MAX = 300;
                let w = img.width, h = img.height;
                if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
                else       { w = Math.round(w * MAX / h); h = MAX; }
                const c = document.createElement('canvas');
                c.width = w; c.height = h;
                c.getContext('2d').drawImage(img, 0, 0, w, h);
                resolve(c.toDataURL('image/jpeg', 0.78));
            };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    });

    if (!supabase) {
        /* No Supabase — store base64 in localStorage as temporary fallback */
        localStorage.setItem('lsrw_avatar_tmp', base64);
        return base64;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    /* Step 2 — try Supabase Storage bucket (optional) */
    try {
        const blob = await fetch(base64).then(r => r.blob());
        /* Store under a per-user folder so it satisfies the Storage RLS policy:
           auth.uid() must equal the first path segment — (storage.foldername(name))[1].
           A flat "<id>.jpg" has no folder segment, so the policy would reject it. */
        const path = `${user.id}/avatar.jpg`;
        const { error } = await supabase.storage.from('avatars').upload(path, blob, { upsert: true, contentType: 'image/jpeg' });
        if (!error) {
            const { data } = supabase.storage.from('avatars').getPublicUrl(path);
            await supabase.from('profiles').update({ avatar_url: data.publicUrl }).eq('id', user.id);
            return data.publicUrl;
        }
    } catch (_) { /* bucket doesn't exist — fall through */ }

    /* Step 3 — store base64 directly in profiles table (always works) */
    await supabase.from('profiles').update({ avatar_url: base64 }).eq('id', user.id);
    return base64;
}

/* Save avatar_url to Supabase profiles table */
async function saveAvatarUrl(url) {
    if (!supabase) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (user) await supabase.from('profiles').update({ avatar_url: url }).eq('id', user.id);
}

/* =========================================================
   INIT
   ========================================================= */
async function init() {
    initTheme();
    document.body.style.background = 'var(--bg-deep)';

    /*
     * Detect a password-recovery deep link. When the user clicks the reset
     * link in their email, Supabase appends "type=recovery" to the URL hash.
     */
    const isRecovery = (window.location.hash || '').includes('type=recovery');

    try {
        const user = await initAuth();   /* this also initializes the supabase client */
        document.getElementById('initial-loader')?.remove();

        /* Now that supabase is initialized, listen for the recovery event too */
        if (supabase) {
            supabase.auth.onAuthStateChange((event) => {
                if (event === 'PASSWORD_RECOVERY') renderLandingPage('reset');
            });
        }

        if (isRecovery) {
            renderLandingPage('reset');     /* recovery link → set new password */
        } else if (!user) {
            renderLandingPage();
        } else {
            renderDashboard(user);
        }
    } catch (err) {
        console.error('Init failed:', err);
        app.innerHTML = `<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:1rem;color:var(--error);background:var(--bg-deep);">
            <div style="font-size:2rem;">⚠️</div><p style="color:var(--text-muted);">Connection failed. Check console.</p></div>`;
    }
}

/* =========================================================
   LANDING / AUTH  — sliding split-panel (Sign In ⇆ Sign Up)
   ========================================================= */
function renderLandingPage(step = 'choose', formData = {}) {
    /* verify / forgot / reset → simple centered card; everything else → the sliding panel */
    if (step === 'verify' || step === 'forgot' || step === 'reset') return renderAuthCard(step, formData);
    renderAuthSlider(step, formData);
}

/* =========================================================
   SLIDING SPLIT-PANEL AUTH  (Sign In ⇆ Sign Up)
   ========================================================= */
function renderAuthSlider(step = 'login', formData = {}) {
    const signUp = (step === 'reg1' || step === 'signup' || step === 'register');

    app.innerHTML = `
    <main class="flex min-h-screen items-center justify-center bg-deep p-6" aria-label="Account access">
      <style>
        .auth-card{position:relative;width:768px;max-width:100%;min-height:480px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-xl);box-shadow:var(--shadow-lg);overflow:hidden;}
        .form-pane{position:absolute;top:0;height:100%;width:50%;transition:all .6s ease-in-out;}
        .sign-in-pane{left:0;z-index:2;}
        .sign-up-pane{left:0;z-index:1;opacity:0;}
        .auth-card.right-panel-active .sign-in-pane{transform:translateX(100%);opacity:0;z-index:1;}
        .auth-card.right-panel-active .sign-up-pane{transform:translateX(100%);opacity:1;z-index:5;animation:authShow .6s;}
        @keyframes authShow{0%,49.99%{opacity:0;z-index:1;}50%,100%{opacity:1;z-index:5;}}
        .auth-form{height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.8rem;padding:0 2.75rem;text-align:center;}
        .overlay-wrap{position:absolute;top:0;left:50%;width:50%;height:100%;overflow:hidden;transition:transform .6s ease-in-out;z-index:100;}
        .auth-card.right-panel-active .overlay-wrap{transform:translateX(-100%);}
        .overlay{position:relative;left:-100%;width:200%;height:100%;background:linear-gradient(135deg,var(--primary),var(--accent-cyan));color:#fff;transform:translateX(0);transition:transform .6s ease-in-out;}
        .auth-card.right-panel-active .overlay{transform:translateX(50%);}
        .overlay-pane{position:absolute;top:0;height:100%;width:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1rem;padding:0 2.5rem;text-align:center;transition:transform .6s ease-in-out;}
        .overlay-left{transform:translateX(-20%);}
        .auth-card.right-panel-active .overlay-left{transform:translateX(0);}
        .overlay-right{right:0;transform:translateX(0);}
        .auth-card.right-panel-active .overlay-right{transform:translateX(20%);}
        .ghost-btn{background:transparent;border:1.5px solid rgba(255,255,255,.85);color:#fff;border-radius:9999px;padding:.62rem 2.6rem;font-weight:700;font-size:.78rem;letter-spacing:.12em;text-transform:uppercase;cursor:pointer;transition:background .2s,transform .2s;}
        .ghost-btn:hover{background:rgba(255,255,255,.16);transform:translateY(-1px);}
        .ghost-btn:active{transform:scale(.97);}
        .auth-mobile-toggle{display:none;}
        @media(max-width:768px){
          .auth-card{min-height:560px;}
          .overlay-wrap{display:none;}
          .form-pane{width:100%;opacity:0;pointer-events:none;transform:none !important;}
          .sign-in-pane{opacity:1;z-index:2;pointer-events:auto;}
          .auth-card.right-panel-active .sign-in-pane{opacity:0;pointer-events:none;z-index:1;}
          .auth-card.right-panel-active .sign-up-pane{opacity:1;z-index:5;pointer-events:auto;}
          .auth-form{padding:2.5rem 1.5rem;}
          .auth-mobile-toggle{display:block;}
        }
      </style>

      <div class="auth-card ${signUp ? 'right-panel-active' : ''}" id="auth-card">

        <!-- SIGN UP -->
        <div class="form-pane sign-up-pane">
          <form id="signup-form" class="auth-form">
            <div class="font-display text-[.8rem] font-bold tracking-wide text-muted">LSRW<span class="text-primary">.PRO</span></div>
            <h2 class="font-display text-[1.6rem] font-bold text-bright">Create Account</h2>
            <div id="su-err" role="alert" aria-live="assertive" style="display:none;" class="w-full rounded-token border border-[rgba(248,113,113,.3)] bg-[var(--error-subtle)] px-3 py-2 text-[.78rem] text-error"></div>
            <input id="su-name" type="text" autocomplete="name" required class="input-field" placeholder="Full name" aria-label="Full name">
            <input id="su-email" type="email" autocomplete="email" required class="input-field" placeholder="Enter E-mail" aria-label="Email">
            <div class="relative w-full">
                <input id="su-pw" type="password" autocomplete="new-password" required minlength="6" class="input-field pr-10" placeholder="Enter Password (min 6)" aria-label="Password">
                <button type="button" class="toggle-pw absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-bright" data-target="su-pw">
                    <i data-lucide="eye" size="18"></i>
                </button>
            </div>
            <button type="submit" id="su-btn" class="btn btn-primary mt-1 rounded-full px-12 uppercase tracking-[.1em]">Sign Up</button>
            <p class="auth-mobile-toggle mt-2 text-[.8rem] text-muted">Already have an account? <button type="button" id="m-goto-signin" class="font-semibold text-primary-light hover:underline">Sign In</button></p>
          </form>
        </div>

        <!-- SIGN IN -->
        <div class="form-pane sign-in-pane">
          <form id="signin-form" class="auth-form">
            <div class="font-display text-[.8rem] font-bold tracking-wide text-muted">LSRW<span class="text-primary">.PRO</span></div>
            <h2 class="font-display text-[1.6rem] font-bold text-bright">Sign In</h2>
            <div id="si-err" role="alert" aria-live="assertive" style="display:none;" class="w-full rounded-token border border-[rgba(248,113,113,.3)] bg-[var(--error-subtle)] px-3 py-2 text-[.78rem] text-error"></div>
            <input id="si-email" type="email" autocomplete="email" required class="input-field" placeholder="Enter E-mail" aria-label="Email" value="${esc(formData.email||'')}">
            <div class="relative w-full">
                <input id="si-pw" type="password" autocomplete="current-password" required class="input-field pr-10" placeholder="Enter Password" aria-label="Password">
                <button type="button" class="toggle-pw absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-bright" data-target="si-pw">
                    <i data-lucide="eye" size="18"></i>
                </button>
            </div>
            <button type="button" id="link-forgot" class="text-[.8rem] text-muted hover:text-primary-light">Forget Password?</button>
            <button type="submit" id="si-btn" class="btn btn-primary mt-1 rounded-full px-12 uppercase tracking-[.1em]">Sign In</button>
            <p class="auth-mobile-toggle mt-2 text-[.8rem] text-muted">New here? <button type="button" id="m-goto-signup" class="font-semibold text-primary-light hover:underline">Sign Up</button></p>
          </form>
        </div>

        <!-- OVERLAY -->
        <div class="overlay-wrap" aria-hidden="true">
          <div class="overlay">
            <div class="overlay-pane overlay-left">
              <h2 class="font-display text-[1.9rem] font-bold text-white">Welcome Back!</h2>
              <p class="max-w-[260px] text-[.9rem] leading-relaxed text-white opacity-90">Sign in to continue your streak and keep mastering your LSRW skills.</p>
              <button type="button" id="goto-signin" class="ghost-btn">Sign In</button>
            </div>
            <div class="overlay-pane overlay-right">
              <h2 class="font-display text-[1.9rem] font-bold text-white">Hello, Friend!</h2>
              <p class="max-w-[260px] text-[.9rem] leading-relaxed text-white opacity-90">Sign up now and start your placement-prep journey with LSRW.PRO.</p>
              <button type="button" id="goto-signup" class="ghost-btn">Sign Up</button>
            </div>
          </div>
        </div>
      </div>
    </main>`;

    lucide.createIcons();
    wireSlider();
}

/* Simple centered card for verify / forgot / reset */
function renderAuthCard(step, formData = {}) {
    app.innerHTML = `
    <main class="flex min-h-screen items-center justify-center bg-deep p-6" aria-label="Account access">
      <div class="card glass-card w-full max-w-[420px] animate-slide-up p-8">
        ${step === 'verify' ? _stepVerify(formData) : ''}
        ${step === 'forgot' ? _stepForgot(formData) : ''}
        ${step === 'reset'  ? _stepReset()          : ''}
      </div>
    </main>`;
    lucide.createIcons();
    document.querySelector('#app input, #app button[type="submit"]')?.focus?.({ preventScroll: true });
    wireCard(step, formData);
}

function _stepVerify(d = {}) {
    return `
        <div class="py-6 text-center">
            <div class="mb-4 text-[3rem]" aria-hidden="true">📬</div>
            <h2 class="mb-[.65rem] text-[1.4rem]">Check your email</h2>
            <p class="mb-7 text-[.85rem] leading-[1.65] text-muted">
                A verification link was sent to<br>
                <strong class="text-bright">${esc(d.email||'your email')}</strong>.<br>
                Open it, then sign in.
            </p>
            <button id="btn-goto-login" type="button" class="btn btn-primary btn-full">Go to Sign In <i data-lucide="arrow-right" size="15"></i></button>
        </div>`;
}

function _stepForgot(d = {}) {
    return `
        <div class="mb-6 flex items-center">
            <button id="btn-back" type="button" class="btn btn-ghost btn-sm pl-0 -ml-2 text-muted hover:text-bright"><i data-lucide="arrow-left" size="16"></i> Back</button>
        </div>
        <div class="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-[rgba(139,125,255,.3)] bg-[var(--primary-subtle)]"><i data-lucide="key-round" size="24" style="color:var(--primary-light);"></i></div>
        <h2 class="mb-2 text-[1.6rem] font-bold">Reset Password</h2>
        <p class="mb-6 text-[.9rem] text-muted leading-relaxed">Enter your email address and we'll send you a link to reset your password.</p>
        <div id="aerr" role="alert" aria-live="assertive" style="display:none;" class="mb-4 rounded-token border border-[rgba(248,113,113,.35)] bg-[var(--error-subtle)] px-4 py-[.65rem] text-[.8rem] text-error"></div>
        <div id="aok" role="status" aria-live="polite" style="display:none;" class="mb-4 rounded-token border border-[rgba(34,209,139,.35)] bg-[var(--success-subtle)] px-4 py-[.65rem] text-[.8rem] text-success"></div>
        <form id="forgot-form">
            <div class="input-group" style="margin-bottom:1.6rem;"><label for="f-email">Email Address</label><input type="email" id="f-email" autocomplete="email" class="input-field" placeholder="you@example.com" value="${esc(d.email||'')}" required></div>
            <button type="submit" id="asub" class="btn btn-primary btn-full btn-lg">Send Reset Link <i data-lucide="send" size="16"></i></button>
        </form>`;
}

function _stepReset() {
    return `
        <div class="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-[rgba(34,209,139,.3)] bg-[var(--success-subtle)]"><i data-lucide="lock-keyhole" size="24" style="color:var(--success);"></i></div>
        <h2 class="mb-2 text-[1.6rem] font-bold">Set New Password</h2>
        <p class="mb-6 text-[.9rem] text-muted leading-relaxed">Choose a strong new password for your account.</p>
        <div id="aerr" role="alert" aria-live="assertive" style="display:none;" class="mb-4 rounded-token border border-[rgba(248,113,113,.35)] bg-[var(--error-subtle)] px-4 py-[.65rem] text-[.8rem] text-error"></div>
        <div id="aok" role="status" aria-live="polite" style="display:none;" class="mb-4 rounded-token border border-[rgba(34,209,139,.35)] bg-[var(--success-subtle)] px-4 py-[.65rem] text-[.8rem] text-success"></div>
        <form id="reset-form">
            <div class="input-group">
                <label for="f-pw">New Password</label>
                <div class="relative w-full">
                    <input type="password" id="f-pw" autocomplete="new-password" class="input-field pr-10" placeholder="Min 6 characters" required minlength="6">
                    <button type="button" class="toggle-pw absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-bright" data-target="f-pw">
                        <i data-lucide="eye" size="18"></i>
                    </button>
                </div>
            </div>
            <div class="input-group" style="margin-bottom:1.6rem;">
                <label for="f-pw2">Confirm Password</label>
                <div class="relative w-full">
                    <input type="password" id="f-pw2" autocomplete="new-password" class="input-field pr-10" placeholder="Re-enter password" required minlength="6">
                    <button type="button" class="toggle-pw absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-bright" data-target="f-pw2">
                        <i data-lucide="eye" size="18"></i>
                    </button>
                </div>
            </div>
            <button type="submit" id="asub" class="btn btn-primary btn-full btn-lg">Update Password <i data-lucide="check" size="16"></i></button>
        </form>`;
}

/* ── Wiring for the sliding sign-in / sign-up panel ── */
function wireSlider() {
    const card = document.getElementById('auth-card');
    const toSignup = () => card.classList.add('right-panel-active');
    const toSignin = () => card.classList.remove('right-panel-active');
    document.getElementById('goto-signup')?.addEventListener('click', toSignup);
    document.getElementById('goto-signin')?.addEventListener('click', toSignin);
    document.getElementById('m-goto-signup')?.addEventListener('click', toSignup);
    document.getElementById('m-goto-signin')?.addEventListener('click', toSignin);

    document.getElementById('link-forgot')?.addEventListener('click', () => {
        const email = document.getElementById('si-email')?.value || '';
        renderLandingPage('forgot', { email });
    });

    document.querySelectorAll('.toggle-pw').forEach(btn => {
        btn.addEventListener('click', () => {
            const input = document.getElementById(btn.dataset.target);
            if (input) {
                const isPw = input.type === 'password';
                input.type = isPw ? 'text' : 'password';
                btn.innerHTML = `<i data-lucide="${isPw ? 'eye-off' : 'eye'}" size="18"></i>`;
                lucide.createIcons();
            }
        });
    });

    const busy = (btn, on, label) => {
        btn.disabled = on;
        btn.innerHTML = on
            ? '<span class="loader" style="width:16px;height:16px;border-width:2px;border-top-color:#fff;"></span>'
            : label;
    };

    document.getElementById('signin-form').addEventListener('submit', async e => {
        e.preventDefault();
        const btn = document.getElementById('si-btn'), err = document.getElementById('si-err');
        err.style.display = 'none'; busy(btn, true);
        try {
            const user = await login(document.getElementById('si-email').value, document.getElementById('si-pw').value);
            renderDashboard(user);
        } catch (ex) {
            err.textContent = ex.message; err.style.display = 'block'; busy(btn, false, 'Sign In');
        }
    });

    document.getElementById('signup-form').addEventListener('submit', async e => {
        e.preventDefault();
        const btn = document.getElementById('su-btn'), err = document.getElementById('su-err');
        err.style.display = 'none'; busy(btn, true);
        try {
            const result = await signup(
                document.getElementById('su-email').value,
                document.getElementById('su-pw').value,
                document.getElementById('su-name').value,
                'male'   /* avatar/gender chosen later on the Profile page */
            );
            if (result.needsVerification) renderLandingPage('verify', { email: document.getElementById('su-email').value });
            else renderDashboard(result.user);
        } catch (ex) {
            err.textContent = ex.message; err.style.display = 'block'; busy(btn, false, 'Sign Up');
        }
    });
}

function wireCard(step, formData = {}) {
    document.getElementById('btn-goto-login')?.addEventListener('click', () => renderLandingPage('login', formData));
    document.getElementById('btn-back')?.addEventListener('click',      () => renderLandingPage('login', formData));

    document.querySelectorAll('.toggle-pw').forEach(btn => {
        btn.addEventListener('click', () => {
            const input = document.getElementById(btn.dataset.target);
            if (input) {
                const isPw = input.type === 'password';
                input.type = isPw ? 'text' : 'password';
                btn.innerHTML = `<i data-lucide="${isPw ? 'eye-off' : 'eye'}" size="18"></i>`;
                lucide.createIcons();
            }
        });
    });

    if (step === 'forgot') {
        document.getElementById('forgot-form').addEventListener('submit', async e => {
            e.preventDefault();
            const btn = document.getElementById('asub'), err = document.getElementById('aerr'), ok = document.getElementById('aok');
            btn.disabled = true; btn.innerHTML = '<span class="loader" style="width:16px;height:16px;border-width:2px;"></span> Sending…';
            err.style.display = 'none'; ok.style.display = 'none';
            try {
                await sendPasswordReset(document.getElementById('f-email').value);
                ok.textContent = '✓ Reset link sent! Check your inbox (and spam folder), then click the link to set a new password.';
                ok.style.display = 'block';
                btn.disabled = false; btn.innerHTML = 'Resend Link <i data-lucide="send" size="15"></i>'; lucide.createIcons();
            } catch (ex) {
                err.textContent = ex.message; err.style.display = 'block';
                btn.disabled = false; btn.innerHTML = 'Send Reset Link <i data-lucide="send" size="15"></i>'; lucide.createIcons();
            }
        });
    }

    if (step === 'reset') {
        document.getElementById('reset-form').addEventListener('submit', async e => {
            e.preventDefault();
            const btn = document.getElementById('asub'), err = document.getElementById('aerr'), ok = document.getElementById('aok');
            const pw = document.getElementById('f-pw').value, pw2 = document.getElementById('f-pw2').value;
            err.style.display = 'none'; ok.style.display = 'none';
            if (pw !== pw2) { err.textContent = 'Passwords do not match.'; err.style.display = 'block'; return; }
            btn.disabled = true; btn.innerHTML = '<span class="loader" style="width:16px;height:16px;border-width:2px;"></span> Updating…';
            try {
                await updatePassword(pw);
                ok.textContent = '✓ Password updated! Redirecting to your dashboard…';
                ok.style.display = 'block';
                const u = await initAuth();
                setTimeout(() => { if (u) renderDashboard(u); else renderLandingPage('login'); }, 1500);
            } catch (ex) {
                err.textContent = ex.message; err.style.display = 'block';
                btn.disabled = false; btn.innerHTML = 'Update Password <i data-lucide="check" size="15"></i>'; lucide.createIcons();
            }
        });
    }
}

/* =========================================================
   DASHBOARD
   ========================================================= */
async function renderDashboard(user) {
    const [profile, recentScores, userBadges] = await Promise.all([getProfile(), getRecentScores(100), getUserBadges()]);
    const fullName = profile?.full_name || user.user_metadata?.full_name || 'Student';
    const gender   = profile?.gender   || user.user_metadata?.gender   || 'male';
    const avatarUrl = profile?.avatar_url || null;
    const streak   = profile?.current_streak || 0;
    const totalAtt = profile?.total_attempts || 0;
    const initial  = fullName[0].toUpperCase();

    const avgScore = recentScores.length > 0
        ? Math.round(recentScores.reduce((a, s) => a + s.score_achieved / s.total_score, 0) / recentScores.length * 100) : 0;

    const modMap = { listening:0, speaking:0, reading:0, writing:0 };
    recentScores.forEach(s => { if (modMap[s.module_type] !== undefined) modMap[s.module_type]++; });
    const topBadges = userBadges.slice(0, 3);

    /* ── Hyper-personalization ── */
    const hour = new Date().getHours();
    const tod  = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : hour < 21 ? 'Good evening' : 'Working late';
    /* weakest skill (lowest average %), used for a tailored recommendation */
    const perf = { listening:{a:0,t:0}, speaking:{a:0,t:0}, reading:{a:0,t:0}, writing:{a:0,t:0} };
    recentScores.forEach(s => { if (perf[s.module_type]) { perf[s.module_type].a++; perf[s.module_type].t += s.score_achieved / s.total_score * 100; } });
    let weakest = null, lo = 101;
    Object.keys(perf).forEach(m => { if (perf[m].a > 0) { const av = perf[m].t / perf[m].a; if (av < lo) { lo = av; weakest = m; } } });
    const cap = w => w.charAt(0).toUpperCase() + w.slice(1);
    /* personalized sub-headline */
    const subline = totalAtt === 0
        ? 'Welcome aboard — pick any module below to start your first session.'
        : weakest
            ? `Your biggest opportunity right now is <strong style="color:var(--primary-light);">${cap(weakest)}</strong> — give it a focused session.`
            : 'Great consistency — keep building all four skills.';

    const modules = [
        { id:'start-listening', key:'listening', label:'Listening',  desc:'Decode technical requirements & client briefs.',  icon:'headphones', color:'#7263f3', badge:'Technical',  bc:'badge-primary', att:modMap.listening },
        { id:'start-speaking',  key:'speaking',  label:'Speaking',   desc:'Master behavioral questions & communication.',    icon:'mic',        color:'#fbbf24', badge:'Behavioral', bc:'badge-warning', att:modMap.speaking  },
        { id:'start-reading',   key:'reading',   label:'Reading',    desc:'Analyse case studies & extract key insights.',    icon:'book-open',  color:'#22d18b', badge:'Case Study', bc:'badge-success', att:modMap.reading   },
        { id:'start-writing',   key:'writing',   label:'Writing',    desc:'Draft professional emails, reports & documents.', icon:'pen-tool',   color:'#f87171', badge:'Live Assess',bc:'badge-error',   att:modMap.writing   },
    ];

    app.innerHTML = `
    <div class="min-h-screen bg-deep">
        <nav class="nav" aria-label="Primary">
            <div class="flex items-center gap-[.7rem]">
                <div class="flex h-[30px] w-[30px] items-center justify-center rounded-lg bg-primary shadow-[0_0_12px_var(--primary-glow)]"><i data-lucide="graduation-cap" size="15" style="color:#fff;"></i></div>
                <span class="font-display text-[1.05rem] font-bold text-bright">LSRW<span class="text-primary">.PRO</span></span>
            </div>
            <div class="flex items-center gap-[.55rem]">
                ${streak > 0 ? `<div class="streak-pill">🔥 ${streak} day${streak!==1?'s':''}</div>` : ''}
                ${topBadges.map(b => `<span class="achievement-badge text-[.7rem]" title="${esc(b.desc)}">${b.icon} ${esc(b.name)}</span>`).join('')}
                <button id="nav-analytics-btn" class="btn btn-outline btn-sm gap-[.35rem]"><i data-lucide="bar-chart-2" size="13"></i> <span class="nav-btn-text">Analytics</span></button>
                <button id="nav-profile-btn" class="btn btn-outline btn-sm gap-[.4rem]" aria-label="Open your profile">
                    <span class="nav-avatar-thumb inline-flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center overflow-hidden rounded-md">
                        ${avatarUrl
                            ? `<img src="${esc(avatarUrl)}" alt="" class="h-[22px] w-[22px] object-cover" onerror="this.outerHTML='<div style=\\'width:22px;height:22px;background:var(--primary);border-radius:6px;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:.7rem;color:#fff;\\'>${esc(initial)}</div>'">`
                            : `<div style="width:22px;height:22px;background:var(--primary);border-radius:6px;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:.7rem;color:#fff;">${esc(initial)}</div>`
                        }
                    </span>
                    <span class="nav-btn-text">${esc(fullName.split(' ')[0])}</span>
                </button>
                ${themeBtn()}
                <button id="logout-btn" class="btn btn-ghost btn-icon" title="Sign out" aria-label="Sign out"><i data-lucide="log-out" size="14"></i></button>
            </div>
        </nav>

        <main id="main-content" class="mx-auto max-w-[1200px] px-10 py-12 max-[768px]:px-4 max-[768px]:py-6">

            <!-- Greeting -->
            <header class="mb-12 flex animate-fade-in items-center gap-7 max-[768px]:gap-4">
                <div class="h-[88px] w-[88px] flex-shrink-0 overflow-hidden rounded-2xl shadow-[0_0_22px_var(--primary-glow)]">
                    ${getAvatarImg(gender, profile?.avatar_url)}
                </div>
                <div>
                    <p class="mb-[.35rem] text-[.72rem] font-semibold uppercase tracking-[.08em] text-muted">${tod}</p>
                    <h1 class="mb-[.4rem]" style="font-size:clamp(1.7rem,3.5vw,2.4rem);">Hey ${esc(fullName.split(' ')[0])} 👋</h1>
                    <p class="text-[.88rem] text-muted">${subline}</p>
                    ${streak > 0 ? `<p class="mt-1 text-[.82rem] font-semibold text-warning">🔥 ${streak}-day streak — don't break the chain!</p>` : ''}
                </div>
            </header>

            <!-- Stats -->
            <div class="stat-grid-4 mb-10 grid grid-cols-4 gap-4 animate-slide-up">
                <div class="stat-card"><div class="stat-label">Total Attempts</div><div class="stat-value"><span data-count="${totalAtt}">0</span></div></div>
                <div class="stat-card"><div class="stat-label">Avg Score</div><div class="stat-value" style="color:var(--primary);"><span data-count="${avgScore}" data-suffix="%">0%</span></div></div>
                <div class="stat-card"><div class="stat-label">Current Streak</div><div class="stat-value" style="color:var(--warning);"><span data-count="${streak}">0</span>🔥</div></div>
                <div class="stat-card"><div class="stat-label">Last Score</div><div class="stat-value" style="color:var(--accent-cyan);">${recentScores.length>0?Math.round(recentScores[0].score_achieved/recentScores[0].total_score*100)+'%':'—'}</div></div>
            </div>

            <!-- Growth journey + modules side-by-side -->
            <div class="dash-main-grid mb-10 grid animate-slide-up grid-cols-[200px_1fr] gap-6">
                ${renderPlantCard(totalAtt)}
                <div>
                    <p class="mb-[1.1rem] text-[.72rem] font-semibold uppercase tracking-[.08em] text-muted">Modules</p>
                    <div class="grid grid-cols-2 gap-4 max-[480px]:grid-cols-1">
                        ${modules.map(m => `
                        <div class="card card-hover ${m.key === weakest ? 'ring-2 ring-primary shadow-neon' : ''}" id="${m.id}" role="button" tabindex="0" aria-label="Start ${m.label} module" style="padding:1.5rem;cursor:pointer;">
                            <div class="pointer-events-none absolute -right-2 -top-2 h-20 w-20 rounded-full" style="background:radial-gradient(circle,${m.color}14,transparent 70%);"></div>
                            ${m.key === weakest ? `<span class="badge badge-primary absolute right-3 top-3 text-[.6rem]">★ Focus</span>` : ''}
                            <div class="mb-[1.1rem] flex h-10 w-10 items-center justify-center rounded-[11px]" style="background:${m.color}18;color:${m.color};"><i data-lucide="${m.icon}" size="20"></i></div>
                            <h3 class="mb-[.3rem] text-[1.05rem]">${m.label}</h3>
                            <p class="mb-[1.1rem] text-[.8rem] leading-[1.5] text-muted">${m.desc}</p>
                            <div class="flex items-center justify-between">
                                <span class="badge ${m.bc} text-[.65rem]">${m.badge}</span>
                                <span class="text-[.72rem] text-muted">${m.att} att.</span>
                            </div>
                        </div>`).join('')}
                    </div>
                </div>
            </div>

            <!-- Badges -->
            ${userBadges.length > 0 ? `
            <section class="mb-10 animate-slide-up" aria-label="Your badges">
                <p class="mb-4 text-[.72rem] font-semibold uppercase tracking-[.08em] text-muted">Your Badges</p>
                <div class="flex flex-wrap gap-[.55rem]">
                    ${userBadges.map(b => `<span class="achievement-badge" title="${esc(b.desc)}">${b.icon} ${esc(b.name)}</span>`).join('')}
                </div>
            </section>` : ''}

            <!-- Recent activity -->
            ${recentScores.length > 0 ? `
            <section class="animate-slide-up" aria-label="Recent activity">
                <p class="mb-4 text-[.72rem] font-semibold uppercase tracking-[.08em] text-muted">Recent Activity</p>
                <div class="card overflow-hidden p-0">
                    ${recentScores.slice(0,5).map((s,i) => {
                        const pct = Math.round(s.score_achieved/s.total_score*100);
                        const col = pct>=70?'var(--success)':pct>=40?'var(--warning)':'var(--error)';
                        const icons = {listening:'headphones',speaking:'mic',reading:'book-open',writing:'pen-tool'};
                        const date  = new Date(s.created_at).toLocaleDateString('en-IN',{month:'short',day:'numeric'});
                        return `<div class="flex items-center justify-between px-[1.4rem] py-[.85rem] ${i>0?'border-t border-line':''}">
                            <div class="flex items-center gap-[.85rem]">
                                <div class="flex h-7 w-7 items-center justify-center rounded-[7px] bg-elevated"><i data-lucide="${icons[s.module_type]||'activity'}" size="13" style="color:var(--text-muted);"></i></div>
                                <div><div class="text-[.83rem] font-semibold capitalize text-bright">${s.module_type}</div><div class="text-[.72rem] text-muted">${date}</div></div>
                            </div>
                            <div class="font-display text-[.9rem] font-bold" style="color:${col};">${pct}%</div>
                        </div>`;
                    }).join('')}
                </div>
            </section>` : ''}
        </main>
    </div>`;

    lucide.createIcons();
    animateCounters();
    enableCardKeyboard();

    /* ── Welcome notification for brand-new users ── */
    if (totalAtt === 0 && !profile?.last_active_date) {
        const firstName = fullName.split(' ')[0];
        setTimeout(() => {
            const w = document.createElement('div');
            w.style.cssText = 'position:fixed;top:78px;right:22px;z-index:999;background:var(--primary-subtle);border:1px solid rgba(114,99,243,.35);border-radius:var(--radius);padding:1rem 1.25rem;font-size:.85rem;color:var(--text-bright);animation:slideInRight .5s var(--ease-bounce);max-width:300px;line-height:1.5;';
            w.innerHTML = `<div style="font-weight:700;margin-bottom:.3rem;">👋 Welcome to LSRW.PRO, ${esc(firstName)}!</div><div style="color:var(--text-muted);font-size:.8rem;">Pick any module below to start your first session and begin building your streak.</div>`;
            document.body.appendChild(w);
            setTimeout(() => { w.style.cssText += ';opacity:0;transform:translateX(32px);transition:all .4s;'; setTimeout(() => w.remove(), 400); }, 6000);
        }, 800);
    }

    /* ── Streak-at-risk reminder ── */
    if (profile?.last_active_date && streak > 2) {
        const diff = Math.round((new Date() - new Date(profile.last_active_date)) / 86400000);
        if (diff >= 1) {
            const s = document.createElement('div');
            s.style.cssText = 'position:fixed;top:78px;right:22px;z-index:999;background:var(--warning-subtle);border:1px solid rgba(251,191,36,.3);border-radius:var(--radius);padding:.8rem 1.1rem;font-size:.83rem;color:var(--warning);font-weight:600;animation:slideInRight .4s var(--ease-bounce);max-width:260px;';
            s.textContent = `⚠️ Don't break your ${streak}-day streak! Attempt a module today.`;
            document.body.appendChild(s);
            setTimeout(() => s.remove(), 6000);
        }
    }

    document.getElementById('logout-btn').onclick         = logout;
    document.getElementById('start-listening').onclick    = () => startListening(document.querySelector('main'));
    document.getElementById('start-speaking').onclick     = () => startSpeaking(document.querySelector('main'));
    document.getElementById('start-reading').onclick      = () => startReading(document.querySelector('main'));
    document.getElementById('start-writing').onclick      = () => startWriting(document.querySelector('main'));
    document.getElementById('nav-profile-btn').onclick    = () => renderProfile(user);
    document.getElementById('nav-analytics-btn').onclick  = () => renderAnalytics(user);
}

/* =========================================================
   PROFILE  — avatar upload + presets
   ========================================================= */
async function renderProfile(user) {
    const [profile, scores, userBadges] = await Promise.all([getProfile(), getRecentScores(100), getUserBadges()]);
    const fullName  = profile?.full_name || user.user_metadata?.full_name || 'Student';
    const gender    = profile?.gender    || user.user_metadata?.gender    || 'male';
    const avatarUrl = profile?.avatar_url || null;
    const streak    = profile?.current_streak || 0;
    const longest   = profile?.longest_streak || 0;
    const totalAtt  = profile?.total_attempts || 0;

    const stats = { listening:{a:0,t:0}, speaking:{a:0,t:0}, reading:{a:0,t:0}, writing:{a:0,t:0} };
    scores.forEach(s => { if (stats[s.module_type]) { stats[s.module_type].a++; stats[s.module_type].t += s.score_achieved/s.total_score*100; } });
    let weakest = 'None', lo = 101;
    Object.keys(stats).forEach(m => { if (stats[m].a > 0) { const av = stats[m].t/stats[m].a; if (av < lo) { lo = av; weakest = m; } } });
    const mIcons = { listening:'headphones', speaking:'mic', reading:'book-open', writing:'pen-tool' };

    app.innerHTML = `
    <div class="min-h-screen bg-deep">
        <nav class="nav" aria-label="Profile">
            <button type="button" class="btn btn-outline btn-sm gap-[.4rem]" id="back-btn"><i data-lucide="arrow-left" size="13"></i> Dashboard</button>
            <span class="font-display font-bold text-bright">Profile</span>
            <div class="w-20"></div>
        </nav>

        <main id="main-content" class="mx-auto max-w-[960px] animate-slide-up px-10 py-10 max-[768px]:px-4">

            <!-- ── PROFILE HERO ── -->
            <header class="mb-10 flex items-center gap-8 max-[768px]:flex-col max-[768px]:text-center">
                <div id="main-avatar-wrap" class="h-[120px] w-[120px] flex-shrink-0 overflow-hidden rounded-[20px] border-2 border-line shadow-[0_0_28px_var(--primary-glow)]">
                    ${getAvatarImg(gender, profile?.avatar_url)}
                </div>
                <div>
                    <h2 class="mb-[.2rem] text-[1.55rem]">${esc(fullName)}</h2>
                    <p class="mb-[.9rem] text-[.85rem] text-muted">${esc(user.email)}</p>
                    <div class="flex flex-wrap gap-[.45rem] max-[768px]:justify-center">
                        ${userBadges.slice(0,4).map(b => `<span class="achievement-badge" title="${esc(b.desc)}">${b.icon} ${esc(b.name)}</span>`).join('')}
                    </div>
                </div>
            </header>

            <!-- ── CHANGE PROFILE PICTURE ── -->
            <div class="card mb-8 p-7">
                <h3 class="mb-6 flex items-center gap-2 text-[.95rem]">
                    <i data-lucide="image" size="14" style="color:var(--text-muted);"></i> Profile Picture
                </h3>

                <!-- Preset character cards -->
                <p class="mb-[.85rem] text-[.7rem] font-semibold uppercase tracking-[.07em] text-muted">Choose a character</p>
                <div role="radiogroup" aria-label="Choose a preset avatar" class="mb-[1.4rem] grid grid-cols-2 gap-4">
                    <div id="preset-female" data-src="${FEMALE_IMG}" data-gender="female" role="radio" tabindex="0" aria-label="Female avatar"
                         class="avatar-preset-opt ${gender==='female' || profile?.avatar_url === FEMALE_IMG ? 'av-active' : ''}">
                        <img src="${FEMALE_IMG}" alt="" class="block h-full w-full object-cover"
                             onerror="this.style.display='none';this.insertAdjacentHTML('afterend','<div style=\\'width:100%;height:100%;padding:.5rem;\\'>${FEMALE_SVG.replace(/'/g,"&#39;").replace(/"/g,"&quot;")}</div>')">
                        <div class="bg-elevated pb-[.6rem] pt-[.5rem] text-center text-[.78rem] font-bold text-bright">Female</div>
                    </div>
                    <div id="preset-male" data-src="${MALE_IMG}" data-gender="male" role="radio" tabindex="0" aria-label="Male avatar"
                         class="avatar-preset-opt ${gender==='male' && !profile?.avatar_url?.startsWith('http') && profile?.avatar_url !== FEMALE_IMG ? 'av-active' : ''}">
                        <img src="${MALE_IMG}" alt="" class="block h-full w-full object-cover"
                             onerror="this.style.display='none';this.insertAdjacentHTML('afterend','<div style=\\'width:100%;height:100%;padding:.5rem;\\'>${MALE_SVG.replace(/'/g,"&#39;").replace(/"/g,"&quot;")}</div>')">
                        <div class="bg-elevated pb-[.6rem] pt-[.5rem] text-center text-[.78rem] font-bold text-bright">Male</div>
                    </div>
                </div>

                <div class="divider"></div>

                <!-- Upload custom photo -->
                <p class="mb-[.85rem] text-[.7rem] font-semibold uppercase tracking-[.07em] text-muted">Or upload your own photo</p>
                <label for="photo-upload" class="btn btn-outline btn-full cursor-pointer gap-2">
                    <i data-lucide="upload" size="14"></i> Choose Photo from Device
                </label>
                <input type="file" id="photo-upload" accept="image/*" class="hidden">

                <!-- Upload preview -->
                <div id="upload-preview" style="display:none;" class="mt-[.85rem] max-h-[200px] overflow-hidden rounded-[12px] border border-line">
                    <img id="preview-img" alt="Selected photo preview" class="block max-h-[200px] w-full object-cover">
                </div>

                <!-- Save button -->
                <div id="save-av-wrap" style="display:none;" class="mt-[1.1rem]">
                    <button id="save-av-btn" type="button" class="btn btn-primary btn-full gap-2">
                        <i data-lucide="check" size="15"></i> Save Profile Picture
                    </button>
                    <div id="save-av-status" class="mt-2 min-h-[1.2em] text-center text-[.78rem] font-semibold" role="status" aria-live="polite"></div>
                </div>
            </div>

            <!-- ── STREAK STATS ── -->
            <div class="mb-8 grid grid-cols-3 gap-4 max-[480px]:grid-cols-1">
                <div class="stat-card"><div class="stat-label">Current Streak</div><div class="stat-value" style="color:var(--warning);">${streak}🔥</div></div>
                <div class="stat-card"><div class="stat-label">Longest Streak</div><div class="stat-value" style="color:var(--primary);">${longest}</div></div>
                <div class="stat-card"><div class="stat-label">Total Attempts</div><div class="stat-value">${totalAtt}</div></div>
            </div>

            <!-- ── ACCOUNT + STATS ── -->
            <div class="grid grid-cols-2 gap-8 max-[768px]:grid-cols-1">
                <div class="card p-7">
                    <h3 class="mb-6 flex items-center gap-[.45rem] text-[.95rem]"><i data-lucide="settings" size="14" style="color:var(--text-muted);"></i> Account</h3>
                    <div class="input-group"><label for="pf-name">Full Name</label><input id="pf-name" type="text" class="input-field opacity-60" value="${esc(fullName)}" disabled></div>
                    <div class="input-group"><label for="pf-email">Email</label><input id="pf-email" type="email" class="input-field opacity-60" value="${esc(user.email)}" disabled></div>
                    <div class="divider"></div>
                    <h4 class="mb-[.8rem] text-[.82rem] font-semibold text-bright">Change Password</h4>
                    <div id="pmsg" class="mb-[.6rem] min-h-[1em] text-[.8rem] font-semibold" role="status" aria-live="polite"></div>
                    <form id="pwd-form">
                        <div class="input-group"><label for="npwd">New Password</label><input type="password" id="npwd" autocomplete="new-password" class="input-field" placeholder="Min 6 characters" required minlength="6"></div>
                        <button type="submit" id="pbtn" class="btn btn-outline btn-full btn-sm">Update Password</button>
                    </form>
                </div>

                <div class="flex flex-col gap-[1.1rem]">
                    ${weakest!=='None'?`
                    <div class="card border-[rgba(251,191,36,.2)] bg-[var(--warning-subtle)] p-[1.4rem]">
                        <div class="mb-2 text-[.7rem] font-bold uppercase tracking-[.06em] text-warning">📈 Focus Area</div>
                        <p class="text-[.85rem] leading-[1.5]">Practise <strong class="capitalize text-bright">${weakest}</strong> more — avg ${Math.round(lo)}%.</p>
                    </div>`:'' }
                    <div class="card flex-1 p-6">
                        <h4 class="mb-[1.1rem] flex items-center gap-[.4rem] text-[.82rem] font-semibold"><i data-lucide="activity" size="13" style="color:var(--text-muted);"></i> Module Progress</h4>
                        ${Object.keys(stats).map(m => {
                            const av = stats[m].a > 0 ? Math.round(stats[m].t/stats[m].a) : 0;
                            return `<div class="mb-[.9rem]">
                                <div class="mb-[.3rem] flex justify-between text-[.78rem]">
                                    <div class="flex items-center gap-[.4rem] font-semibold capitalize text-bright"><i data-lucide="${mIcons[m]}" size="11" style="color:var(--text-muted);"></i> ${m}</div>
                                    <span class="text-muted">${stats[m].a} att · ${av}%</span>
                                </div>
                                <div class="progress-bar"><div class="progress-fill" style="width:${av}%;"></div></div>
                            </div>`;
                        }).join('')}
                    </div>
                    ${userBadges.length>0?`
                    <div class="card p-[1.4rem]">
                        <div class="mb-[.9rem] flex flex-wrap items-center justify-between gap-2">
                            <h4 class="text-[.82rem] font-semibold">🏅 All Badges (${userBadges.length})</h4>
                            <div class="flex gap-[.4rem]">
                                <button type="button" onclick="window.__shareLinkedIn('My ${userBadges.length} LSRW Badges','🏅')" class="btn btn-outline btn-sm gap-[.35rem] px-[.7rem] py-[.3rem] text-[.7rem]"><i data-lucide="linkedin" size="12"></i> LinkedIn</button>
                                <button type="button" onclick="window.__shareWhatsApp('My ${userBadges.length} LSRW Badges','🏅')" class="btn btn-success btn-sm gap-[.35rem] px-[.7rem] py-[.3rem] text-[.7rem]"><i data-lucide="message-circle" size="12"></i> WhatsApp</button>
                            </div>
                        </div>
                        <div class="flex flex-wrap gap-[.45rem]">
                            ${userBadges.map(b=>`<span class="achievement-badge cursor-pointer" title="Click to share on LinkedIn" onclick="window.__shareLinkedIn('${b.name.replace(/'/g,"\\'")}','${b.icon}')">${b.icon} ${esc(b.name)}</span>`).join('')}
                        </div>
                    </div>`:''}
                </div>
            </div>
        </main>
    </div>`;

    lucide.createIcons();
    document.getElementById('back-btn').onclick = () => renderDashboard(user);

    /* ── Avatar picker state ── */
    let pendingSrc  = null;   // image src to preview in the hero
    let pendingUrl  = null;   // value to save to profiles.avatar_url
    let pendingFile = null;   // File object if user uploaded a custom photo

    const mainWrap    = document.getElementById('main-avatar-wrap');
    const saveWrap    = document.getElementById('save-av-wrap');
    const saveBtn     = document.getElementById('save-av-btn');
    const saveStatus  = document.getElementById('save-av-status');

    /* helper: highlight selected preset card via the .av-active class */
    function activatePreset(activeId) {
        ['preset-female', 'preset-male'].forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            const isActive = (id === activeId);
            el.classList.toggle('av-active', isActive);
            el.setAttribute('aria-checked', isActive ? 'true' : 'false');
        });
    }

    /* helper: update the hero avatar preview */
    function previewAvatar(src, avatarGender) {
        mainWrap.innerHTML = getAvatarImg(avatarGender, src);
        saveWrap.style.display = 'block';
        saveStatus.textContent = '';
    }

    /* Preset card click / keyboard */
    document.querySelectorAll('.avatar-preset-opt').forEach(card => {
        const choose = () => {
            const g   = card.dataset.gender;
            const src = card.dataset.src;
            pendingSrc  = src;
            pendingUrl  = src;        /* store the local path  */
            pendingFile = null;

            activatePreset(card.id);
            /* reset upload preview */
            document.getElementById('upload-preview').style.display = 'none';
            document.getElementById('photo-upload').value = '';
            previewAvatar(src, g);
        };
        card.addEventListener('click', choose);
        card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(); } });
    });

    /* File input change → local preview (no upload yet) */
    document.getElementById('photo-upload').addEventListener('change', e => {
        const file = e.target.files[0];
        if (!file) return;

        pendingFile = file;
        pendingSrc  = null;   /* will be set after upload */
        pendingUrl  = null;

        /* clear preset selection */
        activatePreset(null);

        /* show image preview using FileReader */
        const reader = new FileReader();
        reader.onload = ev => {
            const dataUrl = ev.target.result;
            const prevDiv = document.getElementById('upload-preview');
            document.getElementById('preview-img').src = dataUrl;
            prevDiv.style.display = 'block';

            /* live-preview in hero using the data-url (before actual upload) */
            mainWrap.innerHTML = `<img src="${dataUrl}" style="width:100%;height:100%;object-fit:cover;display:block;border-radius:inherit;">`;
            saveWrap.style.display = 'block';
            saveStatus.textContent = '';
        };
        reader.readAsDataURL(file);
    });

    /* Save button */
    saveBtn.addEventListener('click', async () => {
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<span class="loader" style="width:16px;height:16px;border-width:2px;border-top-color:white;"></span> Saving…';
        saveStatus.textContent = '';

        try {
            let urlToSave = pendingUrl;

            if (pendingFile) {
                /* Upload the custom photo to Supabase Storage */
                const uploadedUrl = await uploadCustomAvatar(pendingFile);
                if (!uploadedUrl) throw new Error('Upload failed. Make sure the "avatars" bucket exists in Supabase Storage → Storage → New bucket → name: avatars → Public.');
                urlToSave = uploadedUrl;

                /* update hero with the real URL */
                mainWrap.innerHTML = `<img src="${esc(uploadedUrl)}" style="width:100%;height:100%;object-fit:cover;display:block;border-radius:inherit;">`;
            }

            /* For preset paths (local images), save to Supabase profiles */
            if (!pendingFile) await saveAvatarUrl(urlToSave);
            /* Custom upload already saved inside uploadCustomAvatar */

            saveStatus.textContent = '✓ Saved! Your new photo will appear on the dashboard.';
            saveStatus.style.color = 'var(--success)';
            pendingFile = null;

            /* Update the nav profile button thumbnail immediately */
            const navBtn = document.getElementById('nav-profile-btn');
            if (navBtn && urlToSave) {
                const thumb = navBtn.querySelector('.nav-avatar-thumb');
                if (thumb) {
                    thumb.innerHTML = `<img src="${esc(urlToSave)}" style="width:100%;height:100%;object-fit:cover;border-radius:5px;" onerror="this.style.display='none'">`;
                }
            }

        } catch (err) {
            console.error(err);
            saveStatus.textContent = '✗ ' + err.message;
            saveStatus.style.color = 'var(--error)';
        } finally {
            saveBtn.disabled = false;
            saveBtn.innerHTML = '<i data-lucide="check" size="15"></i> Save Profile Picture';
            lucide.createIcons();
        }
    });

    /* Password change */
    document.getElementById('pwd-form').onsubmit = async e => {
        e.preventDefault();
        const btn = document.getElementById('pbtn'), msg = document.getElementById('pmsg');
        btn.disabled = true; btn.textContent = 'Updating…';
        try { await updatePassword(document.getElementById('npwd').value); msg.textContent = '✓ Updated.'; msg.style.color = 'var(--success)'; document.getElementById('npwd').value = ''; }
        catch (err) { msg.textContent = err.message; msg.style.color = 'var(--error)'; }
        finally { btn.disabled = false; btn.textContent = 'Update Password'; }
    };
}

/* =========================================================
   ANALYTICS
   ========================================================= */
async function renderAnalytics(user) {
    const [scores, profile] = await Promise.all([getRecentScores(100), getProfile()]);
    const hasData = scores.length > 0;

    app.innerHTML = `
    <div class="min-h-screen bg-deep">
        <nav class="nav" aria-label="Analytics">
            <button type="button" class="btn btn-outline btn-sm gap-[.4rem]" id="back-btn"><i data-lucide="arrow-left" size="13"></i> Dashboard</button>
            <span class="font-display font-bold text-bright">Analytics</span>
            <div class="flex items-center gap-2">
                <button type="button" class="btn btn-outline btn-sm gap-[.4rem]" id="pdf-btn"><i data-lucide="download" size="13"></i> <span class="nav-btn-text">Export PDF</span></button>
                ${themeBtn()}
            </div>
        </nav>
        <main id="main-content" class="mx-auto max-w-[1100px] animate-slide-up px-10 py-10 max-[768px]:px-4">
            <div class="mb-8">
                <h1 class="mb-[.3rem]" style="font-size:clamp(1.5rem,3vw,2rem);">Performance Analytics</h1>
                <p class="text-[.85rem] text-muted">Your LSRW journey, visualised.</p>
            </div>
            ${!hasData?`<div class="mb-6 flex items-center gap-2 rounded-token border border-[rgba(114,99,243,.2)] bg-[var(--primary-subtle)] px-[1.1rem] py-[.8rem] text-[.83rem] text-primary-light"><i data-lucide="info" size="14"></i> Complete a module to start seeing your analytics here.</div>`:''}
            <!-- Streak summary -->
            <div class="stat-grid-4 mb-6 grid grid-cols-3 gap-4 max-[480px]:grid-cols-1">
                <div class="stat-card"><div class="stat-label">Current Streak</div><div class="stat-value" style="color:var(--warning);">${profile?.current_streak||0}🔥</div></div>
                <div class="stat-card"><div class="stat-label">Longest Streak</div><div class="stat-value" style="color:var(--primary);">${profile?.longest_streak||0}</div></div>
                <div class="stat-card"><div class="stat-label">Total Sessions</div><div class="stat-value">${profile?.total_attempts||0}</div></div>
            </div>
            <!-- Charts -->
            <div class="chart-row-2 mb-6 grid grid-cols-[1.5fr_1fr] gap-6">
                <div class="card p-6"><p class="mb-4 text-[.72rem] font-semibold uppercase tracking-[.07em] text-muted">Score Over Time</p><canvas id="progressChart" height="200" role="img" aria-label="Line chart of score over time"></canvas></div>
                <div class="card p-6"><p class="mb-4 text-[.72rem] font-semibold uppercase tracking-[.07em] text-muted">Module Distribution</p><canvas id="distributionChart" height="200" role="img" aria-label="Doughnut chart of module distribution"></canvas></div>
            </div>
            <div class="chart-row-2 mb-6 grid grid-cols-2 gap-6">
                <div class="card p-6"><p class="mb-4 text-[.72rem] font-semibold uppercase tracking-[.07em] text-muted">Skill Radar</p><canvas id="radarChart" height="240" role="img" aria-label="Radar chart of skill proficiency"></canvas></div>
                <div class="card p-6"><p class="mb-4 text-[.72rem] font-semibold uppercase tracking-[.07em] text-muted">Avg Score Per Module</p><canvas id="barChart" height="240" role="img" aria-label="Bar chart of average score per module"></canvas></div>
            </div>
            <!-- Activity heatmap -->
            <div class="card mb-6 p-6" id="heatmap-card">
                <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <p class="text-[.72rem] font-semibold uppercase tracking-[.07em] text-muted">Activity Heatmap</p>
                    <div class="flex items-center gap-[.4rem] text-[.66rem] text-muted">
                        <span>Less</span>
                        <span class="hm-cell" data-level="0"></span>
                        <span class="hm-cell" data-level="1"></span>
                        <span class="hm-cell" data-level="2"></span>
                        <span class="hm-cell" data-level="3"></span>
                        <span class="hm-cell" data-level="4"></span>
                        <span>More</span>
                    </div>
                </div>
                <div class="overflow-x-auto pb-1" role="img" aria-label="Calendar heat map of daily practice activity">
                    <div id="heatmap"></div>
                </div>
            </div>
            <!-- Leaderboard -->
            <div class="card p-7" id="leaderboard-card">
                <h3 class="mb-5 flex items-center gap-2 text-[.95rem]"><i data-lucide="trophy" size="16" style="color:var(--warning);"></i> Streak Leaderboard</h3>
                <div id="leaderboard-body" class="text-[.85rem] text-muted">Loading…</div>
            </div>
        </main>
    </div>`;

    lucide.createIcons();
    document.getElementById('back-btn').onclick = () => renderDashboard(user);
    document.getElementById('pdf-btn').onclick  = exportPDF;

    /* ── Leaderboard ── */
    fetchLeaderboard().then(rows => {
        const lb = document.getElementById('leaderboard-body');
        if (!lb) return;
        if (!rows.length) { lb.innerHTML = '<p class="text-[.83rem] text-muted">No streak data yet — be the first!</p>'; return; }
        const medals = ['🥇','🥈','🥉'];
        lb.innerHTML = `<div class="flex flex-col gap-[.65rem]">
            ${rows.map((r,i) => `
            <div class="flex items-center gap-4 rounded-[10px] bg-elevated px-4 py-3" style="border:1px solid ${i===0?'rgba(251,191,36,.3)':'var(--border)'};">
                <span class="w-6 text-center text-[1.2rem]">${medals[i]||'#'+(i+1)}</span>
                <div class="flex-1">
                    <div class="text-[.9rem] font-bold text-bright">${esc(r.display_name)}</div>
                    <div class="text-[.75rem] text-muted">${r.total_attempts} attempts · best ${r.longest_streak} days</div>
                </div>
                <div class="font-display text-[1rem] font-extrabold text-warning">${r.current_streak}🔥</div>
            </div>`).join('')}
        </div>`;
    });

    /* ── Activity heatmap (renders even with no data → blank calendar) ── */
    renderActivityHeatmap(scores);

    /* ── No data → show empty-state instead of fake sample numbers ── */
    if (!hasData) {
        ['progressChart','distributionChart','radarChart','barChart'].forEach(id => {
            const canvas = document.getElementById(id);
            if (!canvas) return;
            const wrap = canvas.parentElement;
            wrap.innerHTML = `
                <p class="mb-3 text-[.72rem] font-semibold uppercase tracking-[.07em] text-muted">${id==='progressChart'?'Score Over Time':id==='distributionChart'?'Module Distribution':id==='radarChart'?'Skill Radar':'Avg Score Per Module'}</p>
                <div class="flex h-[180px] flex-col items-center justify-center gap-[.65rem] opacity-55">
                    <i data-lucide="bar-chart-2" size="36" style="color:var(--border-bright);"></i>
                    <p class="text-[.82rem] text-muted">No attempts yet</p>
                </div>`;
            lucide.createIcons(wrap);
        });
        return;
    }

    /* ── Real user data ── */
    const sorted = [...scores].sort((a,b)=>new Date(a.created_at)-new Date(b.created_at));
    const labels = sorted.map(s=>new Date(s.created_at).toLocaleDateString('en-IN',{month:'short',day:'numeric'}));
    const dp     = sorted.map(s=>Math.round(s.score_achieved/s.total_score*100));
    const st     = {listening:{s:0,c:0},speaking:{s:0,c:0},reading:{s:0,c:0},writing:{s:0,c:0}};
    scores.forEach(s=>{if(st[s.module_type]){st[s.module_type].s+=s.score_achieved/s.total_score*100;st[s.module_type].c++;}});
    const mL   = ['Listening','Speaking','Reading','Writing'];
    const avgS = mL.map(m=>{const k=m.toLowerCase();return st[k].c?Math.round(st[k].s/st[k].c):0;});
    const attC = mL.map(m=>st[m.toLowerCase()].c);

    Chart.defaults.color='#64748b'; Chart.defaults.font.family="'Inter',sans-serif"; Chart.defaults.font.size=11;
    const gc='rgba(255,255,255,0.04)', mc=['#7263f3','#fbbf24','#22d18b','#f87171'];
    new Chart(document.getElementById('progressChart'),{type:'line',data:{labels,datasets:[{label:'Score (%)',data:dp,borderColor:'#7263f3',backgroundColor:'rgba(114,99,243,.08)',borderWidth:2.5,tension:0.4,fill:true,pointBackgroundColor:'#22d3ee',pointRadius:3,pointHoverRadius:5}]},options:{responsive:true,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,max:100,grid:{color:gc},border:{display:false}},x:{grid:{display:false},border:{display:false}}}}});
    new Chart(document.getElementById('distributionChart'),{type:'doughnut',data:{labels:mL,datasets:[{data:attC,backgroundColor:mc,borderColor:'#0d1117',borderWidth:3}]},options:{responsive:true,cutout:'72%',plugins:{legend:{position:'bottom',labels:{padding:14,usePointStyle:true,pointStyleWidth:7}}}}});
    new Chart(document.getElementById('radarChart'),{type:'radar',data:{labels:mL,datasets:[{label:'Proficiency (%)',data:avgS,backgroundColor:'rgba(34,211,238,.1)',borderColor:'#22d3ee',borderWidth:2,pointBackgroundColor:'#22d3ee',pointRadius:3}]},options:{responsive:true,scales:{r:{beginAtZero:true,max:100,angleLines:{color:gc},grid:{color:gc},pointLabels:{color:'#94a3b8',font:{size:12}},ticks:{display:false}}}}});
    new Chart(document.getElementById('barChart'),{type:'bar',data:{labels:mL,datasets:[{label:'Avg Score',data:avgS,backgroundColor:mc.map(c=>c+'cc'),borderRadius:8,borderSkipped:false}]},options:{responsive:true,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,max:100,grid:{color:gc},border:{display:false}},x:{grid:{display:false},border:{display:false}}}}});
}

/**
 * GitHub-style activity heat map: one cell per day for the last ~18 weeks,
 * shaded by how many practice sessions were completed that day.
 */
function renderActivityHeatmap(scores) {
    const mount = document.getElementById('heatmap');
    if (!mount) return;

    const COLS   = 18;                 // weeks shown (columns)
    const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    /* Count attempts per local calendar day (YYYY-MM-DD). */
    const counts = {};
    scores.forEach(s => {
        const key = new Date(s.created_at).toLocaleDateString('en-CA');
        counts[key] = (counts[key] || 0) + 1;
    });

    /* Grid starts on the Sunday of the column furthest in the past. */
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const start = new Date(today);
    start.setDate(start.getDate() - today.getDay() - (COLS - 1) * 7);

    const level = n => (n === 0 ? 0 : n >= 4 ? 4 : n);
    const fmt   = d => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

    const cells = [];
    const monthLabels = [];
    let lastMonth = -1;
    const cur = new Date(start);

    for (let i = 0; i < COLS * 7; i++) {
        const col    = Math.floor(i / 7);
        const future = cur > today;
        const n      = counts[cur.toLocaleDateString('en-CA')] || 0;

        /* Month label above the first column of each new month. */
        if (i % 7 === 0 && !future && cur.getMonth() !== lastMonth) {
            monthLabels.push(`<span style="grid-column:${col + 1};">${MONTHS[cur.getMonth()]}</span>`);
            lastMonth = cur.getMonth();
        }

        if (future) {
            cells.push('<span class="hm-cell" data-level="-1"></span>');
        } else {
            const title = n === 0 ? `No activity · ${fmt(cur)}` : `${n} session${n > 1 ? 's' : ''} · ${fmt(cur)}`;
            cells.push(`<span class="hm-cell" data-level="${level(n)}" title="${title}"></span>`);
        }
        cur.setDate(cur.getDate() + 1);
    }

    const dayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

    mount.innerHTML = `
        <div class="hm-wrap">
            <div class="hm-day-col">${dayLabels.map(d => `<span>${d}</span>`).join('')}</div>
            <div class="hm-main">
                <div class="hm-months" style="grid-template-columns:repeat(${COLS},var(--hm-size));">${monthLabels.join('')}</div>
                <div class="hm-grid">${cells.join('')}</div>
            </div>
        </div>`;
}

/* =========================================================
   CHATBOT
   ========================================================= */
function initChatbot() {
    if (document.getElementById('chatbot-container')) return;
    const c = document.createElement('div');
    c.id = 'chatbot-container';
    c.className = 'fixed bottom-6 right-6 z-[9999] flex flex-col items-end';

    const win = document.createElement('div');
    win.id = 'chat-window';
    win.className = 'mb-[10px] h-[420px] w-[320px] flex-col overflow-hidden rounded-[18px] border border-line bg-card shadow-big';
    win.style.display = 'none';
    win.setAttribute('role', 'dialog');
    win.setAttribute('aria-label', 'AI Tutor chat');
    win.innerHTML = `
        <div class="flex items-center justify-between border-b border-line bg-elevated px-4 py-[.85rem]">
            <div class="flex items-center gap-2">
                <div class="flex h-6 w-6 items-center justify-center rounded-md bg-primary"><i data-lucide="bot" size="13" style="color:#fff;"></i></div>
                <div><div class="text-[.8rem] font-bold text-bright">AI Tutor</div><div class="text-[.66rem] text-success">● Online</div></div>
            </div>
            <button id="chat-close" type="button" aria-label="Close chat" class="cursor-pointer border-0 bg-transparent text-muted"><i data-lucide="x" size="14"></i></button>
        </div>
        <div id="chat-messages" role="log" aria-live="polite" class="flex flex-1 flex-col gap-[.6rem] overflow-y-auto bg-deep p-[.85rem]">
            <div class="max-w-[90%] self-start rounded-[11px] rounded-bl-[3px] bg-elevated px-[.85rem] py-[.6rem] text-[.81rem] leading-[1.5] text-body">
                Hi! I'm your AI Tutor 🎯 Ask anything about LSRW, grammar, or interview tips!
            </div>
        </div>
        <div class="flex gap-[.4rem] border-t border-line bg-elevated p-[.6rem]">
            <input id="chat-input" type="text" aria-label="Message the AI Tutor" placeholder="Ask anything…" class="flex-1 rounded-lg border border-line bg-deep px-[.8rem] py-[.52rem] text-[.8rem] text-bright outline-none">
            <button id="chat-send" type="button" aria-label="Send message" class="flex h-8 w-8 flex-shrink-0 cursor-pointer items-center justify-center rounded-lg border-0 bg-primary"><i data-lucide="send" size="13" style="color:#fff;"></i></button>
        </div>`;

    const fab = document.createElement('button');
    fab.id = 'chat-toggle';
    fab.type = 'button';
    fab.setAttribute('aria-label', 'Open AI Tutor chat');
    fab.className = 'flex h-12 w-12 items-center justify-center rounded-full border-0 bg-primary shadow-[0_4px_14px_var(--primary-glow)] transition-transform hover:scale-110';
    fab.innerHTML = '<i data-lucide="message-circle" size="21" style="color:#fff;"></i>';

    c.appendChild(win); c.appendChild(fab); document.body.appendChild(c);
    lucide.createIcons();

    let open = false;
    const toggle = () => {
        open = !open;
        win.style.display = open ? 'flex' : 'none';
        fab.innerHTML = open ? '<i data-lucide="x" size="19" style="color:#fff;"></i>' : '<i data-lucide="message-circle" size="21" style="color:#fff;"></i>';
        lucide.createIcons();
        if (open) document.getElementById('chat-input').focus();
    };
    fab.onclick = toggle;
    document.getElementById('chat-close').onclick = toggle;

    const msgs = document.getElementById('chat-messages'), inp = document.getElementById('chat-input');
    const addMsg = (text, isUser) => {
        const el = document.createElement('div');
        el.className = isUser
            ? 'max-w-[90%] self-end rounded-[11px] rounded-br-[3px] bg-primary px-[.85rem] py-[.58rem] text-[.81rem] leading-[1.5] text-white [word-break:break-word]'
            : 'max-w-[90%] self-start rounded-[11px] rounded-bl-[3px] bg-elevated px-[.85rem] py-[.58rem] text-[.81rem] leading-[1.5] text-body';
        if (isUser) el.textContent = text; else el.innerHTML = text;
        msgs.appendChild(el); msgs.scrollTop = msgs.scrollHeight; return el;
    };

    const send = async () => {
        const t = inp.value.trim(); if (!t) return;
        addMsg(t, true); inp.value = '';
        const loading = addMsg('<span class="tracking-[3px] animate-[blink_1s_infinite]">●●●</span>', false);
        const reply   = await sendChatMessage(t);
        /* Render model output as plain text (not HTML) to avoid any injection. */
        loading.textContent = reply; msgs.scrollTop = msgs.scrollHeight;
    };

    document.getElementById('chat-send').onclick = send;
    inp.onkeypress = e => { if (e.key === 'Enter') send(); };
}

init();
initChatbot();
