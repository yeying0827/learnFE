## Vite原理：手写一个迷你Vite

### 现在工程化的痛点

现在前端开发项目，工程化工具已经成为了标配，webpack是现在使用率最高的工程化框架，可以很好地帮助我们完成从代码调试到打包的全过程，但随着项目规模的爆炸式增长，webpack也带来了一些痛点问题。

webpack可以帮助我们在JavaScript文件中使用require导入其他JavaScript、CSS、image等文件，并且提供了dev-server启动调试服务器，极大地提高了开发项目的效率。

webpack的核心原理，就是通过分析JavaScript中的require语句，分析出当前JavaScript文件所有的依赖文件，然后递归分析之后，得到整个项目的一个依赖图。

webpack针对不同格式的文件执行不同的loader，比如把CSS文件解析成加载CSS内容的JavaScript代码，最后基于依赖图获取所有的文件，进行打包处理之后，放在内存中提供给浏览器使用，然后dev-server就启动一个调试服务器，访问这个服务器页面，同时代码文件修改之后，可以通过websocket通知前端自动更新页面，也就是众所周知的热更新功能。

由于webpack在项目调试之前，要把所有文件的依赖关系收集完，打包处理后才能启动调试，**很多大项目执行调试命令后需要等待1分钟以上才能开始调试。热更新也需要等几秒钟才能生效，极大地影响开发效率**。所以针对webpack这种打包bundle的思路，社区诞生了bundleless的框架，Vite就是其中的佼佼者。

前端项目之所以需要webpack打包，是因为浏览器里的JavaScript没有很好的方式去引入其他文件。webpack提供的打包功能可以帮助我们更好地组织开发代码，但**现在大部分浏览器都支持了ES6中的module功能，我们在浏览器内使用`type="module"`标记一个script后，在`src/main.js`中就可以直接使用import语法去引入一个新的JavaScript文件。**这样我们其实可以不依赖webpack的打包功能，利用浏览器的module功能就可以重新组织我们的代码。

```html
<script type="module" src="/src/main.js"></script>
```



### Vite原理

通过实现一个迷你Vite来讲解其大致的原理。

首先，浏览器的module功能有一些限制需要额外处理。浏览器识别出JavaScript中的import语句后，会发起一个新的网络请求去获取新的文件，所以只支持`/`、`./`和`../`开头的路径。

在下面的Vue项目启动代码中，**首先**浏览器并不知道Vue是从哪来的，我们第一个要做的事，就是分析文件中的import语句。如果路径不是一个相对路径或者绝对路径，那就说明这个模块是来自node_modules，我们需要去node_modules查找这个文件的入口文件并返回给浏览器；**然后**`./App.vue`是相对路径，可以找到文件，但是浏览器不支持.vue文件的解析；**并且**index.css也不是一个合法的JavaScript文件。

```javascript
// vite-mini/src/main.js
import { createApp } from 'vue'
import App from './App.vue'
import './index.css'

const app = createApp(App)
app.mount('#app');
```

我们需要解决以上三个问题，才能让Vue项目很好地在浏览器里跑起来。

* 首先，我们使用Koa搭建一个server，用来拦截浏览器发出的所有网络请求，才能实现上述功能。

  在以下代码中，使用Koa启动了一个服务，并且访问首页内容读取index.html的内容。

  ```javascript
  // vite-mini/server.js
  const fs = require('fs');
  const path = require('path');
  const Koa = require('koa');
  const app = new Koa();
  
  app.use(async ctx => {
      const { request: {url, query} } = ctx;
      if (url === '/') {
          ctx.type = "text/html";
          let content = fs.readFileSync('./index.html', 'utf-8');
          ctx.body = content
      }
  });
  
  app.listen(24678, () => {
      console.log('快来快来数一数，端口24678');
  })
  ```

  下面是首页index.html的内容，一个div作为Vue启动的容器，并且通过script引入`src/main.js`。

  ```html
  <!-- vite-mini/index.html -->
  <!doctype html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport"
            content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="ie=edge">
      <title>Vite App</title>
  </head>
  <body>
      <h1>geek time</h1>
      <div id="app"></div>
      <script type="module" src="/src/main.js"></script>
  </body>
  </html>
  ```

  我们访问首页之后，就会看到浏览器内显示的geektime文本，并且发起了一个main.js的HTTP请求，接下来就来解决页面中的报错问题。

* 首先报错找不到`/src/main.js`文件，是因为没有处理js文件的请求

  我们需要去读取对应的文件内容并返回

  ```javascript
  // vite-mini/server.js
  app.use(async ctx => {
      const { request: {url, query} } = ctx;
      if (url === '/') {
          ctx.type = "text/html";
          let content = fs.readFileSync('./index.html', 'utf-8');
          ctx.body = content;
      } else if (url.endsWith('.js')) {
          // js文件
          const p = path.resolve(__dirname, url.slice(1));
          ctx.type = "application/javascript";
          const content = fs.readFileSync(p, 'utf-8');
          ctx.body = content;
      }
  });
  ```

* 重启并刷新页面后，继续提示无法解析标识符vue

  ` Failed to resolve module specifier "vue". Relative references must start with either "/", "./", or "../".`

  这是由于浏览器无法识别Vue的路径，所以直接抛出错误，所以要在Koa中把Vue的路径重写。

  这里我们直接使用replace语句，把vue改成/@module/vue，使用@module开头的地址来告诉Koa这是一个需要去node_modules查询的模块。

  我们使用一个rewriteImport函数把js中的文件内容处理后再返回，这样就实现了路径的替换。

  ```javascript
  // vite-mini/server.js
  function rewriteImport(content) {
      return content.replace(/ from ['|"]([^'"]+)['|"]/g, function(s0, s1) {
          // . ../ / 开头的，都是相对路径
          if (s1[0] !== '.' && s1[1] !== '/') {
              return ` from '/@modules/${s1}'`;
          } else {
              return s0
          }
      });
  }
  
  app.use(async ctx => {
      const { request: {url, query} } = ctx;
      if (url === '/') {
          ctx.type = "text/html";
          let content = fs.readFileSync('./index.html', 'utf-8');
          ctx.body = content;
      } else if (url.endsWith('.js')) {
          // js文件
          const p = path.resolve(__dirname, url.slice(1));
          ctx.type = "application/javascript";
          const content = fs.readFileSync(p, 'utf-8');
          ctx.body = rewriteImport(content); // 替换文件中的依赖路径 content;
      }
  });
  ```

* 下一步我们要在Koa中拦截`/@modules/vue`这个请求，并返回Vue的代码内容

  在Koa中判断请求地址，如果是@module的地址，就把后面的Vue解析出来，去node_modules中查询，然后拼接处目标路径`./node_modules/vue/package.json`，去读取Vue项目中package.json的module字段，这个字段就是ES6规范的入口文件地址。

  读取到后文件后，再使用rewriteImport处理后返回即可。

  ```javascript
  // vite-mini/server.js
  else if (url.startsWith('/@modules/')) {
      // 这是一个node_modules里的东西
      const prefix = path.resolve(__dirname, 'node_modules', url.replace('/@modules/', ''));
      const module = require(prefix + '/package.json').module;
      const p = path.resolve(prefix, module);
      const ret = fs.readFileSync(p, 'utf-8');
      ctx.type = "application/javascript";
      ctx.body = rewriteImport(ret);
  }
  ```

  此处使用rewriteImport的原因是，Vue文件内部也会使用Import的语法去加载其他模块。可以看到浏览器的网络请求列表中多了好几个Vue的请求。

  这样我们就实现了node_modules模块的解析。

* 继续处理浏览器无法识别.vue文件的错误

  .vue文件是Vue中特有的文件格式，之前提过Vue内部通过`@vue/compiler-sfc`来解析单文件组件，把组件分成template、style、script三部分，我们要做的就是在Node环境下，把template的内容解析成render函数，并且和script的内容组成组件对象，再返回即可。

  compiler-dom解析template的流程之前有讲解，现在来看下如何使用。

  在下面代码中，我们判断.vue文件的请求后，通过compilerSFC.parse方法解析Vue组件，通过返回的descriptor.script获取JavaScript代码，并且发起一个type=template的请求去获取render函数；

  在query.type是template的时候，调用compilerDom.compile解析template的内容，直接返回render函数。

  ```javascript
  // vite-mini/server.js
  // ...
  const compileSFC = require('@vue/compiler-sfc'); // .vue
  const compileDom = require('@vue/compiler-dom'); // 模板
  
  app.use(async ctx => {
      const { request: {url, query} } = ctx;
      if (url === '/') {
          // ...
      } else if (url.endsWith('.js')) {
          // ...
      } else if (url.indexOf('.vue') > -1) {
          // vue单文件组件
          const p = path.resolve(__dirname, url.split('?')[0].slice(1));
          console.log(p);
          const { descriptor } = compileSFC.parse(fs.readFileSync(p, 'utf-8'));
          if (!query.type) {
              ctx.type = "application/javascript";
              // 借用Vue自带的compile框架 解析单文件组件，相当于vue-loader做的事情
              ctx.body = `
               ${rewriteImport(descriptor/*.scriptSetup*/.script.content.replace('export default', 'const __script = '))}
               import { render as __render } from "${url}?type=template"
               __script.render = __render
               export default __script
              `;
          } else if (query.type === 'template'){
              // 模板内容
              const template = descriptor.template;
              // 要在server端把compile做了
              const render = compileDom.compile(template.content, {mode: "module"}).code;
              ctx.type = "application/javascript";
              ctx.body = rewriteImport(render);
          }
      }
  });
  ```

  重新请求后，我们就可以在浏览器中看到App.vue组件解析的结果。App.vue会额外发起一个App.vue?type=template的请求，最终完成了整个App组件的解析。

* 接下来再实现对css文件的支持

  如果url是css结尾，就返回一段JavaScript代码。这段JavaScript代码会在页面上创建一个style标签，标签内部放入我们读取的css文件代码。这种对css文件的处理方式，让css以JavaScript的形式返回，这样我们就实现了在Node中对Vue组件的渲染。

  ```javascript
  // vite-mini/server.js
  if (url.endsWith('.css')) {
      const p = path.resolve(__dirname, url.slice(1));
      const file = fs.readFileSync(p, 'utf-8');
      const content = `
          const css = "${file.replace(/\n/g, '')}"
          let link = document.createElement('style')
          link.setAttribute('type', 'text/css')
          document.head.appendChild(link)
          link.innerHTML = css
          export default css
      `;
      ctx.type = "application/javascript";
      ctx.body = content;
  }
  ```

  至此还会报错`Uncaught ReferenceError: process is not defined`，在index.html中加入以下代码：

  ```html
  <script>
      // 应该会注入一段client代码，这段仕后端注入的
      // 热更新走的仕socketio，代码也在这里注入
      window.process = {
          env:{
              NODE_ENV:'dev'
          }
      }
  </script>
  ```

  或者在Koa的返回内容中设置。

  重启并刷新就能看到页面按照预期显示了。



### Vite的热更新

最后来看热更新如何实现。

热更新的目的就是在我们修改代码之后，浏览器能够自动渲染更新的内容，所以我们要在客户端注入一个额外的JavaScript文件，这个文件用来和后端实现websocket通信。

1. 后端启动websocket服务，通过chokidar库监听文件夹的变化后，再通过websocket去通知浏览器即可。

   下面的代码中，我们通过chokidar.watch实现了文件夹变更的监听，并通过handleHMRUpdate通知客户端文件更新的类型。

```typescript
export function watch() {
    const watcher = chokidar.watch(appRoot, {
        ignored: ['**/node_modules/**', '**/.git/**'],
        ignoreInitial: true,
        ignorePermissionErrors: true,
        disableGlobbing: true
    });
    watcher;

    return watcher;
}

export function handleHMRUpdate(opts: { file: string; ws: any }) {
    const { file, ws } = opts;
    const shortFile = getShortName(file, appRoot);
    const timestamp = Date.now();

    console.log(`[file change] ${chalk.dim(shortFile)}`);
    let updates;
    if (shortFile.endsWith('.css')) {
        updates = [
            {
                type: 'js-update',
                timestamp,
                path: `/${shortFile}`,
                acceptedPath: `/${shortFile}`
            }
        ];
    }

    ws.send({
        type: 'update',
        updates
    })
}
```

2. 然后客户端注入一段额外的JavaScript代码，判断后端传递的类型是js-update还是cssupdate去执行不同的函数即可。

```javascript
async function handleMessage(payload) {
    switch (payload.type) {
        case 'connected':
            console.log(`[vite] connected.`);
            setInterval(() => socket.send('ping'), 30000);
            break;
        case 'update':
            payload.updates.forEach(update => {
                if (update.type === 'js-update') {
                    fetchUpdate(update);
                }
            });
            break;
    }
}
```



### 总结

首先，我们通过了解webpack的大致原理，知道了现在webpack在开发体验上的痛点。除了用户体验UX之外，开发者的体验DX也是项目质量的重要因素。

**webpack启动服务之前需要进行项目的打包，而Vite则可以直接启动服务**，通过浏览器运行时的请求拦截，实现首页文件的按需加载，这样开发服务器启动的时间就和整个项目的复杂度解耦。任何时候我们启动Vite的调试服务器，基本都可以在一秒以内响应，这极大地提升了开发者的体验，也是Vite使用率越来越高的原因。

**Vite的主要目的就是提供一个调试服务器。Vite可以和Vue解耦，实现对任何框架的支持**，如果使用Vite支持react，只需要解析react中的JSX就可以实现。这也是Vite项目的现状，只需要使用框架对应的Vite插件就可以支持任意框架。

**Vite能够做到这么快的原因，还有一部分是因为使用了esbuild去解析JavaScript文件**。esbuild是一个用Go语言实现的JavaScript打包器，支持JavaScript和TypeScript，现在前端工程化领域的工具越来越多地使用Go和Rust等更高效的语言书写，这也是性能优化的一个方向。



### 思考题

如果一个模块文件是分散的，导致Vite首页一下子要加载1000个JavaScript文件造成卡顿，该如何处理这种情况？

【评论区思路】

可以使用“依赖预构建”，通过预构建生成一个模块，这样只会有一个 http 请求。

https://cn.vitejs.dev/guide/dep-pre-bundling.html 

https://cn.vitejs.dev/config/#dep-optimization-options