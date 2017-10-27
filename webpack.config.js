/* eslint-env node, es6 */

const merge = require('webpack-merge');
const path = require('path');
const webpack = require('webpack');

const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const ExtractMainSass = new ExtractTextPlugin('css/main.css');
const ExtractCkeditorSass = new ExtractTextPlugin('css/ckeditor.css');
const ExtractPrintSass = new ExtractTextPlugin('css/print.css');

// Shared configuration.
const commonConfig = {
  context: path.resolve(__dirname, './src'),
  entry: './main.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'js/bundle.js',
  },
  externals: {
    jquery: 'jQuery',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
      {
        test: /\.css$/,
        use: 'css-loader',
      },
      {
        test: /ckeditor\.scss$/,
        use: ExtractCkeditorSass.extract({
          use: ['css-loader', 'postcss-loader', 'sass-loader'],
        }),
      },
      {
        test: /main\.scss$/,
        use: ExtractMainSass.extract({
          use: ['css-loader', 'postcss-loader', 'sass-loader'],
        }),
      },
      {
        test: /print\.scss$/,
        use: ExtractPrintSass.extract({
          use: ['css-loader', 'postcss-loader', 'sass-loader'],
        }),
      },
      {
        test: /\.(ttf|eot|woff|woff2)$/,
        loader: 'file-loader',
        options: {
          name: 'fonts/[name].[ext]',
        },
      },
      {
        test: /\.(jpg|png|svg)$/,
        loader: 'file-loader',
        options: {
          name: 'graphics/[hash].[ext]',
        },
      },
    ],
  },
  plugins: [
    ExtractCkeditorSass,
    ExtractMainSass,
    ExtractPrintSass,
  ],
};

// Development configuration.
const developmentConfig = {
  devtool: 'cheap-eval-source-map',
  watch: true,
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development'),
    }),
    new BrowserSyncPlugin({
      files: './build/css/*.css',
      host: 'localhost',
      port: 3000,
      proxy: 'drupal-reference.dev',
    }, {
      reload: false,
    }),
  ],
};

// Production configuration.
const productionConfig = {
  devtool: 'source-map',
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false,
    }),
    new webpack.optimize.UglifyJsPlugin({}),
  ],
};

// Export config based on the current environment.
if (process.env.NODE_ENV === 'production') {
  module.exports = merge(commonConfig, productionConfig);
} else {
  module.exports = merge(commonConfig, developmentConfig);
}
