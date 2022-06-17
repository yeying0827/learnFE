/*
简单合并代码
*/

const { readFileSync, open, close, writeFile } = require('fs');
const fs = require('fs');
const path = require('path');

let content = '/* 合并A.js和B.js */\n';
const read = (filepath) => {
    const data = readFileSync(filepath);
    content += data.toString();
}

const write = () => {
    writeFile(path.resolve(__dirname, 'C.js'), content, (err) => {
        if (err) throw err;
        console.log('The file has been saved!');
    });
}

const pagesRoot = path.resolve(__dirname, './src');
fs.readdirSync(pagesRoot).forEach((file) => {
    read(path.resolve(pagesRoot, file))
});
write();
