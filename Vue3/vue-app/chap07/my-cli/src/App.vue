<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png">
    <p>こんにちは、Vue.js！</p>
    <HelloWorld msg="Welcome to Your Vue.js App"/>
  </div>
</template>

<style scoped>
p {
  border: 1px solid Red;
  background-color:Yellow;
}
</style>


<script>
// モジュールのインポート
import HelloWorld from './components/HelloWorld.vue'

// main.jsでインポートできるようにexportしておく
export default {
  name: 'app',
  // App.vueでHelloWorldコンポーネントを使用するために
  // componentsオプションで登録します。
  components: {
    HelloWorld
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
