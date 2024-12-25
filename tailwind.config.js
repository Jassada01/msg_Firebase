/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('daisyui'),
    require('@tailwindcss/typography')
  ],
  daisyui: {
    themes: [
      "light",
      "dark",
      "cupcake",
      // คุณสามารถเพิ่มธีมอื่นๆ ที่ต้องการได้
    ],
    // กำหนดธีมเริ่มต้น
    defaultTheme: "light",
  }
}