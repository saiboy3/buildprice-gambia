import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Terracotta/clay ramp — warm, West-African inspired
        primary: {
          50:  '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#ea580c',
          600: '#c2410c',
          700: '#9a3412',
          800: '#7c2d12',
          900: '#431407',
          950: '#2b0d03',
        },
        // Warm cream surfaces used for page backgrounds and panels
        cream: {
          50:  '#fffbf5',
          100: '#fef3e2',
          200: '#fde8d0',
          300: '#fbd9b5',
        },
        ink: '#431407',
        gambia: {
          red:   '#CE1126',
          green: '#3A7735',
          gold:  '#F9A81A',
          blue:  '#3d5a80',
        },
      },
      fontFamily: {
        sans:    ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        display: ['var(--font-outfit)', 'Outfit', 'sans-serif'],
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.7' },
        },
      },
      animation: {
        shimmer:     'shimmer 1.5s infinite',
        float:       'float 3s ease-in-out infinite',
        fadeInUp:    'fadeInUp 0.4s ease forwards',
        'pulse-soft':'pulse-soft 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

export default config
