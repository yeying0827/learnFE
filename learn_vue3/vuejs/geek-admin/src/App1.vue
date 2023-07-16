<template>
  <div>
    <h3 @click="add">App1</h3>
  </div>
</template>

<script>
import { useCounterStore } from "./store/count";

export default {
  setup() {
    const count = useCounterStore();
    function add() {
      // count.add();
      count.$patch({ count: count.count + 1 });

      // count.increment();
    }
    return {
      count,
      add
    }
  }
}
</script>
