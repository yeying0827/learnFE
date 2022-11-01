## Vue实战： TypeScript下的Vuex

继续对逻辑层进行实现。

选择全局状态管理工具vuex；在TypeScript中vuex往往要与vuex-class进行配合，它同样提供了多个装饰器供我们使用。

安装vuex-class

```shell
$ yarn add vuex-class
```

### 创建todo任务逻辑

新建`src/store/state.ts`文件，定义State的类型和初始值：

```typescript
// src/store/state.ts
export enum Mode {
    edit, // 处于编辑状态
    finish // 处于编辑完成状态
}

export interface ITodoItem {
    id: string // todo任务的id
    name: string // todo任务的名称
    isDone: boolean // 任务是否完成
    iconName: string // 任务的图标
    color: string // 任务图标底色
    mode: Mode // 编辑状态
}

export interface State {
    todoList: Array<ITodoItem>
}

export const state: State = {
    todoList: []
}
```

新建`src/store/mutations.ts`文件，**编写创建todo的逻辑**：接收一个todo对象，把它添加到todoList数组中即可：

```typescript
// src/store/mutations.ts
import {MutationTree} from "vuex";
import {ITodoItem, State} from "@/store/state";

export const mutations: MutationTree<State> = {
    // 创建todo
    createTodoItem(state: State, item: ITodoItem) {
        state.todoList.push(item);
    }
}
```

如何在组件中使用`mutations`？

```typescript
// src/components/Header.vue
import { Component, Vue } from 'vue-property-decorator';
import {Icon} from "vant";

import { Mutation, State } from "vuex-class"; // #
import {ITodoItem, Mode} from "@/store/state"; // #
import {_}from "@/utils"; // # 一个工具文件，从作者的示例库中拷贝过来

@Component({
  components: {
    [Icon.name]: Icon,
  }
})
export default class Header extends Vue {
  @State private todoItem!: ITodoItem[]; // #
  @Mutation private createTodoItem!: (todo: ITodoItem) => void; // #

  private createTodoItemHandle() { // #
    const newItem: ITodoItem = {
      id: _.uuid(),
      name: '新任务',
      isDone: false,
      mode: Mode.edit,
      iconName: 'yingtao',
      color: '#ffcc22',
    }
    this.createTodoItem(newItem);
  }
  
  // ...
}
```

@Mutation就是vuex-class提供的装饰器，它可以帮助我们把相关的mutations作为类成员来使用。



### 自定义todo内容

点击了`+`按钮之后，创建了新的todo任务，然后进入了自定义todo任务的编辑页面，我们可以选择背景颜色和图标，也可以自定义任务名称。

**这些逻辑统一在mutations中实现**：

```typescript
// src/store/mutations.ts
import {MutationTree} from "vuex";
import {ITodoItem, State} from "@/store/state";
import {_} from "@/utils"; /#

export const mutations: MutationTree<State> = {
    // 创建todo
    createTodoItem(state: State, item: ITodoItem) {
        state.todoList.push(item);
    },
    // 选择图标背景色
    selectColor(state: State, payload: { id: string, color: string }) { // #
        const list = state.todoList;
        const todo = _.find(list, payload.id);

        if (todo) {
            todo.color = payload.color;
        }
    },
    // 选择图标
    selectIcon(state: State, payload: { id: string, icon: string }) { // #
        const list = state.todoList;
        const todo = _.find(list, payload.id);

        if (todo) {
            todo.iconName = payload.icon;
        }
    },
    // 编辑任务名称
    changeName(state: State, payload: { id: string, value: string }) { // #
        const list = state.todoList;
        const todo = _.find(list, payload.id);

        if (todo) {
            todo.name = payload.value;
        }
    }
}
```

再借助vuex-class把它们作为类的成员使用，`src/views/Create.vue`的内容：

```typescript
// src/views/Create.vue
import { Component, Vue } from "vue-property-decorator";
import {SwipeCell, Cell, CellGroup, Field} from "vant";
import CircleIcon from "@/components/CircleIcon.vue";
import Icon from "@/components/Icon.vue";
import {config} from "@/config";
import {ITodoItem} from "@/store/state"; // #
import {Getter, Mutation} from "vuex-class"; // #
import { _ } from "@/utils"; // #

@Component({
  components: {
    [SwipeCell.name]: SwipeCell,
    [Cell.name]: Cell,
    [CellGroup.name]: CellGroup,
    [Field.name]: Field,
    CircleIcon,
    Icon
  }
})
export default class Create extends Vue {
  private iconSetting: string[] = config.iconSetting;
  private colorSetting: string[] = config.colorSetting;

  private id!: string // #
  private index!: number // #
  private currentItem!: ITodoItem // #
  @Mutation private selectColor!: (payload: { id: string, color: string }) => void; // #
  @Mutation private selectIcon!: (payload: { id: string, icon: string }) => void; // #
  @Mutation private changeName!: (payload: { id: string, value: string }) => void; // #
  @Getter private getCurrentTodoList!: ITodoItem[]; // #

  // 获取当前将要创建的todo的id
  private mounted() { // #
    console.log(this.getCurrentTodoList);
    const list = this.getCurrentTodoList;
    this.index = list.length - 1;
    const currentItem = list[this.index];
    this.id = currentItem.id;
  }

  // 计算当前icon名称
  private get iconComputed() { // #
    const currentItem = _.find(this.getCurrentTodoList, this.id);
    const { iconName } = currentItem!;
    return iconName;
  }

  // 计算当前背景颜色
  private get colorComputed() { // #
    const currentItem = _.find(this.getCurrentTodoList, this.id);
    const { color } = currentItem!;
    return color;
  }

  private changeColorHandle(color: string) { // #
    this.selectColor({ id: this.id, color });
  }

  private changeIconHandle(name: string) { // #
    this.selectIcon({ id: this.id, icon: name });
  }

  private get nameComputed() { // #
    const  todo =  _.find(this.getCurrentTodoList, this.id);
    return todo!.name;
  }

  private set nameComputed(name) { // #
    this.changeName({ id: this.id, value: name });
  }
}
```

@Getter装饰器就是将Vuex中的Getter添加到类成员上。这里把todoList这个数组引入进来，方便操作。

```html
<!-- src/views/Create.vue template部分 -->
<div class="create">
    <!-- 任务图标 -->
    <section class="icon-block">
      <CircleIcon class="cir" :active-color="colorComputed" radius="3.5rem">
        <Icon :name="iconComputed" slot="icon"></Icon><!-- #增加计算属性 背景颜色和图标 -->
      </CircleIcon>
    </section>
    <!-- 任务名称 -->
    <section>
      <van-cell-group>
        <van-field
            input-align="center"
            placeholder="请输入任务名"
            v-model="nameComputed"
            value="新任务"
            clickable
            maxlength="6"
        ></van-field><!-- #绑定v-model -->
      </van-cell-group>
    </section>
    <!-- 备选图标 -->
    <section class="alternative">
      <div
        class="alternativeIcon"
        v-for="(item, index) in iconSetting"
        @click="changeIconHandle(item)"
        :key="index"
      >
        <Icon :name="item"></Icon><!-- #增加点击事件 -->
      </div>
    </section>
    <!-- 图标背景 -->
    <section class="colorSetting">
      <div
        class="background"
        v-for="(item, index) in colorSetting"
        @click="changeColorHandle(item)"
        :key="index"
      >
        <div v-bind:style="{ backgroundColor: item }"></div><!-- #增加点击事件 -->
      </div>
    </section>
  </div>
```

修改store文件内容：

```typescript
// src/store/getter.ts
import {State} from "@/store/state";
import {ITodoItem} from "@/store/state";

export const getters = {
    getCurrentTodoList(state: State): ITodoItem[] {
        return state.todoList;
    }
};

// src/store/index.ts
import Vue from "vue";
import Vuex from "vuex";
import {state} from "@/store/state"; // #
import {mutations} from "@/store/mutations"; // #
import {getters} from "@/store/getters"; // #
import VuexPersistence from 'vuex-persist'; // #

Vue.use(Vuex);

const vuexLocal = new VuexPersistence({ // #
  storage: window.localStorage
})

export default new Vuex.Store({
  state: state, // #
  mutations: mutations, // #
  getters, // #
  actions: {},
  modules: {},
});
```

使用`vuex-persist`给vuex的数据做持久化处理

安装vuex-persist：

```shell
$ yarn add nanoid ## 生成id
$ yarn add vuex-persist ## vuex持久化
```



### 删除、完成todo任务

创建完任务之后回到首页，会发现多出了一个todo任务，此时需要两个逻辑：

* 任务完成逻辑
* 删除任务逻辑

依旧在mutations中添加相关逻辑：

```typescript
// src/store/mutations.ts
import {MutationTree} from "vuex";
import {ITodoItem, State} from "@/store/state";
import {_} from "@/utils";

export const mutations: MutationTree<State> = {
    // 创建todo
    // ...
    // 选择图标背景色
    // ...
    // 选择图标
    // ...
    // 编辑任务名称
    // ...
    // 删除任务
    deleteTodoItem(state: State, id: string) {
        const list: ITodoItem[] = state.todoList;
        state.todoList = list.filter(item => item.id !== id);
    },
    // 标记任务完成
    doneTodoItem(state: State, id: string) {
        const list: ITodoItem[] = state.todoList;
        const todo = _.find(list, id);

        if (todo) {
            todo.isDone = true;
        }
    }
}
```

修改`Home.vue`的代码：

```vue
<template>
  <div class="home">
    <transition-group
      name="fade"
      tag="ul"
      class="list-group"
    >
      <TodoItem
        v-for="item in TodoListComputed"
        :key="item.id"
        @click-right="delHandle(item.id)"
        @click-left="doneHandle(item.id)"
        :id="item.id"
        :color="item.color"
        :name="item.name"
        :is-done="item.isDone"
        :icon-name="item.iconName"
        right-value="删除"
        left-value="完成"
      ></TodoItem>
    </transition-group>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import {Mutation, State, Getter} from "vuex-class";
import TodoItem from "@/components/TodoItem.vue";
import {ITodoItem, Mode} from "@/store/state";

@Component({
  components: {
    TodoItem
  }
})
export default class Home extends Vue {
  @Mutation private deleteTodoItem!: (id: string) => void;
  @Mutation private doneTodoItem!: (id: string) => void;
  @Getter private getCurrentTodoList!: ITodoItem[];

  private get TodoListComputed() {
    const list = this.getCurrentTodoList.filter(item => !item.isDone);

    return list;
  }

  private delHandle(id: string) {
    this.deleteTodoItem(id);
  }

  private doneHandle(id: string) {
    this.doneTodoItem(id);
  }
}
</script>

<style lang="scss">
// ...
</style>
```

Home.vue中展示列表，将列表项单列一个组件`TodoItem.vue`

```vue
<template>
  <div class="habitList">
    <van-swipe-cell :right-width="65" :left-width="65" class="listSwipe">
      <aside
        class="edit"
        v-if="leftValue"
        slot="left"
        @click="$emit('click-left', id)"
      >
        {{ leftValue }}
      </aside>
      <slot
        v-else
        slot="left"
        @click="$emit('click-right', id)"
        name="act"
      ></slot>
      <van-cell-group class="listGroup">
        <van-cell class="van-ellipsis listCell" :style="{ background: color }">
          <template slot="title">
            <Icon :name="iconName" />
            <span>{{ name }}</span>
          </template>
          <van-icon v-if="isDone" name="certificate"></van-icon>
        </van-cell>
      </van-cell-group>
      <aside
        class="delete"
        v-if="rightValue"
        slot="right"
        @click="$emit('click-right', id)"
      >
        {{ rightValue }}
      </aside>
    </van-swipe-cell>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue} from "vue-property-decorator";
import {SwipeCell, CellGroup, Cell, Icon as VantIcon} from "vant";
import Icon from "@/components/Icon.vue";

@Component({
  components: {
    [SwipeCell.name]: SwipeCell,
    [Cell.name]: Cell,
    [CellGroup.name]: CellGroup,
    [VantIcon.name]: VantIcon,
    Icon,
  }
})
export default class TodoItem extends Vue {
  @Prop() private name!: string;
  @Prop() private iconName!: string;
  @Prop() private color!: string;
  @Prop() private isDone!: boolean;
  @Prop() private id!: string;
  @Prop() private rightValue?: string;
  @Prop() private leftValue?: string;

}
</script>

<style lang="scss" scoped>
//字体大小、行高、字体
// ...
</style>
```



### 小结

基本功能完成。

借助TypeScript + Vue完成一个简单的TODO应用

Vue2.6x虽然对TypeScript的支持有了一定进步，但整体的代码提示还是不到位，语法噪音依然非常大。

注：项目代码存在bug，第一个TODO插入后，继续添加第二个todo进入编辑，会保留第一个todo的数据，点击操作不会更新页面。