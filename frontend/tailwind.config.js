/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Rajdhani', 'system-ui', 'sans-serif'],
        display: ['Orbitron', 'Rajdhani', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        hud: ['Orbitron', 'sans-serif'],
        tactical: ['Rajdhani', 'sans-serif'],
      },
      colors: {
        void: '#050508',
        'hud-bg': '#0a0a0f',
        'neon-red': '#ff0033',
        'neon-cyan': '#00f0ff',
        'neon-yellow': '#ffaa00',
        'neon-green': '#00ff88',
        cyan: { DEFAULT: '#00f0ff' },
        purple: { DEFAULT: '#a855f7' },
        pink: { DEFAULT: '#ff2d55' },
        green: { DEFAULT: '#00ff88' },
      },
      animation: {
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
