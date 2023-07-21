// 引入express
const express = require('express');
const app = express();
const Vue = require('vue'); // vue@next
const renderer3 = require('@vue/server-renderer');
const vue3Compiler = require('@vue/compiler-ssr');

// 一个Vue组件
const vueapp = {
    template: `<div>
        <h1 @click="add">{{ num }}</h1>
        <ul>
            <li v-for="(todo, n) in todos">{{ n+1 }} -- {{ todo }}</li>
        </ul>
    </div>
    `,
    data() {
        return {
            num: 1,
            todos: ['吃饭', '睡觉', '学习vue']
        }
    },
    methods: {
        add() {
            console.log('add triggered!');
            this.num ++
        }
    }
}

// 使用@vue/compiler-ssr解析template
vueapp.ssrRender = new Function('require', vue3Compiler.compile(vueapp.template).code)(require);
console.log('vueapp.ssrRender', vue3Compiler.compile(vueapp.template).code);
// 路由首页返回结果
app.get('/', async function(req, res) {
    let vapp = Vue.createSSRApp(vueapp);
    let html = await renderer3.renderToString(vapp);
    const title = 'Vue SSR';
    let ret = `
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <link rel="icon" href="/favicon.ico">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>    
</head>
<body>
    <div id="app">
        ${html}
    </div>
</body>
</html>
    `;
    res.send(ret);
});

app.listen(9093, () => {
    console.log('listen 9093');
})
