<template>
  <div class="component-c"></div>
</template>

<script lang="ts">
import {Component, Vue, Watch} from "vue-property-decorator";

@Component
export default class componentC extends Vue {
  @Watch('child')
  onChildChanged(val: string, oldVal: string) {}

  // @Watch('person', { immediate: true, deep: true })
  // onPersonChanged1(val: Person, oldValue: Person) {}
  //
  // @Watch('person')
  // onPersonChanged2(val: Person, oldValue: Person) {}
}
</script>
