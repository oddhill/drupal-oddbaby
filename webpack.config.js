/* eslint-env node, es6 */

const merge = require('webpack-merge');
const path = require('path');

const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');

// Shared configuration.
const commonConfig = {
  context: path.resolve(__dirname, './src'),
  entry: {
    main: ['./js/main.js', './scss/main.scss'],
    ckeditor: './scss/ckeditor.scss',
    print: './scss/print.scss',
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'js/[name].js',
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
        test: /\.(sc|c)ss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
          'sass-loader',
        ],
      },
      {
        test: /\.(ttf|eot|woff|woff2|svg)$/,
        exclude: /graphics/,
        loader: 'file-loader',
        options: {
          name: 'fonts/[name].[ext]',
          publicPath: '../',
        },
      },
      {
        test: /\.(jpg|png|svg)$/,
        exclude: /fonts/,
        loader: 'file-loader',
        options: {
          name: 'graphics/[hash].[ext]',
          publicPath: '../',
        },
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/[name].css',
      chunkFilename: 'css/[name].css',
    }),
  ],
};

// Development configuration.
const developmentConfig = {
  mode: 'development',
  devtool: 'cheap-eval-source-map',
  watch: true,
};

// Production configuration.
const productionConfig = {
  mode: 'production',
  devtool: 'source-map',
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin(), new CssMinimizerPlugin()],
  },
};

// Export config based on the current environment.
if (process.env.NODE_ENV === 'production') {
  module.exports = merge(commonConfig, productionConfig);
} else {
  module.exports = merge(commonConfig, developmentConfig);
}
