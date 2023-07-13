import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

createApp(App).mount('#app')

async function test1() {
    await delayError('test1: ref is not defined')
}

async function test2() {
    try {
        await delayError('test2: reactive is not defined')
    } catch (e) {
        console.log(e);
    }
}

test1();
function delayError(msg) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            reject({ message: msg });
        }, 1000);
    })
}
