import * as ts from 'typescript';

// function visitor(node): ts.Node {
//     if (node.kind === ts.SyntaxKind.ImportDeclaration) {
//         const updatedNode = updateImportNode(node, ctx);
//         return updatedNode;
//     }
//     return node;
// }

function updateImportNode(node: ts.Node, ctx: ts.TransformationContext): ts.Node {
    let identifierName;

    const visitor: ts.Visitor = node => {

        // from: https://github.com/ant-design/babel-plugin-import
        function camel2Dash(_str: string) {
            const str = _str[0].toLowerCase() + _str.substring(1);
            return str.replace(/[A-Z]/g, ($1) => `-${$1.toLowerCase()}`)
        }

        if (node.kind === ts.SyntaxKind.NamedImports) {
            // ...
            identifierName = node.getChildAt(1).getText();
            // 返回的节点会被用于取代原节点
            return ts.factory.createIdentifier(identifierName);
        }
        if (node.kind === ts.SyntaxKind.StringLiteral) {
            // ...
            const libName = node.getText().replace(/[\"\']/g, '');

            if (identifierName) {
                const fileName = camel2Dash(identifierName);
                return ts.factory.createStringLiteral(`${libName}/lib/${fileName}`);
            }
        }
        if (node.getChildCount()) {
            return ts.visitEachChild(node, visitor, ctx);
        }
        return node;
    }

    return ts.visitEachChild(node, visitor, ctx);
}

const ImportTransformer = (ctx: ts.TransformationContext): ts.Transformer<ts.SourceFile> => {
    const visitor: ts.Visitor = (node: ts.Node): ts.Node => {
        if (node.kind === ts.SyntaxKind.SourceFile) {
            const newNode = ts.visitEachChild(node, visitor, ctx);
            const printer = ts.createPrinter();
            console.log(printer.printFile(node.getSourceFile()));
            console.log(printer.printFile(newNode.getSourceFile()));

            return newNode;
        }
        if (node.kind === ts.SyntaxKind.ImportDeclaration) {
            return updateImportNode(node, ctx);
        }

        return node;
    }
    return (sf: ts.SourceFile) => {
        return ts.visitNode(sf, visitor);
    }
}

export default ImportTransformer;
