## Vue实战：组件UI编写

把一些重要的API用法带到实战项目中

### Header组件编写

在`src/components`目录下新建`Header.vue`单文件，在这里编写一个`Header`组件。

`Header`组件其实是一个头部组件，会显示当前页面的标题和导航、操作按钮。

这里展示两个知识点：

* 计算属性的使用
* 方法的使用

计划只用两个路由，一个home路由存放各种todo的列表，另一个create路由用于新建todo。

我们需要根据不同的路由来生成不同的Header。这个时候用计算属性比较适合。

TypeScript中的计算属性是用类的属性存取器来实现的，比如方法为`pageInfoComputed`，需要在其前面加上`get`。

```typescript
import { Component, Vue } from 'vue-property-decorator';
import {Icon} from "vant";

@Component({
  components: {
    [Icon.name]: Icon,
  }
})
export default class Header extends Vue {
  private get pageInfoComputed() {
    const currentRouteName = this.$route.name;
    switch(currentRouteName) {
      case "home":
        return {
          icon: {
            name: "plus",
            arrow: "right"
          },
          title: "我的待办"
        };
      case "create":
        return {
          icon: {
            name: "arrow-left",
            arrow: "left"
          },
          title: "新建任务"
        };
      default:
        return "";
    }
  }
}
```

如果我们想要声明两个方法，分别对应两个不同的Icon对应的行为，一个是跳转到create路由，一个是路由后退。

在TypeScript中直接使用类方法即可，也可以加上访问修饰符：

```typescript
import { Component, Vue } from 'vue-property-decorator';
import {Icon} from "vant";

@Component({
  components: {
    [Icon.name]: Icon,
  }
})
export default class Header extends Vue {
  private get pageInfoComputed() {
    // ...
  }

  private leftHandle() {
    this.$router.back();
  }

  private rightHandle() {
    this.$router.push({ path: '/create' });
  }
}
```

在模板中使用：

```html
<header>
    <div>
      <van-icon
        v-if="pageInfoComputed.icon.arrow === 'left'"
        :name="pageInfoComputed.icon.name"
        size="1.5rem"
        @click="leftHandle"
      ></van-icon>
    </div>
    <h3>{{ pageInfoComputed.title }}</h3>
    <div>
      <van-icon
        v-if="pageInfoComputed.icon.arrow === 'right'"
        :name="pageInfoComputed.icon.name"
        size="1.5rem"
        @click="rightHandle"
      ></van-icon>
    </div>
 </header>
```



### 图标组件编写

计划每一个todo任务都配上一个图标。

这个组件由两个主要部分组成：

* 圆圈：包括外围的border和背景色
* icon：中间的图案

**先编写圆圈部分。**

在`src/components`目录下新建`Circle.vue`单文件，编写一个`Circle`组件。

然后还有一个需求，就是可以随时切换背景颜色，所以需要一个方法来根据外部属性的变化来更改自己的背景颜色。

这里使用`@Watch`监听器装饰器。

```typescript
import {Component, Vue, Prop, Watch} from "vue-property-decorator";

@Component
export default class CircleIcon extends Vue {
  @Prop() private radius!: string
  @Prop() private activeColor!: string
  private styleObj = {
    background: this.activeColor || '#ffe78d',
    width: this.radius || '3rem',
    height: this.radius || '3rem'
  }

  // 监听背景颜色变化
  @Watch('activeColor')
  private changeColor(val: string, oldVal: string) {
    this.styleObj.background = val;
  }
}
```

在模板里留一个插槽，给之后的Icon使用：

```html
<div class="circle-icon" :style="styleObj">
    <slot name="icon"></slot>
 </div>
```

**继续编写Icon部分。**

图标可以去[阿里巴巴矢量图标库](https://www.iconfont.cn/)寻找

可以到[作者的仓库](https://github.com/xiaomuzhu/vue-ts-todo/blob/v1.1/src/assets/iconfont.js)下`src/assets/iconfont.js`中直接用打包好的图标

在`src/main.ts`中引入：

```typescript
import Vue from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";
import store from "./store";
import './assets/iconfont'; // #引入

// ...
```

想要使用这些图标还需要额外编写一些代码，也可以用现成的库来方便我们的使用。

下载帮助我们使用图标的库：

```shell
npm i -S vue-icon-font-pro ## 网络问题下载不了此库。。。
```

自己编写：

在App.vue中添加样式

```scss
.icon {
  width: 20px;
  height: 20px;
  fill: currentColor;
  overflow: hidden;
}
```

编写Icon组件

```vue
<template>
  <svg class="icon" aria-hidden="true" v-html="svgInner">
<!--    <use :xlink:href="#icon-{name}"></use>-->
  </svg>
</template>

<script lang="ts">
import {Component, Vue, Prop} from "vue-property-decorator";

@Component
export default class Icon extends Vue {
  @Prop() private name!: string;

  private get svgInner() {
    return `<use xlink:href="#icon-${this.name}"></use>`;
  }
}
</script>
```



### 编写Create页面

我们可以自由地选择背景颜色和图标来组成一个todo图标，还可以给这个todo起一个任务名称。

这么多图标和颜色分别放在两个数组里，新建`src/config.ts`，然后将数组放在其中。

```typescript
export const config = {
    iconSetting: [
        "yingtao",
        // ...
    ],
    colorSetting: [
        "#DDDDDD",
        // ...
    ]
};
```

`src/views/Create.vue`页面分为四部分：

* todo图标：这个图标会随着选择的背景颜色和图标而变化
* 任务名称：是个输入框，用于填写任务名称
* 图标集合
* 颜色集合

```typescript
import { Component, Vue } from "vue-property-decorator";
import {SwipeCell, Cell, CellGroup, Field} from "vant";
import CircleIcon from "@/components/CircleIcon.vue";
import Icon from "@/components/Icon.vue";
import {config} from "@/config";

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
}
```

模板：

```html
<div class="create">
    <!-- 任务图标 -->
    <section class="icon-block">
      <CircleIcon class="cir" radius="3.5rem">
        <Icon name="kite" slot="icon"></Icon>
      </CircleIcon>
    </section>
    <!-- 任务名称 -->
    <section>
      <van-cell-group>
        <van-field input-align="center" placeholder="请输入任务名"></van-field>
      </van-cell-group>
    </section>
    <!-- 备选图标 -->
    <section class="alternative">
      <div
        class="alternativeIcon"
        v-for="(item, index) in iconSetting"
        :key="index"
      >
        <Icon :name="item"></Icon>
      </div>
    </section>
    <!-- 图标背景 -->
    <section class="colorSetting">
      <div
        class="background"
        v-for="(item, index) in colorSetting"
        :key="index"
      >
        <div v-bind:style="{ backgroundColor: item }"></div>
      </div>
    </section>
 </div>
```



至此，页面UI差不多完成了。（样式直接复制作者库中的内容）

没有逻辑，只有UI。

