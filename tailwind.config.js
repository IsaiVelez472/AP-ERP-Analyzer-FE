// Copyright 2025 Anti-Patrones
// This work is licensed under a Creative Commons Attribution-ShareAlike 4.0 International License.
// http://creativecommons.org/licenses/by-sa/4.0/
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
    "./node_modules/preline/dist/*.js"
  ],
  theme: {
    extend: {},
  },
  plugins: [
    // Preline UI is loaded directly in the HTML, so we don't need to require it here
  ],
}

