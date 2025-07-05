new Vue({
  el: '#app',
  data: {
    name: '匿名'
  },
  methods: {
    help: function() {
      window.alert('氏名（漢字）を入力してください');
    }
  }
});