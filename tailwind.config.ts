import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      colors: {
        zinc: {
          50: "#fafafa",
          100: "#f4f4f5",
          150: "#ececee",
          200: "#e4e4e7",
          300: "#d4d4d8",
          400: "#a1a1aa",
          500: "#71717a",
          600: "#52525b",
          700: "#3f3f46",
          800: "#27272a",
          900: "#18181b",
          950: "#09090b",
        },
      },
      boxShadow: {
        "xs": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        "sm": "0 1px 3px 0 rgb(0 0 0 / 0.07), 0 1px 2px -1px rgb(0 0 0 / 0.07)",
        "DEFAULT": "0 2px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.06)",
        "md": "0 4px 8px -2px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.05)",
        "inner-sm": "inset 0 1px 2px 0 rgb(0 0 0 / 0.06)",
      },
      borderRadius: {
        "sm": "0.3rem",
        "DEFAULT": "0.45rem",
        "md": "0.5rem",
        "lg": "0.65rem",
        "xl": "0.85rem",
        "2xl": "1.1rem",
      },
      transitionTimingFunction: {
        "ease-spring": "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
    },
  },
  plugins: [],
};
export default config;
