## 新的代码组织方式：composition api和`<script setup>`的优势

🌰：重构清单应用

composition api可以让我们更好地组织代码结构

`<script setup>`本质上是以一种更精简的方式来书写composition api。

### composition api和`<script setup>`上手

```vue
<!-- src/components/Counter.vue -->
<template>
  <h1 @click="add">{{count}}</h1>
</template>

<script setup>
import {ref} from "vue";

let count = ref(1);

function add() {
  count.value ++;
}
</script>

<style>
h1 {
  color: red;
}
</style>
```

上述代码中，script标签放置逻辑代码，并且用setup标记我们使用`<script setup>`的语法。

ref函数包裹数字，返回的count变量就是响应式的数据；对于ref返回的响应式数据，我们需要修改`.value`才能生效。

**在`<script setup>`标签内定义的变量和函数，都可以在模板中直接使用**。

当我们在`src/pages/Home.vue`组件中，直接`import Counter`组件，`<script setup>`会自动把组件注册到当前组件，可以直接在template中使用。

通过**基于组件去搭建应用的方式**，可以实现对业务逻辑的复用。



### 计算属性

在composition api的语法中，**计算属性和生命周期等功能，都可以脱离vue的组件机制单独使用**。

```vue
<!-- src/components/Todolist.vue -->
<script setup>
import {ref, computed} from "vue";

function useTodos() {
  // ...
  
  let active = computed(() => {
    return todos.value.filter(v => !v.done).length;
  });
  let all = computed(() => {
    return todos.value.length;
  });
  let allDone = computed({
    get: function() {
      return active.value === 0;
    },
    set: function (value) {
      todos.value.forEach(v => v.done = value);
    }
  })
  
  // ...
}

// ...
</script>
```

第二讲的computed是组件的一个配置项，而这里的computed的用法是单独引入使用。



### composition api拆分代码

如上例，如果在一个页面里有累加器和清单两个功能，就需要在data和methods里分别进行配置；使用composition api的逻辑来拆分代码，就**可以把一个功能相关的数据和方法都维护在一起**。

但所有功能代码都写在一起的话，也会带来一些问题；随着功能越来越复杂，script内部的代码也会越来越多；此时可以进一步对代码进行拆分，把功能独立的模块封装成一个独立的函数，真正做到按需拆分。

比如新增一个函数`useTodos()`

这个函数就是把那些和清单相关的所有数据和方法，都放在函数内部定义并且返回，这样这个函数就可以放在任意的地方来维护。

组件入口，也就是`<script setup>`中的代码，就可以变得非常简单和清爽了。

`let {title, todos, addTodo, all, active, clear, allDone} = useTodos();`

执行useTodos的时候，ref、computed等功能都是从Vue中单独引入，而不是依赖this上下文。

可以把组件内部的任何一段代码，从组件文件里抽离出一个独立的文件进行维护。

🌰：追踪鼠标位置的需求

```javascript
// src/utils/mouse.js
import {ref, onMounted, onUnmounted} from 'vue';

export function useMouse() {
    const x = ref(0);
    const y = ref(0);

    function update(e) {
        x.value = e.pageX;
        y.value = e.pageY;
    }

    onMounted(() => {
        window.addEventListener("mousemove", update);
    });

    onUnmounted(() => {
        window.removeEventListener("mousemove", update);
    });

    return {x, y};
}
```

监听`mousemove`事件，需要在组件加载完毕后执行，在composition api中，可以直接引入onMounted和onUnmounted来实现生命周期的功能。

组件加载的时候，会触发onMounted生命周期，执行监听mousemove事件，从而去更新鼠标位置的x和y的值；组件卸载的时候，会触发onUnmounted生命周期，解除mousemove事件。

完成了鼠标事件封装之后，在组件的入口就可以和普通函数一样使用useMouse函数。

```vue
<!-- src/components/Counter.vue -->
<template>
  <h1 @click="add">{{count}}</h1>
  <span>x: {{x}}, y: {{y}}</span>
</template>

<script setup>
import {ref} from "vue";
import {useMouse} from "../utils/mouse";

let count = ref(1);

function add() {
  count.value ++;
}

let {x, y} = useMouse();
</script>
```

（一个页面多次调用此函数，事件监听会不会冲突？）

因为ref和computed等功能都可以从Vue中全局引入，所以我们就**可以把组件进行任意颗粒度的拆分和组合**，这样就大大提高了代码的可维护性和复用性。



### `<script setup>`好用的功能

`<script setup>`是为了提高我们使用composition api的效率而存在的。

普通写法：

```vue
<script>
import {ref} from 'vue';
export default {
  setup() {
    // ...
    return {
      count,
      add
    }
  }
}
</script>
```

要在setup函数中，返回所有需要在模板中使用的变量和方法。

使用`<script setup>`可以让代码变得更加精简。`<script setup>`还有其他一些很好用的功能，比如能够使用顶层的await去请求后端的数据等等。



### style样式的特性

在style标签加上scoped这个属性时，解析后的代码中，标签和样式选择器上，新增了`data-`的前缀，确保只在当前组件生效。

如果在scoped内部，你还想写全局的样式，那么你可以用`:global`来标记，这样能确保你可以很灵活地组合你的样式代码。

在style内部，还可以使用v-bind函数，直接在CSS中使用JavaScript中的变量，编译后其实就是CSS变量。

🌰：

```vue
<template>
  <h1 @click="add">{{count}}</h1>
</template>

<script setup>
import {ref} from "vue";

let count = ref(1);
const color = ref("red");

function add() {
  count.value ++;
  color.value = Math.random() > 0.5? "red": "blue";
}
</script>

<style scoped>
h1 {
  color: v-bind(color);
}
</style>
```

上述代码中，使用v-bind函数绑定color的值，就可以动态地通过JavaScript的变量实现CSS的样式修改。



### 总结

在composition api的语法中，所有的功能都是通过全局引入的方式使用的，并且通过`<script setup>`的功能，我们定义的变量、函数和引入的组件，都不需要额外的生命周期，就可以直接在模板中使用。

通过把功能拆分成函数和文件的方式，可以任意拆分组件的功能，抽离出独立的工具函数，大大提高了代码的可维护性。

可以通过v-bind函数来使用JavaScript中的变量去渲染样式



疑问❓

1. 如果计算属性较多，频繁写computed会有点麻烦？
2. 频繁import ref、computed等？https://github.com/antfu/unplugin-auto-import

