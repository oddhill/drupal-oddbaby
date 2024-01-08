/* eslint-env node, es6 */
/* eslint-disable @typescript-eslint/no-var-requires */

const autoprefixer = require('autoprefixer');
const tailwindcss = require('tailwindcss');

// PostCSS configuration.
module.exports = {
  plugins: [autoprefixer(), tailwindcss()],
};
