/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sporty: ['Orbitron', 'sans-serif'], // For KULT Logo & Main Headers
        sharp: ['Rajdhani', 'sans-serif'],   // For Body & Card Info
      },
    },
  },
  plugins: [],
};