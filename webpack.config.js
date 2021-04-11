const path = require("path");
const html_webpack_plugin = require("html-webpack-plugin");

module.exports = {
    entry: ["babel-polyfill/", './src/js/app.js'],
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: "js/bundle.js"
    },
    devServer: {
        contentBase: "./dist/"
    },
    plugins: [
        new html_webpack_plugin({
            filename: "index.html",
            template: "./src/index.html"
        })
    ],
    module: {
        rules: [
            {
               test   : /\.js$/,
               exclude: /node_modules/,
               use    : {
                  loader: "babel-loader"
               }
            }
        ]
    },
    node: {
        fs: "empty",
        tls: 'empty',
        net: 'empty'
    }
}
