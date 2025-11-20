const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {

    mode: process.env.NODE_ENV ? process.env.NODE_ENV : "production",
    entry: {
        narrowlizer: './src/narrowlizer.js',
        transdiff: './src/transdiff.js',
        "411_review": './src/411_review.js',
        "trinkets": './src/trinkets.js'
    },
    output: {

        filename: '[name].js',
        path: path.resolve(__dirname),
    },
    resolve: {
        fallback: {
            fs: false,
            util: false,
            os: false
        }
    },
    optimization: {
        minimizer: [new TerserPlugin({
            extractComments: false,
        })],
    }
};