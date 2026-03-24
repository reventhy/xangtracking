import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        accent: "#e63946",
        ink: "#111827",
        soft: "#f8fafc",
        line: "#e5e7eb"
      },
      boxShadow: {
        card: "0 14px 40px rgba(17, 24, 39, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
