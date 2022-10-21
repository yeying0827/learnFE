## 编写TypeScript Transformer Plugin

TypeScript的转化原理与Babel其实是近似的：

1. 先把源代码解析为token流，然后生成AST
2. 通过访问者模式访问AST节点并修改生成新的AST
3. 通过新的AST生成JS代码

### AST遍历的例子

一个例子：

假设文件内容是如下代码

```typescript
// index.ts

const a = 1;
const b = 2;

function add(x: number, y: number): number {
  return x + y;
}
```

我们先遍历`index.ts`文件中的各个AST节点

首先，新建一个文件`transformer.ts`，对AST进行一系列操作。

```typescript
// transformer.ts

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
```

将`transformer.ts`使用tsc编译后运行：

```shell
tsc transformer.ts
```

打印结果：

```
FirstStatement
FirstStatement
FunctionDeclaration
EndOfFileToken

Process finished with exit code 0
```

可以看到，通过遍历我们获得了AST上的节点，首先是两个变量声明：

> ts 4.8.4运行打印的不是VariableStatement，而是FirstStatement；因为两者对应的数字是一样的

接着是一个函数声明（FunctionDeclaration），

最后的`EndOfFileToken`相当于结束标志。

> 代码：
>
> compile-relate/index.ts
>
> compile-relate/transformer.ts
>
> 验证：
>
> * 运行tsc编译：`tsc transformer.ts`
> * 查看效果：`node transformer.js`



### 转换方式

上例中，直接利用了TypeScript提供的API进行了AST的遍历操作，但是如果涉及到转换操作，依然用TypeScript的API进行裸操作会很麻烦，可以使用以下三种主流的方式来进行转换操作：

* 适用于Webpack生态的[ts-loader](https://github.com/TypeStrong/ts-loader)
* 使用[ttypescript](https://github.com/cevek/ttypescript)代替tsc
* 编写自己的编译器包装器

其中应用最广泛、生态最完善的就是ts-loader + webpack。

一个重要原因就是目前的前端开发主要借助的就是webpack打包，选择此种方式更贴近实际开发。

使用方式很简单，就是给ts-loader配置`getCustomTransformers`选项：

```js
module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: {
          // other loader's option
          getCustomTransformers: () => ({ before: [yourImportedTransformer] })
        }
      },
      // ...
    ]
  }
  // ...
}
```

更多配置可以查看[ts-loader](https://github.com/TypeStrong/ts-loader)



### 编写Transformer Plugin的例子

#### 目标

实现如下转换：

```javascript
// before
import { Button } from 'antd'
// after
import Button from 'antd/lib/button'
```

#### 了解需要改什么

CustomTransformer操作的是AST，所以需要了解代码转换前后的AST区别在哪里。

**转换前：**

<img src="../img/beforeTransform.awebp" alt="beforeTransform" />

**转换后：**

![afterTransform](../img/afterTransform.awebp)

可以看出，需要做的转换有两处：

1. 替换ImportClause的子节点，但保留其中的Identifier
2. 替换StringLiteral，为原来的值加上上面的Identifier

如何找到并替换对应的节点呢？

#### 如何遍历并替换节点

TS提供了两个方法遍历AST：

* ts.forEachChild
* ts.visitEachChild

两者的主要区别：

`forEachChild`只能遍历AST，`visitEachChild`在遍历的同时，入参中的`visitor`回调函数会返回新节点，被用于替换当前遍历的节点，所以我们可以利用`visitEachChild`来遍历并替换节点。

visitChild的方法签名：

```typescript
    /**
     * Visits each child of a Node using the supplied visitor, possibly returning a new Node of the same kind in its place.
     *
     * @param node The Node whose children will be visited.
     * @param visitor The callback used to visit each child.
     * @param context A lexical environment context for the visitor.
     */
    function visitEachChild<T extends Node>(node: T | undefined, visitor: Visitor, context: TransformationContext, nodesVisitor?: typeof visitNodes, tokenVisitor?: Visitor): T | undefined;
```

假设已经拿到了AST的根节点SourceFile和`TransformationContext`，就可以用以下代码遍历AST：

```typescript
ts.visitEachChild(SourceFile, visitor, ctx);

function visitor(node) {
  if (node.getChildCount()) {
    return ts.visitEachChild(node, visitor, ctx)
  }
  return node
}
```

visitor返回的节点会被用来替换visitor正在访问的节点。

#### 如何创建节点

TS中AST节点的工厂函数全都以create开头，在编辑器里敲下：ts.create，代码补全列表里能看到很多和节点创建有关的方法。

比如创建一个1+2的节点：

```typescript
// ts 4.8.4 三个方法都已经不再建议使用
ts.createAdd(ts.createNumericLiteral(1), ts.createNumericLiteral(2));

// ts 4.8.4
ts.factory.createAdd(ts.factory.createNumericLiteral(1), ts.factory.createNumericLiteral(2));
```

#### 如何判断节点类型

`ts.SyntaxKind`里存储了所有的节点类型，同时每个节点中都有一个kind字段标明它的类型。

我们可以用以下代码判断是否是我们需要处理的节点类型：

```typescript
if (node.kind === ts.SyntaxKind.ImportDeclaration) {
  // handle...
}
```

也可以用ts-is-kind模块简化判断：

```typescript
import * as kind from 'ts-is-kind'; // 已弃用

if (kind.isImportDeclaration(node)) {
  // ...
}
```

这样就可以对前面的visitor进行补充：

```typescript
function visitor(node) {
    if (node.kind === ts.SyntaxKind.ImportDeclaration) {
        const updatedNode = updateImportNode(node, ctx);
        return updatedNode;
    }
    return node;
}
```

因为Import语句不能嵌套在其他语句下面，所以ImportDeclaration只会出现在SourceFile的下一级子节点上，因此不需要对node做深层递归遍历。

此时只要`updateImportNode`函数完成之前图中的AST转换，我们的工作就完成了。

#### 更新ImportDeclaretion节点

实现updateImportNode函数。

为了方便找到需要的节点，我们对ImportDeclaration做递归遍历，只对NamedImports和StringLiteral做特殊处理：

```typescript
function updateImportNode(node: ts.Node, ctx: ts.TransformationContext) {
    const visitor: ts.Visitor = node => {
        if (node.kind === ts.SyntaxKind.NamedImports) {
            // ...
        }
        if (node.kind === ts.SyntaxKind.StringLiteral) {
            // ...
        }
        if (node.getChildCount()) {
            return ts.visitEachChild(node, visitor, ctx);
        }
        return node;
    }
}
```

* 首先处理`NamedImports`

  在[AST explorer](https://astexplorer.net/)的帮助下，可以发现`NamedImports`包含了三部分：两个大括号和一个叫`Button`的`Identifier`。

  通过kind判断找到这类节点，直接取出其中的`Identifier`，就可以取代原先的`NamedImports`：

  ```typescript
  if (node.kind === ts.SyntaxKind.NamedImports) {
      // ...
      const identifierName = node.getChildAt(1).getText();
      // 返回的节点会被用于取代原节点
      return ts.factory.createIdentifier(identifierName);
  }
  ```

* 再处理`StringLiteral`

  要返回新的`StringLiteral`，需要使用到`NamedImports`中提取出来的`identifierName`，故把identifier提取到外层定义，作为updateImportNode的内部状态。

  同时，`antd/lib`目录下的文件名没有大写字母，因此要把identifierName中首字母大写去掉：

  ```typescript
  if (node.kind === ts.SyntaxKind.StringLiteral) {
      // ...
      const libName = node.getText().replace(/[\"\']/g, '');
    
      if (identifierName) {
        const fileName = camel2Dash(identifierName);
        return ts.factory.createStringLiteral(`${libName}/lib/${fileName}`);
      }
  }
  
  // from: https://github.com/ant-design/babel-plugin-import
  function camel2Dash(_str: string) {
      const str = _str[0].toLowerCase() + _str.substring(1);
      return str.replace(/[A-Z]/g, ($1) => `-${$1.toLowerCase()}`)
  }
  ```

* 完整的`updateImportNode`定义如下：

  ```typescript
  function updateImportNode(node: ts.Node, ctx: ts.TransformationContext) {
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
  }
  ```

#### 完成

至此，就成功实现了最开始的目标，将所有代码整合起来，就是一个完整的Transformer Plugin。

> 代码：
>
> * sourcecode
>
>   compile-relate/src/index.tsx
>
> * transformers
>
>   compile-relate/transformers/index.ts
>
>   compile-relate/transformers/ImportTransformer.ts
>
> * transformer-tester
>
>   compile-relate/transformers/transformerTest.ts
>
> * ts-loader
>
>   compile-relate/webpack.config.js
>
> 准备工作：
>
> ```shell
> # 安装webpack、ts-loader、react、react-dom、antd
> yarn add webpack webpack-cli ts-loader @types/react @types/react-dome -D
> yarn add react react-dom antd
> ```
>
> 测试transformer：
>
> ```shell
> tsc transformers/index.ts ## 生成index.js ImportTransformer.js
> tsc transformers/transformerTest.ts ## 生成transformerTest.js
> 
> node transformers/transformerTest.js
> ```
>
> 在ts-loader中使用：
>
> ```shell
> npx webpack
> ```

#### 改进

上述代码距离babel-plugin-import的完整功能还有很远，比如：

* 同时import多个组件，如：`import { Button, Alert } from "antd"`
* import时用as重命名了，如：`import { Button as Btn } from "antd"`
* CSS也要按需引入

以上都可以在ASTExplorer的帮助下找到AST转换前后的区别，然后按照上文的流程实现。



### 小结

主要介绍了TypeScript Transformer的编写，从一个简单的TypeScript Transformer入手，[ts-import-plugin](https://github.com/Brooooooklyn/ts-import-plugin)

参考文章：[手把手教写 TypeScript Transformer Plugin](https://zhuanlan.zhihu.com/p/30360931)

