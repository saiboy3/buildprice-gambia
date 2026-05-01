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
          red:   '#3a7735',
          green: '#3a7735',
          blue:  '#3d5a80',
        },
      },
      fontFamily: { sans: ['Inter', 'sans-serif'] },
    },
  },
  plugins: [],
}

export default config
