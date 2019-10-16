const path = require('path');

module.exports = {
    mode: "production",
    entry: {
        narrowlizer: './src/narrowlizer.js',
        transdiff: './src/transdiff.js'
    },
    output: {

        filename: '[name].js',
        path: path.resolve(__dirname),
    },
    node:{
        fs: 'empty'
    }
};