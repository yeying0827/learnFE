## Vue实战：vue-property-decorator

项目中引入了一个库`vue-property-decorator`。使我们可以使用基于类的注解装饰器进行开发，语法有点像Angular。

另一个库`vue-class-component`，是Vue官方推出的一个支持使用class方式来开发vue单文件组件的库。

`vue-property-decorator`正式基于此而来，它在此基础上增加了装饰器相关的功能。



### 主要功能

vue-class-component功能如下：

* methods可以直接声明为类的成员方法
* 计算属性可以被声明为类的属性访问器
* 初始化的data可以被声明为类属性
* data、render以及所有的Vue生命周期钩子可以直接作为类的成员方法
* 所有其他属性，需要放在装饰器中

vue-property-decorator主要提供了多个装饰器和一个函数：

* @Prop
* @PropSync
* @Model
* @Watch
* @Provide
* @Inject
* @ProvideReactive
* @InjectReactive
* @Emit
* @Ref
* @Component（由vue-class-component提供）
* Mixins（由vue-class-component提供）



### vue-class-component主要功能

#### @Component

Component装饰器它注明了此类为一个Vue组件，因此即使没有设置选项也不能省略。

如果需要定义比如name、components、filters、directives以及自定义属性，就可以在Component装饰器中定义。

🌰：在JavaScript中定义一个组件

```javascript
import { componentA, componetB } from '@/component';

export default {
  components: {
    componentA,
    componentB,
  },
  directives: {
    focus: {
      // 指令的定义
      inserted: function(el) {
        el.focus();
      }
    }
  }
}
```

在TypeScript中可以如下定义：

```typescript
// src/components/TestSyntax.vue
import { Component, Vue } from "vue-property-decorator";
import componentA from "@/components/componentA.vue";
import componentB from "@/components/componentB.vue";

@Component({
  components: {
    componentA,
    componentB
  },
  directives: {
    focus: {
      inserted(el) {
        el.focus();
      }
    }
  }
})
export default class TestSyntax extends Vue {}
```

#### Computed、Data、Methods语法

取消了组件的data和methods属性，需要直接定义在Class中，当作类成员的属性和方法。

```typescript
// src/components/componentA.vue
import { Component, Vue } from "vue-property-decorator";

@Component
export default class componentA extends Vue {
  // 类成员属性相当于以前的data
  count: number = 123;

  // 类成员方法就是以前的methods
  add(): number {
    return this.count ++;
  }

  // 获取计算属性
  get total(): number {
    return this.count;
  }

  // 设置计算属性
  set total(param: number) {
    this.count = param;
  }
}
```



### vue-property-decorator主要API

#### @Prop

这个装饰器是Prop相关的装饰器，`@Prop(options: (PropOptions | Constructor[] | Constructor) = {})`。

使用Prop装饰器定义Prop时，如果在tsconfig.json中配置了`strictPropertyInitialize`选项，就需要通过附加一个`!`给定义的属性，表示显示赋值断言。

🌰：在JavaScript中定义Prop

```javascript
export default {
  props: {
    propA: String,
    propB: [String, Number],
    propC: {
      type: Array,
      default: () => {
        return ['a', 'b']
      },
      required: true,
      validator: (value) => {
        return [
          'a',
          'b'
        ].indexOf(value) !== -1
      }
    }
  }
}
```

使用TypeScript如下：

```typescript
// src/components/componentB.vue
import {Component, Prop, Vue} from "vue-property-decorator";

@Component
export default class componentB extends Vue {
  @Prop(String)
  propsA!: string;

  @Prop([String, Number])
  propB!: string|number;

  @Prop({
    type: Array,
    default: () => {
      return ['a', 'b']
    },
    required: true,
    validator(value: any): boolean {
      return [
          'a',
          'b'
      ].indexOf(value) !== -1
    }
  })
  propC!: [];
}
```

#### @Watch

这个装饰器就是Vue中的监听器。

`@Watch(path: string, options: WatchOptions = {})`

JavaScript版本写法：

```javascript
export default {
  watch: {
    child: [
      {
        handler: 'onChildChanged',
        immediate: false,
        deep: false,
      }
    ],
    person: [
      {
        handler: 'onPersonChanged1',
        immediate: true,
        deep: true,
      },
      {
        handler: 'onPersonChanged2',
        immediate: false,
        deep: false,
      }
    ]
  },
  methods: {
    onChildChanged(val, oldVal) {},
    onPersonChanged1(val, oldVal) {},
    onPersonChanged2(val, oldVal) {},
  }
}
```

在TypeScript中：

```typescript
// src/components/componentC.vue
import {Component, Vue, Watch} from "vue-property-decorator";

@Component
export default class componentC extends Vue {
  @Watch('child')
  onChildChanged(val: string, oldVal: string) {}

  @Watch('person', { immediate: true, deep: true })
  onPersonChanged1(val: Person, oldValue: Person) {}

  @Watch('person')
  onPersonChanged2(val: Person, oldValue: Person) {}
}
```

使用了装饰器代码简洁了不少。

#### @Emit

在Vue中事件的监听与触发，Vue提供了两个函数`$emit`和`$on`。在`vue-property-decorator`中如何使用？

这就需要用到`vue-property-decorator`提供的@Emit装饰器。

JavaScript代码：

```javascript
import Vue from 'vue';
export default {
  mounted() {
    this.$on('emit-todo', function(n){
      console.log(n);
    });
    this.emitTodo('world');
  },
  methods: {
    emitTodo(n) {
      console.log('hello');
      this.$emit('emit-todo', n);
    }
  }
}
```

使用TypeScript实现：

```typescript
// src/components/componentD.vue
import {Component, Emit, Vue} from "vue-property-decorator";

@Component
export default class componentD extends Vue {
  mounted() {
    this.$on('emit-todo', function (n) {
      console.log(n);
    });
    this.emitTodo('world');
  }

  @Emit()
  emitTodo(n: string) {
    console.log('hello');
  }
}
```

使用`@Emit`装饰器的函数，会在运行之后触发等同于其函数名（驼峰式会转为横杠式写法）的事件，并将其参数传递给`$emit`。假设想触发特定的事件，可以这么做：

```typescript
// src/components/componentD.vue
import {Component, Emit, Vue} from "vue-property-decorator";

@Component
export default class componentD extends Vue {
  mounted() {
    this.$on('emit-todo', function (n) {
      console.log(n);
    });
    this.emitTodo('world');
  }

  @Emit('reset') // ##传递参数
  emitTodo(n: string) {
    console.log('hello');
  }
}
```

给装饰器@Emit传递一个事件名参数，这样函数emitTodo运行后就会触发`'reset'`事件。

@Emit装饰的函数所接受的参数，会在运行之后触发事件的时候传递过去。

@Emit触发事件有两种方式：

1. `@Emit()`不传参数，则触发的事件名就是它所装饰的函数名
2. `Emit(name: string)`传递一个字符串，该字符串为要触发的事件名

#### @Model

Vue组件提供`model: {prop?: string, event?: string}`让我们可以定制prop和event。

默认情况下，一个组件上的v-model会把value用作prop，把input用作event；但是一些输入类型比如单选框和复选框可能想使用value prop来达到不同的目的，使用model选项可以回避这些情况产生的冲突。

比如：

```javascript
Vue.component('my-checkbox', {
  model: { // 指定v-model的绑定的prop是`checked`
    prop: 'checked',
    event: 'change',
  },
  props: {
    // this allows using the `value` prop for a different purpose
    value: String,
    // use `checked` as the prop which take the place of `vale`
    checked: {
      type: Number,
      default: 0
    }
  },
  // ...
})
```

在template中使用：

```html
<my-checkbox v-model="foo" value="some value"></my-checkbox>
```

此时模板相当于：

```html
<my-checkbox
   :checked="foo"
   @change="val => { foo = vale }"
   value="some value"></my-checkbox>
```

用vue-property-decorator提供的`@Model`改造上面的例子：

```typescript
// src/components/componentE.vue
import {Component, Model, Vue} from "vue-property-decorator";

@Component
export default class componentE extends Vue {
  @Model('change', { type: Boolean })
  checked!: boolean;
}
```

`@Model()`接收两个参数，第一个是event的值，第二个是prop的类型说明。



### 小结

TypeScript版的Vue Class化的语法，多处用到装饰器和Class。