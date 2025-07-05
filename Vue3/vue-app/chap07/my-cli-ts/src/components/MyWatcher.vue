<template>
  <div>
    <label>名前：
      <input type="text" v-model="name" />
    </label>
  </div>
</template>

<script lang="ts">

import { Component, Prop,  Vue, Watch } from 'vue-property-decorator';
@Component
export default class MyWatcher extends Vue {
  private name: string = '匿名';

  @Watch('name')
  //@Watch('name', { immediate: true, deep: true })
  private onNameChanged(newValue: string, oldValue: string): void {
    // tslint:disable-next-line:no-console
    console.log(oldValue + '=>' + newValue);
  }
}
</script>