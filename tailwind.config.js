/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      colors: {
        navy: {
          950: "#05070f",
          900: "#080b16",
          850: "#0a0e1a",
          800: "#0e1320",
          750: "#121829",
          700: "#161d31",
          600: "#1d2740",
          500: "#26324f",
        },
        accent: {
          DEFAULT: "#38bdf8",
          cyan: "#22d3ee",
          blue: "#3b82f6",
          deep: "#0ea5e9",
        },
        hazard: {
          critical: "#f43f5e",
          high: "#fb923c",
          moderate: "#facc15",
          low: "#34d399",
        },
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(56,189,248,0.15), 0 8px 30px -12px rgba(56,189,248,0.25)",
        panel: "0 1px 0 0 rgba(255,255,255,0.03) inset, 0 20px 50px -25px rgba(0,0,0,0.7)",
      },
      backgroundImage: {
        grid: "linear-gradient(to right, rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.025) 1px, transparent 1px)",
      },
      keyframes: {
        pulseRing: {
          "0%": { transform: "scale(0.85)", opacity: "0.7" },
          "70%": { transform: "scale(1.6)", opacity: "0" },
          "100%": { opacity: "0" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        pulseRing: "pulseRing 2.4s cubic-bezier(0.4,0,0.6,1) infinite",
      },
    },
  },
  plugins: [],
};
