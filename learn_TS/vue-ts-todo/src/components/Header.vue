<template>
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
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import {Icon} from "vant";

import { Mutation, State } from "vuex-class";
import {ITodoItem, Mode} from "@/store/state";
import {_}from "@/utils";

@Component({
  components: {
    [Icon.name]: Icon,
  }
})
export default class Header extends Vue {
  @State private todoItem!: ITodoItem[];
  @Mutation private createTodoItem!: (todo: ITodoItem) => void;

  private createTodoItemHandle() {
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

  private leftHandle() {
    this.$router.back();
  }

  private rightHandle() {
    this.createTodoItemHandle();
    this.$router.push({ path: '/create' });
  }
}
</script>
<style lang="scss" scoped>
header {
  display: grid;
  grid-template-columns: 3rem auto 3rem;
  align-items: center;
  grid-row-end: end;
  width: 100%;
  height: 3.5rem;
  min-height: 8%;
  background-color: #fff;
}
</style>
