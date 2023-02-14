## 数据流：使用Vuex设计你的数据流

### 前端数据管理

现在Web应用都是由三大件构成，分别是：组件、数据和路由。

组件之间需要共享一些数据的时候，应该如何实现？

解决这个问题的最常见的一种思路就是：专门定义一个全局变量，任何组件需要数据的时候都去这个全局变量中获取。

但这样会产生一个问题，`window._store`并不是响应式的，如果在Vue项目中直接使用，那么就无法自动更新页面；需要用ref和reactive去把数据包裹成响应式数据，并提供统一的操作方法，这其实就是数据管理框架Vuex的雏形了。



### Vuex是什么

Vuex存在的意义，就是管理我们项目的数据。

**总有些数据是需要共享的。**如果都在组件内部传递，会变得非常混乱。

对数据做统一地申请和发放，这样才能方便做资产管理。Vuex就相当于我们项目中的大管家，集中式存储和管理应用里所有组件的状态。

安装依赖：

```shell
yarn add vuex@next
# or
npm install vuex@next
```

使用：

1. 在src/store下新建index.js文件

2. 使用createStore来创建一个数据存储，称之为`store`

   store内部除了数据，还需要mutation配置去修改数据。

   可以把mutation理解为数据更新的申请单，mutation中的函数会把state作为参数，本例中直接操作state.count就可以完成数据的修改。

   ```javascript
   // src/store/index.ts
   import {createStore} from "vuex";
   
   const store = createStore({
       state() {
           return {
               count: 666
           };
       },
       mutations: {
           add(state) {
               state.count ++;
           }
       }
   })
   
   export default store;
   ```

3. 至此，在Vue的组件系统之外，多了一个数据源。

   我们在Vue中注册这个数据源：在项目入口文件src/main.js中，使用`app.use(store)`进行注册，这样Vue和Vuex就连接上了。

   ```javascript
   // src/main.js
   import { createApp } from 'vue'
   import App from './App.vue'
   import router from './router';
   import store from "./store"; // 引入数据源
   
   import './assets/main.css'
   
   createApp(App).use(store)/*注册数据源*/.use(router)/*注册路由数据*/.mount('#app')
   ```

4. 在组件的script中，使用`useStore`去获取数据源。初始化值和修改值的函数有两个变化：

   1. count不使用ref直接定义 => 使用计算属性返回了`store.state.count`
   2. 由于数据由Vuex统一管理，不能直接操作`store.state.count += 1`，要使用`store.commit("add")`去触发Vuex中的mutation去修改数据。

   ```javascript
   <!-- src/components/Counter.vue -->
   import {computed, ref} from "vue";
   // import {useStore} from "vuex";
   import {useStore} from "../store/gvuex";
   // ...
   
   const store = useStore();
   const count2 = computed(() => store.state.count); // 使用计算属性返回
   function add1() {
     store.commit("add"); // 触发store中的mutation去修改数据
   }
   ```

**每当需要抽离共享的数据时，我们都需要思考这个数据的初始化和更新逻辑。**



### 手写mini Vuex

思路：

1. 创建一个变量store用来存储数据

2. 把这个store的数据包转成响应式的数据，并且提供给Vue组件使用

   在Vue中有[provide/inject](https://cn.vuejs.org/guide/components/provide-inject.html)这两个函数专门用来做数据共享，provide注册了数据后，所有的子组件都可以通过inject获取数据。

步骤：

1. 在src/store文件夹下，新建`gvuex.js`

   使用一个Store类来管理数据，类的内部使用_state存储数据，使用mutations来管理数据修改的函数。

   **注**：state使用reactive包裹成响应式数据

   ```javascript
   // src/store/gvuex.js
   import {inject, reactive} from "vue";
   
   const STORE_KEY = "__store__";
   function useStore() {
       return inject(STORE_KEY);
   }
   
   function createStore(options) {
       return new Store(options);
   }
   
   class Store {
       constructor(options) {
           this._state = reactive({
               data: options.state()
           });
           this._mutations = options.mutations;
       }
   }
   
   export {createStore, useStore};
   ```

   暴露createStore用于创建Store实例，并且可以在任意组件的setup函数内，使用useStore去获取store的实例。

2. 把src/store/index.js中的`vuex`改为`./gvuex`

   这样就使用createStore创建了一个自定义的Store实例；该实例定义了count变量和修改count值的add函数。

   项目入口文件src/main.js中也注册了这个实例。

3. 为了让useStore能正常工作，需要给Store新增一个实例方法install，这个方法会在`app.use`函数内部执行。

   在intall函数中通过调用`app.provide`函数注册store实例给全局的组件使用。

   ```javascript
   // src/store/gvuex.js
   import {inject, reactive} from "vue";
   
   const STORE_KEY = "__store__";
   // ...
   
   class Store {
       // ...
       install(app) {
           app.provide(STORE_KEY, this);
       }
   }
   
   export {createStore, useStore};
   ```

4. 接着还要定义一个get函数`state()`用于直接获取响应式数据`_state.data`，并且提供commit函数去执行用户配置好的mutations。

   ```javascript
   // src/store/gvuex.js
   import {inject, reactive} from "vue";
   
   const STORE_KEY = "__store__";
   // ...
   
   class Store {
       // ...
       install(app) {
           app.provide(STORE_KEY, this);
       }
       get state() {
           return this._state.data;
       }
       commit(type, payload) {
           const entry = this._mutations[type];
           entry && entry(this._state.data, payload);
       }
   }
   
   export {createStore, useStore};
   ```

5. 至此，就可以在`src/components/Counter.vue`组件中使用我们自定义的`gvuex`去实现累加器的功能了。

借助vue的插件机制和reactive响应式功能，就实现了一个迷你的数据管理工具，也就是一个迷你的Vuex实现。



### Vuex实战

可以看出，Vuex就是一个公用版本的ref，提供响应式数据给整个项目使用。

在Vuex中，可以使用**getters配置**，来实现类似computed的功能。🌰：

```javascript
// src/store/index.ts
import {createStore} from "vuex";

const store = createStore({
    state() {
        return {
            count: 666
        };
    },
    getters: {
        double(state) {
            return state.count * 2;
        }
    },
    // ...
})

export default store;
```

使用：

```javascript
// src/components/Counter.vue
const double = computed(() => store.getters.double);
```

我们可以很方便地在组件中使用getters，把double处理和计算的逻辑交给Vuex。

在Vuex中，mutation的设计就是用来实现同步地修改数据；如果数据是异步修改的，我们需要一个新的配置：action。

这些**异步的修改需求**，在Vuex中需要新增action的配置，在action中你可以做任意的异步处理。

使用：

在createStore的配置中，新增action配置，这个配置中所有的函数，可以通过解构参数获得commit函数；异步任务完成后，就随时可以调用commit来执行mutations去更新数据。

🌰：

```javascript
// src/store/index.ts
import {createStore} from "vuex";
// import {createStore} from "./gvuex";

const store = createStore({
    state() {
        return {
            count: 666
        };
    },
    // ...
    actions: {
        asyncAdd({commit}) {
            setTimeout(() =>{
                commit('add');
            }, 1000);
        }
    }
})

export default store;
```

actions的调用方式是使用`store.dispatch`。

```javascript
// src/components/Counter.vue
store.dispatch("asyncAdd");
```

从宏观来说，Vue的组件负责渲染页面，组件中用到跨页面的数据，就使用store来存储，但是Vue不能直接修改store的state，而是要通过actions/mutations去做数据的修改。

由于Vuex所有的数据修改都是通过mutations来完成的，因而我们可以很方便地监控到数据的动态变化。还可以借助官方的调试工具，非常方便地去调试项目中的数据变化。

**是否用Vuex来管理某个数据的核心问题**就是，这个数据是否有共享给其他页面或组件的需要。



### 下一代Vuex

对Typescript的类型推导的支持，可以考虑使用Pinia，很有潜力的状态管理框架。



### 总结

共享的数据怎么科学管理？需要Vuex出马

Vue是一个状态和数据管理的框架，负责管理项目中多个组件和多个页面共享的数据。

使用state定义数据，使用mutation定义修改数据的逻辑（在组件中使用commit调用mutations），还可以用getters去实现Vuex世界的计算属性，使用action定义异步任务（在内部使用commit调用mutation去同步数据）。

Vuex使项目中的数据流动变得非常自然。数据流向组件，但组件不能直接修改数据，而是要通过mutation提出申请，由mutation去修改数据，形成了一个圆环。
