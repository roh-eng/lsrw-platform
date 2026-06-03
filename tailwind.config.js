/**
 * Tailwind CSS v3 build config — mirrors the old Play-CDN inline config so the
 * compiled output is identical, but minified and shipped as a static file.
 *
 * Build:   npm run build:css      (one-off, minified → css/tailwind.css)
 * Watch:   npm run watch:css      (rebuild on change while developing)
 *
 * IMPORTANT: almost every utility class lives inside JS template strings, so the
 * content scan MUST include js/**\/*.js, not just index.html.
 */
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './js/**/*.js'],
  // Theme is switched via CSS variables on [data-theme]; no `dark:` utilities are
  // used, but keep parity with the old config.
  darkMode: ['class', '[data-theme="dark"]'],
  // base.css already provides the reset/typography; re-adds only Tailwind's border
  // reset so `border` utilities still render.
  corePlugins: { preflight: false },
  theme: {
    extend: {
      colors: {
        deep:      'var(--bg-deep)',
        card:      'var(--bg-card)',
        elevated:  'var(--bg-elevated)',
        raised:    'var(--bg-hover)',
        primary:   { DEFAULT: 'var(--primary)', light: 'var(--primary-light)', dark: 'var(--primary-dark)' },
        secondary: 'var(--secondary)',
        cyan:      'var(--accent-cyan)',
        success:   'var(--success)',
        error:     'var(--error)',
        warning:   'var(--warning)',
        bright:    'var(--text-bright)',
        body:      'var(--text-main)',
        muted:     'var(--text-muted)',
        line:      { DEFAULT: 'var(--border)', bright: 'var(--border-bright)' },
      },
      fontFamily: {
        sans:    ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'ui-sans-serif', 'sans-serif'],
      },
      borderRadius: { token: '14px', xl2: '28px' },
      boxShadow: {
        soft: 'var(--shadow-sm)',
        mid:  'var(--shadow-md)',
        big:  'var(--shadow-lg)',
        neon: 'var(--shadow-neon)',
      },
      backgroundImage: {
        'brand-grad': 'linear-gradient(135deg, var(--primary), var(--accent-cyan))',
      },
      // @keyframes are defined in css/base.css
      animation: {
        'fade-in':        'fadeIn .5s cubic-bezier(.4,0,.2,1) both',
        'slide-up':       'slideUp .45s cubic-bezier(.4,0,.2,1) both',
        'scale-in':       'scaleIn .4s cubic-bezier(.4,0,.2,1) both',
        'slide-in-right': 'slideInRight .4s cubic-bezier(.34,1.56,.64,1) both',
        float:            'float 6s ease-in-out infinite',
        'pulse-glow':     'pulse-glow 2s ease-in-out infinite',
      },
    },
  },
};
