const path = require('path');

module.exports = {
    entry: './src/transdiff.js',
    output: {
        filename: 'transdiff.js',
        path: path.resolve(__dirname),
    },
};