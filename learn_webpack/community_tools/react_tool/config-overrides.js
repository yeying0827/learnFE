const HTMLWebpackPlugin = require('html-webpack-plugin');

module.exports = function (config, env) {
    config.plugins.push(new HTMLWebpackPlugin({
        template: 'public/index1.html',
        filename: 'index1.html'
    }))
    return config;
};
