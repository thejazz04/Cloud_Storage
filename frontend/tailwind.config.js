/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f4f6fe',
          100: '#ebf0fe',
          200: '#dce5fd',
          300: '#c3d2fc',
          400: '#a2b7fa',
          500: '#7e96f7',
          600: '#6472f1',
          700: '#525ce0',
          800: '#444bb7',
          900: '#3a3f92',
          DEFAULT: '#6472f1'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
