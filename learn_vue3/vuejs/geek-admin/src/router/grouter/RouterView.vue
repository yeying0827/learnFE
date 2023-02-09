<template>
  <h1>
    自定义Router</h1>
  <component :is="comp"></component>
</template>

<script setup>
import {computed} from "vue";
import {useRouter} from "./index";

let router = useRouter();

const comp = computed(() => {
  const route = router.routes.find(r => r.path === router.current.value);
  return route?.component || null;
});
</script>
