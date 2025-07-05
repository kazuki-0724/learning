new Vue({
  el: '#app',
  data: {
    unit: {}
  },
  methods: {
    onchange: function() {
      console.log(this.unit.name + '：' + this.unit.size);
    }
  }
});