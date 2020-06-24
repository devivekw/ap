
import Vue from 'vue'
Vue.config.devtools = true
import App from './App.vue'
import router from './router'
import { store } from './store.js'

const fb = require('./firebaseConfig.js')

import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import CKEditor from '@ckeditor/ckeditor5-vue'

import'./assets/scss/main.scss'

// Install BootstrapVue
Vue.use(BootstrapVue)
// Optionally install the BootstrapVue icon components plugin
Vue.use(IconsPlugin)
Vue.use(CKEditor)

Vue.config.productionTip = false

// handle page reloads
let app
fb.auth.onAuthStateChanged(user => {
  if (!app) {
    app = new Vue({
      el: '#app',
      router,
      store,
      render: h => h(App)
    })
  }
})