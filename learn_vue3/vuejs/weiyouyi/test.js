const {effect, reactive} = require('@vue/reactivity');

let dummy
const counter = reactive({ num1: 1, num2: 2 });
effect(() => {
    dummy = counter.num1 + counter.num2;
    console.log(dummy); // num1修改就会打印日志
});
setInterval(() => {
    counter.num1 ++;
}, 1000);
