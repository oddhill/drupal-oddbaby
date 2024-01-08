/* eslint-disable no-undef */

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts}', './templates/**/*.html.twig'],
  corePlugins: {
    container: false,
  },
  theme: {
    colors: {
      organic: '#ecebe6',
      white: '#fcfcfc',
      primary: '#e05e41',
      secondary: '#2543ae',
      success: '#64c366',
      warning: '#ed4e3d',
      neutral: {
        100: '#f7f7f8',
        200: '#e4e3de',
        300: '#c2bebe',
        500: '#847e7e',
        700: '#4b4848',
        900: '#1e1e1e',
      },
    },
    fontFamily: {
      sans: ['Averta', 'sans-serif'],
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
