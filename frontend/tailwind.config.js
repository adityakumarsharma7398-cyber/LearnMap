/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        learnmap: {
          bg: "#F9DDEB",
          blue: "#3346C8",
          lavender: "#C9B8F5",
          yellow: "#F8E54B",
          mint: "#7DD6BF",
          pink: "#E9A7C8",
          dark: "#111111",
          card: "#FFFFFF",
          muted: "#6B7280"
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'neo': '4px 4px 0px #111111',
        'neo-sm': '2px 2px 0px #111111',
        'neo-lg': '6px 6px 0px #111111',
        'neo-active': '1px 1px 0px #111111',
      },
      borderRadius: {
        'card': '20px',
        'hero': '28px',
      }
    },
  },
  plugins: [],
}
