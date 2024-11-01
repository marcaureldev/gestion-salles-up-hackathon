/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
      backgroundImage: {
        'custom-gradient': 'linear-gradient(162deg, #517879 4.83%, #1E3E57 103.44%)',
        'formPicture': "url('/images/form-picture.svg')",
      },
      colors: {
        'primary-color': '#299D91',
        'gradient1': '#517879',
        'gradient2': '#1E3E57',
      },
    },
  },
  plugins: [],
}