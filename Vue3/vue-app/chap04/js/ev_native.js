Vue.component('my-input', {
  template: `<input type="text" />`
  // template: `<label>名前：<input type="text" /></label>`
});

new Vue({
  el: '#app',
  methods: {
    onfocus: function(e) {
      console.log(e);
    }
  }
});
