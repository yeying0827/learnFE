## Webpack

#### 优点
webpack 本身具备了诸多优点：从单一入口出发，打包所有前端资源，使用 loader 处理多种代码语言的转换，使用 plugin 扩展原有的模块打包流程，使用 HMR 提升开发体验，利用代码压缩和代码分割来提升前端加载性能等等。


### 基本使用
```shell
## 初始化 创建package.json文件
npm init

## 安装webpack和webpack-cli
yarn add webpack webpack-cli -D

## 查看webpack版本
npx webpack --version

## 运行构建，没有入口文件会报错
npx webpack

## 添加一个入口文件src/index.js和一个测试文件src/fool.js
```
```javascript
// fool.js
export const fool = 'Hello World';

export function log(message) {
    console.log(message);
}

// index.js
import {fool, log} from './fool';

log(fool);
```
#### 配置脚本命令
```json
{
  "scripts": {
    "build": "webpack"
  }
}
```

```js
// 配置webpack, webpack.config.js
// 对外暴露一个配置对象，webpack通过这个对象来读取相关的一些配置
const path = require('path');

module.exports = {
    mode: 'development', // 指定构建模式
    
    entry: './src/index.js', // 指定构建入口文件
    
    output: {
        path: path.resolve(__dirname + 'dist'), // 指定构建生成文件所在的路径
        filename: 'bundle.js' // 指定构建生成的文件名
    }
}
```

#### 本地开发

```shell
## 配置服务
yarn add webpack-dev-server -D
```

配置脚本：启动开发服务器的命令

```json
{
  "scripts": {
    "build": "webpack",
    "serve": "webpack-dev-server"
  }
}
```

##### 在dist目录下手动添加一个html文件进行测试

```html
<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Webpack</title>
</head>
<body>
<script src="./bundle.js"></script>
</body>
</html>
```

##### 配置webpack.config.js

```js
module.exports = {
  // ...
  devServer: {
    static: path.resolve(__dirname, 'dist') // 开发服务器启动路径
  }
}
```

#### 使用css

使用loader处理css文件

0. 安装loader

   ```shell
   yarn add style-loader css-loader -D
   ```

1. 创建css文件

   ```css
   // index.css
   .container {
     width: 200px;
     height: 200px;
     background-color: orange;
   }
   ```

2. 在src/index.js中引用

   ```js
   import './index.css'
   ```

3. 配置webpack.config.js文件

   ```javascript
   module.exports = {
     // ...
     module: {
       rules: [
         {
           test: /\.css$/i,
           use: ['style-loader', 'css-loader'] // 注意顺序
         }
       ]
     }
   }
   ```

4. 运行`yarn serve`

   可以看到打包后的文件里包含了index.css的内容，js被执行后css的内容会被包在style标签中插入到html文件的head中



### 基础概念

#### 1. entry

webpack构建的入口，构建的起点。webpack会读取这个文件，并从它开始解析依赖，在内部构建一个依赖图，这个依赖图会引用项目中使用到的各个模块，然后进行打包，生成一个或多个bundle文件。

```js
module.exports = {
  entry: 'index.js'
}

// 等价于
module.exports = {
  entry: {
    main: 'index.js'
  }
}
```

#### 2. output

webpack最终构建出来的静态文件

```javascript
module.exports = {
  output: {
    path: path.resolve(__dirname, 'dist'),
    filname: 'bundle.js'
  }
}

// 也可以利用entry的名称
module.exports = {
  output: {
    filname: '[name].js', // 使用[name]来引入entry名称，这里即为main
    path: path.join(__dirname, '/dist/[hash]') // 路径中使用hash，每次构建时会有一个不同的hash值，可以用于避免发布新版本时浏览器缓存导致的问题，文件名中也可以使用hash
  }
}
```

#### 3. loader

提供一种处理多种文件格式的机制。可以理解为一个转换器，负责将某种文件格式的内容转换成webpack可以支持打包的模块。

最终把不同格式的文件都解析成js代码，以便打包后在浏览器中运行

**配置babel来处理js文件：**

```shell
yarn add babel-loader @babel/core @babel/preset-env -D
```

```js
module.exports = {
  // ...
  module: {
    rules: [
      // ...
      {
        test: /\.jsx?/,
        include: path.resolve(__dirname, 'src'),
        use: {
          loader: 'babel-loader', // 使用babel-loader可以使用babel将ES6代码转译为浏览器可以执行的ES5代码
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  }
}
```

#### 4. plugin

满足更多构建中特殊的需求，例如使用copy-webpack-plugin来复制不需要loader处理的文件、定义环境变量的define-plugin、生成css文件的extra-text-webpack-plugin等。

plugin理论上可以干涉webpack整个构建流程，可以在流程的每一个步骤中定制自己的构建需求。

```shell
yarn add copy-webpack-plugin -D
```

```javascript
const copyPlugin = require('copy-webpack-plugin');

module.exports = {
  // ...
  plugins: [
    new copyPlugin({
      patterns: [
        { from: 'src/public', to: 'public'}
      ]
    })
  ]
}
```

**将css提取到单独的打包文件中**

```shell
yarn add mini-css-extract-plugin -D
```

```javascript
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        loaders: [MiniCssExtractPlugin.loader, 'css-loader']
      }
    ]
  },
  plugins: [
    // ...,
    new MiniCssExtractPlugin()
  ]
}
```



#### 5. mode

用于方便快捷地指定一些常用的默认优化配置，值为：development、production和none。

production：会启用[TerserPlugin](https://github.com/webpack-contrib/terser-webpack-plugin)来压缩JS代码，让生成的代码文件更小

development：会启用`devtools: 'eval'`配置，提升构建和再构建的速度
