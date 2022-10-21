## TypeScript的编译原理

定制TypeScript

TypeScript暴露了相关的接口给开发者，允许开发者控制部分JavaScript代码的生成。即，我们可以通过编写TypeScript Transformer Plugin的方式控制最终生成的js代码。

编写TypeScript Transformer Plugin之前需要了解一些前置知识，就是TypeScript的编译原理中一些简单的知识点。

### 编译器的组成

TypeScript编译器的主要组成部分：

* Scanner：扫描器
* Parser：解析器
* Binder：绑定器
* Emitter：发射器
* Checker：检查器



### 编译器的主要操作

* Scanner通过扫描源代码生成token流

  ```
  扫描器（SourceCode）--> Token流
  ```

* Parser将token流解析为抽象语法树（AST）

  ```
  解析器（Token流）--> AST
  ```

* Binder将AST中的声明节点与相同实体的其他声明相连形成符号（Symbols）。符号是语义系统的主要构造块

  ```
  绑定器（AST）--> Symbols
  ```

* Checker通过符号和AST来验证源代码语义

  ```
  检查器（AST，Symbols）--> 类型验证
  ```

* 通过Emitter生成JavaScript代码

  ```
  发射器（AST，检查器）--> JavaScript代码
  ```



### 编译器处理流程

TypeScript的编译流程可以粗略地分为三步：

1. 解析
2. 转换
3. 生成

结合编译器的各个组成部分和主要操作，得到如下流程图：

![流程图](../img/compile.awebp)

开发者编写的Transformer Plugin作用于**Emitter**阶段



### 抽象语法树AST

抽象语法树怎么来的。

例子：一段变量声明的代码`var a = ...`，它要经过下面两个步骤来得到AST

1. 字符流转化为被定义过的token流（一个个单词？）
2. 线性token流被转化为抽象语法树

![得到AST](../img/convert2AST.awebp)

AST是一棵树，这棵树的节点代表了语法信息，这棵树的边代表了节点之间的组成关系。

例子：

```javascript
const a = 3 + 4;
console.log(a);
```

它的AST以`ES Tree`规范来以JSON形式输出

```json
{
  "type": "Program",
  "body": [
    {
      "type": "VariableDeclaration",
      "kind": "const",
      "declarations": [
        {
          "type": "VariableDeclarator",
          "id": {
            "type": "Identifier",
            "name": "a"
          },
          "init": {
            "type": "BinaryExpression",
            "operator": "+",
            "left": {
              "type": "Literal",
              "value": 3
            },
            "right": {
              "type": "Literal",
              "value": 4
            }
          }
        }
      ]
    },
    {
      "type": "ExpressionStatement",
      "expression": {
        "type": "CallExpression",
        "callee": {
          "type": "MemeberExpression",
          "computed": false,
          "object": {
            "type": "Identifier",
            "name": "console"
          },
          "property": {
            "type": "Identifier",
            "name": "log"
          }
        },
        "arguments": [
          {
            "type": "Identifier",
            "name": "a"
          }
        ]
      }
    }
  ]
}
```

从解析源代码到生成AST之间的步骤是TypeScript控制的，我们无法干涉，我们可以做的是：访问AST的节点并修改其携带的信息和节点与节点之间的关系，最终生成新的AST，再根据新AST生成代码。这样就达到了控制代码转换的目的。



### 修改节点

想要修改节点，就必须对节点进行访问，这就涉及到了**访问者模式**，这种模式使我们可以遍历一棵树，而不必实现或知道树中的所有信息。

例子：将所有需要修改的节点中标识符为`a`改为`b`

```typescript
tree.visit({
  Identifier(node) {
    if (node.name === 'a') {
      node.name = 'b';
    }
  },
})
```

在TypeScript的具体使用模板是这样的：

```typescript
import * as ts from 'typescript';
export default function(/*opts?: Opts*/) {
  function visitor(ctx: ts.TransformationContext, sf: ts.SourceFile) {
    const visitor: ts.Visitor = (node: ts.Node): ts.VisitResult => {
      // here we can check each node and potentially return
      // new nodes if we want to leave the node as is, and
      // continue searching through child nodes:
      return ts.visitEachChild(node, visitor, ctx);
    }
    return visitor;
  }
  return (ctx: ts.TransformationContext): ts.Transformer => {
    return (sf: ts.SourceFile) => ts.visitNode(sf, visitor(ctx, sf));
  }
}
```

给TypeScript Transformer指定AST，然后通常一个Transformer将使用`visitor`来遍历AST，访问者可以检查AST中的每个节点并在这些节点上执行操作，例如代码验证、分析，然后确定是否以及如何修改代码。



### 小结

简略地讲解了TypeScript的编译过程，对大概的流程有一个粗略的认知。

