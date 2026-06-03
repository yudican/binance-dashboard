import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0a0c10',
        bg2: '#0f1218',
        bg3: '#141820',
        card: '#131820',
        card2: '#1a2030',
        accent: '#f0b90b',
        gain: '#0ecb81',
        loss: '#f6465d',
        info: '#1890ff',
        warn: '#f77f00',
        muted: '#6b7280',
        muted2: '#9ca3af',
        text: '#e8eaf0',
      },
      fontFamily: {
        sans: ['var(--font-syne)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-plex)', 'ui-monospace', 'monospace'],
      },
      borderColor: {
        DEFAULT: 'rgba(255,255,255,0.06)',
        soft: 'rgba(255,255,255,0.06)',
        strong: 'rgba(255,255,255,0.12)',
      },
      boxShadow: {
        card: '0 1px 0 rgba(255,255,255,0.04) inset, 0 8px 24px rgba(0,0,0,0.35)',
        glow: '0 0 0 4px rgba(14, 203, 129, 0.18)',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseDot: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(14, 203, 129, 0.6)' },
          '50%': { boxShadow: '0 0 0 6px rgba(14, 203, 129, 0)' },
        },
        spin: {
          to: { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        fadeUp: 'fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
        pulseDot: 'pulseDot 1.8s ease-out infinite',
        spin: 'spin 0.8s linear infinite',
      },
    },
  },
  plugins: [],
}
export default config
