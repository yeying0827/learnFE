<template>
  <div class="component-d"></div>
</template>

<script lang="ts">
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
</script>
