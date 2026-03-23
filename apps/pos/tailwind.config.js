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
        primary: '#1e40af',
        secondary: '#2a5480',
        surface: '#f7f9fb',
        'primary-dark': '#1e3a8a',
        'primary-light': '#eff6ff',
        'surface-low': '#f0f4f7',
        'surface-card': '#ffffff',
        'surface-high': '#e3e9ed',
        border: '#e3e9ed',
        'on-surface': '#111827',
        'on-surface-muted': '#6b7280',
        // Keep brand-accent for backward compatibility
        brand: {
          accent: '#224ceb',
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
}
