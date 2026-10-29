import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "var(--ink)",
        muted: "var(--muted)",
        green: "var(--green)",
        "green-dark": "var(--green-dark)",
        "green-soft": "var(--green-soft)",
        paper: "var(--paper)",
        canvas: "var(--canvas)",
        line: "var(--line)",
        amber: "var(--amber)",
      },
      fontFamily: {
        sans: ['"DM Sans"', '"Segoe UI"', "sans-serif"],
        display: ['"Manrope"', '"Segoe UI"', "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
