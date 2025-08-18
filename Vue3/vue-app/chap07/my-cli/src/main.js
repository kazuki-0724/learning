import Vue from 'vue'
import App from './App.vue'

//Vue.config.productionTip = false
//Vue.config.ignoredElements = [/^Hello/]
//Vue.config.performance = true
new Vue({
  render: h => h(App),
}).$mount('#app')

/**
 * Vue.jsのエントリーポイントです。
 * このjsファイルを読み込むhtmlのid="app"の部分に
 * Vue.jsのコンポーネントをマウントします。
 * <div id="app"></div>の部分が丸々App.vueの内容に置き換わる
 * 「render: h => h(App)」は、App.vueコンポーネントを
 * Vueインスタンスのレンダリング関数として指定しています。
 * ほぼほぼ様式美のようなもの。
 */