const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'production', // 指定构建模式

    // entry: './src/index.js', // 指定构建入口文件

    entry: {
        main: './src/index.js',
    }, // 与上面写法等价，默认key为main，指定构建入口文件

    output: {
        path: path.resolve(__dirname, 'dist'), // 指定构建生成文件所在路径
        filename: '[name].js' // 指定构建生成的文件名，默认是main.js
    },

    devServer: {
        static: path.resolve(__dirname, 'dist') // 开发服务器启动路径
    },

    module: {
        rules: [
            {
                test: /\.less$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'less-loader'
                ]
            },
            {
                test: /\.css$/i, // 匹配文件的正则表达式
                include: [
                    path.resolve(__dirname, 'src')
                ],
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
            },
            {
                test: /\.(png|jpg|gif)$/i,
                /*use: [ // webpack 5 配置此会有问题，打包出两个图片文件，css中引用的是其中无法加载的图片文件
                    {
                        loader: 'file-loader',
                        options: {}
                    }
                ]*/
                type: 'asset',
                parser: {
                    dataUrlCondition: {
                        maxSize: 4 * 1024 // 4kb
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
        new MiniCssExtractPlugin({
            filename: '[name]-[hash].css' // 这里也可以使用hash，默认是main.css
        }), // 将css单独抽离的plugin
        new HtmlPlugin({
            template: './src/index.html'
        })
    ]
}
