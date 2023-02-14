import {createRouter, createWebHashHistory, Router, RouteRecordRaw} from 'vue-router';
// import {createRouter, createWebHashHistory, createWebHistory} from './grouter';

import Home from '../pages/Home.vue';
import About from '../pages/About.vue';

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        name: 'Home',
        component: Home
    },
    {
        path: '/about',
        name: 'About',
        component: About
    }
];

const router: Router = createRouter({
    history: createWebHashHistory(),
    // history: createWebHistory(),
    routes
});

export default router;
