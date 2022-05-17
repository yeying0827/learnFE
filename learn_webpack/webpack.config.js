const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    mode: 'production', // 指定构建模式

    // entry: './src/index.js', // 指定构建入口文件

    entry: {
        main: './src/index.js',
    }, // 与上面写法等价，默认key为main，指定构建入口文件

    output: {
        path: path.resolve(__dirname, 'dist'), // 指定构建生成文件所在路径
        filename: '[name].js' // 指定构建生成的文件名
    },

    devServer: {
        static: path.resolve(__dirname, 'dist') // 开发服务器启动路径
    },

    module: {
        rules: [
            {
                test: /\.css$/i, // 匹配文件的正则表达式
                use: [MiniCssExtractPlugin.loader, 'css-loader'] // 需要保证loader的顺序，从右到左，先解析css内容，再包装成style标签的内容，最后插入到head中
            },
            {
                test: /\.jsx?/,
                include: path.resolve(__dirname, 'src'), // 指定哪些路径下的文件需要经过loader处理
                use: {
                    loader: 'babel-loader', // 使用babel-loader可以使用babel将ES6代码转译为浏览器可以执行的ES5代码
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    },

    plugins: [
        new CopyPlugin({
            patterns: [
                { from: 'src/public', to: 'public'}
            ]
        }),
        new MiniCssExtractPlugin()
    ]
}
