// tailwind.config.ts (IDE용 우회)
import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./src/**/*.{js,ts,jsx,tsx}"],
} satisfies Config;
