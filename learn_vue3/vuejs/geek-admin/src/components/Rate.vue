<template>
  <div :style="fontStyle">
    <slot></slot>
    <div class="rate" @mouseleave="mouseOut">
      <span @mouseover="mouseOver(num)" v-for="num in 5" :key="num">☆</span>
      <span class="hollow" :style="fontWidth">
        <span @click="onRate(num)" @mouseover="mouseOver(num)" v-for="num in 5" :key="num">★</span>
      </span>
    </div>
  </div>
</template>

<script setup>
import {computed, ref, watch, toRefs} from "vue";
let props = defineProps({
  // value: Number,
  modelValue: Number,
  theme: {type: String, default: 'orange'}
});


const themeObj = {
  'black': '#00',
  'white': '#fff',
  'red': '#f5222d',
  'orange': '#fa541c',
  'yellow': '#fadb14',
  'green': '#73d13d',
  'blue': '#40a9ff',
};
const fontStyle = computed(() => ({ color: themeObj[props.theme]}));

const {modelValue} = toRefs(props);
let width = ref(modelValue.value);
function mouseOut() {
  width.value = modelValue.value;
}

function mouseOver(num) {
  width.value = num;
}

const fontWidth = computed(() => ({width: `${width.value}em`}));

let emits = defineEmits(['update:modelValue']); // defineEmits('update-rate');
function onRate(num) {
  emits('update:modelValue', num);
}

watch(
    () => props.modelValue,
    (val) => {
      width.value = val;
    }
);
</script>

<style>
.rate {
  position: relative;
  display: inline-block;
}
.rate > span.hollow {
  position: absolute;
  display: inline-block;
  top: 0;
  left: 0;
  width: 0;
  overflow: hidden;
}
</style>
