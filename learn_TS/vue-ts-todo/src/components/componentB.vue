<template>
  <div class="component-b"></div>
</template>

<script lang="ts">
import {Component, Prop, Vue} from "vue-property-decorator";

@Component
export default class componentB extends Vue {
  @Prop(String)
  propsA!: string;

  @Prop([String, Number])
  propB!: string|number;

  @Prop({
    type: Array,
    default: () => {
      return ['a', 'b']
    },
    required: true,
    validator(value: any): boolean {
      return [
          'a',
          'b'
      ].indexOf(value) !== -1
    }
  })
  propC!: [];
}
</script>
