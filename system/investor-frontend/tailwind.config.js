/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/index.html", "./src/**/*.{js,jsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0B0B0B",
        pearl: "#F6F6F6",
        graphite: "#1C1C1C",
        slate: "#8A8A8A",
        border: "#E6E6E6"
      },
      boxShadow: {
        card: "0 12px 40px rgba(0,0,0,0.08)"
      }
    }
  },
  plugins: []
};
