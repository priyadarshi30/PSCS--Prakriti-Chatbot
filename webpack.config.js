const path = require('path');

module.exports = {
  resolve: {
    fallback: {
      "fs": false,
      "path": false
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        enforce: 'pre',
        use: ['source-map-loader'],
        exclude: [/node_modules\/face-api.js/]
      }
    ]
  },
  ignoreWarnings: [/Failed to parse source map/]
};
