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
        use: [MiniCssExtractPlugin.loader, 'css-loader']
      }
    ]
  },
  plugins: [
    // ...,
    new MiniCssExtractPlugin({
      filename: '[name].css' // 这里也可以使用hash
    })
  ]
}
```



#### 5. mode

用于方便快捷地指定一些常用的默认优化配置，值为：development、production和none。

production：会启用[TerserPlugin](https://github.com/webpack-contrib/terser-webpack-plugin)来压缩JS代码，让生成的代码文件更小

development：会启用`devtools: 'eval'`配置，提升构建和再构建的速度



### 资源利用

* webpack官方文档或类库周边的文档
* 社区的各种文章
* github官方仓库的issues
* 源码

#### 官方文档建议查看顺序

Guides 》Concepts 》Configuration 》Loaders 》Plugins 》API

Github Issues 搜索技巧：[searching-issues-and-pull-requests](https://docs.github.com/en/search-github/searching-on-github/searching-issues-and-pull-requests)

注意内容的时效性，留意版本的坑

#### 查阅源码小技巧

* 优先思考问题根源，列出可能导致问题的原因，再有针对性的查阅源码
* 如有异常报错，仔细阅读报错信息和异常堆栈，根据其内容定位问题所在
* 可以直接在node_modules中修改webpack或其他第三方类库的源码进行debug，方便快速定位
* 实现一个可以复现问题的最小化demo，可以有效避免其他无关因素的干扰
* 一些疑难杂症可以尝试使用github issues或者email和作者进行沟通，可以更有效率



### 前端构建基础配置

最基础的构建需求：

* 构建发布需要的HTML、JS、CSS文件
* 使用CSS预处理器来编写样式
* 引用图片
* 使用Babel来支持ES新特性
* 本地提供静态服务以方便开发调试

#### 1. 关联HTML

如果文件名或者路径会变化，例如使用`[hash]`来进行命名，那最好将HTML引用路径和构建结果关联起来，可以使用[html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin)

```shell
yarn add html-webpack-plugin -D
```

```javascript
const HtmlPlugin = require('html-webpack-plugin');

module.exports = {
  // ...
  plugins: [
    new HtmlPlugin({
      template: './src/index.html' // 传递一个指定的模板html文件
    })
  ]
}
```

html-webpack-plugin会创建一个HTML文件，其中会引用构建出来的js文件

[examples](https://github.com/jantimon/html-webpack-plugin/tree/main/examples)

#### 2. 构建CSS

* css-loader 负责解析CSS代码，主要是为了处理CSS中的依赖，例如`@import`和`url()`等引用外部文件的声明；
* style-loader 将css-loader解析的结果转变为JS代码，运行时动态插入`style`标签来让css代码生效
* MiniCSSExtractPlugin.loader可以单独把css文件分离出来

#### 3. 使用CSS预处理器

使用less，可以通过添加对应的loader来支持

```shell
yarn add less less-loader -D
```

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.less$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'less-loader'
        ]
      }
    ]
  }
}
```

#### 4. 处理图片文件

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.(png|jpg|gif)$/i,
        /*use: [ // webpack 5使用这个打包会生成两个图片文件，css中引用的是其中无法打开的文件
          {
            type: 'file-loader',
            options: {}
          }
        ]*/,
        type: 'asset', // 'asset/resource', // 默认都打包成独立的图片资源
        parser: {
          dataUrlCondition: { // 大于4kb的打包成独立图片，否则转为base64格式插入css文件
            maxSize: 4 * 1024 // 4kb
          }
        }
      }
    ]
  }
}
```

[Asset Modules](https://webpack.js.org/guides/asset-modules/#resource-assets)

#### 5. 使用Babel处理js文件

使我们可以使用ES新特性的JS编译工具

具体可以参考Babel官方文档[.babelrc](https://babeljs.io/docs/en/config-files/)
