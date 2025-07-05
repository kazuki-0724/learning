<template>
  <div>
    <p>{{ hoge("こんにちは") }}</p>
    <p>{{ localEmail }}</p>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class MyHello extends Vue {
  private email: string = 'Y-Suzuki@example.com';

  private hoge(value: string): string {
    return `**${value}**`;
  }

  get localEmail(): string {
    return this.email.split('@')[0].toLowerCase();
  }
}

</script>