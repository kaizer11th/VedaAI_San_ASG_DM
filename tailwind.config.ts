import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: "#F4F4F6",
          card: "#FFFFFF",
          line: "#E7E7EC"
        },
        ink: {
          DEFAULT: "#16181D",
          soft: "#5B5E66",
          faint: "#96989F"
        },
        accent: {
          DEFAULT: "#FF6A3D",
          soft: "#FFE9DD",
          dark: "#E5541F"
        },
        redpen: {
          DEFAULT: "#D64545",
          soft: "#FBE4E2"
        },
        correct: {
          DEFAULT: "#1FA971",
          soft: "#E1F7EC"
        },
        warn: {
          DEFAULT: "#B8791E",
          soft: "#F5E9D6"
        },
        brand: {
          50: "#f5f3ff",
          100: "#ede9fe",
          500: "#7c5cff",
          600: "#6a45f5",
          700: "#5a35e0"
        }
      },
      fontFamily: {
        display: ["'Inter'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'Inter'", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
