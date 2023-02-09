<template>
<!--  <a :href="'#' + props.to">-->
  <a @click="go">
    <slot/>
  </a>
</template>

<script setup>
import {defineProps} from "vue";
import {useRouter} from "./index";

const router = useRouter();

const props = defineProps({
  to: {type: String, required: true}
});

function go() {
  window.history.pushState({}, '', props.to);
  const popStateEvent = new PopStateEvent('popstate',);
  dispatchEvent(popStateEvent);
}
</script>
