import Vue from 'vue'
import Router from 'vue-router'
import BookSearch from './components/BookSearch.vue'
import BookForm from './components/BookForm.vue'
import Home from './components/Home.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/search',
      name: 'search',
      component: BookSearch
    },
    {
      path: '/form',
      name: 'form',
      component: BookForm
    },
    { path: '*', redirect: '/' }
  ]
})
