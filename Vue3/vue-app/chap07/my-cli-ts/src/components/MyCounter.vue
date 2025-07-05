<template>
  <div>
    <button type="button" v-on:click="onclick">
      {{ this.step }}増加</button>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Emit, Vue } from 'vue-property-decorator';

@Component
export default class MyCounter extends Vue {

  @Prop() private step!: number;
  @Emit('plus')
  private onclick() {
    return Number(this.step);
  }
}
</script>