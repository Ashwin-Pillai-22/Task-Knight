/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background :'#242c3b',
        bar: {
          out: '#2d2d2e',
          inner: '#00CFFF'
        }

      }
    },
  },
  plugins: [],
}
