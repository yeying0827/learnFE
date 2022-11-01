<template>
  <div class="component-a"></div>
</template>

<script lang="ts">
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
</script>
