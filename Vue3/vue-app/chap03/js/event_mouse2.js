new Vue({
  el: '#app',
  data: {
    result: ''
  },  
  methods: {
    //mouseenter／mouseleaveイベント
    onmousein: function(e) {
      this.result += 'Enter:' + e.target.id + '<br />';
    },
    onmouseout: function(e) {
      this.result += 'Leave:' + e.target.id + '<br />';
    }
  }
});