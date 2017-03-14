/* eslint-env node, es6 */

const merge = require('webpack-merge');
const path = require('path');
const webpack = require('webpack');

const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const StyleLintPlugin = require('stylelint-webpack-plugin');

// Shared configuration.
const commonConfig = {
  context: path.resolve(__dirname, '../src'),
  entry: './main.js',
  output: {
    path: path.relative(__dirname, 'build'),
    filename: 'bundle.js',
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
        use: ExtractTextPlugin.extract({
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
    new ExtractTextPlugin('styles.css'),
  ],
};

// Development configuration.
const developmentConfig = {
  devtool: 'cheap-eval-source-map',
  watch: true,
  plugins: [
    new BrowserSyncPlugin({
      host: 'localhost',
      port: 3000,
      proxy: 'sitename.dev',
    }),
    new StyleLintPlugin({
      context: path.resolve(__dirname, '../src/scss'),
    }),
  ],
};

// Production configuration.
const productionConfig = {
  devtool: 'source-map',
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
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
