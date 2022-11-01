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
