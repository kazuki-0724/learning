new Vue({
  el: '#app',
  data: {
    name: '匿名'
  },
  methods: {
    clear: function() {
      this.name = '';
    }
  }
});

// Vue.config.keyCodes = {
//     'zen-han': 243,
//     'no-change': 29
//   };