new Vue({
  el: '#app',
  methods: {
    onclick: function(message, e) {
      console.log(message);
      console.log(e);
    }
  }
});