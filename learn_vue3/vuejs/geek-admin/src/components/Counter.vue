<template>
  <h1 @click="add">{{count}}</h1>
<!--  <span>x: {{x}}, y: {{y}}</span>-->
  <h1 @click="add1">count from vuex: {{count2}}, {{double}}</h1>
</template>

<script setup>
import {computed, ref} from "vue";
import {useStore} from "vuex";
// import {useStore} from "../store/gvuex";
// import {useMouse} from "../utils/mouse";

let count = ref(1);
const color = ref("red");

function add() {
  count.value ++;
  color.value = Math.random() > 0.5? "red": "blue";
}

// let {x, y} = useMouse();

const store = useStore();
const count2 = computed(() => store.state.count); // 使用计算属性返回
const double = computed(() => store.getters.double);
function add1() {
  // store.commit("add"); // 触发store中的mutation去修改数据
  store.dispatch("asyncAdd");
}
</script>

<style scoped>
h1 {
  color: v-bind(color);
}
</style>
