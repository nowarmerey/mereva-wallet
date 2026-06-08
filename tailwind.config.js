/** @type {import('tailwindcss').Config} */
module.exports = {
  // "class" strategy lets us toggle dark mode by adding/removing
  // the `dark` class on <html> (handled by the ThemeToggle component).
  darkMode: "class",
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
