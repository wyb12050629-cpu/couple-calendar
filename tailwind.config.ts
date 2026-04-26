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
        yubin: "#FF6B8A",
        munsung: "#6B9EFF",
        shared: "#B06BFF",
        "bg-pink": "#FFF5F8",
      },
      fontFamily: {
        header: ["Pacifico", "cursive"],
        body: ["Nunito", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
