import * as ts from "typescript"

// 引入目标文件
const filepath = './index.ts';

// 创建一个program实例
const program = ts.createProgram([filepath], {});

// 获取类型检查器
const checker = program.getTypeChecker();

// 获取index.ts的源代码
const source = program.getSourceFile(filepath);

// 创建printer实例为我们打印最后的ast
const printer = ts.createPrinter();

// 获取kind对应的枚举值的键名
const syntaxToKind = (kind: ts.Node["kind"]) => {
    // console.log(kind);
    return ts.SyntaxKind[kind];
};

// 从根节点开始遍历并打印
ts.forEachChild(source!, node => {
    console.log(syntaxToKind(node.kind));
});

ts.factory.createAdd(ts.factory.createNumericLiteral(1), ts.factory.createNumericLiteral(2));
