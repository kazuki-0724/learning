new Vue({
  el: '#app',
  data: {
    memo: ''
  },
  methods: {
    onchange: function() {
      console.log('入力値は「' + this.memo + '」です。');
    }
  }
});