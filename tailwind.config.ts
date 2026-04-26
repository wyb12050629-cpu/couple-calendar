import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        paper: "#FAF6EE",
        ink: "#3A2F25",
        yubin: "#B85F5F",
        munsung: "#5F7B95",
        shared: "#9B8AA8",
        accent: "#D4A574",
        line: "#E8DDC9",
        caption: "#6B5D50",
      },
      fontFamily: {
        header: ["Pretendard", "sans-serif"],
        handwriting: ["Pretendard", "sans-serif"],
        body: ["Pretendard", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
