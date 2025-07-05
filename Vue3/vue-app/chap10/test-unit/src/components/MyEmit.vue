<template>
  <div id="emit">
    <input type="button" value="送信" v-on:click="onupdate" />
  </div>
</template>

<script>
export default {
  methods: {
    // ボタンクリック時にカスタムイベントを生成
    onupdate() {
      this.$emit('update')
      this.$emit('update', { name: 'Vue.js', version: '2.6.10' })
    }
  }
}
</script>