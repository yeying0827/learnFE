// 1. 引入express
const express = require('express');

// 2. 创建应用对象
const app = express();

// 3. 创建路由规则
// request 是对请求报文的封装
// response 是对响应报文的封装
app.get('/server', (request, response) => {
    // 设置响应头，允许跨域
    response.setHeader('Access-Control-Allow-Origin', '*');

    // 设置响应体
    response.send('HELLO AJAX - 2');
});

app.all('/server', (request, response) => {
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Headers', '*'); // 接收所有头信息

    response.send('HELLO AJAX POST');
});

app.all('/json-server', (request, response) => {
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Headers', '*');

    // response.send('HELLO AJAX JSON');
    const data = {
        name: 'guigu'
    };
    response.send(data);
});

// 针对ie缓存
app.get('/ie', (request, response) => {
    response.send('HELLO IE');
});

// 网络延时
app.get('/delay', (request, response) => {
    response.setHeader('Access-Control-Allow-Origin', '*');

    setTimeout(() => {
        response.send('延时响应');
    }, 3000);
});

// jQuery服务
app.all('/jquery-server', (request, response) => {
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Headers', '*');

    // response.send('Hello jQuery Ajax');
    const data = {
        name: 'sss'
    }
    response.send(data);
})

// axios 服务
app.all('/axios-server', (request, response) => {
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Headers', '*');

    const data = {
        name: 'axios'
    }
    // response.send('123');
    response.send(data);
});

// fetch 服务
app.all('/fetch-server', (request, response) => {
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Headers', '*');

    const data = {
        name: 'axios'
    }
    // response.send('123');
    response.send(data);
});

// jsonp服务
app.all('/jsonp-server', (request, response) => {
    // response.send('hello jsonp-server');
    // response.send('console.log("hello jsonp")');
    const data = {
        name: '尚硅谷guigu'
    };
    const str = JSON.stringify(data);
    // 返回结果
    // end不会加特殊响应头
    response.end(`handle(${str})`);
})

app.all('/check-username', (request, response) => {
    const data = {
        error: 1,
        msg: '用户名已存在'
    };
    const str = JSON.stringify(data);
    response.end(`handle(${str})`);
});

app.all('/jquery-jsonp-server', (request, response) => {
    const data = {
        name: '尚硅谷',
        city: ['北京', '上海', '深圳']
    };
    const str = JSON.stringify(data);
    const cb = request.query.callback;
    response.end(`${cb}(${str})`);
});

app.all('/cors-server', (request, response) => {
    response.setHeader('Access-Control-Allow-Origin', "*");
    response.setHeader('Access-Control-Allow-Headers', "*"); // 允许请求携带的头信息，预检请求的响应
    response.setHeader('Access-Control-Allow-Methods', '*'); // 允许的请求类型，预检请求的响应
    response.setHeader('Access-Control-Expose-Headers', "name"); // 允许浏览器能够获取到的自定义响应头

    response.setHeader('token', 'fsjlfksd');
    response.send('跨域');
})

// 4. 监听端口启动服务
app.listen(8000, () => {
    console.log('服务已启动， 8000端口监听中......');
})
