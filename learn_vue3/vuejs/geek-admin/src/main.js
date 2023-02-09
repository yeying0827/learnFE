import { createApp } from 'vue'
import App from './App.vue'
import router from './router';
import store from "./store";

import './assets/main.css';

window.onerror = function (e) {
    console.log([`https://stackoverflow.com/search?q=[js]+${e}`]);
}

createApp(App).use(store)/*注册数据源*/.use(router)/*注册路由数据*/.mount('#app')

