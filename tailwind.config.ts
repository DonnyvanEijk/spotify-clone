import type { Config } from "tailwindcss";
const { mauve, violet } = require("@radix-ui/colors");

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ...mauve,
        ...violet,
      },
      keyframes: {
        wave: {
          "0%": { borderWidth: "0px" },
          "50%": { borderWidth: "5px" },
          "100%": { borderWidth: "0px" },
        },
      },
      animation: {
        wave: "wave 2s infinite ease",
      },
      boxShadow: {
        glow: "0 0 10px 2px rgba(255, 255, 255, 0.6)", // Example glow effect
      },
    },
  },
  plugins: [],
} satisfies Config;
