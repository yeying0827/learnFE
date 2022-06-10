const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const ProgressPlugin = require('progress-webpack-plugin');
const mock = require('./mock');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');

// src/pages 目录为页面入口的根目录
const pagesRoot = path.resolve(__dirname, './src/pages');
// fs读取pages下的所有文件夹来作为入口，使用entries对象记录下来
const entries = fs.readdirSync(pagesRoot).reduce((entries, page) => {
    // 文件夹名称作为入口名称，值为对应的路径，可以省略`index.js`，webpack默认会寻找目录下的index.js文件
    entries[page] = path.resolve(pagesRoot, page);
    return entries;
}, {});

module.exports = {
    mode: 'production', // 指定构建模式

    // 配置如何解析模块路径
    resolve: {
        alias: {
            utils$: path.resolve(__dirname, 'src/utils') // $结尾表示精确匹配，否则模糊匹配，即import带有utils都会被替换
        },
        extensions: ['.js', '.json', '.jsx'], // 这里的顺序代表匹配后缀的优先级
        modules: ['node_modules'], // 直接声明依赖名的模块，webpack会类似Node.js一样进行路径搜索，搜索`node_modules`目录
        mainFields: ['browser', 'module', 'main'], // 当引用的是一个模块或者一个目录时，会使用package.json文件中的哪一个字段指定的文件
        mainFiles: ['index.js'], // 无package.json文件或者无`main`字段：则查找`index.js`文件
    },
    resolveLoader: { // 仅用于解析webpack的loader包
        extensions: ['.js', '.json'],
        mainFields: ['loader', 'main']
    },

    entry: './src/index.js', // 指定构建入口文件

    /*entry: {
        main: './src/index.js',
    }, // 与上面写法等价，默认key为main，指定构建入口文件*/

    // entry: entries, // 将entries对象作为入口配置

    output: {
        path: path.resolve(__dirname, 'dist'), // 指定构建生成文件所在路径
        filename: '[name].js' // 指定构建生成的文件名，默认是main.js
    },

    devServer: {
        host: 'localhost',
        port: 8080,
        open: true,
        static: [
            {
                directory: path.resolve(__dirname, 'dist/public'),
                publicPath: '/assets'
            }, // 开发服务器启动路径
            {
                directory: path.resolve(__dirname, 'dist'),
                publicPath: '/'
            }
        ],
        proxy: {
            '/api': {
                target: 'http://localhost:3000',
                pathRewrite: {
                    '^/api': ''
                }
            }
        },
        // 提供执行自定义函数和应用自定义中间件的能力
        setupMiddlewares: function (middlewares, devServer) {
            // console.log(middlewares);
            if(!devServer) {
                throw new Error('webpack-dev-server is not defined');
            }
            mock(devServer.app);
            devServer.app.get('/setup-middleware/some/path', function(req, res) {
                res.send('console.log("setup-middlewares option GET")');
            });
            // 如果想在所有其他中间件之前运行一个中间件，
            // 可以使用unshift方法，与放在`onBeforeSetupMiddleware`作用一样
            middlewares.unshift({
                name: 'first-in-array',
                path: '/foo/path',
                middleware: (req, res) => {
                    res.send('console.log("Foo!")');
                }
            });

            // 如果想在所有其他中间件之后运行一个中间件，
            // 可以使用push方法，与放在`onAfterSetupMiddleware`作用一样
            middlewares.push({
                name: 'hello-world-test-one',
                path: '/foo/bar',
                middleware: (req, res) => {
                    res.send('console.log("Foo Bar!")');
                }
            });

            middlewares.push((req, res) => {
                // console.log(res);
                res.send('Hello, world');
            })
            // console.log(middlewares);

            return middlewares;
        }
    },

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

    // 配置如何处理不同类型的模块
    module: {
        noParse: /jquery|loash/, // 不需要编译处理的模块
        rules: [
            {
                test: /\.less$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'postcss-loader',
                    'less-loader'
                ]
            },
            {
                test: /\.css$/i, // 匹配文件的正则表达式
                include: [
                    path.resolve(__dirname, 'src')
                ],
                use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader'] // 需要保证loader的顺序，从右到左，先解析css内容，再包装成style标签的内容，最后插入到head中
            },
            {
                test: /\.jsx?/,
                include: path.resolve(__dirname, 'src'), // 指定哪些路径下的文件需要经过loader处理
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader', // 使用babel-loader可以使用babel将ES6代码转译为浏览器可以执行的ES5代码
                    options: {
                        cacheDirectory: true,
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
            {
                test: /\.html$/i,
                include: path.resolve(__dirname, 'src'),
                use: ['html-loader']
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
            filename: '[name]-[fullhash].css' // 这里也可以使用hash，默认是main.css
        }), // 将css单独抽离的plugin
        new HtmlWebpackPlugin({
            // inject: true,
            template: './index.html',
            title: 'webpack学习',
            minify: { // 压缩HTML的配置
                minifyCSS: true, // 压缩HTML中出现的CSS代码，默认false
                minifyJS: true, // 压缩HTML中出现的JS代码，默认false
                collapseInlineTagWhitespace: true,
                collapseWhitespace: true, // 和上一个配置配合，移除无用的空格和换行，默认false
                removeComments: true, // 移除html注释，默认false
            }
        }),
        new webpack.DefinePlugin({
            PRODUCTION: JSON.stringify(true),
            VERSION: JSON.stringify('5fa3b9'),
            BROWSER_SUPPORTS_HTML5: true,
            TWO: '1+1',
            CONSTANTS: {
                APP_VERSION: JSON.stringify('1.2.2')
            },
            DLL_PATH: JSON.stringify('/public/moment.dll.js')
        }),
        new webpack.IgnorePlugin({resourceRegExp: /^\.\/locale$/, contextRegExp: /moment$/}), // 忽略掉i18n代码文件
        // new BundleAnalyzerPlugin(), // 构建完成后在浏览器中可以查看分析结果
        new ProgressPlugin((percentage, message, ...args) =>  {
            console.log(percentage, message, ...args);
        }),
        /*new webpack.DllReferencePlugin({
            context: __dirname,
            // 描述 moment 动态链接库的文件内容
            manifest: require('./dist/public/moment.manifest.json'),
        })*/
        new WebpackManifestPlugin({})
    ]
}
