new Vue({
  el: '#app',
  data: {
    pos: {
      left: 0,
      top: 0
    },
    show: false
  },
  methods: {
    onleftclick: function() {
      this.show = false;
    },
    onrightclick: function(e) {
      this.pos = {
        top: e.pageY + 'px',
        left: e.pageX + 'px'
      };
      this.show = true;
    }
  }
});
