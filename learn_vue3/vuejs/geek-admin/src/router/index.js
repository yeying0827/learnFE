import {createRouter, createWebHashHistory} from 'vue-router';
// import {createRouter, createWebHashHistory, createWebHistory} from './grouter';

import Home from '../pages/Home.vue';
import About from '../pages/About.vue';

const routes = [
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

const router = createRouter({
    history: createWebHashHistory(),
    // history: createWebHistory(),
    routes
});

export default router;
