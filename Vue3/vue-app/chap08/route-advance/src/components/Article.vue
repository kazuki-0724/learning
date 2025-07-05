<template>
  <span>記事コード：{{ aid }}</span>
</template>

<script>
export default {
  name: 'Article',
  data () {
    return {
      aid: 0
    }
  },
  created() {
    this.aid = this.$route.params.aid
  },
  watch: {
    // eslint-disable-next-line
    '$route'(to, from) {
      this.aid = to.params.aid
    }
  }
}
</script>