## 为什么要学习TypeScript

### 1. 与JavaScript的关系

JavaScript的超集。

在TypeScript中可以使用一些尚在提案阶段的语法特性，可以有控制访问符，最主要的区别就是TypeScript是一门静态语言。

给一门语言加语法糖是相对容易推进到标准的事情，而直接把一门语言从动态改为静态，还要兼容数以亿计的老旧网站，在可预见的时间内几乎不可能发生。TypeScript的静态性是它立于不败之地的基础。

TypeScript是静态弱类型语言，因为要兼容JavaScript，所以TypeScript几乎不限制JavaScript中原有的隐式类型转换。（保留灵活性）

### 2. TypeScript优点

1. 在代码编写阶段就规避大量的低级错误（TypeError）

2. 提升团队协作效率，节省大量沟通成本、代码阅读成本等等（显示类型就是最好的注释，TypeScript提供的类型提示功能使我们可以非常清晰地调用同伴的代码）

   FlowType静态类型检查器

   pyre-check静态类型检查器

3. 可以通过配置保持灵活度

   可以在任何想灵活的地方将类型定义为any，且TypeScript对类型的检查严格程度可以通过`tsconfig.json`来配置

4. Structural Type System（结构类型系统）

   即使开启`strict`，TypeScript依然很灵活，为了兼容JavaScript，TypeScript采用了Structural Type System。

   TypeScript中的类型不是定义本身，而是定义的形态。例子：

   ```typescript
   class Foo {
     method(input: string): number { /*...*/ }
   }
   
   class Bar {
     method(input: string): number { /*...*/ }
   }
   
   const foo: Foo = new Foo(); // ok
   const bar: Bar = new Foo(); // ok
   ```

保留灵活度的同时，带来生产力上的提升

### 3. TypeScript的缺点

1. 与实际框架结合会有很多坑
2. 配置学习成本高
   * 目前的前端脚手架基本以JavaScript为主，TypeScript相比于JavaScript多年积累的生态还是稍显不如，很多时候需要自己定制脚手架
3. TypeScript的类型系统比较复杂，需要额外的学习成本