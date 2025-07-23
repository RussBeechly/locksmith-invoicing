/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}", // Looks in pages directory
    "./components/**/*.{js,ts,jsx,tsx}", // If you add components later
    "./app/**/*.{js,ts,jsx,tsx}" // If you ever use Next.js /app directory
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};


