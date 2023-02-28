## 单元测试：如何使用TDD开发组件

大幅提升组件库代码可维护性的手段

如何使用测试驱动开发的方式实现一个组件

[practice commit](https://github.com/yeying0827/vue3-lib-learning/commit/366d9af8de61da05a2c27b58a77aff5889a66489)

### 单元测试

Unit Testing，对软件中的最小可测试单元进行检查和验证

假设存在以下代码：

```javascript
function add(x, y) {
  return x + y;
}
console.log( 3 === add(1, 2));
```

为了让add函数的行为符合预期，我们希望添加一些Console的判断逻辑，并让这些代码自动化执行。

具体操作：

1. 在src目录下，新建一个add.js文件

   ```javascript
   // src/add.js
   function add(a, b) {
       return a + b;
   }
   
   function expect(ret) {
       return {
           toBe(arg) {
               if (ret !== arg) {
                   throw Error(`预计和实际不符，预期是${arg}, 实际是${ret}`);
               }
           }
       }
   }
   
   function test(title, fn) {
       try {
           fn();
           console.log(title, '测试通过');
       } catch (e) {
           console.log(e);
           console.log(title, '测试失败');
       }
   }
   
   test('测试数字相加', () => {
       expect(add(1, 2)).toBe(3);
   });
   ```

   说明：

   * 函数test内部执行测试代码，可以给每个测试起个名字，方便调试时查找；
   * expect可以判断传入的值和预期是否相符

2. 命令行执行`node add.js`，可以看到测试结果

   ```shell
   $ node add.js         
   测试数字相加 测试通过
   ```

如果每次git提交之前，都能执行一遍add.js去检查add函数的逻辑，add函数相当于有了个自动检查员，就可以很好地提高add函数的可维护性。

假设add函数需要增加新的逻辑，可以先写好测试代码，根据报错信息，进一步丰富add函数的逻辑。

再执行`node add.js`；确保新增逻辑的时候，也没有影响到之前的代码逻辑。



### 引入Jest

内置了断言、测试覆盖率等功能。

#### 配置

* 安装相关依赖库（jest需要指定26版本，否则会报错）

  ```shell
  $ yarn add jest@26 vue-jest@next @vue/test-utils@next -D
  $ yarn add babel-jest@26 @babel/core @babel/preset-env -D
  $ yarn add ts-jest@26 @babel/preset-typescript @types/jest -D
  ```

  * vue-jest和@vue/test-utils是测试Vue组件必备的库
  * babel-jest库用于测试js和jsx文件
  * ts-jest库用于测试ts文件

* 在根目录下新建`babel.config.js`文件

  ```javascript
  // babel.config.js
  // eslint-disable-next-line no-undef
  module.exports = {
      presets: [
          ['@babel/preset-env', { targets: { node: 'current' } }],
          '@babel/preset-typescript'
      ]
  };
  ```

  指定babel解析的node版本和TypeScript环境

* 在根目录下新建`jest.config.js`文件，用于配置jest的测试行为

  ```javascript
  // jest.config.js
  // eslint-disable-next-line no-undef
  module.exports = {
      transform: {
          '^.+\\.vue$': 'vue-jest',
          '^.+\\.jsx?$': 'babel-jest',
          '^.+\\.ts$': 'ts-jest'
      },
      testMatch: ['**/?(*.)+(spec).[jt]s?(x)']
  };
  ```

  不同格式的文件配置使用不同的jest命令

  测试文件的文件名格式为：xxx.spec.[js|ts]

* 配置package.json文件，在scripts中新增test命令

  ```json
  {
    "name": "vue3-lib-learning",
    "private": true,
    "version": "0.0.0",
    "scripts": {
      // ...
      "test": "jest"
    },
    // ...
  }
  ```

#### 测试

* 在src目录下新增`test.spec.js`文件

  ```javascript
  // test.spec.js
  function sayHello(name, fn) {
      if (name === '大圣') {
          fn();
      }
  }
  
  test('测试加法', () => {
      expect(1 + 2).toBe(3); // 判断值相等
  });
  
  test('测试函数', () => {
      const fn = jest.fn();
      sayHello('大圣', fn);
      expect(fn).toHaveBeenCalled(); // 判断函数是否执行
  });
  ```

  更多断言函数查阅[官网](https://www.jestjs.cn/docs/expect)

* 执行`yarn test`



### TDD开发组件

借助Vue官方推荐的[@vue/test-utils](https://next.vue-test-utils.vuejs.org/)库来测试组件的渲染。

#### demo

1. 新建`src/components/button`文件夹

2. 新建一个基础的`Button.vue`文件

   ```vue
   <!-- src/components/button/Button.vue -->
   <template>
     <div>
       <slot/>
     </div>
   </template>
   
   <script lang="ts">
   export default {
     name: 'ElButton'
   }
   </script>
   ```

3. 新建`Button.spec.ts`文件

   参考Element3的Button组件，可以通过size来配置按钮的大小。

   **先根据需求、Button的行为去书写测试案例**。

   ```typescript
   // src/components/button/Button.spec.ts
   import Button from './Button.vue';
   import {mount} from "@vue/test-utils";
   
   describe('按钮测试', () => {
       it('按钮能够显示文本', () => {
           const content = '大圣小老弟';
           const wrapper = mount(Button, {
               slots: {
                   default: content
               }
           });
           expect(wrapper.text()).toBe(content);
       });
       it('通过size属性控制大小', () => {
           const size = 'small';
           const wrapper = mount(Button, {
               props: {
                   size
               }
           });
           expect(wrapper.classes()).toContain(`el-button--${size}`);
       });
   })
   ```

   `@vue/test-utils`库中的mount函数，可以在命令行里模拟Vue的组件渲染。

   说明：

   * `wrapper.text()`能获取到组件的文本内容，然后对Button渲染结果进行判断
   * `wrapper.classes()`能获取到组件对应dom所拥有的样式类
   * 通过size参数，可以通过渲染不同的class来实现按钮的不同大小

4. 命令行执行`yarn test`来执行所有的测试代码

   此时会报错提示button上没有`el-button--small`这个样式类，但实际上我们希望会加上这个类

   ```shell
   Excepted value: "el-button--small"
   Received array: []
   ```

5. 接着我们通过实现Button组件的逻辑，去处理这个错误信息，这就是**TDD测试驱动开发**的方式。

6. 进一步丰富Button.vue

   ```vue
   <!-- src/components/button/Button.vue -->
   <template>
     <div class="el-button"
     :class="[
         size? `el-button--${size}`: '',
         ]">
       <slot/>
     </div>
   </template>
   
   <script lang="ts">
   export default {
     name: 'ElButton'
   }
   </script>
   <script setup lang="ts">
   import {computed, withDefaults} from "vue";
   interface Props {
     size?: '' | 'small' | 'medium' | 'large'
   }
   
   const props = withDefaults(defineProps<Props>(), {
     size: ''
   });
   </script>
   ```

   通过接收到的size参数去动态渲染对应的class。

   class通过Sass去修改Button的大小。

   ```scss
   // src/components/button/Button.vue
   @import "../../styles/mixin";
   
   @include b(button) {
     display: inline-block;
     cursor: pointer;
     background: $--button-default-background-color;
     color: $--button-default-font-color;
     & + & {
       margin-left: 10px;
     }
     @include button-size(
       $--button-padding-vertical,
       $--button-padding-horizontal,
       $--button-font-size,
       $--button-border-radius
     );
   
     @include m(small) {
       @include button-size(
         $--button-small-padding-vertical,
         $--button-small-padding-horizontal,
         $--button-small-font-size,
         $--button-small-border-radius
       )
     }
   
     @include m(medium) {
       @include button-size(
         $--button-medium-padding-vertical,
         $--button-medium-padding-horizontal,
         $--button-medium-font-size,
         $--button-medium-border-radius
       )
     }
     @include m(large) {
       @include button-size(
         $--button-large-padding-vertical,
         $--button-large-padding-horizontal,
         $--button-large-font-size,
         $--button-large-border-radius
       )
     }
   }
   ```

   通过`b(button)`生成`el-button`的样式类，，通过b和button-size的嵌套，就能实现按钮大小的控制。

7. 设置按钮的大小，除了通过Props传递，还可以通过**全局配置**的方式设置**默认大小**。

   1. 在`src/main.ts`文件中，设置全局变量

      ```typescript
      // src/main.ts
      // ...
      const app = createApp(App);
      app.config.globalProperties.$AILEMENTE = {
          size: 'large'
      }
          app.use(ElContainer)
              .use(ElButton)
              .mount('#app')
      ```

      通过globalProperties设置全局变量$AILEMENTE。

   2. 在src目录下新建util.ts文件

      ```typescript
      // src/util.ts
      import {getCurrentInstance, ComponentInternalInstance} from "vue";
      
      export function useGlobalConfig() {
          const instance: ComponentInternalInstance | null = getCurrentInstance();
          if (!instance) {
              console.log('useGlobalConfig必须在setup里使用');
              return;
          }
          return instance.appContext.config.globalProperties.$AILEMENTE || {};
      }
      ```

      通过Vue提供的getCurrentInstance()获取当前的实例；然后返回全局配置的`$AILEMENTE`。

      由于很多组件都需要读取全局配置，所以此处封装了`useGlobalConfig()`函数。

   3. 使用：在Button.vue文件中，通过computed返回计算后的按钮的size

      ```vue
      <template>
        <div class="el-button"
        :class="[
            buttonSize? `el-button--${buttonSize}`: '',
            ]">
          <slot/>
        </div>
      </template>
      
      <script lang="ts">
      export default {
        name: 'ElButton'
      }
      </script>
      <script setup lang="ts">
      import {computed, withDefaults} from "vue";
      import {useGlobalConfig} from "../../util";
      interface Props {
        size?: '' | 'small' | 'medium' | 'large'
        type?: '' | 'primary' | 'success' | 'warning' | 'danger'
      }
      
      const props = withDefaults(defineProps<Props>(), {
        size: '',
        type: ''
      });
      
      const globalConfig = useGlobalConfig(); // 使用全局变量
      const buttonSize = computed(() => props.size || globalConfig.size);
      </script>
      ```

      如果props.size没有传值，就使用全局的globalConfig.size；如果全局中也没配置size，就使用Sass中的默认大小。

8. 使用组件（再加一个type属性）

   ```vue
   <!-- src/App.vue -->
   <div>
     <el-button>普按钮</el-button>
     <el-button size="small">小按钮</el-button>
   
     <el-button type="primary">
       主按钮
     </el-button>
     <el-button type="success">
       绿按钮
     </el-button>
     <el-button>普按钮</el-button>
     <el-button size="small">
       小按钮
     </el-button>
   
   </div>
   ```

#### 完善测试配置

```javascript
// jest.config.js
// eslint-disable-next-line no-undef
module.exports = {
    transform: {
        '^.+\\.vue$': 'vue-jest',
        '^.+\\.jsx?$': 'babel-jest',
        '^.+\\.ts$': 'ts-jest'
    },
    testMatch: ['**/?(*.)+(spec).[jt]s?(x)'],
    collectCoverage: true,
    coverageReporters: ['json', 'html']
};
```

collectCoverage的配置为true表示需要收集代码测试覆盖率。

执行`yarn test`，根目录下会生成一个coverage目录；打开其中的`index.html`，可以在浏览器中看到测试覆盖率的报告。

在一定程度上，测试覆盖率也能够体现出代码的可维护性。

#### 完善提交步骤

在`.husky/pre-commit`文件中，添加`yarn test`命令，确保测试通过的代码才能进入git版本控制，进一步提高代码的规范和可维护性。

```shell
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

yarn lint
yarn test
```



### 总结

* 什么是自动化测试

* 通过jest框架配置了Vue的自动化测试环境

* 在Jest中，通过describe函数给测试行为分组，通过it执行测试，再利用expect语法去执行断言。

* 借助`@vue/test-utils`库可以很方便地对Vue组件进行测试

* TDD测试驱动开发的开发模式。

  先根据功能需求，写出测试案例，根据测试报错信息，开始实现功能，最终让测试代码全部通过，用这样的方式来检验开发的结果。

  优势：可以随时检验代码的逻辑，能极大提高代码的可维护性。

**其他**

1. 执行测试报错，`ReferenceError: module is not defined in ES module scope`。

解决：将package.json中的`"type": "module"`去掉。