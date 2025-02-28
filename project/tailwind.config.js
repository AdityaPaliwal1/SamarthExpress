/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        navbar: "#070c0e",
        primary: "#ADBBC2",
        button: "#070c0e",
        tabColor: "#1a2023",
        iconColor: "#191c24",
        footer: "#191b24",
      },
      keyframes: {
        typing: {
          "0%": { width: "0%" },
          "100%": { width: "100%" },
        },
      },
      animation: {
        typing: "typing 3.5s steps(30, end) forwards",
      },
    },
  },
  plugins: [],
};
