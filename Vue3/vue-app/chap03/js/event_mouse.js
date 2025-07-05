new Vue({
  el: '#app',
  data: {
    path: 'http://www.web-deli.com/image/linkbanner_l.gif'
  },
  methods: {
    onmouseenter: function() {
      this.path = 'http://www.web-deli.com/image/home_chara.gif';
    },
    onmouseleave: function() {
      this.path = 'http://www.web-deli.com/image/linkbanner_l.gif';
    }
  }
});