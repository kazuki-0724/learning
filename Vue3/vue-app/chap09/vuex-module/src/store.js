import Vue from 'vue'
import Vuex from 'vuex'
import MainModule from './main-store'
import SubModule from './sub-store'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    main: MainModule,
    sub : SubModule
  },

  state: {
    hoge: 0
  },
  mutations: {
    hoge(state) {
      state.hoge++;
    }
  }
})

