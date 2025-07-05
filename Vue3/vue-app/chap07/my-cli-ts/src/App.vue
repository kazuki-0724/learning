<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png">
    <!-- <HelloWorld msg="Welcome to Your Vue.js + TypeScript App"/> -->
    <MyHello></MyHello>
    <MyCounter step="1" v-on:plus="onplus"></MyCounter>
    <p>現在値：{{current}}</p>
    <MyCustom></MyCustom>
    <MyWatcher></MyWatcher>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import HelloWorld from './components/HelloWorld.vue';
import MyHello from './components/MyHello.vue';
import MyCounter from './components/MyCounter.vue';
import MyCustom from './components/MyCustom.vue';
import MyWatcher from './components/MyWatcher.vue';

@Component({
  components: {
    HelloWorld,
    MyHello,
    MyCounter,
    MyCustom,
    MyWatcher,
  },
})
export default class App extends Vue {
  private current: number = 0;
  private onplus(e: number) {
    this.current += e;
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
