/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#E6392E',
        secondary: '#334155',
        accent: '#DC2626',
        dark: '#1F2937',
        light: '#FAF7F0',
      },
    },
  },
  plugins: [],
}