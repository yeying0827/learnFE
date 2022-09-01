## single-spa-vue

`single-spa-vue`是一个针对vue项目的初始化、挂载、卸载的库函数，可以实现`single-spa`注册的应用、生命周期函数等功能，可查看[single-spa-vue repo](https://github.com/single-spa/single-spa-vue)

### 安装

#### 使用 Vue CLI的项目

[vue-cli-plugin-single-spa](https://github.com/single-spa/vue-cli-plugin-single-spa)将会把所有的事情都做好

```shell
vue add single-spa
```

该命令将会做下面的事情：

* 修改你的`webpack`配置，使你的项目可以作为一个single-spa应用或parcel工作。
* 安装`single-spa-vue`
* 修改你的`main.js`或`main.ts`文件，从而使你的项目适用于一个`single-spa`应用或是一个parcel
* 添加`set-public-path.js`文件（没有看到这个文件？），它将使用`systemjs-webpack-interop`来设置应用程序的公共路径。

#### 没有使用Vue CLI的项目

```shell
npm install --save single-spa-vue
```

您也可以通过在您的HTML文件中添加`<script src="https://unpkg.com/single-spa-vue"></script>`并访问`singleSpaVue`全局变量来使用single-spa-vue。



### 使用

如果没有安装过的话，请安装`systemjs-webpack-interop`：

```shell
npm install systemjs-webpack-interop -S
```

在和`main.js/ts`同级的位置新建一个名为`set-public-path.js`的文件：

```js
// set-public-path.js
import { setPublicPath } from 'systemjs-webpack-interop';
setPublicPath('appName');
```

> 请注意，如果你使用Vue CLI插件，你的main.ts或main.js文件将自动更新此代码，set-public-path.js文件将自动创建，应用名称是你package.json的名称属性。

如果你想处理你的Vue实例，你可以按照这个方法修改mount方法。mount方法在v1.6.0之后会返回带有Vue实例的Promise。

```javascript
const vueLifecycles = singSpaVue({/*...*/});
export const mount = props => vueLifecycles.mount(props).then(instance => {
  // 使用vue实施做你想做的事情
  // ...
})；
```



#### vue2

对于Vue 2，将你的应用程序的入口文件改为以下内容:

```javascript
import './set-public-path';
import Vue from 'vue';
import App from './App.vue';
import router from './router';
import singleSpaVue from 'single-spa-vue';

const vueLifecycles = singleSpaVue({
  Vue,
  appOptions: {
    render(h) {
      return h(App);
    },
    router
  },
});

export const bootstrap = vueLifecycles.bootstrap;
export const mount = vueLifecycles.mount;
export const unmount = vueLifecycles.unmount;
```



#### vue3

> Vue 3的路由器只有在single-spa的urlRerouteOnly设置为 "true "时才能正常工作。在single-spa@<=5中，urlRerouteOnly的默认值是false。所以请确保更新你的root config，将其设置为true。另外，升级到vue-cli-plugin-single-spa@>=3，以确保standalone模式将urlRerouteOnly设为true。

对于Vue 3，将你的应用程序的入口文件改为以下内容:

```javascript
import './set-public-path';
import { h, createApp } from 'vue';
import singleSpaVue from '../lib/single-spa-vue.js';
import App from './App.vue';

const vueLifecycles = singleSpaVue({
  createApp,
  appOptions: {
    render() {
      return h(App, {
        props: {
          // 在 "this "对象上可以使用single-spa props，根据需要将它们转发给你的组件。
        	// https://single-spa.js.org/docs/building-applications#lifecycle-props
        	name: this.name,
        	mountParcel: this.mountParcel,
        	singleSpa: this.singleSpa,
        }
      })
    }
  }
});

export const bootstrap = vueLifecycles.bootstrap;
export const mount = vueLifecycles.mount;
export const unmount = vueLifecycles.unmount;
```



#### 自定义props

single-spa自定义props可以像下面这样传递给你的根组件：

```javascript
// main.js
const vueLifecycles = singleSpaVue({
  Vue,
  appOptions: {
    render(h) {
      return h(App, {
        props: {
          mountParcel: this.mountParcel,
          otherProp: this.otherProp,
        },
      });
    },
    router,
  },
});
```

```vue
<!-- App.vue -->
<template>
	<button>
    {{ otherProp }}
  </button>
</template>
<script>
export default {
  props: ['mountParcel', 'otherProp']
}
</script>
```



#### 共享依赖

从性能角度考虑，最好是共享Vue、Vue Router和其他大型库的单一版本和实例。

要做到这一点，需要将共享的依赖项添加为webpack externals。然后使用浏览器内模块加载器（如systemjs）为每个single-spa应用程序提供这些共享的依赖项。将vue和其他库添加到你的import map中。关于这样使用的import map的例子，请查看[coexisting-vue-microfrontends的index.html文件](https://github.com/joeldenning/coexisting-vue-microfrontends/blob/master/root-html-file/index.html)。

强烈建议共享Vue和其他通用库的单一实例。更多细节请见[single-spa的推荐设置](https://single-spa.js.org/docs/faq/#is-there-a-recommended-setup)，以了解原因。

* 使用Vue CLI的情况下共享依赖

  ```javascript
  // vue.config.js
  module.exports = {
    chainWebpack: config => {
      config.externals(['vue', 'vue-router']);
    },
  };
  ```

  

* 未使用Vue CLI的情况下共享依赖

  ```javascript
  // webpack.config.js
  module.exports = {
    externals: ['vue', 'vue-router'],
  };
  ```

  

#### 选项

在调用`singleSpaVue(opts)`时，所有选项都通过opts参数传递给single-spa-vue。以下是可用的选项：

* Vue（必传）：主要的Vue对象，通常暴露在window对象上，或通过`require('vue')`、`import Vue from 'vue'`获得

* appOptions（必传）：一个对象或异步函数，将用于实例化你的Vue.js应用程序。appOptions将直接传递给new Vue(appOptions)。请注意，如果你没有为appOptions提供一个el，那么一个div将被创建并追加到DOM上，作为你的Vue应用程序的默认容器。当appOptions是一个异步函数时，它接收single-spa props作为一个参数（截至single-spa-vue@2.4.0）。

* loadRootComponent（非必传，用于取代appOptions.render）：一个可被解析为根组件的promise，这对懒加载很有用。

* handleInstance：一个可以用来处理Vue实例的方法。Vue 3带来了新的实例API，你可以从中访问应用实例，比如handleInstance: (app, props) => app.use(router)。对于Vue 2用户，可以访问Vue实例。

  handleInstance(app, props)函数接收实例作为其第一个参数，并接收single-spa props作为其第二个参数。如果 handleInstance 返回一个promise，single-spa-vue 将等待解析 app / parcel 的挂载生命周期结束，直到 handleInstance 的promise完成解析。

* replaceMode：一个布尔值，决定你的Vue根组件是否会完全替换它所挂载的容器元素。Vue库总是会替换，所以为了实现`replaceMode: false`，会在容器内创建一个临时的`<div class="single-spa-container">`元素，这样Vue就会替换该元素而不是容器。引入于single-spa-vue@2.3.0。

要配置single-spa应用程序被挂载到哪个dom元素，请使用`appOptions.el`：

```javascript
const vueLifecycles = singleSpaVue({
  Vue,
  appOptions: {
    render: h=>h(App),
    el: '#a-special-container'
  }
});
```

为了异步配置选项，从appOptions函数中返回一个promise：

```javascript
const vueLifecycles = singleSpaVue({
  Vue,
  async appOptions() {
    return {
      router: await routerFactory(),
      render: h=>h(App),
    };
  },
});
```



### Parcels

#### 创建parcel

parcel config是一个代表用Vue、React、Angular或任何其他框架实现的组件的对象。

要创建一个VueJS single-spa parcel config对象，只需从你的appOptions中省略el选项，因为dom元素将由Parcel的使用者指定。其他每个选项的提供都应该与上面的例子完全一样。

```javascript
const parcelConfig = singleSpaVue({/*...*/});
```

#### 渲染parcel

要在Vue中渲染一个parcel config对象，你可以使用single-spa-vue的Parcel组件

```vue
<template>
  <Parcel
    v-on:parcelMounted="parcelMounted()"
    v-on:parcelUpdated="parcelUpdated()"
    :config="parcelConfig"
    :mountParcel="mountParcel"
    :wrapWith="wrapWith"
    :wrapClass="wrapClass"
    :wrapStyle="wrapStyle"
    :parcelProps="getParcelProps()"
  />
</template>

<script>
// For old versions of webpack
import Parcel from 'single-spa-vue/dist/esm/parcel'
// For new versions of webpack
import Parcel from 'single-spa-vue/parcel'

import { mountRootParcel } from 'single-spa'

export default {
  components: {
    Parcel
  },
  data() {
    return {
      /*
        parcelConfig (object, required)
        
        parcelConfig是一个对象，或者一个将可以解析为parcel config的promise。
        该对象可以来自当前项目，也可以通过跨微前端导入（cross microfrontend imports）来自不同的微前端。它可以代表一个Vue组件，或一个React/Angular组件。
        https://single-spa.js.org/docs/recommended-setup#cross-microfrontend-imports

        Vanilla js object:
        parcelConfig: {
          async mount(props) {},
          async unmount(props) {}
        }

        // React component
        parcelConfig: singleSpaReact({...})

        // cross microfrontend import is shown below
      */
      parcelConfig: System.import('@org/other-microfrontend').then(ns => ns.Widget),


      /*
        mountParcel (function, required)

        mountParcel函数可以是当前Vue应用程序的mountParcel prop，也可以是全局可用的mountRootParcel函数。更多信息可以查看
        http://localhost:3000/docs/parcels-api#mountparcel
      */
      mountParcel: mountRootParcel,

      /*
        wrapWith (string, optional)

        The wrapWith string determines what kind of dom element will be provided to the parcel.
        Defaults to 'div'
      */
      wrapWith: 'div'

      /*
        wrapClass (string, optional)

        The wrapClass string is applied to as the CSS class for the dom element that is provided to the parcel
      */
      wrapClass: "bg-red"

      /*
        wrapStyle (object, optional)

        The wrapStyle object is applied to the dom element container for the parcel as CSS styles
      */
      wrapStyle: {
        outline: '1px solid red'
      },
    }
  },
  methods: {
    // These are the props passed into the parcel
    getParcelProps() {
      return {
        text: `Hello world`
      }
    },
    // Parcels mount asynchronously, so this will be called once the parcel finishes mounting
    parcelMounted() {
      console.log("parcel mounted");
    },
    parcelUpdated() {
      console.log("parcel updated");
    }
  }
}
</script>
```



### Webpack的公共路径

vue-cli-plugin-single-spa通过SystemJSPublicPathWebpackPlugin设置webpack公共路径。默认情况下，公共路径被设置为符合以下输出目录结构：

```text
dist/
  js/
    app.js
  css/
    main.css
```

在这种目录结构下（这是Vue CLI默认的），公共路径不应该包括js文件夹。这可以通过设置[rootDirectoryLevel](https://github.com/joeldenning/systemjs-webpack-interop#as-a-webpack-plugin)为2来实现。如果这与你的目录结构或设置不一致，你可以在你的vue.config.js或webpack.config.js中用以下代码改变rootDirectoryLevel：

```javascript
// vue.config.js
module.exports = {
  chainWebpack(config) {
    config.plugin('SystemJSPublicPathWebpackPlugin').tap((args) => {
      args[0].rootDirectoryLevel = 1;
      return args;
    });
  }
}
```