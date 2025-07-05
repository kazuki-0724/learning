<template>
  <div id="event">
    <form v-on:submit.prevent="onsubmit">
      <label>メールアドレス：
        <input id="email" v-model="email" /></label>
      <input type="submit" value="登録" />
    </form>
    <div id="result">{{result}}</div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      email: '',
      result: ''
    }
  },
  methods: {
    onsubmit() {
      this.result = '登録完了：' + this.email
    }
  }
}
</script>