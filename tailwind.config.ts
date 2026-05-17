import type { Config } from "tailwindcss";

// Tailwind v4 — most config is in globals.css via @theme
// This file handles legacy plugins only
const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
};

export default config;
