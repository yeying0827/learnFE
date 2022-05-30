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

* css-loader 负责解析CSS代码，并处理CSS中的依赖，例如`@import`和`url()`等引用外部文件的声明；
* style-loader 将css-loader解析的结果转变为字符串，运行时动态插入`style`标签来让css代码生效
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



### 配置entry

构建入口

#### 1. 单一入口

```javascript
module.exports = {
  entry: './src/index.js',
 
  // 两者等价 
  entry: {
    main: './src/index.js'
  }
};
```

#### 2. 多个js作为入口

```javascript
// 多个入口生成不同的文件
module.exports = {
  entry: {
    // 按需取名，通常是业务名称
    foo: './src/foo.js',
    bar: './src/bar.js'
  }
}
```

#### 3. 多个文件作为一个入口打包到一起

```javascript
module.exports = {
  entry: {
    main: [
      './src/foo.js',
      './src/bar.js'
    ]
  }
}
```

#### 4. 配置动态的入口

🌰：支持在「src/pages」下添加多个页面入口

```javascript
const path = require('path');
const fs = reqiure('fs');

// src/pages目录为页面入口的根目录
const pagesRoot = path.resolve(__dirname, './src/pages');
// fs读取pages下的所有文件夹来作为入口，使用entries对象记录下来
const entries = fs.readdirSync(pagesRoot).reduce((entries, page) => {
  // 文件夹名称作为入口名称，值为对应的路径，可以省略`index.js`，webpack默认会寻找目录下的index.js
  entries[page] = path.resolve(pagesRoot, page);
  return entries;
}, {});

module.exports = {
  entry: entries // 与上述`多个js作为入口`效果相同
}
```

打包后依旧是在一个html文件引用这多个js文件



### module

管理模块和模块之间的关系

#### 1. 路径解析

当我们写一个`import`语句来引用一个模块时，webpack是如何获取到对应模块的文件路径的？

[enhanced-resolve](https://github.com/webpack/enhanced-resolve/)：处理依赖模块路径的解析

Nodejs模块路径解析机制：[深入 Node.js 的模块机制](https://www.infoq.cn/article/nodejs-module-mechanism/)

基本的模块解析规则：

* 解析相对路径

  1. 查找相对当前模块的路径下是否有对应文件或文件夹
  2. 有文件：则直接加载
  3. 有文件夹：则继续查找文件夹下的package.json文件
  4. 有package.json文件：则按照文件中`main`字段对应的值（文件名）来查找文件
  5. 无package.json文件或者无`main`字段：则查找`index.js`文件

* 解析模块名

  查找当前文件目录、父级目录及以上目录下的`node_modules`文件夹，看是否有对应名称的模块

* 解析绝对路径（不建议使用）

  直接查找对应路径的文件

> 在webpack配置中，和模块路径解析相关的配置都在`resolve`字段下

#### 2. resolve配置

1. `resolve.alias`

   配置某个模块的别名：经常编写相对路径很麻烦

   ```javascript
   module.exports = {
     resolve: {
       alias: {
         // 模糊匹配，只要模块路径中携带了`utils`就可以被替换掉
         // utils: path.resolve(__dirname, 'src/utils') // 获取绝对路径
        	// 精确匹配
         utils$: path.resolve(__dirname, 'src/utils')
       }
     }
   }
   ```

   [Resolve Alias](https://webpack.js.org/configuration/resolve/#resolvealias)

2. `resolve.extensions`

   webpack自行补全文件后缀

   webpack会尝试给依赖的路径添加上`extensions`字段所配置的后缀，然后进行依赖路径查找

3.  `resolve.modules`

   对于直接声明依赖名的模块，如`react`，webpack会类似Node.js一样进行路径搜索，搜索`node_modules`目录，这个目录就是使用`resolve.modules`字段进行配置的，默认就是：

   ```javascript
   modules.exports = {
     resolve: {
       modules: ['node_modules'],
     }
   }
   ```

   通常情况下不会调整这个配置。

   可以简化模块的查找，提升构建速度。

4. `resolve.mainFields`

   路径解析规则中，解析相对路径的第4步，提到有package.json文件则按照文件中`main`字段的值（文件名）来查找文件。

   实际，webpack的`resolve.mainFields`配置可以进行调整。当引用的是一个模块或者一个目录时，会使用package.json文件中的哪一个字段指定的文件，默认的配置是：

   ```json
   {
     resolve: {
       // 配置 target === 'web' 或者 target === 'webworker' 时的默认值
       mainFields: ['browser', 'module', 'main'],
       
       // target的值为其他时的默认值
       mainFields: ['module', 'main']
     }
   }
   ```

   通常情况下，模块的package都不会声明`browser`或者`module`字段，所以便是使用`main`

5. `resolve.mainFiles`

   路径解析规则中，解析相对路径的第5步，提到无package.json文件或者无`main`字段：则查找`index.js`文件。

   实际，这个也是可以配置的，使用`resolve.mainFiles`字段，默认配置是：

   ```json
   {
     resolve: {
       mainFiles: ['index'] // 也可以添加其他默认使用的文件名
     }
   }
   ```

   通常情况下，无需修改，index.js基本是约定俗成

6. `resolve.resolveLoader`

   用于配置解析loader时的resolve配置，原本resolve的配置项在这个字段下基本都有。默认的配置是：

   ```json
   {
     resolve: {
       resolveLoader: {
         extensions: ['.js', '.json'],
         mainFields: ['loader', 'main']
       }
     }
   }
   ```

   一般遵从标准的使用方式，把loader安装在项目根路径下的node_modules下。

#### 3. 小结

webpack配置文件中和`resolve`相关的选项都会传递给enhanced-resolve使用，来解析代码模块的路径



### loader

用于处理不同的文件类型（模块），类似预处理器。Webpack本身只认识JavaScript，对于其他类型的资源必须预先定义一个或多个loader对其进行转译，输出为Webpack能够接收的形式再继续进行，因此loader做的实际上是一个预处理的工作。

> loader基本上都是第三方库，使用时需要安装，有一些loader还需要安装额外的类库，例如less-loder需要less，babel-loader需要babel等。

#### 1. 匹配规则

由于loader处理的是代码模块的内容转换，所以loader的配置是放在`module`字段下的，当配置loader时，就是在`module.rules`中添加新的配置项，在该字段中，每一项被视为一条匹配使用哪些loader的规则。

匹配规则的两个最关键因素：一个是匹配条件（test），一个是匹配规则后的引用（use）。

**匹配条件**通常使用资源文件的绝对路径来进行匹配，在官方文档中称为`resource`，除此之外还有较少使用的`issuer`，指的是声明依赖资源的源文件的绝对路径。

🌰：在/path/to/app.js中声明引入`import './src/style.scss'`，`resource`是「/path/to/src/style.scss」，`issuer`是「/path/to/app.js」，规则条件会对这两个值来尝试匹配。

被加载模块是resource，而加载者是issuer。resource与issuer可用于更加精确地确定模块规则的作用范围

`webpack.config.js`中rules写的`test`和`include`都用于匹配`resource`路径，是`resource.test`和`resource.include`的简写。

#### 2. 规则条件配置

webpack的规则提供了多种配置形式：

* `test`：匹配特定条件
* `include`：匹配特定路径
* `exclude`：排除特定路径
* `and: []`：必须匹配数组中所有条件
* `or: []`：匹配数组中任意一个条件
* `not: []`：排除匹配数组中所有条件

上述条件的值可以是：

* 字符串：是字符串的话，需要提供绝对路径
* 正则表达式：调用正则的`test`方法来判断匹配
* 函数：`(path)=>boolean`，返回`true`表示匹配
* 数组：至少包含一个条件的数组  （通常需要高度自定义时才会使用）
* 对象：匹配所有属性值的条件

`test/include/exclude`是`resource.(test/include/exclude)`的简写（webpack 5中只支持简写），`and/or/not`这些需要放到`resource`中进行配置。

如果exclude 和include同时存在，则exclude权限比较高

#### 3. module type

模块类型。不同的模块类型类似于配置了不同的loader，webpack会有针对性地进行处理。可能的值：

* `javascript/auto`：webpack 3默认的类型，支持现有的各种JS代码模块类型——CommonJS、AMD、ESM
* `javascript/esm`：ECMAScript modules，其他模块系统如CommonJS或AMD等不支持，是`.mjs`文件的默认类型
* `javascript/dynamic`：CommonJS和AMD，排除ESM
* `javascript/json`：JSON数据格式，`require`或者`import`都可以引入，是`.json`文件的默认类型
* `webassembly/experimental`：WebAssembly modules，当前还处于试验阶段，是`.wasm`文件的默认类型。webassembly/sync、webassembly/async
* asset、asset/resource，asset/inline，aseet/source：资源文件

如果不希望使用默认的类型的话，在确定好匹配规则条件时，可以使用`type`字段来指定模块类型。可以帮助规范整个项目的模块系统。

#### 4. 使用loader配置（use）

`use`字段可以是一个数组，也可以是一个字符串或者表示loader的对象。

当使用表示loader的对象，对象通常包含两个属性：loader和options，`options`可以给对应的loader传递一些配置项

#### 5. loader应用顺序

一个模块文件可以经过多个loader的转换处理，执行顺序是从最后配置的loader开始，一步步往前。

如果多个rule匹配上了同一个模块文件，loader的应用顺序可以使用`enforce`字段来配置当前rule的loader类型，没配置的话是普通类型，可以配置`pre`或`post`，分别对应前值类型或后置类型的loader。

还有一种行内loader，即在应用代码中引用依赖时直接声明使用的loader，如`const json = require('json-loader!./file.json')`这种。不建议在应用开发中使用这种loader。

所有的loader按照 **前置->行内->普通->后置** 的顺序执行。

通常建议把要应用的同一类型loader都写在同一个匹配规则中，更好维护和控制。

#### 6. 使用`noParse`

`module.noParse`字段，可以用于配置哪些模块文件的内容不需要进行解析。对于一些**不需要解析依赖（即无依赖）**的第三方大型类库等，可以通过这个字段来配置，以提高整体的构建速度。

> 使用`noParse`进行忽略的模块文件中不能使用`import`、`require`、`define`等导入机制。

```javascript
module.exports = {
  // ...
  module: {
    rules: [
    	// ...
    ],
    noParse: /jquery|lodash/, // 正则表达式
    // 或者使用function
    noParse(content) {
      return /jquery|lodash/.test(content)
    }
  }
};
```

#### 使用

1. 添加[`postcss-loader`](https://webpack.js.org/loaders/postcss-loader/)，并添加[`autoprefixer`](https://github.com/postcss/autoprefixer)配置，需要在package.json中配置browserslist配置，或添加.browserslistrc文件

   ```shell
   yarn add postcss-loader -D
   yarn add autoprefixer -D
   ```

   ```javascript
   // webpack.config.js
   module.exports = {
     module: {
       rules: [
         {
           test: /\.css$/i,
           use: [
             MiniCssExtractPlugin.loader,
             'css-loader',
             'postcss-loader'
           ]
         }
       ]
     }
   }
   
   // postcss.config.js
   module.exports = {
     plugins: [
       require('autoprefixer')
     ]
   }
   ```

   ```json
   {
     browserslist: [
       ">0.2%",
       "not dead",
       "not op_mini all"
     ],
   }
   ```

2. 尝试使用[`htmlloader`](https://webpack.js.org/loaders/html-loader/)，可以在js中使用例如`import file from './file.html'`。

   ```shell
   yarn add html-loader -D
   ```

   ```javascript
   module.exports = {
     module: {
       rules: [
         {
           test: /\.html$/,
           use: ['html-loader']
         }
       ]
     }
   }



### 使用plugin

负责除了模块化打包外其他多样性的构建任务处理。

mode对plugin配置的影响？

#### 1. mode和plugin

mode不同值会影响webpack构建配置，其中有一个就是会启用DefinePlugin来设置`process.env.NODE_ENV`的值，方便代码中判断构建环境。

除此之外，development和production两个不同的mode之间还有其他plugin使用上的区别：

* development

  会启用NamedChunksPlugin和NamedModulesPlugin，主要作用是在HotModuleReplacement（热模块替换）开启时，模块变化时的提示内容显示chunk或者module名称（控制台），而不是ID。

* production

  会启用多个plugins：

  * FlagDependencyUsagePlugin：在构建时给使用的依赖添加标识，用于减少构建生成的代码量。
  * FlagIncludedChunksPlugin：在构建时给chunk中所包含的所有chunk添加id，用于减少不必要的chunk。
  * ModuleConcatenationPlugin：构建时添加作用域提升的处理，用于减少构建生成的代码量，详细参考：[module-concatenation-plugin](https://webpack.js.org/plugins/module-concatenation-plugin/)
  * NoEmitOnErrorsPlugin：编译时出错的代码不生成，避免构建出来的代码异常。
  * OccurenceOrderPlugin：按使用的次数来对模块进行排序，可以进一步减少构建代码量。
  * SideEffectsFlagPlugin：在构建时给带有Side Effects的代码模块添加标识，用于优化代码量时使用。
  * TerserPlugin：压缩JS代码。参考[Terser](https://terser.org/)

  production mode下启用的大量plugin都是为了优化生成代码而使用的，和配置的`optimization`的内容息息相关，详细可以查阅：[optimization](https://webpack.js.org/configuration/optimization/)

#### 2. 一些plugin

##### Defineplugin

webpack内置的插件，可以使用webpack.DefinePlugin直接获取。

在不同的mode中，会使用DefinePlugin来设置运行时的`process.env.NODE_ENV`常量。

DefinePlugin用于创建一些在编译时可以配置值，在运行时可以使用的常量。🌰：

```javascript
module.exports = {
  // ...
  plugins: [
    new webpack.DefinePlugin({
      PRODUCTION: JSON.stringify(true), // const PRODUCTION = true
      VERSION: JSON.stringify('5fa3b9'), // const VERSION = '5fa3b9'
      BROWSER_SUPPORTS_HTML5: true, // const BROWSER_SUPPORTS_HTML5 = 'true'
      TWO: '1+1', // const TWO = 1 + 1
      CONSTANTS: {
        APP_VERSION: JSON.stringify('1.1.2') // const CONSTANTS = { APP_VERSION: '1.1.2' }
      }
    }),
  ]
}

// index.js
console.log("Running App version " + VERSION); // 5fa3b9
console.log('PRODUCTION: ', PRODUCTION); // true
console.log('TWO: ', TWO); // 2
console.log('BROWSER_SUPPORTS_HTML5: ', BROWSER_SUPPORTS_HTML5); // true
console.log('CONSTANTS: ', CONSTANTS); // { APP_VERSION: "1.2.2" }
```

有了以上配置，就可以在应用代码文件中，访问配置好的常量了，如：

```javascript
console.log("Running App version " + VERSION);

if(!!BROWSER_SUPPORTS_HTML5) require('html5shiv');
```

配置规则：

* 如果值是字符串，那么整个字符串会被当成代码片段来执行，其结果作为最终变量的值
* 如果是对象字面量，那么该对象的所有key会以同样的方式去定义
* 如果既不是字符串，也不是对象字面量，那么该值会被转为一个字符串，如`true`，最后的结果是`'true'`(???true打印出来为布尔值的true，不是字符串的`'true'`)

关于DefinePlugin使用得最多的方式是定义环境常量，如`production=true`或者`__DEV__=true`等。部分类库在开发环境时依赖这样的环境变量来给予开发者更多的开发调试反馈。

##### TerserPlugin

webpack mode为production时会启用TerserPlugin来压缩JS代码。使用方式：

```shell
yarn add terser-webpack-plugin -D
```

```javascript
module.exports = {
  // ...
  // TerserPlugin的使用比较特别，需要配置在optimization字段中，属于构建代码优化的一部分
  optimization: {
    minimize: true, // 启用代码压缩
    minimizer: [ // 配置代码压缩工具
      new TerserPlugin({
        test: /\.js(\?.*)?$/i, // 只处理.js文件
        terserOptions: {
          compress: true
        }
      })
    ],
  }
}
```

[terser-webpack-plugin](https://github.com/webpack-contrib/terser-webpack-plugin)

> 以前的版本webpack是使用UglifyWebpackPlugin来压缩JS代码，后边更换为TerserPlugin，可以更好地处理新的JS代码语法。

##### IgnorePlugin

也是webpack内置的插件，可以使用`webpack.IngorePlugin`来获取。

用于忽略某些特定的模块，让webpack不把这些指定的模块打包进去。例如使用moment.js，直接引用后，会有大量的i18n的代码，导致最后打包出来的文件比较大，而实际场景并不需要这些i18n的代码，就可以使用IgnorePlugin来忽略掉这些代码文件：

```javascript
module.exports = {
  // ...
  plugins: [
    new webpack.IgnorePlugin({resourceRegExp: /^\.\/locale$/, contextRegExp: /moment$/})
  ]
}
```

IgnorePlugin配置的参数有两个，第一个是匹配引入模块路径的正则表达式，第二个是匹配模块的对应上下文，即所在目录名。

##### webpack-bundle-analyzer

这个plugin可以用于分析webpack构建打包的内容，用于查看各个模块的依赖关系和各个模块的代码内容多少，便于开发者做性能优化。

配置简单，仅仅引入plugin即可，在构建时可以在浏览器中查看分析结果

```javascript
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  // ...
  plugins: [
    new BundleAnalyzerPlugin()
  ]
}
```

使用这个可配置IgnorePlugin来过滤掉部分大而无用的第三方模块。

#### 3. awesome-webpack

[awesome webpack](https://webpack.js.org/awesome-webpack/)

#### 4. 其他一些plugin

##### ProgressPlugin

可以在构建时获取构建进度。

```shell
yarn add progress-webpack-plugin -D
```

```javascript
const ProgressPlugin = require('progress-webpack-plugin');

module.exports = {
  // ...
  plugins: [
    new ProgressPlugin((percentage, message, ...args) => {
      console.log(percentage, message, ...args);
    })
  ]
}
```

[文档](https://webpack.js.org/plugins/progress-plugin/)

##### DllPlugin

用于将一部分稳定的代码构建给分离出来，之后构建时重复使用那一部分内容，来减少构建时的工作量，提升构建效率

```javascript
// webpack.dll.config.js
const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: {
    moment: ['moment']
  },
  output: {
    filename: '[name].dll.js',
    path: path.resolve(__dirname, 'dist/public'),
    library: '[name]_[fullhash]'
  },
  plugins: [
    new webpack.DllPlugin({
      context: __dirname,
      name: '[name]_[fullhash]', // 需要和output.library保持一致
      path: path.join(__dirname, 'dist/public', '[name].manifest.json')
    })
  ]
}
```

```shell
## 运行命令，会在dist/public目录下生成moment.dll.js和moment.manifest.json两个文件
npx webpack --config webpack.dll.config
```

```javascript
// webpack.config.js 中使用动态库文件
module.exports = {
  // ...
  plugins: [
    new HtmlPlugin({
      inject: true,
      template: './index.html',
      title: 'webpack学习'
    }),
    // 定义常量，在html中替换
    new webpack.DefinePlugin({
      // ...
      DLL_PATH: JSON.stringify('/public/moment.dll.js')
    }),
    // 通过引用dll的manifest文件，来把依赖的名称映射到模块的id上，之后再在需要的时候通过内置的webpack_require函数来require他们
    new webpack.DllReferencePlugin({
      context: __dirname,
      manifest: require('./dist/public/moment.manifest.json'),
    })
  ]
}
```

```html
<!-- 在index.html中引用dll文件 -->
<head>
  <title>
    <%= htmlWebpackPlugin.options.title %>
  </title>
</head>
<body>
  <div>
    Test....
  </div>
  <script src="<%= DLL_PATH %>"></script>
  <script src="/public/moment.dll.js"></script><!-- 两种都可以 -->
</body>
```

> 注意！！需要把对html处理的loader把index.html文件排除在外，否则会去解析index.html中引用的js，抛出找不到模块的错误，也无法解析webpack配置的常量

#### 5. 思考mode对plugin的影响

plugin主要用于提高开发构建效率，处于不同mode有不同的需求，在开发调试中，侧重于实时更新，看到最新的代码效果，所以就需要热替换的效果，就不必手动刷新页面，只要修改内容就能得到反馈；在构建部署生产阶段，侧重于提升前端资源的加载性能，比如更快的打开页面，就需要配置更多提升性能相关的插件，如引入压缩的plugin，减少资源的体积，达到提升性能的效果，再比如给模块添加标识，在重复使用时不重复引入构建，减少构建生成的代码，还可以利用到缓存。



### 优化图片&HTML&CSS

#### 1. 图片资源压缩

* 可以使用[image-webpack-loader](https://github.com/tcoopman/image-webpack-loader)来压缩图片文件

```shell
## 使用cnpm安装loader
npm install cnpm -g --registry=https://registry.npm.taobao.org
## 使用yarn或npm可能会导致无法完整下载依赖，导致无法打包
cnpm install --save-dev image-webpack-loader
```

```javascript
module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /\.(png|jpg|gif)$/i,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 4 * 1024 // 4kb，超过限制会生成独立文件
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
      }
    ]
  }
}
```

image-webpack-loader的压缩是使用[imagemin](https://github.com/imagemin)提供的一系列图片压缩类库来处理的

* 使用DataURL：减少图片请求，优化大量小图片加载效率

过去：使用CSS Sprites，将多个小图片合并成一张，然后利用CSS background position的方式来引用对应的图片资源，这种方式受到CSS background的限制，并且position的值都由工具生成，有时不便于维护。[webpack生成CSS sprites](https://juejin.cn/post/6844903501890322440)

更为方便：将小图片转换为base64编码，将图片变成编码和代码文件打包到一起，可以起到减少小图片请求数量的效果

webpack4可以使用[url-loader](https://github.com/webpack-contrib/url-loader)，webpack5中可以直接配置`parser.dataUrlCondition.maxSize`来指定大于多少体积转为base64编码

#### 2. 代码压缩

* HTML

  使用html-webpack-plugin插件，使用`minify`字段配置就可以使用HTML压缩（使用[html-minifier](https://github.com/kangax/html-minifier#options-quick-reference)来实现HTML代码压缩）

  不配置minify，默认去除无用空格和换行、并移除注释

  ```javascript
  const HtmlWebpackPlugin = require('html-webpack-plugin');
  
  module.exports = {
    // ...
    plugins: [
      new HtmlWebpackPlugin({
        template: './index.html',
        title: 'webpack学习',
        minify: {
          minifyCSS: true, // 压缩HTML中出现的CSS代码，默认false
          minifyJS: true, // 压缩HTML中出现的JS代码，默认false
          collapseInlineTagWhitespace: true,
          collapseWhitespace: true, // 和上一个配置配合，移除无用的空格和换行，默认false
          removeComments: true, // 移除html注释，默认false
        }
      })
    ]
  }
  ```

* CSS

  在postcss-loader的基础上使用[cssnano](https://cssnano.co/)，移除无用的空格和换行

  ```shell
  npm install --save-dev cssnano
  ## 安装cssnano后，有影响到image-webpack-loader，需要重新安装下image-webpack-loader
  cnpm install --save-dev  image-webpack-loader
  ```

  ```javascript
  // webpack.config.js
  module.exports = {
    // ...
    module: {
      rules: [
        {
          test: /\.less$/,
          loader: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            'postcss-loader'
            'less-loader',
          ]
        }
      ]
    }
  }
  // postcss.config.js
  module.exports = {
    // ...
    plugins: [
      require('autofixer'),
      require('cssnano')()
    ]
  }
  ```



### 优化JS代码

尽可能减少构建出来的JS代码体积

#### 1. Tree shaking（ESM）

依赖于ES2015模块系统中的[静态结构特性](https://exploringjs.com/es6/ch_modules.html#static-module-structure),可以移除JavaScript上下文中未引用代码，删除用不着的代码，能够有效减少JS代码文件的大小。

在production的mode下，webpack会移除未引用的这部分代码，来减少构建出来的代码整体体积。

在development mode，需要在配置文件中新增：

```javascript
module.exports = {
  mode: 'development',
  //...
  optimization: {
    usedExports: true, // 模块内未使用的部分不进行导出
  }
}
```

再打包可以看到，有注释说明square未使用，对外暴露的方法只有`cube`。这里已经给模块中是否被使用到的方法打了标识，当使用TerserPlugin后，Terser会移除那些没有对外暴露且没有额外副作用的方法，来减小构建出来的代码体积。

#### 2. sideEffects（主要用于开发npm包）

🌰：

`lodash-es`这个模块的「package.json」文件中有`sideEffects: false`的声明，最终webpack的打包结果不会把lodash-es所有的代码内容打包进来，只会打包用到的模块相关的代码，这就是sideEffects的作用。

如果使用`lodash`模块，则会全部打包。

当某个模块的`package.json`文件中有了这个声明之后，webpack会认为这个模块没有任何副作用，只是单纯用来对外暴露模块使用，一旦开启了`optimization.sideEffects`的话，那么在打包的时候就会做一些额外的处理。

> 对比：
>
> `usedExports`依赖Terser来检测未使用的部分代码是否有副作用，而sideEffects是通过「package.json」等相关的标识来确定，由应用开发者自己来进行控制，并且移除的是无用的模块或者代码文件，相对效率更高一些。

「package.json」下的`sideEffects`可以是匹配文件路径的数组，表示这些模块文件是有副作用的，不能被移除：

```json
{
  sideEffects: [
    "*.css"
  ]
}
```

CSS代码文件是最典型的有副作用的模块，主要import了就不能移除，因为你需要它的样式代码，所以使用`sideEffects`来优化项目代码时切记，要声明CSS文件是有副作用的。

#### 3. concatenateModules

当用development构建生成的代码，每个模块都会使用`(function(module, __webpack_exports__, __webpack_require__){})`的函数包起来，我们可以使用`optimization.concatenateModules: true`的配置来移除这一部分多余的代码。

webpack会把可以优化的模块整合到一起，来减少上述那样的闭包函数的代码。

注释中的`CONCATENATED MODULE`的模块便是webpack整合到一起的模块，而模块间依赖的方法则是以局部变量的方式直接调用了，就可以减少大量的闭包函数代码，从而减少构建出来的代码体积，如果加上Terser的压缩，效果就更加显著了。

#### 4. 总结

Tree shaking，sideEffects和concatenateModules这些优化配置选项，在production mode中都是开箱即用，无须用户设置便会默认开启。



### 拆分代码文件

将CSS代码单独拆分的原因：

* 所有静态资源都打包成一个JS文件，如果只是单独修改了样式，也要重新加载整个应用的JS文件，相当不划算，浪费带宽、时间
* 有多个页面如果共用一部分样式，但是每个页面都单独打包一个JS文件，那么每次访问都会重复加载原本可以共享的那些CSS代码
* 如果单独拆分出来，不仅可以减少一次请求的体积，使请求返回更快，也可以利用到缓存，避免重复的加载

JS代码过大时，也可以用代码文件拆分的方法来进行优化。分离公共部分

#### 1. splitChunks配置项

`optimization.splitChunks`的多个配置项：

* chunks：表示从哪些模块中抽取代码，可以设置`all/async/initial`三个值其中一个，分别表示`所有模块/异步加载的模块/同步加载的模块`，或者也可以设置一个function，用于过滤掉不需要抽取代码的模块，如：

  ```javascript
  modules.exports = {
    // ...
    optimization: {
      splitChunks: {
        chunks: 'all', // 从所有模块中抽取代码
        chunks(chunk) {
          // 排除`my-excluded-chunk`
          return chunk.name !== 'my-excluded-chunk';
        }
      }
    }
  }
  ```

* minSize：表示生成的公共代码文件最小的体积，而maxSize则是告诉webpack尽可能把大于这个设置值的代码量拆分成更小的文件来生成，默认为0，即不限制。

  代码量在[minSize, maxSize]区间内的模块生成公共代码文件

* minChunks：表示一个模块被多少个模块共享引用时要被抽离出来，默认为1，如果设置为2，表示起码有两个模块引用了一个模块，这个被引用的模块才会被抽离出来

* name：是抽离出来的文件名称，默认为true，即自动生成

* automaticNameDelimiter：抽取模块后生成的文件由多个模块的名称组成，这个选项用于配置多个名称组合时使用的连接符，默认是`~`

* cacheGroups：最关键的配置，表示抽离公共部分的配置，一个key-value的配置对应一个生成的代码文件（？）。🌰：

  ```javascript
  module.exports = {
    // ...
    optimization: {
      chunks: 'all',
      name: 'common',
      cacheGroups: {
        defaultVendors: { // id hint?
          test: /[\\/]node_modules[\\/]/,
          priority: -10
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        }
      },
    }
  }
  ```

  上述例子会抽离两个代码文件出来：defaultVendors和default，这两个的配置会继承splitChunks上的所有配置项，并且多了三个配置项：

  * test：用于匹配要抽离的代码模块
  * priority：权重配置，如果一个模块满足多个cacheGroup的匹配条件，那么就由权重来确定抽离到哪个cacheGroup
  * reuseExistingChunk：设置为true表示如果一个模块已经被抽离出去了，那么就复用它，不会重新生成

  更多配置项参考官方文档：[split chunks](https://webpack.js.org/plugins/split-chunks-plugin/)

#### 2. 应用：拆分第三方类库

拆分文件是为了更好地利用缓存，分离公共类库很大程度上是为了让多页面利用缓存，从而减少下载的代码量，同时，代码变更时可以利用缓存减少下载代码量的好处。

建议将公共使用的第三方类库显式地配置为公共的部分，而不是webpack自己去判断处理。因为公共的第三方类库通常升级频率相对低一些，这样可以避免因业务chunk的频繁变更而导致缓存失效。

显式配置共享类库🌰：

```javascript
module.exports = {
  // ...
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: { // vendor 是我们第三方类库的公共代码的名称
          test: /react|angular|lodash/, // 直接使用test来做路径匹配
          chunks: 'initial',
          name: 'vendor',
          enforce: true
        }
      }
    }
  }
}

// 或者
module.exports = {
  // ...
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          chunks: 'initial',
          test: path.resolve(__dirname, "node_modules"), // 路径在node_modules目录下的都作为公共部分
          name: 'vendor', // 使用vendor入口作为公共部分
          enforce: true
        }
      }
    }
  }
}
```

可以针对项目情况，选择最合适的做法。

#### 3. 按需加载

当Web应用是单个页面，并且极其复杂的时候，会发现有一些代码并不是每一个用户都需要用到的。可以将这一部分代码抽离出去，仅当用户真正需要用到时才加载。

在webpack的构建环境中，要按需加载代码模块很简单，遵循ES标准的动态加载语法[dynamic-import](https://github.com/tc39/proposal-dynamic-import)来编写代码即可，webpack会自动处理使用该语法编写的模块：

```javascript
// import作为一个方法使用，传入模块名即可，返回一个promise来获取模块暴露的对象
// 注释webpackChunkName: "jquery" 可以用于指定chunk的名称，在输出文件时有用
import(/* webpackChunkName: "jquery" */ 'jquery').then(($) => {
  console.log($);
})
```

由于动态加载代码模块的语法依赖于promise，对于低版本的浏览器，需要添加promise的[polyfill](https://github.com/stefanpenner/es6-promise)后才能使用。

如上代码，webpack构建时会自动把jQuery模块分离出来，并且在代码内部实现动态加载jQuery的功能。动态加载代码时依赖于网络，其模块内容会异步返回，所以`import`方法是返回一个promise来获取动态加载的模块内容。

`import`后面的注释`webpackChunkName: "jquery"`用于告知webpack所要动态加载模块的名称，这样就可以把分离出来的文件名称带上jQuery标识了。如果没有这个注释，那么分离出来的文件名称会以简单数字的方式标识，不便于识别。

通常在大型的单页应用中，一般会把局部业务功能作为一个异步模块，在用户使用到时再动态加载进来，这样可以进一步减少大型应用初始化时需要加载的前端资源，来提升我们应用的用户体验。

#### 4.  思考：拆分代码带来的性能和体验优化，可以通过什么指标来测试？

* 可以使用lighthouse进行性能分析
* 在chrome中查看network查看请求、响应的时间
* 打包后使用webpack-bundle-analyzer查看代码分析
* 直接查看打包后的包体积
