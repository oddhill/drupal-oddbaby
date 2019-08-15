/* eslint-env node, es6 */
/* eslint-disable import/no-extraneous-dependencies */

const autoprefixer = require('autoprefixer');

// PostCSS configuration.
module.exports = {
  plugins: [
    autoprefixer(),
  ],
};
