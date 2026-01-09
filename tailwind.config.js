/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}", // <--- 確保這行有寫，它才會掃描你的 App.jsx
    ],
    theme: {
      extend: {},
    },
    plugins: [],
  }