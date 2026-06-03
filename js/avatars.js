/**
 * Avatar System
 *
 * Priority order when rendering a profile picture:
 *   1. Custom uploaded photo (Supabase Storage URL)
 *   2. Preset local PNG  →  images/male-avatar.png  /  images/female-avatar.png
 *   3. Built-in SVG character (onerror fallback — no internet needed)
 *
 * Usage:
 *   import { getAvatar, MALE_IMG, FEMALE_IMG } from './avatars.js';
 *   el.innerHTML = getAvatar('male');
 *   el.innerHTML = getAvatar('female', profile.avatar_url);
 */

/* ── Local preset image paths ─────────────────────────────── */
export const MALE_IMG   = 'images/male-avatar.png';
export const FEMALE_IMG = 'images/female-avatar.png';

/* ── Built-in SVG fallback characters ─────────────────────── */
export const MALE_SVG = `<svg viewBox="0 0 200 230" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;display:block;">
  <defs>
    <radialGradient id="m-bg" cx="50%" cy="25%" r="75%"><stop offset="0%" stop-color="#253048"/><stop offset="100%" stop-color="#111a2a"/></radialGradient>
    <radialGradient id="m-fc" cx="40%" cy="35%" r="65%"><stop offset="0%" stop-color="#fddcb5"/><stop offset="100%" stop-color="#e09560"/></radialGradient>
    <radialGradient id="m-sk" cx="30%" cy="30%" r="70%"><stop offset="0%" stop-color="#f5c090"/><stop offset="100%" stop-color="#d88050"/></radialGradient>
  </defs>
  <rect width="200" height="230" rx="24" fill="url(#m-bg)"/>
  <path d="M22 192 Q22 160 100 148 Q178 160 178 192 L178 230 L22 230Z" fill="#1c2d45"/>
  <rect x="93" y="148" width="14" height="55" fill="#d0e8f8" opacity=".75"/>
  <polygon points="97,150 103,150 101,178 99,178" fill="#7263f3"/>
  <polygon points="95,150 105,150 101,157 99,157" fill="#5248c8"/>
  <path d="M93 148 L74 170 L93 182" fill="#132035"/>
  <path d="M107 148 L126 170 L107 182" fill="#132035"/>
  <rect x="87" y="134" width="26" height="16" rx="7" fill="url(#m-sk)"/>
  <circle cx="100" cy="92" r="50" fill="url(#m-fc)"/>
  <ellipse cx="50" cy="96" rx="9" ry="12" fill="url(#m-sk)"/><ellipse cx="50" cy="96" rx="5.5" ry="8" fill="#d07848"/>
  <ellipse cx="150" cy="96" rx="9" ry="12" fill="url(#m-sk)"/><ellipse cx="150" cy="96" rx="5.5" ry="8" fill="#d07848"/>
  <path d="M50 82 Q54 44 100 40 Q146 44 150 82 L146 68 Q134 48 100 46 Q66 48 54 68Z" fill="#18100c"/>
  <path d="M50 82 Q48 96 50 104 L55 84Z" fill="#18100c"/>
  <path d="M150 82 Q152 96 150 104 L145 84Z" fill="#18100c"/>
  <path d="M68 64 Q78 52 92 62 Q86 76 86 84" fill="#18100c"/>
  <path d="M132 64 Q122 52 108 62 Q114 76 114 84" fill="#18100c"/>
  <rect x="57" y="85" width="36" height="25" rx="5" fill="rgba(180,220,255,.12)" stroke="#18100c" stroke-width="3"/>
  <rect x="107" y="85" width="36" height="25" rx="5" fill="rgba(180,220,255,.12)" stroke="#18100c" stroke-width="3"/>
  <line x1="93" y1="97" x2="107" y2="97" stroke="#18100c" stroke-width="2.8"/>
  <line x1="57" y1="97" x2="50" y2="97" stroke="#18100c" stroke-width="2.5"/>
  <line x1="143" y1="97" x2="150" y2="97" stroke="#18100c" stroke-width="2.5"/>
  <rect x="58" y="86" width="34" height="23" rx="4.5" fill="#7ab8e8" opacity=".12"/>
  <rect x="108" y="86" width="34" height="23" rx="4.5" fill="#7ab8e8" opacity=".12"/>
  <circle cx="75" cy="97" r="8.5" fill="#1c1414"/><circle cx="125" cy="97" r="8.5" fill="#1c1414"/>
  <circle cx="79" cy="93" r="3" fill="white" opacity=".92"/><circle cx="129" cy="93" r="3" fill="white" opacity=".92"/>
  <path d="M60 81 Q75 75 90 79" stroke="#18100c" stroke-width="2.8" fill="none" stroke-linecap="round"/>
  <path d="M110 79 Q125 75 140 81" stroke="#18100c" stroke-width="2.8" fill="none" stroke-linecap="round"/>
  <path d="M96 110 Q100 117 104 110" stroke="#bf7040" stroke-width="1.8" fill="none" stroke-linecap="round"/>
  <path d="M86 124 Q100 135 114 124" stroke="#b86040" stroke-width="2.8" fill="none" stroke-linecap="round"/>
  <ellipse cx="65" cy="114" rx="14" ry="6.5" fill="#ffaab8" opacity=".28"/>
  <ellipse cx="135" cy="114" rx="14" ry="6.5" fill="#ffaab8" opacity=".28"/>
  <rect x="32" y="176" width="94" height="54" rx="5" fill="#22303f"/>
  <rect x="35" y="179" width="88" height="45" rx="3" fill="#2196f3" opacity=".72"/>
  <rect x="42" y="186" width="38" height="3" rx="1.5" fill="white" opacity=".55"/>
  <rect x="42" y="193" width="58" height="3" rx="1.5" fill="white" opacity=".38"/>
  <rect x="42" y="200" width="46" height="3" rx="1.5" fill="white" opacity=".44"/>
  <rect x="22" y="227" width="114" height="5" rx="2.5" fill="#111a2a"/>
  <path d="M126 162 Q144 174 126 192" stroke="url(#m-sk)" stroke-width="17" fill="none" stroke-linecap="round"/>
</svg>`;

export const FEMALE_SVG = `<svg viewBox="0 0 200 230" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;display:block;">
  <defs>
    <radialGradient id="f-bg" cx="50%" cy="25%" r="75%"><stop offset="0%" stop-color="#2a1c42"/><stop offset="100%" stop-color="#12091e"/></radialGradient>
    <radialGradient id="f-fc" cx="40%" cy="35%" r="65%"><stop offset="0%" stop-color="#fddcb5"/><stop offset="100%" stop-color="#e09560"/></radialGradient>
    <radialGradient id="f-sk" cx="30%" cy="30%" r="70%"><stop offset="0%" stop-color="#f5c090"/><stop offset="100%" stop-color="#d88050"/></radialGradient>
  </defs>
  <rect width="200" height="230" rx="24" fill="url(#f-bg)"/>
  <path d="M22 192 Q22 160 100 148 Q178 160 178 192 L178 230 L22 230Z" fill="#2d1870"/>
  <rect x="93" y="148" width="14" height="55" fill="#fce4f0" opacity=".75"/>
  <ellipse cx="100" cy="154" rx="13" ry="5.5" fill="#e91e8c"/>
  <ellipse cx="100" cy="154" rx="7" ry="3" fill="#b0146a"/>
  <circle cx="100" cy="154" r="3.5" fill="#e91e8c"/>
  <path d="M93 148 L74 170 L93 182" fill="#1c0e48"/>
  <path d="M107 148 L126 170 L107 182" fill="#1c0e48"/>
  <rect x="87" y="134" width="26" height="16" rx="7" fill="url(#f-sk)"/>
  <!-- Long hair strokes drawn BEHIND the face -->
  <path d="M56 74 Q40 118 44 178 Q55 208 78 220" stroke="#3a1e08" stroke-width="40" fill="none" stroke-linecap="round"/>
  <path d="M144 74 Q160 118 156 178 Q145 208 122 220" stroke="#3a1e08" stroke-width="40" fill="none" stroke-linecap="round"/>
  <!-- Face drawn ON TOP — covers any hair that might overlap the chin -->
  <circle cx="100" cy="92" r="50" fill="url(#f-fc)"/>
  <!-- Top hair only (crown, not sides) -->
  <path d="M50 82 Q54 44 100 40 Q146 44 150 82 L146 68 Q132 48 100 46 Q68 48 54 68Z" fill="#2c1506"/>
  <path d="M64 66 Q74 52 88 62 Q82 76 82 86" fill="#3a1e08" opacity=".9"/>
  <path d="M136 66 Q126 52 112 62 Q118 76 118 86" fill="#3a1e08" opacity=".9"/>
  <circle cx="100" cy="46" r="8" fill="#7263f3"/><circle cx="100" cy="46" r="5" fill="#9a8af8"/><circle cx="100" cy="46" r="2.5" fill="#7263f3"/>
  <ellipse cx="50" cy="96" rx="9" ry="12" fill="url(#f-sk)"/><ellipse cx="50" cy="96" rx="5.5" ry="8" fill="#d07848"/>
  <ellipse cx="150" cy="96" rx="9" ry="12" fill="url(#f-sk)"/><ellipse cx="150" cy="96" rx="5.5" ry="8" fill="#d07848"/>
  <circle cx="50" cy="106" r="4.5" fill="#ffd700"/><circle cx="50" cy="106" r="2.5" fill="#ffe44d"/>
  <circle cx="150" cy="106" r="4.5" fill="#ffd700"/><circle cx="150" cy="106" r="2.5" fill="#ffe44d"/>
  <rect x="57" y="85" width="36" height="25" rx="5" fill="rgba(180,220,255,.12)" stroke="#18100c" stroke-width="3"/>
  <rect x="107" y="85" width="36" height="25" rx="5" fill="rgba(180,220,255,.12)" stroke="#18100c" stroke-width="3"/>
  <line x1="93" y1="97" x2="107" y2="97" stroke="#18100c" stroke-width="2.8"/>
  <line x1="57" y1="97" x2="50" y2="97" stroke="#18100c" stroke-width="2.5"/>
  <line x1="143" y1="97" x2="150" y2="97" stroke="#18100c" stroke-width="2.5"/>
  <rect x="58" y="86" width="34" height="23" rx="4.5" fill="#7ab8e8" opacity=".12"/>
  <rect x="108" y="86" width="34" height="23" rx="4.5" fill="#7ab8e8" opacity=".12"/>
  <circle cx="75" cy="97" r="8.5" fill="#1c1414"/><circle cx="125" cy="97" r="8.5" fill="#1c1414"/>
  <circle cx="79" cy="93" r="3" fill="white" opacity=".92"/><circle cx="129" cy="93" r="3" fill="white" opacity=".92"/>
  <circle cx="72" cy="100" r="1.5" fill="white" opacity=".55"/><circle cx="122" cy="100" r="1.5" fill="white" opacity=".55"/>
  <path d="M60 85 Q75 80 90 85" stroke="#18100c" stroke-width="1.8" fill="none" stroke-linecap="round" opacity=".8"/>
  <path d="M110 85 Q125 80 140 85" stroke="#18100c" stroke-width="1.8" fill="none" stroke-linecap="round" opacity=".8"/>
  <path d="M60 80 Q75 74 90 78" stroke="#3a1e08" stroke-width="2.8" fill="none" stroke-linecap="round"/>
  <path d="M110 78 Q125 74 140 80" stroke="#3a1e08" stroke-width="2.8" fill="none" stroke-linecap="round"/>
  <path d="M96 110 Q100 117 104 110" stroke="#bf7040" stroke-width="1.8" fill="none" stroke-linecap="round"/>
  <path d="M85 124 Q100 136 115 124" stroke="#e0587a" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M90 124 Q100 129 110 124" fill="#ff8fab" opacity=".55"/>
  <ellipse cx="64" cy="114" rx="15" ry="7" fill="#ffaab8" opacity=".38"/>
  <ellipse cx="136" cy="114" rx="15" ry="7" fill="#ffaab8" opacity=".38"/>
  <rect x="32" y="176" width="94" height="54" rx="5" fill="#22303f"/>
  <rect x="35" y="179" width="88" height="45" rx="3" fill="#a855f7" opacity=".72"/>
  <rect x="42" y="186" width="38" height="3" rx="1.5" fill="white" opacity=".55"/>
  <rect x="42" y="193" width="58" height="3" rx="1.5" fill="white" opacity=".38"/>
  <rect x="42" y="200" width="46" height="3" rx="1.5" fill="white" opacity=".44"/>
  <rect x="22" y="227" width="114" height="5" rx="2.5" fill="#12091e"/>
  <path d="M126 162 Q144 174 126 192" stroke="url(#f-sk)" stroke-width="17" fill="none" stroke-linecap="round"/>
</svg>`;

/**
 * Returns an <img> tag that tries:
 *   1. customUrl  (Supabase Storage URL or local path saved in profiles)
 *   2. The preset PNG  (images/male-avatar.png or images/female-avatar.png)
 *   3. On error → inline SVG character
 *
 * @param {'male'|'female'} gender
 * @param {string|null}     customUrl  — value from profiles.avatar_url
 */
export function getAvatar(gender, customUrl = null) {
    /* Cache the SVG strings on window so the inline onerror handler can reach them */
    if (typeof window !== 'undefined') {
        window.__AV = window.__AV || {};
        window.__AV.male   = MALE_SVG;
        window.__AV.female = FEMALE_SVG;
    }

    const src = customUrl || (gender === 'female' ? FEMALE_IMG : MALE_IMG);
    const key = gender === 'female' ? 'female' : 'male';

    /* onerror: replace <img> with a <div> containing the inline SVG */
    const onErr = `(function(el){
        if(!window.__AV)return;
        var d=document.createElement('div');
        d.style.cssText='width:100%;height:100%;';
        d.innerHTML=window.__AV['${key}']||window.__AV.male;
        if(el.parentNode)el.parentNode.replaceChild(d,el);
    })(this);this.onerror=null;`;

    return `<img src="${src.replace(/"/g, '&quot;')}"
                 style="width:100%;height:100%;object-fit:cover;display:block;border-radius:inherit;"
                 onerror="${onErr.replace(/\n\s*/g,' ')}">`;
}

/** Convenience: returns src path only (useful for <img src="..."> in custom places) */
export function getAvatarSrc(gender, customUrl = null) {
    return customUrl || (gender === 'female' ? FEMALE_IMG : MALE_IMG);
}
