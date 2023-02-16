import { createApp } from 'vue'
import App from './App.vue'
import router from './router';
import store from "./store";
import Element3 from 'element3';
import 'element3/lib/theme-chalk/index.css';

import './assets/main.css';

window.onerror = function (e) {
    console.log([`https://stackoverflow.com/search?q=[js]+${e}`]);
}

createApp(App).use(store)/*注册数据源*/.use(router)/*注册路由数据*/
    .use(Element3)/*注册组件库*/.mount('#app')

