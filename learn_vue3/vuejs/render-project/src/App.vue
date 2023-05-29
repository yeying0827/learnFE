<script setup>
import HelloWorld from './components/HelloWorld.vue'
import {ref} from "vue";
const count = ref(1);
const name = ref('vue3入门');
const setName = (n) => {
  name.value = n;
  pos.value[1] += 20;
  count.value += 2;
}
const pos = ref([20, 120, 200, 100]);
</script>

<template>
  <div @click="setName('vue3真棒')" :pos="[10, 10, 300, 300]" fill="#eee">
    <h1 :pos="[20, 20, 200, 100]" fill="red" color="#000">累加器{{count}}</h1>
    <span :pos="pos" fill="black">哈喽 {{name}}</span>
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
