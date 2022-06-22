const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: {
        moment: ['moment']
    },
    output: {
        filename: '[name].dll.js',
        path: path.resolve(__dirname, 'dist/public'),
        library: '[name]_[fullhash]' // 打包后对外暴露的类库名称
    },
    plugins: [
        new webpack.DllPlugin({
            context: __dirname,
            name: '[name]_[fullhash]', // 需要和output.library的值保持一致
            path: path.join(__dirname, 'dist/public', '[name].manifest.json')
        })
    ]
}
