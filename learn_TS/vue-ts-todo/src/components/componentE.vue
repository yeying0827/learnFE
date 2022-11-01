<template>
  <div class="component-e"></div>
</template>

<script lang="ts">
import {Component, Model, Vue} from "vue-property-decorator";

@Component
export default class componentE extends Vue {
  @Model('change', { type: Boolean })
  checked!: boolean;
}
</script>
