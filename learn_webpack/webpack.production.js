const { merge } = require('webpack-merge');
const webpack = require('webpack');
const base = require('./webpack.base');
const TerserPlugin = require("terser-webpack-plugin");
const {WebpackManifestPlugin} = require("webpack-manifest-plugin");

module.exports = merge(base, {
    mode: 'production',

    optimization: { // TerserPlugin的使用需要在optimization中配置，属于构建代码优化的一部分
        minimize: true, // 启用代码压缩
        minimizer: [new TerserPlugin({
            test: /\.js(\?.*)?$/i, // 只处理.js文件
            terserOptions: {
                compress: true
            }
        })], // 配置代码压缩工具
        usedExports: true, // 模块内未使用的部分不进行导出
        // concatenateModules: true,
        // sideEffects: true
        /*splitChunks: {
            chunks: 'all',
            name: 'common',
            cacheGroups: {
                defaultVendors: {
                    test: /[\\/]node_modules[\\/]/,
                    priority: -10
                },
                default: {
                    minChunks: 2,
                    priority: -20,
                    reuseExistingChunk: true
                }
            },
        }*/
    },

    module: {
        rules: [
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
                },
                use: [
                    {
                        loader: 'image-webpack-loader',
                        options: {
                            mozjpeg: { // 压缩jpeg的配置
                                progressive: true,
                                quality: 65
                            },
                            optipng: { // 使用imagemin-optipng压缩png，enable false为关闭
                                enabled: false
                            },
                            pngquant: { // 使用imagemin-pngquant压缩png
                                quality: [0.65, 0.9],
                                speed: 4
                            },
                            gifsicle: { // 压缩gif的配置
                                interlaced: false,
                            },
                            webp: { // 开启webp，会把jpg和png图片压缩为webp格式
                                quality: 75
                            }
                        }
                    }
                ]
            },
        ]
    },

    plugins: [
        new webpack.DefinePlugin({
            PRODUCTION: JSON.stringify(true),
            'process.env.NODE_ENV': JSON.stringify('production')
        }),
        new webpack.IgnorePlugin({resourceRegExp: /^\.\/locale$/, contextRegExp: /moment$/}), // 忽略掉i18n代码文件
        new WebpackManifestPlugin({})
    ]
})
