/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        midnight: {
          900: "#070a1f",
          800: "#0a0e27",
          700: "#111638",
          600: "#1a2148",
        },
        starlight: {
          DEFAULT: "#f5b942",
          soft: "#fcd34d",
          dim: "#92744a",
        },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', '"Noto Serif SC"', "serif"],
        serif: ['"Noto Serif SC"', "serif"],
        sans: ['"Noto Sans SC"', "system-ui", "sans-serif"],
      },
      animation: {
        "twinkle": "twinkle 4s ease-in-out infinite",
        "twinkle-slow": "twinkle 7s ease-in-out infinite",
        "float-up": "floatUp 0.8s ease-out forwards",
        "drift": "drift 30s linear infinite",
        "pulse-glow": "pulseGlow 3s ease-in-out infinite",
        "shimmer": "shimmer 3s ease-in-out infinite",
      },
      keyframes: {
        twinkle: {
          "0%, 100%": { opacity: "0.2", transform: "scale(0.8)" },
          "50%": { opacity: "1", transform: "scale(1.2)" },
        },
        floatUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        drift: {
          "0%": { transform: "translateX(0) translateY(0)" },
          "50%": { transform: "translateX(-20px) translateY(-10px)" },
          "100%": { transform: "translateX(0) translateY(0)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(245, 185, 66, 0.15)" },
          "50%": { boxShadow: "0 0 40px rgba(245, 185, 66, 0.35)" },
        },
        shimmer: {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
