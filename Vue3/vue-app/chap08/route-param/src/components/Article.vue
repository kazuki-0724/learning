<template>
  <span>記事コード：{{ aid }}</span>
  <!--<span>記事コード：{{ $route.params.aid }}</span>-->
</template>

<script>
export default {
  name: 'Article',
  props: {	
    aid: String
    //aid: Number
  }
}
</script>