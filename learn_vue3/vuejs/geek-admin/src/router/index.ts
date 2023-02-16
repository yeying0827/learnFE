import {createRouter, createWebHashHistory, Router, RouteRecordRaw} from 'vue-router';
// import {createRouter, createWebHashHistory, createWebHistory} from './grouter';

import Home from '../pages/Home.vue';
import About from '../pages/About.vue';
import Login from '../pages/Login.vue';

import {getToken} from '../utils/auth';

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
    },
    {
        path: '/login',
        name: 'Login',
        component: Login
    }
];

const router: Router = createRouter({
    history: createWebHashHistory(),
    // history: createWebHistory(),
    routes
});

router.beforeEach((to, from, next) => {
    let token = getToken();
    if (!token && to.path !== '/login') {
        next('/login');
        return;
    }
    next();
})

export default router;
