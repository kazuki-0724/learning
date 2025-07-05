<template>
  <div id="app">
    メイン：{{mainUpdated}} <br />
    サブ：{{subUpdated}} <br />
    <input type="button" value="更新" v-on:click="setUpdated" />
    <!-- ゲッター： {{localUpdated}} {{hoge}} -->
    <!-- <input type="button" value="+" v-on:click="updateHoge" /> -->
  </div>
</template>

<script>
export default {
  name: 'app',
  computed: {
    mainUpdated() {
      return this.$store.state.main.updated;
    },
    subUpdated() {
      return this.$store.state.sub.updated;
    },
    localUpdated() {
      // return this.$store.getters.localUpdated;
      return this.$store.getters['main/localUpdated'];
    },
    hoge(){
      //return this.$store.state.hoge;
      return this.$store.getters['main/hoge'];
    },
  },
  methods: {
    setUpdated() {
      //this.$store.commit('setUpdated')
      
      // 名前空間を分離した場合
      this.$store.commit('main/setUpdated')
      this.$store.commit('sub/setUpdated')
    },
    updateHoge() {
      this.$store.dispatch('main/hogeAction');
    },    
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
