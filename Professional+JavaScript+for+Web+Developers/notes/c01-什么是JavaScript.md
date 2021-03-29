## c01-什么是JavaScript

1995年问世。

最初在客户端处理某些基本的验证。

名字：Mocha -> LiveScript -> JavaScript



ECMAScript脚本语言标准：ECMA-262（TC39，第39技术委员会）



### 完整的的JavaScript包含：

* 核心ECMAScript
* 文档对象模型DOM
* 浏览器对象模型BOM

宿主环境提供ECMAScript的基准实现和与环境自身交互必需的扩展。



### ECMA-262定义了什么：

语法 | 类型 | 语句 | 关键字 | 保留字 | 操作符 | 全局对象



### 版本更迭

第1版：本质上与JavaScript1.1相同，支持Unicode标准，对象与平台无关

第2版：一些编校

第3版（！！）：更新了字符串处理、错误定义和数值输出。另外还增加了对正则表达式、新的控制语句、try/catch异常处理的支持，等

第4版（×）：强类型变量、新语句和数据结构、真正的类和经典的继承，以及操作数据的新手段

第5版（3.1！！！）：厘清第3版的歧义，增加对JSON的支持、方便继承和高级属性定义的方法、增加严格模式

第6版（2015.6！！！！）：支持类、模块、迭代器、生成器、箭头函数、期约（Promise）、反射、代理和众多新的数据类型（Map、Set等）

第7版（2016.6）：少量语法层面的增强，如Array.prototype.includes和指数操作符

第8版（2017.6）：增加了异步函数（async/await）、SharedArrayBuffer及Atomics API，以及Object.values()/Object.entreis()/Object.getOwnPropertyDescriptors()和字符串填充方法（？），明确支持对象字面量最后的逗号。

第9版（2018.6）：异步迭代、剩余和扩展属性、一组新的正则表达式特性、Promise finally()，以及模板字面量修订

第10版（2019.6）：增加了Array.prototype.flat()/flatMap()、String.prototype.trimStart()/trimEnd()、Object.fromEntries()方法，以及Symbol.prototype.description属性，明确定义了Function.prototype.toString()的返回值并固定了Array.prototype.sort()的顺序。解决了与JSON字符串兼容的问题，并定义了catch子句的可选绑定（？）



### ECMAScript符合性：

必须满足的条件

* 支持ECMA-262中描述的所有“类型、值、对象、属性、函数，以及程序语法与语义”；
* 支持Unicode字符



### 浏览器支持

| 浏览器          | DOM Level  | ECMAScript符合性 |
| --------------- | ---------- | ---------------- |
| IE5.5~8         | DOM Level1 | ES3              |
| IE9             |            | ES5（部分）      |
| IE10-11         |            | ES5              |
| Edge12+         |            | **ES6**          |
| Safari6~8       |            | ES5              |
| Safari9+        |            | **ES6**          |
| Chrome49+       |            | ES6              |
| FireFox45+      |            | ES6              |
| iOS Safari 9.2+ |            | ES6              |



### DOM

一个应用编程接口（API），用于在HTML中使用扩展的XML。DOM将整个页面抽象为一组分层节点。

动态HTML：不刷新页面而修改页面外观和内容。

#### DOM级别

* **DOM Level1**（1998）：DOM Core和DOM HTML两个模块。目标：映射文档结构

  DOM Core：提供一种映射XML文档，从而方便访问和操作文档任意部分的方式；DOM HTML扩展了Core并增加了特定于HTML的对象和方法。

* **DOM Level2**：增加了对鼠标和用户界面事件、范围、遍历的支持，通过对象接口支持了CSS。DOM Core也被扩展以包含对XML命名空间的支持。

  新增模块：

  * DOM视图：描述追踪文档不同视图的接口。（如应用CSS样式前后的文档）
  * DOM事件：描述事件及事件处理的接口
  * DOM样式：描述处理元素CSS样式的接口
  * DOM遍历和范围：描述遍历和操作DOM树的接口

* **DOM Level3**：进一步扩展了DOM，增加了以统一的方式加载和保存文档的方法（DOM Load and Save的新模块中），还有验证文档的方法（DOM Validation）。DOM Core扩展以支持所有XML1.0的特性，包括XML Infoset、XPath和XML Base。

* **DOM4（DOM Living Standard）**：新增的内容包括替代Mutation Events的Mutation Observers。

L1+L2（部分）+L3（部分）：Opera 9 | Safari2+ | iOS Safari 3.2+ | Chrome 1+ | FF 1+



#### 其他DOM

基于XML的，增加了自己独有的DOM方法和接口：

* SVG（可伸缩矢量图，Scalable Vector Graphics）
* MathML（数学标记语言，Mathematics Markup Language）
* SMIL（同步多媒体集成语言，Synchronized Multimedia Integration Language）



### BOM

可以操控浏览器显式页面之外的部分。

唯一一个没有相关标准的JavaScript实现。<——HTML5

主要针对浏览器窗口和子窗口，通常包括特定于浏览器的扩展:

* 弹出新浏览器窗口的能力(window.open)
* 移动、缩放和关闭浏览器窗口的能力
* navigator对象，提供关于浏览器的详尽信息
* location对象，提供浏览器加载页面的详尽信息
* screen对象，提供关于用户屏幕分辨率的详尽信息
* performance对象，提供浏览器内存占用、导航行为和时间统计的详尽信息
* 对cookie的支持
* 其他自定义对象，如XMLHttpRequest和IE的ActiveXObject



多数浏览器对JavaScript的支持，指的是实现ECMAScript和DOM的程度。

