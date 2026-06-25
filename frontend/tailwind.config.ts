import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#fff7fb",
        potato: "#f7a7bd",
        caramel: "#c46a86",
        leaf: "#92b6a2",
        soil: "#4c3941",
        cocoa: "#241b20"
      },
      boxShadow: {
        soft: "0 18px 45px rgba(117, 78, 36, 0.14)",
        innerSoft: "inset 0 2px 10px rgba(255, 255, 255, 0.45)"
      },
      borderRadius: {
        potato: "28px"
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif"
        ]
      }
    }
  },
  plugins: []
} satisfies Config;
