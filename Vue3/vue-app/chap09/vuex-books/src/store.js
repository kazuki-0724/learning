import Vue from 'vue'
import Vuex from 'vuex'
import { ADD_BOOK } from './mutation-types'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    books: [
      {
        isbn: '978-4-8222-5389-9',
        title: '作って楽しむプログラミング HTML5超入門',
        price: 2000
      },
      {
        isbn: '978-4-7981-5757-3',
        title: 'JavaScript逆引きレシピ',
        price: 2800
      },
      {
        isbn: '978-4-7741-9763-0',
        title: '3ステップでしっかり学ぶ Python 入門',
        price: 2480
      },
      {
        isbn: '978-4-7981-5382-7',
        title: '独習C# 新版',
        price: 3600
      },
      {
        isbn: '978-4-8399-6644-7',
        title: 'たのしいラズパイ電子工作ブック',
        price: 1900
      },
    ]
  },
  getters: {
    booksCount(state) {
      return state.books.length
    },
    getBooksByPrice(state) {
      return price => {
        return state.books.filter(book => book.price < price)
      }
    },
    /*
    BooksCount3000(state, getters) {
       return getters.getBooksByPrice(3000).length
    }
    */
  },
  mutations: {
    addBook(state, payload) {
      state.books.push(payload.book)
    }
    
    /*
    // 定数対応
    [ADD_BOOK](state, payload) {
      state.books.push(payload.book)
    }
    */

  },
  actions: {    
    addAsync(context, payload) {
      setTimeout(function() {
        context.commit(ADD_BOOK, payload)
      }, 5000)
    }
    
    /*
    // 分割代入を使った場合
    addAsync({ commit }, payload) {
      setTimeout(function() {
        commit(ADD_BOOK, payload)
      }, 5000);
    }
    */
  }
})
