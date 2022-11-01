<template>
  <div class="circle-icon" :style="styleObj">
    <slot name="icon"></slot>
  </div>
</template>

<script lang="ts">
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
</script>

<style lang="scss" scoped>
.circle-icon {
  border: solid 2px black;
  border-radius: 50%;
  margin: 0;
  background: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
