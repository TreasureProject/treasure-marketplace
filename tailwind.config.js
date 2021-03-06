module.exports = {
  mode: "jit",
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class", // or 'media' or 'class'
  safelist: [
    "bg-[#c80b00]",
    "bg-[#4bbdbd]",
  ],
  theme: {
    extend: {
      colors: {
        brown: "#795548",
        "brown-50": "#efebe9",
        "brown-100": "#d7ccc8",
        "brown-200": "#bcaaa4",
        "brown-300": "#a1887f",
        "brown-400": "#8d6e63",
        "brown-500": "#795548",
        "brown-600": "#6d4c41",
        "brown-700": "#5d4037",
        "brown-800": "#4e342e",
        "brown-900": "#3e2723",
      },
    },
  },

  plugins: [
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require("@tailwindcss/forms")({
      strategy: "class",
    }),
    require("@tailwindcss/aspect-ratio"),
  ],
};
