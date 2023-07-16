import { defineStore } from "pinia";
import { ref } from 'vue';

export const useCounterStore = defineStore('count', {
    id: 'count',
    state: () => {
        return { count: 1 }
    },
    actions: {
        add() {
            this.count ++
        }
    }
})


// export const useCounterStore = defineStore('count', () => {
//     const count = ref(0);
//     function increment() {
//         count.value ++
//     }
//
//     return { count, increment }
// });
