/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./ui/**/*.{html,js}",
    "./ui/*.{html,js}"
  ],
  theme: {
    extend: {
      colors: {
        'vna-primary': '#0B4F9A',
        'vna-secondary': '#ffc107',
      },
    },
  },
  plugins: [],
}

