<template>
  <div id="app">
    <div id="nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/about" active-class="current">About</router-link>
      <!--<router-link to="/about" tag="button">About</router-link>-->
      <!--<router-link tag="div" to="/about">
        <a>About</a>
      </router-link>-->
      <!--<router-link to="/about" event="mouseover">About</router-link>-->
    </div>
    <router-view/>
  </div>
</template>

<style>

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
/*
#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
*/
.current {
  color: red;
  font-weight: bold;
}
</style>
