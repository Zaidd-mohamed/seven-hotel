/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        gold: "#C9A24D",
        ink: "#000000",
        charcoal: "#0B0B0B",
        soft: "#CFCFCF",
      },
      fontFamily: {
        heading: ["Playfair Display", "serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        luxe: "0 20px 60px rgba(0,0,0,0.55)",
      },
    },
  },
  plugins: [],
};
