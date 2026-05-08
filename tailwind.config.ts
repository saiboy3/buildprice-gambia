import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#fef9ec',
          100: '#fdf0c9',
          200: '#fbde8e',
          300: '#f9c74f',
          400: '#f7b32b',
          500: '#f09212',
          600: '#d46f0b',
          700: '#b0500d',
          800: '#8f3f11',
          900: '#763512',
          950: '#431905',
        },
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
