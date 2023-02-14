## TypeScript：Vue3中使用TS

有时我们需要放弃一些灵活性去换取项目的整体收益，比如使用template。

语言层面上，TypeScript提高了代码可维护性和调试效率。

### 什么是TypeScript

TypeScript的主要作用是给JavaScript赋予强类型的语言环境。

TypeScript相当于在JavaScript外面包裹了一层类型系统，可以帮助我们开发更健壮的前端应用。

好处：如果项目中的每个变量、每个接口都能在声明的时候定义好类型，那么很多错误在开发阶段就可以提前被TypeScript识别。

每个函数的参数、返回值的类型和属性都清晰可见，极大地提高我们代码的可维护性和开发效率。

TypeScript能够智能地去报错和提示，阅读和调试代码的难度也降低了很多。

泛型让我们拥有了根据输入的类型去实现函数的能力，让人感受到TypeScript类型可以进行动态设置。

TypeScript的类型其实是可以编程的，可以根据类型去组合推导新的类型，甚至可以使用extends去实现递归类型。



### Vue3中的TypeScript

TypeScript对代码书写的要求更高。

Vue2中全部属性都挂载在`this`之上，而this可以说是一个黑盒子，我们完全没办法预知this上会有什么数据，这也是为什么Vue2对TypeScript的支持一直不太好的原因。

Vue3中使用TypeScript：

需要再script标签上加一个配置`lang="ts"`，来标记当前组件使用了TypeScript，然后代码内部使用defineComponent定义组件即可。

```vue
<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
  // 启用类型推断
})
</script>
```

在`<script setup>`内部，需要调整写法的内容不多。使用Composition API的过程中，TypeScript可以针对ref或reactive进行类型推导。

```typescript
let title = ref("");
title.value = 1; // Assigned expression type 1 is not assignable to type string
```

我们也可以显式地去规定ref、reactive和computed输入的属性。以下代码演示了ref、reactive和computed限制类型的写法，每个函数都可以使用默认的参数推导，也可以显式地通过泛型去限制。

```vue
<script setup lang="ts">
import {computed, reactive, ref} from '@vue/runtime-core';
interface Course {
  name: string,
  price: number
}
const msg = ref('') // 根据输入参数推导字符串类型
const msg1 = ref<string>('') // 通过泛型显式约束

const obj = reactive({})
const cource = reactive<Course>({name: '1', price: 123})

const msg2 = computed(() => '') // 默认参数推导
const course2 = computed<Course>(() => ({name: '1', price: 129}))
</script>
```

在Vue中，除了组件内部数据的类型限制，还需要对传递的属性Props声明类型。在`<script setup>`语法中，只需要在defineProps和defineEmits声明参数类型就可以了。

```typescript
const props = defineProps<{
  title: string,
  value?: number
}>()
const emit = defineEmit<{
  (e: 'update', value: number): void
}>()
```

🌰：代码改造，清单应用

定义Todo接口，然后初始化todos，Vue也暴露Ref类型，todos是Ref包裹的数组。

```typescript
// src/components/Todolist.vue
import {ref, Ref} from "vue";

interface Todo {
  title: string,
  done: boolean
}
let todos: Ref<Todo[]> = ref([{ title: '学习vue3 & typescript', done: false }]);
```

当你需要了解Composition API所有的类型设置的时候，可以进入项目目录下面的`node_modules/@vue/reactivity/dist/reactivity.d.ts`中查看。

vue-router的优化相关：用户路由的配置使用`RouteRecordView`来定义，返回的router实例使用类型Router来定义，这两个类型都是vue-router内置的。

🌰：文件后缀改为`.ts`

```typescript
// src/router/index.ts
import {createRouter, createWebHashHistory, Router, RouteRecordRaw} from 'vue-router';
// ...

const routes: Array<RouteRecordRaw> = [
    // ...
];

const router: Router = createRouter({
    history: createWebHashHistory(),
    // history: createWebHistory(),
    routes
});

export default router;
```

在`RouteRecordRaw`类型的限制下，你在注册路由的时候，如果参数有漏写或者格式不对的情况，那就会在调试窗口里看到报错信息；而不必等到运行时才发现。



### TypeScript和JavaScript的平衡

TypeScript引入的强类型系统带来了可维护性较好、调试较为方便的好处。

TypeScript是JavaScript的一个超集，两者并不是完全对立的关系。

打好坚实的JavaScript基础，在维护复杂项目和基础库的时候选择TypeScript。

TypeScript最终还是要编译成为JavaScript，并在浏览器里执行。对于浏览器厂商来说，引入类型系统的收益并不太高，毕竟编译需要时间，会影响运行时的性能。所以未来TypeScript很难成为浏览器的语言标准。

核心还是要掌握JavaScript，在这个基础之上，无论是框架，还是TypeScript类型系统，我们都将其作为额外的工具使用。



### 总结

对代码的开发效率是一个很大的提升。
