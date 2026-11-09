import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0F1713",
          well: "#1E2924",
          line: "#2E3A34",
        },
        muted: {
          DEFAULT: "#5B6660",
          dark: "#A9B3AE",
        },
        surface: {
          DEFAULT: "#F4F6F5",
          deep: "#EAEEEC",
        },
        line: "#E3E7E5",
        lime: {
          DEFAULT: "#C8F169",
          press: "#B6E34F",
          soft: "#EEF9DA",
          ink: "#3F5A12",
        },
        studio: "#0B100E",
        danger: {
          DEFAULT: "#B42318",
          soft: "#FDECEA",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      boxShadow: {
        dock: "0 12px 32px -8px rgba(15, 23, 19, 0.35), 0 2px 6px rgba(15, 23, 19, 0.18)",
        lift: "0 6px 18px -6px rgba(15, 23, 19, 0.18)",
      },
      transitionTimingFunction: {
        out: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        hang: {
          "0%": { transform: "translateY(-14px) rotate(-7deg)", opacity: "0" },
          "55%": { transform: "translateY(0) rotate(3deg)", opacity: "1" },
          "100%": { transform: "translateY(0) rotate(0deg)", opacity: "1" },
        },
        rise: {
          "0%": { transform: "translateY(8px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        count: {
          "0%": { transform: "scale(1.25)", opacity: "0" },
          "30%": { transform: "scale(1)", opacity: "1" },
          "100%": { transform: "scale(0.96)", opacity: "1" },
        },
        wipe: {
          "0%": { clipPath: "inset(0 100% 0 0)" },
          "100%": { clipPath: "inset(0 0 0 0)" },
        },
      },
      animation: {
        hang: "hang 520ms cubic-bezier(0.16, 1, 0.3, 1) both",
        rise: "rise 360ms cubic-bezier(0.16, 1, 0.3, 1) both",
        count: "count 1000ms cubic-bezier(0.16, 1, 0.3, 1) both",
        wipe: "wipe 480ms cubic-bezier(0.16, 1, 0.3, 1) both",
      },
    },
  },
  plugins: [],
};
export default config;
