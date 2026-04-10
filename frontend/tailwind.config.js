/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      screens: {
        'xs': '400px',
      },
      fontFamily: {
        sporty: ['Syne', 'sans-serif'], // For KULT Logo & Main Headers
        sharp: ['Syne', 'sans-serif'],   // For Body & Card Info
        sans: ['Syne', 'sans-serif'],
      },
      boxShadow: {
        neon: '0 0 40px rgba(124, 58, 237, 0.25)',
      },
    },
  },
  plugins: [],
};