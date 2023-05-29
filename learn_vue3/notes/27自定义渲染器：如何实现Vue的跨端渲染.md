## 自定义渲染器：如何实现Vue的跨端渲染

自定义渲染器：可以自定义Vue渲染的逻辑

### 什么是渲染器

虚拟dom，是用对象的方式去描述一个项目，这种形式可以让整个Vue项目脱离浏览器的限制，更方便地实现Vuejs的跨端。

渲染器是围绕虚拟dom存在的。Vue源码内部把一个框架里所有和平台相关的操作，抽离成了独立的方法。

实现Vue3在一个平台的渲染，只需实现以下方法：

* 用createElement创建标签，用createText创建文本
* 用insert新增元素，用remove删除元素
* 通过setText更新文本
* 通过patchProps修改属性
* 实现parentNode、nextSibling等方法实现节点的查找关系

完成后，理论上就可以在一个平台内实现一个应用了。

在Vue3中的**runtime-core模块，对外暴露了这些接口**，runtime-core内部基于这些函数实现了整个Vue内部的所有操作。在runtime-dom中获得渲染器。

Vue代码提供了浏览器端操作的函数；DOM编程接口完成了浏览器端增加、添加和删除操作，这些API都是浏览器端独有的，如果一个框架**强依赖于**这些函数，那就只能在浏览器端运行。

如果一个框架想要实现跨端的功能，那么渲染器本身不能依赖任何平台下特有的接口。

#### 核心代码逻辑

* 通过调用createRenderer函数去创建一个渲染器，参数options传递进来的增删改查所有函数，会在内部的render、mount、patch等函数中被调用去渲染一个元素 [renderer源码](https://github.com/vuejs/core/blob/58e5c51149d7e28e5f7533b357c5cd70f5fea0d3/packages/runtime-core/src/renderer.ts#L325)

* 之前的实现方式是调用浏览器的API创建元素，比如mountElement

  ```javascript
  function mountElement(vnode, container, isSVG, refNode) {
    const el = isSVG
      ? document.createElementNS(....)
      : document.createElement(vnode.tag)
  }
  ```

  经过渲染器抽离之后，内部的mountElement就会把所有document的操作全部换成options传递进来的hostCreatexxx函数。

  ```javascript
  // vuejs/core/packages/runtime-core/src/renderer.ts L612
  const mountElement = (
      vnode: VNode,
      container: RendererElement,
      anchor: RendererNode | null,
      parentComponent: ComponentInternalInstance | null,
      parentSuspense: SuspenseBoundary | null,
      isSVG: boolean,
      slotScopeIds: string[] | null,
      optimized: boolean
    ) => {
      let el: RendererElement
      let vnodeHook: VNodeHook | undefined | null
      const { type, props, shapeFlag, transition, dirs } = vnode
  
      el = vnode.el = hostCreateElement(
        vnode.type as string,
        isSVG,
        props && props.is,
        props
      )
  
      // ...
    }
  ```

* 创建一个具体平台的渲染器，这是Vue3中的runtime-dom包主要做的事

  我们可以基于Vue3的runtime-core包封装其他平台的渲染器，让其他平台也能使用Vue内部的响应式和组件化等优秀的特性。

  ```javascript
  const { render } = createRenderer({
    nodeOps: {
      createElement() {},
      createText() {},
      // more..
    },
    patchData
  })
  ```

  

### 自定义渲染

自定义渲染器让Vue脱离了浏览器的限制。

只需要实现平台内部的增删改查函数后，就可以直接对接Vue3。

#### 🌰：实现一个Canvas的渲染器

* 新建src/renderer.js文件**（render-project）**

  实现一个简易的Canvas渲染逻辑，把整个Canvas维护成一个对象，每次操作的时候直接把Canvas重绘一下。

  ```javascript
  // src/renderer.js
  import { createRenderer } from "@vue/runtime-core";
  const { createApp: originCa } = createRenderer({
      insert: (child, parent, anchor) => {
          if (typeof child === 'string') {
              parent.text = child
          } else {
              child.parent = parent;
              if (!parent.child) parent.child = [child];
              else parent.child.push(child);
          }
          if (parent.nodeName) {
              draw(child);
              if (child.onClick) {
                  ctx.canvas.addEventListener('click', () => {
                      child.onClick();
                      setTimeout(() => {
                          draw(child);
                      })
                  }, false);
              }
          }
      },
      createElement(type, isSVG, isCustom) {
          return {
              type
          }
      },
      setElementText(node, text) {
          node.text = text;
      },
      patchProp(el, key, prevValue, nextValue) {
          el[key] = nextValue;
      },
      parentNode: node => node,
      nextSibling: node => node,
      createText: text => text,
      remove: node => node
  });
  ```

* 实现draw函数。

  用Canvas的操作方法递归地把Canvas对象渲染到Canvas标签内部。

  ```javascript
  // src/renderer.js
  let ctx;
  function draw(ele, isChild) {
      if (!isChild) {
          ctx.clearRect(0, 0, 500, 500)
      }
  
      ctx.fillStyle = ele.fill || 'white'
      ctx.fillRect(...ele.pos)
      if (ele.text) {
          ctx.fillStyle = ele.color || 'white'
          ele.fontSize = ele.type === "h1" ? 20 : 12
          ctx.font = (ele.fontSize || 18) + 'px serif'
          ctx.fillText(ele.text, ele.pos[0] + 10, ele.pos[1] + ele.fontSize)
      }
      ele.child && ele.child.forEach(c => {
          console.log('child:::', c)
          draw(c, true)
      })
  }
  ```

* 由于主体需要维护的逻辑就是对对象的操作，所以创建和更新操作直接操作对象即可。

  insert操作需要维护parent和child元素，也需要调用draw函数，并且需要监听onclick事件。（src/render.js）

* 修改src/main.js的createApp方法的引用

  ```javascript
  // src/main.js
  import { createApp } from './render.js'/*'vue'*/
  import './style.css'
  import App from './App.vue'
  
  createApp(App).mount('#app')
  ```

  改为从render.js中引入createApp。

  ```javascript
  // src/render.js
  function createApp(...args) {
      const app = originCa(...args);
      return {
          mount(selector) {
              const canvas = document.createElement('canvas');
              canvas.width = window.innerWidth;
              canvas.height = window.innerHeight;
              document.querySelector(selector).appendChild(canvas);
              ctx = canvas.getContext('2d');
              app.mount(canvas);
          }
      }
  }
  
  export { createApp };
  ```

  通过createRender生成的render，去定义我们自己的createApp函数，重写mount函数。在Canvas的mount中，我们需要创建canvas标签并挂载到app上。

* 测试使用

  修改src/App.vue文件

  ```vue
  <!-- src/App.vue -->
  <script setup>
  import HelloWorld from './components/HelloWorld.vue'
  import {ref} from "vue";
  const count = ref(1);
  const name = ref('vue3入门');
  const setName = (n) => {
    name.value = n;
    pos.value[1] += 20;
    count.value += 2;
  }
  const pos = ref([20, 120, 200, 100]);
  </script>
  
  <template>
    <div @click="setName('vue3真棒')" :pos="[10, 10, 300, 300]" fill="#eee">
      <h1 :pos="[20, 20, 200, 100]" fill="red" color="#000">累加器{{count}}</h1>
      <span :pos="pos" fill="black">哈喽 {{name}}</span>
    </div>
  </template>
  ```

  根据ref返回的响应式对象，渲染canvas内部的文字和高度，并且点击的时候还可以修改文字。

* 至此就实现了Canvas平台的基本渲染

社区开源的Vue3的自定义渲染器，比如：

* uni-app：小程序跨端框架
* Vugel：可以使用Vue渲染Webgl

#### 🌰：对three.js进行一个渲染尝试

实现逻辑和Canvas比较类似，通过对对象的维护和draw函数实现最终的绘制。

在draw函数内部，调用three.js的操作方法去创建camera、scene、geometry等；最后对外暴露three.js的createApp函数。

```javascript
// src/three-render.js
import { createRenderer } from "@vue/runtime-core";
import * as THREE from 'three';
import { nextTick } from "@vue/runtime-core";

let renderer;

function draw(obj) {
    const {camera, cameraPos, scene, geometry, geometryArg, material, mesh, meshY, meshX} = obj;
    if ([camera, cameraPos, scene, geometry, geometryArg, material, mesh, meshY, meshX].filter(v => v).length < 9) {
        return;
    }
    let cameraObj = new THREE[camera](40, window.innerWidth / window.innerHeight, 0.1, 10);
    Object.assign(cameraObj.position, cameraPos);

    let sceneObj = new THREE[scene]();

    let geometryObj = new THREE[geometry](...geometryArg);

    let materialObj = new THREE[material]();

    let meshObj = new THREE[mesh](geometryObj, materialObj);
    meshObj.rotation.x = meshX;
    meshObj.rotation.y = meshY;

    sceneObj.add(meshObj);

    renderer.render(sceneObj, cameraObj);
}

const {createApp: originCa} = createRenderer({
    insert: (child, parent, anchor) => {
        if (parent.domElement) {
            draw(child);
        }
    },
    createElement(type, isSVG, isCustom) {
        return {
            type
        };
    },
    setElementText(node, text) {
    },
    patchProp(el, key, prevValue, nextValue) {
        el[key] = nextValue;
        draw(el);
    },
    parentNode: node => node,
    nextSibling: node => node,
    createText: text => text,
    remove: node => node
});

function createApp(...args) {
    const app = originCa(...args);
    return {
        mount(selector) {
            renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            document.querySelector('#app').appendChild(renderer.domElement);
            app.mount(renderer);
        }
    }
}

export {
    createApp
};
```

新建App1.vue：

```vue
<!-- src/App1.vue -->
<template>
  <div
    camera="PerspectiveCamera"
    :cameraPos={z:1}
    scene="Scene"
    geometry="BoxGeometry"
    :geometryArg="[0.2, 0.2, 0.2]"
    material="MeshNormalMaterial"
    mesh="Mesh"
    :meshY="y"
    :meshX="x"
  ></div>
</template>

<script>
import {ref} from "vue";

export default {
  setup() {
    const y = ref(0.3);
    const x = ref(0.3);
    setInterval(() => {
      y.value += 0.3;
      x.value += 0.5;
    }, 100);

    return { y, x }
  }
}
</script>
<style>
#app {
  margin: 0;
  padding: 0;
}
</style>
```

通过ref响应式对象控制立方体偏移的角度，再通过setInterval实现立方体的动画，实现翻转效果。

#### 🌰：在Canvas的封装上更进一步（Pixi）

对Canvas已有框架Pixi.js实现一些封装

这样就可以通过Vue3的响应式开发方式，快速开发一个小游戏。

用响应式包裹Pixi的对象。

[源码，在线编辑器](https://github.dev/shengxinjing/vue3-vs-vue2/blob/0911af848941c2eeb2783c32c1907fd286134be1/vue3-runtime-canvas/index.js)

[源码](https://github.com/shengxinjing/vue3-vs-vue2/blob/master/vue3-runtime-canvas/index.js)



### 小结

自定义渲染器的原理：把所有的增删改查操作暴露出去，使用的时候不需要知道内部的实现细节，我们只需要针对每个平台使用不同的API即可。

在Vue渲染器的设计中，就把document所有的操作都抽离成了nodeOps，并且通过调用Vue的createRenderer函数创建平台的渲染器。

自定义渲染器也代表着适配器设计模式的一个实践。

反思：自己现在负责的项目中，有哪些地方为了不同的接口或者平台写了太多的判断代码，是否也可以使用类似自定义渲染器的逻辑和模式，把多个组件、平台、接口之间不同的操作方式封装成一个核心模块，去进行单独函数的扩展。
