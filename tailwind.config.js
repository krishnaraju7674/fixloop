/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#FAF9F5",
        ink: "#101A28",
        accent: {
          DEFAULT: "#0E7C66",
          dark: "#0A5C4C",
          soft: "#E4F2EC",
        },
        alert: "#C2402A",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
};
