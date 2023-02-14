## 路由：新一代vue-router带来什么变化

### 前后端开发模式的演变

在jQuery时代，对于大部分Web项目而言，前端都是不能控制路由的，而是需要依赖后端项目的路由系统。通常，前端项目也会部署在后端项目的模板里。

在这个时代，前端工程师并不需要了解路由的概念；对于每次的页面跳转，都由后端开发人员来负责重新渲染模板。

为了提高页面的交互体验，前端的开发模式发生了变化，项目的结构也发生了变化。

由JavaScript获取当前的页面地址，计算出路由并匹配组件，再去动态渲染当前页面。用户进行交互操作时，不再需要刷新页面，而是直接通过JS重新计算出匹配的路由组件渲染即可。

这种所有路由都渲染一个前端入口文件的方式，是单页面应用程序（SPA，single page application）的雏形。

通过JavaScript动态控制路由去提高用户体验，浏览器路由的变化可以通过pushState来操作。这种纯前端开发应用的方式，以前被称为Pjax（即pushState + Ajax）。

前端项目终于可以独立进行部署了。



### 前端路由的实现原理

在通过URL区分路由的机制上，有两种实现方式：

* 一种是hash模式，通过URL中#后面的内容做区分，被称为hash-router
* 另一种就是history模式，这种方式下，路由看起来和普通的URL完全一致

在vue-router中对应两个函数，分别是createWebHashHistory和createWebHistory。

#### hash模式

单页应用在页面交互、页面跳转上都是无刷新的，这极大地提高了用户访问网页的体验。

实现起来，就是匹配不同的URL路径，进行解析，然后动态地渲染出区域HTML内容。关键点是，保证页面的不刷新。

2014年前，都是通过hash来实现前端路由。因为URL中hash值的变化并不会导致浏览器页面的刷新，只是会触发hashchange事件。

通过对hashchange事件的监听，我们就可以在回调函数内部进行动态地页面切换。就比如下面的代码。

```javascript
window.addEventListener('hashchange', fn);
```

#### history模式

在2014年之后，因为HTML5标准发布，浏览器多了两个API：`history.pushState`和`history.replaceState`。这两个API可以在浏览器不刷新页面的状态下改变URL的地址，并触发popState事件。

借助这两个API和popState事件，我们就能用另一种方式实现前端路由切换。

通过监听popState事件，我们可以监听到通过pushState修改路由的变化。在回调函数中，就可以实现页面的更新操作。

```javascript
window.addEventListener('popState', fn);
```



### 手写mini vue-router

设计一个使用hash模式的mini vue-router。

* 首先在src/router目录下新建一个grouter文件夹，并在该文件夹下新建文件index.js，内容如下：

  ```javascript
  // src/router/grouter.js
  import {ref, inject} from "vue";
  import RouterView from "./RouterView.vue";
  import RouterLink from "./RouterLink.vue";
  
  const ROUTER_KEY = '__router__';
  
  function createRouter(options) {
      return new Router(options);
  }
  
  function useRouter() {
      return inject(ROUTER_KEY);
  }
  
  function createWebHashHistory() {
      function bindEvents(fn) {
          window.addEventListener('hashchange', fn);
      }
      return {
          bindEvents,
          url: window.location.hash.slice(1) || '/'
      }
  }
  
  class Router {
      constructor(options) {
          this.history = options.history;
          this.routes = options.routes;
          this.current = ref(this.history.url);
  
          this.history.bindEvents(() => {
              this.current.value = window.location.hash.slice(1);
          });
      }
      install(app) {
          app.provide(ROUTER_KEY, this);
      }
  }
  
  export {createRouter, createWebHashHistory, useRouter};
  ```

  * 首先，实现了用Router类去管理路由，current为当前的路由地址，使用ref包裹成响应式的数据；

  * 然后，创建createWebHashHistory函数用于对hashchange事件进行监听，并返回一个对象用于设置回调函数和返回当前URL；
  * 在Router类的install方法中注册Router实例
  * 并对外暴露createRouter方法去创建并获取Router实例
  * 暴露的useRouter方法可以获取路由实例

* 使用：修改src/router/index.js中的相关引用路径

  ```javascript
  // src/router/index.ts
  // import {createRouter, createWebHashHistory} from 'vue-router';
  import {createRouter, createWebHashHistory} from './grouter';
  
  // ...
  
  const router = createRouter({
      history: createWebHashHistory(),
      routes
  });
  
  export default router;
  ```

  可以看到，调用createWebHashHistory()并将返回值作为参数history的值；并且将routes作为页面的参数传递给createRouter函数。

* 为了正常使用，还需要注册两个内置组件router-view和router-link。

  router-view组件的功能，就是current发生变化的时候，去匹配current地址对应的组件，然后动态渲染到router-view的位置就可以了。

  * 首先使用useRouter获取当前路由的实例
  * 然后根据当前的路由路径，也就是`router.current.value`的值，在用户路由配置routes中计算出匹配的组件
  * 最后通过计算属性返回comp变量，在template内部使用component组件动态渲染

  具体代码如下：

  ```vue
  <!-- src/router/grouter/RouterView.vue -->
  <template>
    <h1>
      自定义Router</h1>
    <component :is="comp"></component>
  </template>
  
  <script setup>
  import {computed} from "vue";
  import {useRouter} from "./index";
  
  let router = useRouter();
  
  const comp = computed(() => {
    const route = router.routes.find(r => r.path === router.current.value);
    return route?.component || null;
  });
  </script>
  ```

  然后是router-link组件，以下代码中，template渲染了一个a标签，a标签的href属性前加了一个#，就实现了hash的修改；此处接收一个字符串类型的字段to作为props。

  ```vue
  <template>
    <a :href="'#' + props.to">
      <slot/>
    </a>
  </template>
  
  <script setup>
  import {defineProps} from "vue";
  
  const props = defineProps({
    to: {type: String, required: true}
  });
  
  </script>
  ```

* 为了使用上述两个组件，我们需要进行注册。

  ```javascript
  // src/router/grouter/index.ts
  import {ref, inject} from "vue";
  import RouterView from "./RouterView.vue";
  import RouterLink from "./RouterLink.vue";
  
  // ...
  
  class Router {
      // ...
      install(app) {
          app.provide(ROUTER_KEY, this);
          // 注册两个组件
          app.component('router-view', RouterView);
          app.component('router-link', RouterLink);
      }
  }
  
  export {createRouter, createWebHashHistory, useRouter};
  ```

至此，就完成了hash模式的mini vue-router。



### vue-router实战要点

vue-router实战中的几个常见功能：

* 首先是路由匹配，支持动态路由
* 需要导航守卫功能，也就是在访问路由页面之前进行权限认证，这样可以做到对页面的访问控制
* 此外还有与性能有关的动态导入功能，把不常用的路由组件单独打包，当访问到这个路由的时候再进行加载，这也是vue项目中常见的优化方式



### 总结

从最初的嵌入到后端内部发布，再到现在的前后端分离的过程，见证了前端SPA应用的发展。

前端路由实现的两种方式，通过监听不同的浏览器事件，来实现hash模式和history模式，在router-view内部动态地渲染组件。

vue-router实战中常见的一些痛点



**如何决定使用hash模式还是history模式：**

1. 是否有兼容性需求，history API是html5（2014年）新增的
2. 服务器是否能配合做修改，比如使用NGINX，需要给不同路由请求重定向到特定的页面
3. 更建议使用history模式，链接更好看更标准，SEO的支持更好，一种协议的进步

**改为history模式的尝试**：

1. 新增createWebHistory函数，并将监听回调的current赋值改为`window.location.pathname`

```javascript
// src/router/grouter/index.ts
import {ref, inject} from "vue";
import RouterView from "./RouterView.vue";
import RouterLink from "./RouterLink.vue";

// ...

function createWebHistory() {
    function bindEvents(fn) {
        window.addEventListener('popstate', fn);
    }
    return {
        bindEvents,
        url: window.location.pathname || '/'
    }
}

class Router {
    constructor(options) {
        this.history = options.history;
        this.routes = options.routes;
        this.current = ref(this.history.url);

        this.history.bindEvents(() => {
            // this.current.value = window.location.hash.slice(1);
            this.current.value = window.location.pathname; // history模式
        });
    }
    // ...
}

export {createRouter, createWebHashHistory, createWebHistory, useRouter};
```

2. 修改RouterLink组件

```vue
<!-- src/router/grouter/RouterLink.vue -->
<template>
<!--  <a :href="'#' + props.to">-->
  <a @click="go">
    <slot/>
  </a>
</template>

<script setup>
import {defineProps} from "vue";
import {useRouter} from "./index";

const router = useRouter();

const props = defineProps({
  to: {type: String, required: true}
});

function go() {
  window.history.pushState({}, '', props.to);
  const popStateEvent = new PopStateEvent('popstate',);
  dispatchEvent(popStateEvent);
}
</script>
```

将跳转方式改为调用go函数，在go内部调用history.pushState API，同时手动触发popstate事件（因为调用pushState不会触发popstate事件，只有浏览器前进后退会触发popstate事件）

3. 最后在创建路由的地方将调用的createWebHashHistory改为调用createWebHistory

```javascript
// import {createRouter, createWebHashHistory} from 'vue-router';
import {createRouter, createWebHashHistory, createWebHistory} from './grouter';
// ...

const router = createRouter({
    // history: createWebHashHistory(),
    history: createWebHistory(),
    routes
});

export default router;
```

至此，就可以实现一个简单的history模式的vue-router。
