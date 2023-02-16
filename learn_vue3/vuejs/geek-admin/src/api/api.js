import http from "./http";
import {useStorage} from "../utils/storage";

export const login = (payload) => http.post('/user/login', payload).then(res => {
    sessionStorage.setItem('vue3token', res.data);
    return res;
});
