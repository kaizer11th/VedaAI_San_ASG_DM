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
          DEFAULT: "#F6F6F2",
          card: "#FFFFFF",
          line: "#E4E3DC"
        },
        ink: {
          DEFAULT: "#15171C",
          soft: "#4B4F58",
          faint: "#8A8D95"
        },
        redpen: {
          DEFAULT: "#B5372A",
          soft: "#F4E1DE"
        },
        correct: {
          DEFAULT: "#2E8B63",
          soft: "#E1F0E7"
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
        display: ["'Fraunces'", "serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"]
      }
    }
  },
  plugins: []
};

export default config;
