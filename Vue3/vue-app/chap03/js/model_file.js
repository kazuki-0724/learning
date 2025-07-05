new Vue({
  el: '#app',
  data: {
    message: ''
  },
  methods: {
    onchange: function() {
      let that = this;
      let fl = this.$refs.upfile.files[0];
      let data = new FormData();
      data.append('upfile', fl, fl.name);
      fetch('upload.php', { 
        method: 'POST',
        body: data,
      }) 
      .then(function (response) {
        return response.text();
      })
      .then(function (text) {
        that.message = text;
      })
      .catch(function (error) { 
        window.alert('Error: ' + error.message);
      });
    }
  }
});