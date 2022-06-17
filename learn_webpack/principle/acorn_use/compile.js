const { readFileSync } = require('fs');

const acorn = require('acorn');

const data = readFileSync('./src/entry.js');
const data1 = readFileSync('./src/bar.js');

// 遍历所有节点的函数
function walkNode(node, callback) {
    callback(node);

    Object.keys(node).forEach(key => {
        const item = node[key];
        if (Array.isArray(item)) {
            item.forEach(sub => {
                sub.type && walkNode(sub, callback);
            })
        }

        item && item.type && walkNode(item, callback);
    })
}

function parseDependencies(str) {
    const ast = acorn.parse(str, {
        sourceType: "module",
        ranges: true
    });
    const resource = []; // 依赖列表

    // 从根节点开始
    walkNode(ast, node => {
        const callee = node.callee;
        const args = node.arguments;

        // require 我们认为是一个函数调用，并且函数名为require，参数只有一个，且必须是字面量
        if (
            node.type === 'CallExpression' &&
            callee.type === 'Identifier' &&
            callee.name === 'require' &&
            args.length === 1 &&
            args[0].type === 'Literal'
        ) {
            const args = node.arguments;

            // 获取依赖的相关信息
            resource.push({
                string: str.substring(node.start, node.end),
                path: args[0].value,
                start: node.start,
                end: node.end
            });
        }

        // import声明的处理
        if (
            node.type === 'ImportDeclaration' &&
            node.source.type === 'Literal'
        ) {
            const usages = node.specifiers;

            resource.push({
                string: str.substring(node.start, node.end),
                path: node.source.value,
                start: node.start,
                end: node.end,
                usage: usages.map(item => {
                    if (item.type === 'ImportDefaultSpecifier') {
                        return item.local.name;
                    } else {
                        return {
                            imported: item.imported.name,
                            local: item.local.name
                        }
                    }
                })
            });
        }
    });

    return resource;
}

console.log(parseDependencies(data.toString()));
console.log(parseDependencies(data1.toString()));

// const ast = acorn.parse(data, {
//     sourceType: "module",
//     locations: true,
//     onComment: (isBlock, text, start, end, startLoc, endLoc, ) => {},
//     onToken: (token) => {
//         console.log(token);
//     }
// });
