/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        lamaSky: "#E2F8FF",
        lamaSkyLight: "#F7FDFF",
        lamaPurple: "#8C7AE6",
        lamaPurpleLight: "#F2F1FF",
      },
      fontFamily: {
        sans: ['var(--font-inter)'],
      },
    },
  },
  plugins: [],
}; 