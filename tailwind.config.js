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
        primary: "#1E9F93",
        background: "#F3F4F6", // light gray
        card: "#FFFFFF", // white
        text: "#111827", // dark gray
        muted: "#6B7280", // medium gray
        border: "#E5E7EB", // light gray
      },
      borderRadius: {
        'xl': '1rem',
        '20': "20px",
      },
      boxShadow: {
        card: "0 8px 24px rgba(0,0,0,0.1)",
        insetSoft: "inset 0 0 0 1px rgba(0,0,0,0.06)",
      },
      keyframes: {
        modalIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        fadeOut: {
          "100%": { opacity: 0 },
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
