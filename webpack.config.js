const path = require('path');

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
    node:{
        fs: 'empty'
    }
};