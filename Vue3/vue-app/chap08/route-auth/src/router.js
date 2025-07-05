import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import About from './views/About.vue'
import Signin from './components/Signin.vue'

Vue.use(Router)

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/signin',
      name: 'signin',
      component: Signin
    },
    {
      path: '/about',
      name: 'about',
      component: About,
      meta: {
        isRequestAuth: true
      }
    }
  ]
})

// authedフラグが立っていれば、認証済と見なす
let isAuthed = function() { return !!sessionStorage['authed']; }

router.beforeEach((to, from, next) => {
  if (to.matched.some(route => route.meta.isRequestAuth)
      && !isAuthed()) {
        next({ path: '/signin', query: { path: to.fullPath }})
      } else {
        next()
      }
});

export default router