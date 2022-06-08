const path = require('path');
const webpack = require('webpack');
const middleware = require('webpack-dev-middleware');
const webpackOptions = require('./webpack.config.js'); // webpack配置文件的路径
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

webpackOptions.mode = 'development';

const compiler = webpack(webpackOptions);
const express = require('express');
const app = express();

app.use(middleware(compiler, {
    // webpack-dev-middleware的配置选项
    // publicPath: '/assets',
    headers: () => [ // 响应头
        {
            key: "X-custom-header",
            value: "foo"
        },
        {
            key: "Y-custom-header",
            value: "bar"
        }
    ],
    methods: ['GET'],
}))

app.get('/', (req, res) => {
    res.send('test middleware');
})

app.get('/test', (req, res) => {
    res.send('add test');
})

// 其他web服务中间件
// app.use(...);

app.listen(3000, () => console.log('Example app listening on port 3000!'));
