const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const BeforeTransformers = require('./transformers/index');

module.exports = {
    mode: 'production', // 指定构建模式
    // mode: 'development',
    // devtool: 'eval',

    entry: './src/index.tsx', // 指定构建入口文件

    output: {
        path: path.resolve(__dirname, 'dist'), // 指定构建生成文件所在路径
        filename: '[name].js' // 指定构建生成的文件名，默认是main.js
    },

    // 配置如何处理不同类型的模块
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                options: {
                    // other loader's option
                    getCustomTransformers(program) {
                        return {
                            before: BeforeTransformers.transformers,
                            after: []
                        }
                    },
                    // getCustomTransformers: yourImportedTransformer, // () => ({ before: yourImportedTransformer }),
                    compilerOptions: {
                        module: 'es2015',
                    },
                },
                exclude: /node_modules/
            },
        ]
    },
    resolve: {
        extensions: ['*', '.js', '.ts', '.tsx']
    },

    plugins: [
    ]
}
