new Vue({
  el: '#app',
  data: {
    temperature: 0
  },
  methods: {
    onchange: function() {
      console.log(this.temperature.toFixed(1));
    }
  }
});