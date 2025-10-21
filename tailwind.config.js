/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/app/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1E9F93"
      },
      borderRadius: {
        'xl': '1rem',
        '20': "20px",
      },
      boxShadow: {
        card: "0 8px 24px rgba(0,0,0,0.4)",
        insetSoft: "inset 0 0 0 1px rgba(255,255,255,0.06)",
      },
      keyframes: {
        modalIn: {
          "0%": { opacity: 0, transform: "translateY(20px) scale(0.98)" },
          "100%": { opacity: 1, transform: "translateY(0) scale(1)" },
        },
        fadeOut: {
          "100%": { opacity: 0, transform: "scale(0.95)" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        "modal-in": "modalIn 300ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-out": "fadeOut 300ms ease-out forwards",
        float: "float 6s ease-in-out infinite",
      },
    }
  },
  plugins: [
    require('@tailwindcss/aspect-ratio'),
  ]
};
