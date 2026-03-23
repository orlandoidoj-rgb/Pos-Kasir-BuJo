/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        headline: ['Manrope', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#1e40af',
          dark: '#1e3a8a',
          light: '#eff6ff',
        },
        secondary: '#2a5480',
        surface: '#f7f9fb',
        'on-surface': '#1a2233',
        'primary-dark': '#1e3a8a',
        'primary-light': '#eff6ff',
      },
    },
  },
  plugins: [],
}
