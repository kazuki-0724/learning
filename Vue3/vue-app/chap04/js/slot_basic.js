Vue.component('my-hello', {
  props: [ 'yourName' ],
  template: `<div>こんにちは、<slot>ゲスト</slot>さん！</div>`,
})

new Vue({
  el: '#app',
});