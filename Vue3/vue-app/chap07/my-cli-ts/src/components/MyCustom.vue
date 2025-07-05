<template>
  <div>
    <div v-bind:title="str | trim">str: 「{{ str | trim }}」</div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Emit, Vue } from 'vue-property-decorator';

@Component({
  filters: {
    trim(value: string): string {
      if (typeof value !== 'string') {
        return value;
      }
      return value.trim();
    },
  },
})
export default class MyCustom extends Vue {
  private str: string = '  WINGS Project  ';
}
</script>