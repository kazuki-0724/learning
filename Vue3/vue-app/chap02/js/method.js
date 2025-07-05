new Vue({
  el: '#app',
  data: {
    email: 'Y-Suzuki@example.com'
  },
  methods: {
    localEmail: function() {
      return this.email.split('@')[0].toLowerCase();
    }
  }
});