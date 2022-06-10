const { merge } = require('webpack-merge');
const webpack = require('webpack');
const base = require('./webpack.base');
const path = require("path");
const mock = require("./mock");

module.exports = merge(base, {
    mode: 'development',
    devtool: 'eval-cheap-source-map',

    module: {
        rules: []
    },

    optimization: {
        nodeEnv: false,
        usedExports: true, // 模块内未使用的部分不进行导出
        concatenateModules: true,
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
    plugins: [
        new webpack.DefinePlugin({
            PRODUCTION: JSON.stringify(false),
            'process.env.NODE_ENV': JSON.stringify('development')
        }),
        new webpack.DllReferencePlugin({
            context: __dirname,
            // 描述 moment 动态链接库的文件内容
            manifest: require('./dist/public/moment.manifest.json'),
        })
    ]
})
