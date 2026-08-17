/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        jakarta: ['"Plus Jakarta Sans"', 'Outfit', '"Segoe UI"', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'Outfit', '"Segoe UI"', 'sans-serif'],
        vietnam: ['"Plus Jakarta Sans"', 'Outfit', '"Segoe UI"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
