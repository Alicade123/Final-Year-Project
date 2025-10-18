/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  corePlugins: {
    preflight: true,
  },
  future: {
    disableColorOpacityUtilitiesByDefault: false,
  },
  experimental: {
    // ✅ Forces Tailwind to use rgb() instead of oklch()
    optimizeUniversalDefaults: true,
  },
  plugins: [],
};
