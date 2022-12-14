/** @type {import('tailwindcss').Config} */

const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'true-gray': '#171717',
        'true-gray-600': '#52525B',
        'true-green-600': '#059669',
        'color-42': '#1fbabc',
        'color-kakao': '#fce403',
        'hot-pink': '#FF00E5',
        'hot-green': '#00FF38',
      },
      fontFamily: {
        pixel: ['dalmoori', 'PressStart2P', ...defaultTheme.fontFamily.mono],
      },
    },
  },
  plugins: [],
};
