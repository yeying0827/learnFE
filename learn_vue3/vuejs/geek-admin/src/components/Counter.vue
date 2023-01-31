<template>
  <h1 @click="add">{{count}}</h1>
  <span>x: {{x}}, y: {{y}}</span>
</template>

<script setup>
import {ref} from "vue";
import {useMouse} from "../utils/mouse";

let count = ref(1);
const color = ref("red");

function add() {
  count.value ++;
  color.value = Math.random() > 0.5? "red": "blue";
}

let {x, y} = useMouse();
</script>

<style scoped>
h1 {
  color: v-bind(color);
}
</style>
