Vue.component('my-counter', {
  props: [ 'init' ],
  template: `<div>現在値は{{ current }}です！
    <input type="button" v-on:click="onclick" value="増やす" /></div>`,
  data: function() {
    return {
      current: this.init
    };
  },
  methods: {
    onclick: function() {
      this.current++;
    }
  }
})

new Vue({
  el: '#app'
});