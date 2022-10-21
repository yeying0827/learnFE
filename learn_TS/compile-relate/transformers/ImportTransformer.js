"use strict";
exports.__esModule = true;
var ts = require("typescript");
// function visitor(node): ts.Node {
//     if (node.kind === ts.SyntaxKind.ImportDeclaration) {
//         const updatedNode = updateImportNode(node, ctx);
//         return updatedNode;
//     }
//     return node;
// }
function updateImportNode(node, ctx) {
    var identifierName;
    var visitor = function (node) {
        // from: https://github.com/ant-design/babel-plugin-import
        function camel2Dash(_str) {
            var str = _str[0].toLowerCase() + _str.substring(1);
            return str.replace(/[A-Z]/g, function ($1) { return "-".concat($1.toLowerCase()); });
        }
        if (node.kind === ts.SyntaxKind.NamedImports) {
            // ...
            identifierName = node.getChildAt(1).getText();
            // 返回的节点会被用于取代原节点
            return ts.factory.createIdentifier(identifierName);
        }
        if (node.kind === ts.SyntaxKind.StringLiteral) {
            // ...
            var libName = node.getText().replace(/[\"\']/g, '');
            if (identifierName) {
                var fileName = camel2Dash(identifierName);
                return ts.factory.createStringLiteral("".concat(libName, "/lib/").concat(fileName));
            }
        }
        if (node.getChildCount()) {
            return ts.visitEachChild(node, visitor, ctx);
        }
        return node;
    };
    return ts.visitEachChild(node, visitor, ctx);
}
var ImportTransformer = function (ctx) {
    var visitor = function (node) {
        if (node.kind === ts.SyntaxKind.SourceFile) {
            var newNode = ts.visitEachChild(node, visitor, ctx);
            var printer = ts.createPrinter();
            console.log(printer.printFile(node.getSourceFile()));
            console.log(printer.printFile(newNode.getSourceFile()));
            return newNode;
        }
        if (node.kind === ts.SyntaxKind.ImportDeclaration) {
            return updateImportNode(node, ctx);
        }
        return node;
    };
    return function (sf) {
        return ts.visitNode(sf, visitor);
    };
};
exports["default"] = ImportTransformer;
