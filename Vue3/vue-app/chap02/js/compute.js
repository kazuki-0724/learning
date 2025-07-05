new Vue({
  el: '#app',
  data: {
    email: 'Y-Suzuki@example.com'
  },
  computed: {
    localEmail: function() {
      return this.email.split('@')[0].toLowerCase();
    }
  }
});