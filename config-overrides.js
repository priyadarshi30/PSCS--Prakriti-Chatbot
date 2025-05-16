const webpack = require('webpack');
const path = require('path');

module.exports = function override(config, env) {
  // Add fallbacks for node modules
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "fs": false,
    "path": false
  };

  // Ignore source-map-loader warnings for face-api.js
  config.ignoreWarnings = [
    ...(config.ignoreWarnings || []),
    /Failed to parse source map/
  ];

  // Exclude face-api.js from source-map-loader
  config.module.rules.push({
    test: /\.js$/,
    enforce: 'pre',
    use: ['source-map-loader'],
    exclude: [/node_modules\/face-api.js/]
  });

  return config;
};
