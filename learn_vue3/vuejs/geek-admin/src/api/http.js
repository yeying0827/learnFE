import axios from "axios";
import {Msgbox, Message} from "element3";
import store from '@/store';
import {getToken} from '@/utils/auth';

const service = axios.create({
    baseURL: '/apis', // process.env.VUE_APP_BASE_API, // url = base url + request url
    timeout: 5000 // request timeout
});

service.interceptors.request.use(
    config => {
        const token = getToken();
        if (token) {
            config.headers['X-Token'] = getToken();
        }
        return config;
    },
    error => {
        console.log(error); // for debug
        return Promise.reject(error);
    }
);

service.interceptors.response.use(
    response => {
        const res = response.data;
        if (res.code !== 20000) {
            console.log('接口信息报错', res.message);

            // 50008: Illegal token; 50012: Other clients logged in; 50014: Token expired;
            if (res.code === 50008 || res.code === 50012) {
                // to re-login
                Msgbox.confirm('You have been logged out, you can cancel to stay on this page, or log in again', 'Confirm logout', {
                    confirmButtonText: 'Re-Login',
                    cancelButtonText: 'Cancel',
                    type: 'warning',
                }).then(() => {
                    store.dispatch('user/resetToken').then(() => {
                        location.reload()
                    })
                })
            }

            return Promise.reject(new Error(res.message || 'Error'))
        } else {
            return res;
        }
    },
    error => {
        console.log('接口信息报错', error);
        return Promise.reject(error);
    }
);

export default service;
