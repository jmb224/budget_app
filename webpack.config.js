import { resolve } from "path";
import html_webpack_plugin from "html-webpack-plugin";

export const entry = ["babel-polyfill/", './src/js/app.js'];
export const output = {
    path: resolve(__dirname, 'dist'),
    filename: "js/bundle.js"
};
export const devServer = {
    contentBase: "./dist/"
};
export const plugins = [
    new html_webpack_plugin({
        filename: "index.html",
        template: "./src/index.html"
    })
];
export const module = {
    rules: [
        {
            test: /\.js$/,
            exclude: /node_modules/,
            use: {
                loader: "babel-loader"
            }
        }
    ]
};
export const node = {
    fs: "empty",
    tls: 'empty',
    net: 'empty'
};
