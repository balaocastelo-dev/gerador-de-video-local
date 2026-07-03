import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fff1f2",
          100: "#ffe4e6",
          200: "#fecdd3",
          300: "#fda4af",
          400: "#fb7185",
          500: "#f43f5e",
          600: "#e11d48",
          700: "#be123c",
          800: "#9f1239",
          900: "#881337",
          950: "#4c0519"
        },
        canvas: "#0a0a0a",
        panel: "#121212"
      },
      boxShadow: {
        glow: "0 20px 80px rgba(225, 29, 72, 0.18)"
      },
      backgroundImage: {
        "hero-grid":
          "radial-gradient(circle at top left, rgba(225, 29, 72, 0.18), transparent 30%), radial-gradient(circle at bottom right, rgba(255, 255, 255, 0.06), transparent 25%)"
      }
    }
  },
  plugins: []
};

export default config;
