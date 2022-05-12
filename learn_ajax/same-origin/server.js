const express = require('express');
const {request} = require("express");

const app = express();

app.get('/home', (request, response) => {
    response.sendFile(__dirname + '/index.html'); // 需要传入绝对路径
});

app.get('/data', (request, response) => {
    response.send('响应数据');
});

app.listen(9000, () => {
    console.log('服务启动了...');
});
