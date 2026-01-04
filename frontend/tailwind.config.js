/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#a3e635",
        "primary-hover": "#84cc16",
        "primary-light": "#ecfccb",
        "primary-dark-bg": "rgba(163, 230, 53, 0.1)",
        "surface": "#1e293b",
        "background": "#0f172a",
        "text-main": "#f8fafc",
        "text-secondary": "#94a3b8",
        "border-color": "#334155",
        // Aliases para compatibilidade
        "background-dark": "#0f172a",
        "background-light": "#0f172a",
        "surface-dark": "#1e293b",
        "surface-input": "#1e293b",
        "border-dark": "#334155",
        "secondary-text": "#94a3b8",
        "sidebar-bg": "#1e293b",
      },
      fontFamily: {
        "display": ["Manrope", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "0.5rem",
        "lg": "1rem",
        "xl": "1.5rem",
        "full": "9999px"
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s infinite',
      },
    },
  },
  plugins: [],
}
