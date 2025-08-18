new Vue({
  el: '#app',
  data: {
    list: [ '赤パジャマ', '青パジャマ', '黄パジャマ' ]
  },
  methods: {
    onclick: function() {
      //this.list[1] = '茶パジャマ';
      // 配列の値の変更はそのままだとVueは検知できないため、明示的に値が変更されたことを通知する必要がある
      //Vue.set(this.list, 1, '茶パジャマ');
      //this.$set(this.list, 1, '茶パジャマ');
      //this.list.splice(1, 1, '茶パジャマ');
      //this.list = this.list.concat('茶パジャマ');

      // シフトはVueで検知できるが、配列全体の再描画になってしまい非効率のため
      // 「v-bind:key」を付与して要素を特定させる。v-forが複数存在する場合は注意
      this.list.shift();

    }
  }
});
