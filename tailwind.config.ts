import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
        inter: ['Inter', 'sans-serif'],
        /* Backward-compat: both map to Inter */
        syne: ['Inter', 'sans-serif'],
        mono: ['Inter', 'sans-serif'],
      },
      colors: {
        /* System backgrounds — iOS / macOS (resolve to CSS vars so dark mode flips) */
        sys: {
          bg: 'var(--sys-bg)',
          bg2: 'var(--sys-bg2)',
          bg3: 'var(--sys-bg3)',
          grouped: 'var(--sys-grouped)',
          elevated: 'var(--sys-elevated)',
        },
        /* Apple system colors */
        accent: {
          DEFAULT: '#4F6EF7',
          hover: '#6B87FF',
          soft: 'rgba(79, 110, 247, 0.1)',
          glow: 'rgba(79, 110, 247, 0.35)',
        },
        success: {
          DEFAULT: '#30D158',
          soft: 'rgba(48, 209, 88, 0.14)',
          glow: 'rgba(48, 209, 88, 0.25)',
        },
        warning: {
          DEFAULT: '#FF9F0A',
          soft: 'rgba(255, 159, 10, 0.16)',
          glow: 'rgba(255, 159, 10, 0.35)',
        },
        danger: {
          DEFAULT: '#FF3B30',
          soft: 'rgba(255, 59, 48, 0.12)',
          glow: 'rgba(255, 59, 48, 0.35)',
        },
        indigo: {
          DEFAULT: '#5E5CE6',
        },
        teal: {
          DEFAULT: '#5AC8FA',
        },
        purple: {
          DEFAULT: '#BF5AF2',
        },
        pink: {
          DEFAULT: '#FF2D55',
        },
        yellow: {
          DEFAULT: '#FFD60A',
        },
        /* Labels — use as text-label, text-label-secondary, etc. Flip via CSS vars. */
        label: {
          DEFAULT: 'var(--label)',
          secondary: 'var(--label-secondary)',
          tertiary: 'var(--label-tertiary)',
          quaternary: 'var(--label-quaternary)',
        },
        /* Separators */
        separator: {
          DEFAULT: 'var(--separator)',
          opaque: 'var(--separator-opaque)',
        },
        /* Backward-compat aliases — flip via CSS vars */
        text: {
          primary: 'var(--label)',
          secondary: 'var(--label-secondary)',
          muted: 'var(--label-tertiary)',
          disabled: 'var(--label-quaternary)',
        },
        bg: {
          deep: 'var(--sys-bg)',
          primary: 'var(--sys-bg)',
          secondary: 'var(--sys-bg2)',
          tertiary: 'var(--sys-bg3)',
          elevated: 'var(--sys-elevated)',
        },
        border: {
          DEFAULT: 'var(--separator)',
          strong: 'var(--separator-opaque)',
        },
      },
      borderRadius: {
        apple: '14px',
        card: '20px',
        modal: '28px',
      },
      backdropBlur: {
        xs: '2px',
        xl2: '48px',
        xl3: '60px',
      },
      boxShadow: {
        glass:
          '0 2px 4px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06), 0 24px 48px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,1)',
        'glass-hover':
          '0 4px 8px rgba(0,0,0,0.06), 0 12px 32px rgba(0,0,0,0.08), 0 32px 64px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,1)',
        'glow-accent': '0 0 24px rgba(0, 122, 255, 0.25)',
        'glow-success': '0 0 24px rgba(48, 209, 88, 0.25)',
        'glow-warning': '0 0 24px rgba(255, 159, 10, 0.25)',
        'glow-danger': '0 0 24px rgba(255, 59, 48, 0.25)',
        button: '0 4px 14px rgba(0, 122, 255, 0.35)',
      },
      animation: {
        'orb-1': 'orb-drift-1 25s ease-in-out infinite',
        'orb-2': 'orb-drift-2 30s ease-in-out infinite',
        'orb-3': 'orb-drift-3 20s ease-in-out infinite',
        'bubble-float': 'bubble-float 4s ease-in-out infinite',
        'spin-gradient': 'spin-gradient 6s linear infinite',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
        shimmer: 'shimmer 1.8s infinite',
        'pulse-badge': 'pulse-badge 2s ease-in-out infinite',
        'success-ripple': 'success-ripple 0.6s ease-out',
      },
      keyframes: {
        pulseSoft: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'pulse-badge': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.15)' },
        },
        'success-ripple': {
          '0%': { boxShadow: '0 0 0 0 rgba(48, 209, 88, 0.4)' },
          '70%': { boxShadow: '0 0 0 16px rgba(48, 209, 88, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(48, 209, 88, 0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
