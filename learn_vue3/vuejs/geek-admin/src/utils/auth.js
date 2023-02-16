import {useStorage} from "./storage";

export const getToken = () => {
    return sessionStorage.getItem('vue3token');
}
