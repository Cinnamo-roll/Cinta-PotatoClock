import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#fffaf0",
        potato: "#d7ad4a",
        caramel: "#9a6b2f",
        leaf: "#6f8655",
        soil: "#3b3124",
        cocoa: "#241e17"
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
