"use strict";
exports.__esModule = true;
var ts = require("typescript");
// 引入目标文件
var filepath = './index.ts';
// 创建一个program实例
var program = ts.createProgram([filepath], {});
// 获取类型检查器
var checker = program.getTypeChecker();
// 获取index.ts的源代码
var source = program.getSourceFile(filepath);
// 创建printer实例为我们打印最后的ast
var printer = ts.createPrinter();
// 获取kind对应的枚举值的键名
var syntaxToKind = function (kind) {
    // console.log(kind);
    return ts.SyntaxKind[kind];
};
// 从根节点开始遍历并打印
ts.forEachChild(source, function (node) {
    console.log(syntaxToKind(node.kind));
});
