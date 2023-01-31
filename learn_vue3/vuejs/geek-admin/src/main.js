import { createApp } from 'vue'
import App from './App.vue'
import router from './router';

import './assets/main.css'

createApp(App).use(router)/*注册路由数据*/.mount('#app')
