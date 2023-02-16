const tokens = {
    'dasheng': 'qwerty1234567'
}

// 1. 引入express
const express = require('express');

// 2. 创建应用对象
const app = express();

const bodyParser = require('body-parser'); // 解析post请求的body数据

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// 3. 创建路由规则
// request 是对请求报文的封装
// response 是对响应报文的封装
app.post('/user/login', (request, response) => {
    console.log(request.body);
    // 设置响应
    const {username} = request.body;
    const token = tokens[username];

    if (username !== 'dasheng') {
        response.send({
            code: 60204,
            message: 'Account or password is incorrect!'
        });
        return;
    }

    response.send({
        code: 20000,
        data: token
    });
});

// 4. 监听端口启动服务
app.listen(8000, () => {
    console.log('服务已启动， 8000端口监听中......');
});
