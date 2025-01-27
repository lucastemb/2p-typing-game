/** @type {import('tailwindcss').Config} */
module.exports = {
  purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  content: [],
  theme: {
    extend: {
      fontFamily: {
        "vcrOSD": ["vcrOSD","sans-serif"]
      },
      backgroundImage: {
        'custom-conic': 'conic-gradient(#FDF8E1 90deg, #73c7e3 90deg 180deg, #FDF8E1 180deg 270deg, #73c7e3 270deg)',
      },
      backgroundSize: {
        '120': '120px 120px',
      },
      backgroundPosition: {
        'top-left': 'top left',
      },
    },
  },
  plugins: [
  ],
}

