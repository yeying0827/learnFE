## c02-HTML中的JavaScript

### \<script\>元素

#### 形式

* 行内

  其中的代码会被从上到下解释。计算完成之前，页面其余内容不会被加载，也不会被显式。

* 外部

  下载与解析都会阻塞HTML解析，扩展名.js不是必需的，前提是确保服务器返回正确的MIME类型。

  同时行内有JavaScript代码的话，行内代码会被忽略。

  浏览器在解析资源时，会向src指定的路径发送一个GET请求，以取得相应资源。这个初始的请求不受浏览器同源策略限制（但仍受父页面HTTP/HTTPS协议的限制），但返回并被执行的JavaScript则受限制。

  **优点**：

  * 可以让我们通过不同的域分发JavaScript（确保是自己所有或者可信来源）
  * 可以动态加载和执行JavaScript代码
  * 可以将内容集中管理，提高可维护性，可独立编辑，可多处共享，可更好利用缓存（提高加载速度）
  * 不至于让HTML文件过大
  * 兼容HTML和XHTML（不必额外考虑XHTML中的注释hack）
  * 对于支持SPDY/HTTP2的浏览器，可以轻量、独立JavaScript组件形式向客户端送达脚本，从同一个地方取得一批文件，并将它们逐个放到浏览器缓存中。（Push Cache？）



#### 属性

* **src**：要执行的代码的外部文件。一个URL。

* **type**：代码块中脚本语言的内容类型（MIME类型）

  惯例为"text/javascript"。

  JavaScript文件的MIME类型通常是"application/x-javascript"，不过给type设置这个值可能导致脚本被忽略。

  **设置为"module"**会被当作ES6模块，可使用import和export关键字。**行为类似加defer**，模块依赖关系也会被下载，等HTML解析完成后执行；如果再设置async，行为类似async，模块依赖关系都下载完后就开始执行（无论HTML解析是否完成）

* **defer**（只对外部脚本文件有效，IE7及更早版本中行内脚本也可指定）不阻塞文档解析

  脚本下载与HTML解析并行，等HTML解析完成后**每个脚本会有序执行**（HTML5规定的有序，并在DOMContentLoaded事件（所有同步js代码执行完毕后触发）之前执行，实际不一样按顺序，且加载慢的话可能在Loaded事件之后执行，因此最好只包含一个这样的脚本）

  考虑兼容，最好还是把要延迟执行的脚本放在页面底部。

  XHTML中指定defer需要写成：defer="defer"

* **async**（只对外部脚本文件有效）下载过程不阻塞文档解析

  **下载**脚本与HTML解析并行。不阻塞其他页面动作（如下载资源或其他脚本加载（读取？））

  **脚本执行**时还是会中断HTML解析，不保证执行顺序与插入DOM的顺序一致。

  动态导入的脚本（createElement，.src），默认append到文档中的`script`会异步执行（类似async），如果需要的js按顺序执行，需要设置`async`为false。

  **不应在页面加载期间修改DOM，与其他异步脚本没有依赖关系**。

  保证会在页面的load事件（所有资源完成加载后触发）前执行。

  XTML中指定async需要写成：async="async"

* **language**：（废弃）

* **charset**：（很少用），使用src属性时指定的代码字符集

* **crossorigin**：配置相关请求的CORS（跨源资源共享）设置。默认不使用CORS。

  属性值：

  * anonymous  配置文件请求不必设置凭据标志（不携带cookie）

  * use-credentials  设置凭据标志，意味着出站请求会包含凭据（携带cookie）

  * 空或非法值  默认当作anonymous

  这个配置主要是想在当前项目中引用跨域的资源文件时，能捕捉到具体的报错信息（`window.onerror`）

  如果设置了crossorigin，浏览器启用CORS访问检查，服务器端必须返回一个`Access-Control-Allow-Origin`的header，否则资源无法访问。

* **integrity**：允许 比对接收到的资源和指定的加密签名以验证子资源完整性（SRI， Subresource Integrity）。（不是所有浏览器都支持）

  如果接收到的资源的签名与该属性指定的签名不匹配，则页面报错，脚本不执行。可用于确保CDN（内容分发网络，Content Delivery Network）不会提供恶意内容（XSS风险）。



#### 放置位置

head还是body？

过去都集中放置在页面的\<head\>标签内，这会导致必须把所有JavaScript代码都下载、解析和解释完后，才开始渲染页面。如果JavaScript内容过多，就会导致页面渲染的明显延迟。

现代Web应用通常把所有JavaScript引用放在\<body\>元素中的内容后面。防止渲染被阻塞导致的白屏。JS只能获取已经解析的DOM。



#### 动态加载脚本

使用DOM API。默认以异步方式加载，相当于添加了async属性。不是所有浏览器都支持async属性，要统一行为，可以明确设置async为false（同步加载）。

以此种方式获取的资源对浏览器的预加载器不可见。会严重影响它们在资源获取队列中的优先级。可能会严重影响性能。要让预加载器知道这些动态请求文件的存在，可以在文档头部显式地声明它们：

```html
<link rel="preload" href="xxx.js">
```



#### XHTML

必须指定type属性且为"text/javascript"

编写代码的规则比HTML中严格，**在HTML中，解析\<script\>元素会应用特殊规则**，但XHTML中没有这些规则。例子：小于号<被解释成一个标签的开始

1. 把小于号替换成对应的HTML实体形式\&lt; ——影响阅读

2. 把所有代码都包含到一个CDATA块中——可以包含任意文本的区块，其内容不作为标签来解析

   ```xml
   <script type="text/javascript"><![CDATA[
   	function () {}
   ]]></script>
   ```

   在不支持CDATA块的非XHTML兼容浏览器中，需要使用JavaScript注释来抵消：

   ```xml
   <script type="text/javascript">
   //<![CDATA[
   	function () {}
   //]]>
   </script>
   ```

XHTML模式会在页面的MIME类型被指定为"application/xhtml+xml"时触发，不是所有浏览器都支持



#### 兼容

* xml中的应用

* noscript以及不支持JavaScript的浏览器

  * （Netscape联合Mosaic）把脚本代码包含在一个HTML注释中，如：

    ```html
    <script><!--
    	function () {}
    //--></script>
    ```

    现在已不必再使用。在XHTML模式下，这样写也会导致脚本被忽略，因为代码处于有效的XML注释当中。

  * \<noscript\>元素

    可以包含任何可以出现在\<body\>中的HTML元素。触发条件：

    浏览器不支持脚本；浏览器对脚本的支持被关闭



#### 文档模式的影响doctype

主要区别：主要体现在通过CSS渲染的内容方面，对JavaScript也有一些关联影响（副作用）

* 混杂模式quirks mode

  让IE像IE5一样（支持一些非标准特性）

  以省略文档开头的doctype声明作为开关。——在不同浏览器中差异非常大，需要hack

* 标准模式standards mode

  让IE具有兼容标准的行为

  ```html
  <!-- HTML 4.01 Strict -->
  <!DOCTYPE ....>
  
  <!-- XHTML 1.0 Strict -->
  <!DOCTYPE ...>
  
  <!-- HTML5 -->
  <!DOCTYPE html>
  ```

* 准标准模式almost standards mode

  主要区别在于，如何对待图片元素周围的空白。

  通过过渡性文档类型（Transitional）和框架集文档类型（Frameset）来触发。

  ```html
  <!-- HTML 4.01 Transitional -->
  <!DOCTYPE ....>
  
  <!-- HTML 4.01 Frameset -->
  <!DOCTYPE ....>
  
  <!-- XHTML 1.0 Transitional -->
  <!DOCTYPE ...>
  
  <!-- XHTML 1.0 Frameset -->
  <!DOCTYPE ...>
  ```

  

