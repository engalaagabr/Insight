/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0b1220',
          800: '#0f172a',
          700: '#1f2937',
          600: '#374151',
        }
      }
    },
  },
  plugins: [],
}
