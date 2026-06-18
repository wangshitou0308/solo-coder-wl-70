/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        forest: {
          50: '#f2f7f1',
          100: '#e0ebe0',
          200: '#c2d7c0',
          300: '#9bbd98',
          400: '#719d6d',
          500: '#52804e',
          600: '#3f663c',
          700: '#335031',
          800: '#2b4129',
          900: '#253624',
          950: '#121e12',
        },
        amber: {
          50: '#fefbe8',
          100: '#fff5c2',
          200: '#ffea88',
          300: '#ffd945',
          400: '#ffc515',
          500: '#ffb300',
          600: '#e18a00',
          700: '#ba6103',
          800: '#974b0a',
          900: '#7c3e0d',
          950: '#481f02',
        },
        cream: {
          50: '#fdfcfa',
          100: '#faf8f3',
          200: '#f5f0e4',
          300: '#ede4cf',
          400: '#ddd0ae',
          500: '#ccb98e',
          600: '#b79d6a',
          700: '#988055',
          800: '#7c6949',
          900: '#66573e',
          950: '#372e20',
        }
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', 'Times New Roman', 'Times', 'serif'],
        sans: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 12px -2px rgba(0, 0, 0, 0.08), 0 4px 8px -2px rgba(0, 0, 0, 0.06)',
        'card': '0 4px 20px -4px rgba(45, 90, 39, 0.12)',
        'hover': '0 8px 30px -6px rgba(45, 90, 39, 0.18)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'count-up': 'countUp 1s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
