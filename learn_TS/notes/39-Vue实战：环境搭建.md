## Vue实战：环境搭建

Vue最主流的技术栈结合TypeScript来实现一个「待办WebAPP」。

### 安装Vue CLI

Vue官方的Vue CLI，全局安装：

```shell
npm install -g @vue/cli
// or
yarn global add @vue/cli
```

安装之后就可以在命令行中访问vue命令。可以通过简单运行`vue`，来验证它是否安装成功，还可以用这个命令来检查其版本：

```shell
$ vue --version 
@vue/cli 4.5.13
```



### 创建项目

用命令行初始化项目

```shell
$ vue create vue-ts-todo

? Please pick a preset: Manually select features
? Check the features needed for your project: 
 ◉ Choose Vue version
 ◯ Babel
 ◉ TypeScript
 ◉ Progressive Web App (PWA) Support
 ◉ Router
 ◉ Vuex
 ◉ CSS Pre-processors
❯◉ Linter / Formatter
 ◯ Unit Testing
 ◯ E2E Testing
 
? Please pick a preset: Manually select features
? Check the features needed for your project: Choose Vue version, TS, PWA, Router, Vuex, CSS Pre-processors, Linter
? Choose a version of Vue.js that you want to start the project with 2.x
? Use class-style component syntax? Yes
? Use Babel alongside TypeScript (required for modern mode, auto-detected polyfills, transpiling JSX)? No
? Use history mode for router? (Requires proper server setup for index fallback in production) No
? Pick a CSS pre-processor (PostCSS, Autoprefixer and CSS Modules are supported by default): Sass/SCSS
 (with node-sass)
? Pick a linter / formatter config: Prettier
? Pick additional lint features: Lint and fix on commit
? Where do you prefer placing config for Babel, ESLint, etc.? In dedicated config files
```

选择Vue的全家桶，因为是练习不选择测试相关的内容

* `Use class-style component syntax? Yes` 选择用组件装饰器语法
* `Pick a linter / formatter config: Prettier` 配置prettier代码美化
* `Use Babel alongside TypeScript (required for modern mode, auto-detected polyfills, transpiling JSX)? No` 已经有TypeScript，不再引入Babel进行转义
* `Pick a CSS pre-processor (PostCSS, Autoprefixer and CSS Modules are supported by default): Sass/SCSS (with node-sass)` CSS预处理的问题，选择SASS，使用`node-sass`

安装node-sass依赖有问题，根据[文章](https://blog.csdn.net/winnyrain/article/details/126248523)做调整

```shell
yarn remove node-sass
yarn add sass
```



### 改造项目

项目的整体目录结构是这样的：

```
$ tree
.
├── node_modules
├── package.json
├── public
│   ├── favicon.ico
│   ├── img
│   │   └── icons
│   │       ├── android-chrome-192x192.png
│   │       ├── android-chrome-512x512.png
│   │       ├── android-chrome-maskable-192x192.png
│   │       ├── android-chrome-maskable-512x512.png
│   │       ├── apple-touch-icon-120x120.png
│   │       ├── apple-touch-icon-152x152.png
│   │       ├── apple-touch-icon-180x180.png
│   │       ├── apple-touch-icon-60x60.png
│   │       ├── apple-touch-icon-76x76.png
│   │       ├── apple-touch-icon.png
│   │       ├── favicon-16x16.png
│   │       ├── favicon-32x32.png
│   │       ├── msapplication-icon-144x144.png
│   │       ├── mstile-150x150.png
│   │       └── safari-pinned-tab.svg
│   ├── index.html
│   └── robots.txt
├── src
│   ├── App.vue
│   ├── assets
│   │   └── logo.png
│   ├── components
│   │   └── HelloWorld.vue
│   ├── main.ts
│   ├── registerServiceWorker.ts
│   ├── router
│   │   └── index.ts
│   ├── shims-tsx.d.ts
│   ├── shims-vue.d.ts
│   ├── store
│   │   └── index.ts
│   └── views
│       ├── About.vue
│       └── Home.vue
├── .browserslistrc
├── .eslintrc.js
├── .gitignore
├── tsconfig.json
├── vue.config.js
└── yarn.lock
```

主要关注`src/`目录下的项目主体。

* assets：存放图片等第三方资源的目录
* components：存放自定义组件的目录
* views：存放页面的目录



### 引入第三方库

想要开发一个完整的webapp，仅有Vue CLI提供的初始化模板是不够的，需要引入另外一个关键库：

* UI库：这里选择有赞团队的Vant

```shell
$ yarn add vant@^2.12.6 ## Vant和Vue的版本需要对应，否则可能报错"export 'Fragment' (imported as '_Fragment') was not found in 'vue'
## https://blog.csdn.net/u014220146/article/details/113745020
```

至此还有一个问题，就是当我们直接引入Vant组件的时候其实是整体引入的，所有的代码都会打包进我们的app，这十分影响打包体积和性能：

```typescript
// src/main.ts
import Vue from 'vue';
import Vant from 'vant';
import 'vant/lib/index.css';

Vue.use(Vant);
```

因此应该按需引入组件，避免不必要的组件引入影响我们的打包体积。

比如引入Button组件：

```typescript
import Button from 'vant/lib/button';
import 'vant/lib/button/style';
```

但这样编写太繁琐了，可以安装`ts-import-plugin`帮助我们按需引入。

```shell
$ yarn add ts-import-plugin -D
```

修改根目录下的`vue.config.js`：

```javascript
const merge = require('webpack-merge');
const tsImportPluginFactory = require('ts-import-plugin');

module.exports = {
    lintOnSave: true,
    chainWebpack: config => {
        config.module
            .rule("ts")
            .use("ts-loader")
            .tap(options => {
                options = merge(options, {
                    transpileOnly: true,
                    getCustomTransformers: () => ({
                        before: [
                            tsImportPluginFactory({
                                libraryName: "vant",
                                libraryDirectory: "es",
                                style: true
                            })
                        ]
                    }),
                    compilerOptions: {
                        module: 'es2015'
                    }
                });
                return options;
            })
    }
}
```

启动项目：

```shell
$ yarn serve
```



### 小结

项目环境以及配置完毕了。