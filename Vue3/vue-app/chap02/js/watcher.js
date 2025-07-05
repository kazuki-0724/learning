new Vue({
  el: '#app',
  data: {
    name: '',
    upperName: ''
  },
  created: function() {
    this.delayFunc = _.debounce(this.getUpper, 2000);
  },
  watch: {
    name: function(newValue, oldValue) {
      this.delayFunc();
    }
  },
  // computed: {
  //   upperName: function() {
  //     return this.name.toUpperCase();
  //   }
  // },
  methods: {
    getUpper: function() {
      this.upperName = this.name.toUpperCase();
    }
  }
});