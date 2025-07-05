<template>
  <div id="email">{{ localEmail }}</div>
</template>
<script>
export default {
  props: {
    email: String
  },
  computed: {
    localEmail: function() {
      return this.email.split('@')[0].toLowerCase()
    }
  }
}
</script>