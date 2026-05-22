import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import zhCn from 'element-ui/lib/locale/lang/zh-CN'

import VueRouter from 'vue-router'
import Vuex from 'vuex'
import router from './router'
import createStore from './stores'
import App from './App.vue'

import './styles/global.scss'
import './styles/layout.scss'
import './styles/element-overrides.scss'
import './styles/login.scss'

import './mock'

Vue.use(ElementUI, { locale: zhCn })
Vue.use(VueRouter)
Vue.use(Vuex)

const store = createStore()

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
