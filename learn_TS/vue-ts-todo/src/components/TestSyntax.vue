<template>
  <div class="test-syntax"></div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import componentA from "@/components/componentA.vue";
import componentB from "@/components/componentB.vue";

@Component({
  components: {
    componentA,
    componentB
  },
  directives: {
    focus: {
      inserted(el) {
        el.focus();
      }
    }
  }
})
export default class TestSyntax extends Vue {}
</script>
