<template>
  <h1>这是关于</h1>
  <button @click="loading">123</button><button @click="reset">reset</button>
  <br>
  <button @click="toggle">toggle</button>
<!--  <Rate :value="5" theme="red"/>
  <Rate :value="score" @update-rate="updateRate"/>
  <Rate :value="1" theme="green" />-->
  <Rate v-model="score"/>
  <Rate v-model="score">课程评分</Rate>
  <Rate v-model="score">
    <img src="/favicon.ico" alt="" width="14">
  </Rate>
</template>

<script setup>
import {useFavicon} from "../utils/favicon";
import {useFullscreen} from "@vueuse/core";
import Rate from '../components/Rate.vue';
import {ref} from "vue";

const score = ref(3.5);

const {toggle} = useFullscreen();

let { favicon, reset } = useFavicon();

function loading() {
  favicon.value = '/geek.webp';
}

// function updateRate(num) {
//   score.value = num;
// }
</script>
