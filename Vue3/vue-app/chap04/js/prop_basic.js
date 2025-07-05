Vue.component('my-hello', {
  props: [ 'yourName' ],

  // props: {
  //   yourName: {
  //     type: String,
  //     required: true
  //   }
  // },
  template: `<div>こんにちは、{{ yourName }}さん！</div>`,
})

new Vue({
  el: '#app',
});