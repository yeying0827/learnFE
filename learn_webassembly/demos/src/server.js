const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

const PORT = 8888; // 服务监听的端口号

const mime = {
    "html": 'text/html;charset=UTF-8',
    "wasm": 'application/wasm' // 遇到“.wasm”格式文件的请求时，返回特定的MIME头
};

http.createServer((req, res) => {
    let realPath = path.join(__dirname, `.${url.parse(req.url).pathname}`);
    console.log(realPath);
    // 检查所访问文件是否存在，并且是否可读
    fs.access(realPath, fs.constants.R_OK, err => {
        if (err) {
            res.writeHead(404, { 'Content-TYpe': 'text/plain' });
            res.end();
        } else {
            fs.readFile(realPath, "binary", (err, file) => {
                if (err) {
                    console.log(err);
                    // 文件读取失败时返回 500
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end();
                } else {
                    // 根据请求的文件返回相应的文件内容
                    let ext = path.extname(realPath);
                    ext = ext ? ext.slice(1) : 'unknow';
                    let contentType = mime[ext] || 'text/plain';
                    res.writeHead(200, { 'Content-Type': contentType });
                    res.write(file, "binary");
                    res.end();
                }
            });
        }
    });
}).listen(PORT);
console.log("Server is running at port: " + PORT + ".");
