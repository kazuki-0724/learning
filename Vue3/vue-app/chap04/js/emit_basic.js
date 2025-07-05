Vue.component('my-counter', {
  props: [ 'step' ], 
  template: `<button type="button" v-on:click="onclick">
    {{ step }}</button>`,
  methods: {
    onclick: function() {
      this.$emit('plus', Number(this.step));
    }
  }
});

new Vue({
  el: '#app',
  data: {
    current: 0
  },
  methods: {
    onplus: function(e) {
      this.current += e;
    }
  }
});