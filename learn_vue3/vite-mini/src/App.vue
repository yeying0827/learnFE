<template>
  <div class="main-content">App {{name}}</div>
</template>

<script>
import {ref} from "vue";
export default {
  setup() {
    const name = ref('vite mini');

    return {
      name
    }
  }
}
</script>
