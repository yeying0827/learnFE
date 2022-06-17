const airbnbBase = require('@neutrinojs/airbnb-base');
const vue = require('@neutrinojs/vue');
const jest = require('@neutrinojs/jest');

module.exports = {
  options: {
    root: __dirname,
    mains: {
      index: 'index',
      admin: {
        entry: 'admin',
        title: 'Admin Page'
      }
    }
  },
  use: [
      // 这里都是neutrino的中间件，用于修改配置
      // neutrino的preset本质也是一个中间件，只是preset集成了更多的配置项，以及多个中间件协同
    airbnbBase(),
    vue({
      html: {
        title: 'neutrino-app测试使用'
      }
    }),
    jest(),
    (neutrino) => {
      console.log(neutrino.config.toConfig()); // 打印配置内容

      // 用webpack-chain的姿势使用neutrino.config来自定义配置
      neutrino.config
          .devServer.port(8088);
    }
  ],
};
