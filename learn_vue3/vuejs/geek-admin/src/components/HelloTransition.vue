<template>
  <button @click="toggle">click</button>
  <transition name="fade">
    <h1 v-if="showTitle">{{title}}</h1>
  </transition>
</template>

<script setup>
import {ref} from "vue";

const showTitle = ref(false);
const title = '你好 Vue3';

function toggle () {
  showTitle.value = !showTitle.value;
}
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s linear;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
