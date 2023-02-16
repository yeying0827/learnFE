import {createStore} from "vuex";
// import {createStore} from "./gvuex";
import {login} from "../api/api";
import router from '../router/index';

const store = createStore({
    state() {
        return {
            count: 666
        };
    },
    getters: {
        double(state) {
            return state.count * 2;
        }
    },
    mutations: {
        add(state) {
            state.count ++;
        },
        SET_REMOVE_ROUTES(state, payload) {
            // ...
        }
    },
    actions: {
        asyncAdd({commit}) {
            setTimeout(() =>{
                commit('add');
            }, 1000);
        },
        login({commit}, payload) {
            return login(payload);
        },
        addRoutes({commit}, accessRoutes) {
            // 添加动态路由，同时保存，将来如果需要重置路由可以用到它们
            const removeRoutes = [];

            accessRoutes.forEach(route => {
                const removeRoute = router.addRoute(route);
                removeRoutes.push(removeRoute);
            });

            commit('SET_REMOVE_ROUTES', removeRoutes);
        }
    }
})

export default store;
