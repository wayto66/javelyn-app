/** @type {import('tailwindcss').Config} */
const config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#212425",
        secondary: "#323637",
        jpurple: "#7b68ee",
        jwhite: "#f5f5f5",
        jred: "#DE3163",
      },
    },
  },
  plugins: [],
};

module.exports = config;
