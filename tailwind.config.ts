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
        ink: "#4A3F35",
        yubin: "#C97B7B",
        munsung: "#7B95A8",
        shared: "#9B8AA8",
        accent: "#D4A574",
        line: "#E8DDC9",
      },
      fontFamily: {
        header: ["Gaegu", "cursive"],
        handwriting: ["Nanum Pen Script", "cursive"],
        body: ["Gowun Dodum", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
