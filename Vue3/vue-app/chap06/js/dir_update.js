Vue.directive('highlight', {
   bind: function(el, binding, vnode, oldVnode) {
    el.style.backgroundColor = binding.value;
  },
  update: function(el, binding, vnode, oldVnode) {
    el.style.backgroundColor = binding.value;
  }
});

/*
// bind／updateをまとめて定義
Vue.directive('highlight', function(el, binding, vnode, oldVnode) {
  el.style.backgroundColor = binding.value;
});
*/

new Vue({
  el: '#app',
  data: {
    color: 'yellow'
  }
});