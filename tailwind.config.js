/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        teal: {
          light: '#2a9d8f',
          DEFAULT: '#0f4c5c',
          dark: '#0a333d'
        },
        sage: {
          light: '#e9f5ed',
          DEFAULT: '#9cbfa7',
          dark: '#6e8c78'
        },
        charcoal: {
          DEFAULT: '#333333',
          dark: '#212121'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
