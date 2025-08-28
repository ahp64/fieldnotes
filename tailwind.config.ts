import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0b1021',
        foreground: '#e4e4e7',
        primary: {
          DEFAULT: '#7dd3fc',
          foreground: '#0b1021',
        },
        secondary: {
          DEFAULT: '#f5c94a',
          foreground: '#0b1021',
        },
        accent: {
          DEFAULT: '#a78bfa',
          foreground: '#0b1021',
        },
        muted: {
          DEFAULT: '#1e293b',
          foreground: '#94a3b8',
        },
        card: {
          DEFAULT: '#1e293b',
          foreground: '#e4e4e7',
        },
        border: '#334155',
      },
    },
  },
  plugins: [],
}

export default config