import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'bg-light': '#ffffff',
        'bg-dark': '#000000',
        'surface-light': '#ffffff',
        'surface-dark': '#000000',
        'border-light': '#000000',
        'border-dark': '#ffffff',
        'text-light': '#000000',
        'text-dark': '#ffffff',
      },
      fontFamily: {
        heading: ['"Archivo Black"', 'sans-serif'],
        body: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        brutal: '6px 6px 0 0 #000000',
        'brutal-dark': '6px 6px 0 0 #ffffff',
      },
      keyframes: {
        slideIn: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        slideIn: 'slideIn 220ms ease-out',
      },
    },
  },
  plugins: [],
} satisfies Config
