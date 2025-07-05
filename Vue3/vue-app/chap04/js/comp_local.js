let MyHello = {
  template: `<div>こんにちは、Vue.js！</div>`
};

new Vue({
  el: '#app',
  components: {
    'my-hello': MyHello
  }
});