import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import Article from './components/Article.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  // 以下でルーティングテーブルを定義する
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home //ルートに対応するものは事前にimpotしておく
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      // 動的にインポートする
      component: () => import(/* webpackChunkName: "about" */ './views/About.vue')
    },
    {
      // :aidはパラメータを表す
      path: '/article/:aid',
      //path: '/articles/:aid(\\d{2,3})',
      name: 'article',
      component: Article,
      props: true
      /*props: routes => ({
        aid: Number(routes.params.aid)
      })*/
    }
  ]
})
