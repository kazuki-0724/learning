import Vue from 'vue'
import Router from 'vue-router'
import Main from './components/Main.vue'
import Article from './components/Article.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'main',
      components: {
        default: Main,
        sub: Article
      }
    }
  ]
})
