import Vue from "vue";
import Vuex from "vuex";
import {state} from "@/store/state";
import {mutations} from "@/store/mutations";
import {getters} from "@/store/getters";
import VuexPersistence from 'vuex-persist';

Vue.use(Vuex);

const vuexLocal = new VuexPersistence({
  storage: window.localStorage
})

export default new Vuex.Store({
  state: state,
  mutations: mutations,
  getters,
  plugins: [vuexLocal.plugin]
});
