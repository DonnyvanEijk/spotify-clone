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
        ...violet
      }
    },
  },
  plugins: [],
} satisfies Config;
