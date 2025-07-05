new Vue({
  el: '#app',
  methods: {
    onsubmit: function(e) {
      if (!confirm('送信しても良いですか？')) {
        e.preventDefault();
        return;
      }
    }
  }
});