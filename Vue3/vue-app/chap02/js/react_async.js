new Vue({
  el: '#app',
  data: {
    author: {
      name: '山田'
    }
  },
  mounted: function() {
    Vue.set(this.author, 'company', 'WINGSプロジェクト');
    //console.log(this.$el.textContent.includes(this.author.company));

    let that = this;
    this.$nextTick().then(function () {
      console.log(that.$el.textContent.includes(that.author.company));
    })
  }
});