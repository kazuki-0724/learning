<template>
  <div class="list">
    <p>{{ bookCount }}件の読書情報が記録されています。</p>
    <BookInfo v-for="(b, i) of books"
      :linkable="true" :book="b" :index="i + 1" :key="b.isbn"></BookInfo>
    <div>
      <el-pagination background layout="prev, pager, next"
        :total="bookCount" :page-size="3" @current-change="onchange"></el-pagination>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import BookInfo from '@/components/BookInfo.vue'

export default {
  name: 'home',
  data() {
    return {
      books: []
    }
  },
  components: {
    BookInfo
  },
  computed: mapGetters([ 'bookCount', 'getRangeByPage' ]),
  methods: {
    onchange(page) {
      this.books = this.getRangeByPage(page)
    }
  },
  mounted() {
    this.books = this.getRangeByPage(1)
  }
}
</script>
