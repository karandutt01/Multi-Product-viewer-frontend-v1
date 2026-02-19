const path = require('path');

module.exports = {
  entry: './src/index.js', // Entry point for your app
  output: {
    path: path.resolve(__dirname, 'dist'), // Output directory
    filename: 'bundle.js', // Output file name
    clean: true // Clean output dir before emit
  },
  module: {
    rules: [
      {
        test: /\.js$/, // Transpile JS files
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader', // Use Babel for ES6+ support
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'] // Add '@babel/preset-react' if using React
          }
        }
      },
      {
        test: /\.css$/, // Load CSS files
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|jpg|gif|svg)$/, // Load images
        type: 'asset/resource'
      }
    ]
  },
  resolve: {
    fallback: {
      "console": require.resolve("console-browserify") // Polyfill for Node.js 'console'
    }
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'public') // Serve static files
    },
    compress: true,
    port: 3000,
    historyApiFallback: true
  },
  mode: 'development', // Change to 'production' for production builds
  devtool: 'source-map' // Source maps for debugging
};