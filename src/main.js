import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import 'amfe-flexible'
import '@/style/reset.css'
import '@/style/iconfont/iconfont.css'

createApp(App).use(store).use(router).mount('#app')
