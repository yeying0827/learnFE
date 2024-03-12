const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

const PORT = 8888;
const mime = {
    'html': 'text/html;charset=UTF-8',
    'wasm': 'application/wasm'
}

http.createServer((req, res) => {
    let realPath = path.join(__dirname, `.${url.parse(req.url).pathname}`);
    fs.access(realPath, fs.constants.R_OK, err=> {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end();
        } else {
            fs.readFile(realPath, "binary", (err, file) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end();
                } else {
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
console.log(`Server is running at port: ${PORT}`);