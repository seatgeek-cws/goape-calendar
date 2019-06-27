const path = require('path');

module.exports = {
  entry:  './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist')
  },
  resolve: {
    extensions: ['.js', '.ts']
  },
  module: {
    rules: [
      {
        test: [/.js$/],
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
        }
      }
    ]

  },
  devServer: {
    open: true,
    disableHostCheck: true
  }
};

