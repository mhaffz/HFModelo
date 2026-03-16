/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdfbfa',
          100: '#f9f6f1',
          200: '#f1eadd',
          300: '#e5d7c3',
          400: '#d4b896',
          500: '#c59d72',
          600: '#b68558',
          700: '#976a47',
          800: '#7d593f',
          900: '#644835',
          950: '#36251a',
        },
        pastel: {
          bg: '#f5f1ea',
          surface: '#fcf8f3',
          panel: '#eee5da',
          border: '#e6dacb',
          text: '#4a4036',
          muted: '#8c7e70'
        },
        dark: {
          bg: '#1a1814',
          surface: '#24211c',
          panel: '#2d2922',
          border: '#3d372e',
          text: '#e6dacb',
          muted: '#a39281'
        }
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s infinite',
      },
    },
  },
  plugins: [],
}
