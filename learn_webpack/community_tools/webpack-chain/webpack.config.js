const path = require('path');
const Config = require('webpack-chain'); // webpack-chain提供一个Config类
const HtmlWebpackPlugin = require("html-webpack-plugin");
const DashboardPlugin = require('webpack-dashboard/plugin');

const config = new Config(); // 新建一个配置对象
// console.log(__dirname)

/*
config
    .mode('development')
    .entry('main')
        .add('./src/index.js') // 指定构建入口文件
        .end()
    .output
        .path(path.resolve(__dirname, 'dist')) // 指定构建生成文件所在路径
        .filename('bundle.js') // 指定构建生成的文件名
*/

config
    .mode('development')
    // Interact with entry points
    .entry('index')
        .add('./src/index.js')
        .end()
    // Modify output settings
    .output
        .path(path.resolve(__dirname, 'dist'))
        .filename('[name].bundle.js');
config
    .resolve
        .modules.add('/node_modules')
        .add('../../node_modules').clear();

config.plugin('html-template')
    .use(HtmlWebpackPlugin, [{
        template: './src/index.html'
    }]);

config.plugin('dashboard')
    .use(DashboardPlugin, [{
        port: 3000
    }]);

module.exports = config.toConfig();
