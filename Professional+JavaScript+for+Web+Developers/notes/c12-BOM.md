## c12-BOM

BOM的核心——window对象

窗口和弹窗

location对象——页面信息

navigator对象——浏览器信息

history对象——浏览器历史记录

BOM是使用JavaScript**开发Web应用程序**的核心。提供了与网页无关的浏览器功能对象。

浏览器实现之间共通的部分成为了事实标准，为Web开发提供了浏览器间互操作的基础。

HTML5规范，涵盖了BOM的主要内容，希望将JavaScript在浏览器中最基础的部分标准化。



### window对象

表示浏览器的实例。在浏览器中有两重身份：

一个是ECMAScript中的Global对象，

另一个是浏览器窗口的JavaScript接口。

因为window对象的属性在全局作用域中有效，所以很多浏览器API及相关构造函数都以window对象属性的形式暴露出来。

#### Global作用域

通过var声明的所有全局变量和函数都会变成window对象的属性和方法。

如果使用let或const替代var，则不会把变量添加给全局对象。

访问未声明的变量会抛出错误，但可以在window对象上查询是否存在可能未声明的变量，如：

```javascript
var newValue = oldValue; // 抛出错误 ReferenceError: oldValue is not defined
var newValule = window.oldValue; // undefined
```

#### 窗口关系

top对象始终指向最上层（最外层）窗口，即浏览器窗口本身。

parent对象始终指向当前窗口的父窗口。如果当前窗口是最上层窗口，则parent等于top（都等于window）。最上层的window如果不是通过`window.open()`打开的，那么其name属性就不会包含值。

self对象，是终极window属性，始终会指向window。实际上，self和window是同一个对象。

这可以把访问多个窗口的window对象串联起来。（嵌套iframe页面）

#### 窗口位置与像素比

1. 获取位置，移动位置

现代浏览器提供了**screenLeft和screenTop属性**，用于表示窗口相对于屏幕左侧和顶部的位置，**返回值的单位是CSS像素**。

可以使用**moveTo()和moveBy()**方法移动窗口。都接收两个参数，moveTo接收要移动到的新位置的绝对坐标x和y；moveBy接收相对当前位置在两个方向上移动的像素数。

**测试：**FF可用——条件：通过window.open()打开，且只有一个标签页；Chrome不可用。

第一个参数，为负向左移动，为正则向右移动；第二个参数，为负向上移动，为正则向下移动。

依浏览器而定，可能会被部分或全部禁用。

2. 像素比

不同像素密度的屏幕下就会有不同的缩放系数，以便把物理像素（屏幕实际的分辨率）转换为CSS像素（浏览器报告的虚拟分辨率）。

物理像素与CSS像素之间的转换比率由window.devicePixelRatio属性提供。

**例子🌰：**

手机屏幕的物理分辨率为1920x1080，浏览器转换为逻辑分辨率为640x320，window.devicePixelRatio的值就为3。这样一来，12px的文字实际上就会用36的物理像素来显示。

window.devicePixelRatio实际上与每英寸点数（DPI，dots per inch）是对应的。DPI表示单位像素密度，而window.devicePixelRatio表示物理像素与逻辑像素之间的缩放系数。

**[扩展学习](https://github.com/amfe/article/issues/17)：**

屏幕尺寸：指的是屏幕对角线的长度

分辨率：是指宽度上和高度上最多能显示的物理像素点个数

PPI（pixel per inch）:   屏幕像素密度，即每英寸(1英寸=2.54厘米)聚集的像素点个数，这里的一英寸还是对角线长度

DPI:   每英寸像素点，印刷行业术语。对于电脑屏幕而言和PPI是一个意思

设备像素(又称为物理像素 device pixels，dp):    指设备能控制显示的最小物理单位，意指显示器上一个个的点。从屏幕在工厂生产出的那天起，它上面设备像素点就固定不变了，和屏幕尺寸大小有关，单位 pt。

设备独立像素(也叫密度无关像素或逻辑像素device-independent pixel，简称DIPs)：可以认为是计算机坐标系统中得一个点，这个点代表一个可以由程序使用的虚拟像素(比如: css像素)，这个点是没有固定大小的，越小越清晰，然后由相关系统转换为物理像素。

css像素(也叫虚拟像素)：指的是 CSS 样式代码中使用的逻辑像素，在 CSS 规范中，长度单位可以分为两类，绝对(absolute)单位以及相对(relative)单位。px 是一个相对单位，相对的是设备像素(device pixel)

DPR(设备像素比)：设备像素比 = 设备像素 / 设备独立像素。(在Retina屏的iphone上，DPR为2，1个css像素相当于2个物理像素) 1px => 2dp

**以iphone6为例**：

iPhone6的设备宽度和高度为`375pt * 667pt`,可以理解为设备的独立像素（类似css像素）；而其dpr为`2`，根据上面公式，我们可以很轻松得知其物理像素为`750pt * 1334pt`。

对于这样的css样式：

width: 2px;

height: 2px;

在不同的屏幕上(普通屏幕 vs retina屏幕)，css像素所呈现的大小(物理尺寸)是一致的，不同的是1个css像素所对应的物理像素个数是不一致的。

在普通屏幕下，1个css像素 对应 1个物理像素(1:1)。

在retina 屏幕下，1个css像素对应 4个物理像素(1:4)。 1px² => 4 dp²

dpr = 物理像素dp/设备独立像素dip(px)

根据dpr不同，设置其缩放为dpr倒数，设置页面缩放可以使得1个CSS像素(1px)由1个设备像素来显示，从而提高显示精度；因此，设置1/dpr的缩放视口，可以画出1px的边框；

#### 窗口大小

window.innerWidth和window.innerHeight返回**浏览器窗口中页面视口**（可见视口）的宽度和高度（不包含浏览器边框和工具栏，包含滚动条的位置）。（移动端默认是写死的宽度，通过`<meta name="viewport">`设置content可以设置，通常移动端页面会设置为`width=device-width`设置为和设备宽度（ layout-viewport-width，iphone6为375）相同，设置scale=1/dpr时，相当于缩小css像素，使1个css像素对应1个物理像素，设置scale=1时，相当于使用1个css像素对应dpr个物理像素）。

innerWidth = 375 / scale = 750px； innerWidth 分成 10rem, font-size = innerWidth / 10 = 75px

window.outerWidth和window.outerHeight返回**浏览器窗口自身**的大小。(移动端的屏幕宽度，固定不变)

document.documentElement.clientWidth和document.documentElement.clientHeight返回**页面视口**的宽度和高度（不包含滚动条的位置）（返回布局视口的大小，即渲染页面的实际大小，MobileIE返回的是可见视口的大小）。

document.compatMode=="CSS1Compat"，可用于**检查页面是否处于标准模式**。如果是，使用document.docmentElement.clientWidth和clientHeight；否则使用document.body.clientWidth和clientHeight。

window.innerWidth和innerHeight（可见视口的大小），以及document.documentElement.clientWidth和clientHeight（在Mobile Internet Explorer中返回的是可见视口的大小，在其他移动浏览器中返回的是布局视口的大小），在放大或缩小页面时，这些值也会相应变化。Mobile Internet Explorer中把布局视口的信息保存在document.body.clientWidth和clientHeight中，放大或缩小页面时，这些值也会相应变化。

可以使用**resizeTo()和resizeBy()**方法调整窗口大小。都接收两个参数，resizeTo()接收新的宽度和高度，resizeBy()接收宽度和高度要缩放多少。resizeBy()接收负的参数表示缩小，正的参数表示放大。**测试：**FF可用——条件：通过window.open()打开，且只有一个标签页；Chrome不可用。只能应用到最上层的window对象。

#### 视口位置

用户可以通过**滚动**在有限的视口中查看文档。

度量文档相对于视口滚动距离的属性有两对，返回**相等的值**：window.pageXOffset/window.scrollX和window.pageYOffset/window.scrollY。

可以使用**scroll()、scrollTo()和scrollBy()**方法滚动页面。这3个方法都接收表示相对视口距离的x和y坐标。前两个方法的两个参数表示要滚动到的坐标，最后一个表示滚动的距离。

这几个方法也都接收一个scrollToOptions字典，除了提供偏移量，还可以通过behavior属性告诉浏览器是否平滑滚动。

```javascript
scrollBy({left:100, top: 500, behavior: 'smooth'});
scrollTo({left:100, top: 500, behavoir: 'smooth'});

// scroll()和scrollTo()效果相似
```

#### 导航与打开新窗口

1. 弹窗（如何打开一个窗口，以及如何关闭它）

**window.open(**)：导航到指定URL。接收四个参数：要加载的URL、目标窗口、**特性字符串**和表示新窗口在浏览器历史记录中是否替代当前加载页面的布尔值。

通常传前3个参数，第4个参数只有在不打开新窗口时才会使用。

第2个参数如果是一个已经存在的窗口或frame的名字，则会在对应的窗口或frame中打开URL（与a标签中的target属性作用相同）；否则就会打开一个新窗口并将其命名为第2个参数指定的名称。第二个参数也可以是一个特殊的窗口名，如\_self、\_parent、\_top或\_blank。

第3个参数（特性字符串），用于指定新窗口的配置，是一个逗号分隔的设置字符串。如果打开的不是新窗口，会被忽略。（以逗号分隔的名值对，名值对以等号连接）

* fullscreen。yes或no。是否最大化，仅IE支持
* height。数值。新窗口的高度，不小于100。测试：FF和Chrome有效果
* width。数值。新窗口的宽度，不小于100。
* left。数值。新窗口的x轴坐标，不能为负。测试：FF和Chrome有效果
* top。数值。新窗口的y轴坐标，不能为负。测试：FF和Chrome有效果
* location。yes或no。是否显示地址栏，不同浏览器的默认值不同。测试：FF和Chrome会显示地址栏，但是只读
* Menubar。yes或no。是否显示菜单栏，默认为no。测试：ff和Chrome好像没影响？
* resizable。yes或no。是否可以拖动改变新窗口大小。测试：设置no，ff和Chrome好像没影响？
* scrollbars。yes或no。是否可以在内容过长时滚动。
* status。yes或no。是否显示状态栏。
* toolbar。yes或no。是否显示工具栏。

```javascript
self.parent.open('./c12-sub2.html', "newWindow", "location=yes,height=200,left=100,top=0,width=500,Menubar=yes,resizable=no"); // ff和Chrome，设置特性字符串，可以弹出新窗口；否则打开新标签页
```

**window.open()**方法返回一个对新建窗口的引用。为控制新窗口提供了方便。

还可以使用**close()**方法关闭新打开的窗口。

```html
<button id="openSub">open Sub Sub Page</button>
<button onclick="closeSubWindow();">close Sub Sub Page</button>
<script>
    let a;
    document.querySelector('#openSub').addEventListener('click', () => {
        a = self.parent.open('./c12-sub2.html', "newWindow");
    });
    function closeSubWindow() {
        a.close();
        alert(a.closed); // true
    }
</script>
```

只能用于window.open()创建的弹出窗口。弹出窗口可以调用top.close()来关闭自己。

```javascript
// Scripts may close only the windows that were opened by them.
```

关闭后的窗口，只能用于检查其`closed`属性。

新创建窗口的window对象有一个**属性opener**，指向打开它的窗口。这个属性只在弹出窗口的最上层window对象（top）有定义，是指向调用window.open()打开它的窗口或frame的指针。

窗口不会跟踪记录自己打开的新窗口，如有需要开发者要自己记录。

把opener设置为null，表示新打开的标签页不需要与打开它的标签页通信，因此可以在独立进程中运行。（不可逆）

2. 安全限制（**浏览器对弹窗的限制**）

IE早期版本实现对弹窗的多重安全限制（在线广告的滥用），包括不允许创建弹窗或者把弹窗移出屏幕外，以及不允许隐藏状态栏等。IE7开始，地址栏也不能隐藏了，而且弹窗默认不能移动或者缩放。

IE对打开本地网页的窗口再弹窗解除了某些限制，如果代码来自服务器，会施加弹窗限制。

ff1禁用了隐藏状态栏的功能，ff3强制弹窗始终显示地址栏。

Opera只会在主窗口中打开新窗口，但不允许它们出现在系统对话框的位置。

浏览器会在用户操作下才允许创建弹窗。

3. 弹窗屏蔽程序（**检测弹窗是否被屏蔽**）

所有现代浏览器都内置了屏蔽弹窗的程序。如果弹窗被阻止，window.open()可能会返回null。只要检查这个方法的返回值就可以知道弹窗是否被屏蔽了。

在浏览器扩展或其他程序屏蔽弹窗时，window.open()通常会抛出错误。所以要准确检测弹窗是否被屏蔽，还需要用try/catch包裹起来。

```javascript
let blocked = false;
try {
  let win = window.open('xxxxx');
  if(win == null) {
    blocked = true;
  }
} catch(ex) {
  blocked = true;
}
if(blocked) {
  alert("The popup was blocked!");
}
```

#### 定时器

JavaScript在浏览器中是**单线程**执行的，但允许使用定时器指定在某个时间之后或每隔一段时间就执行相应的代码。

**setTimeout()**——通常接收两个参数：要执行的代码和在执行回调函数前等待的时间（毫秒）。第一个参数可以是包含JavaScript代码的字符串或者一个函数；第二个参数是要等待的毫秒数，不是执行代码的确切时间。——返回一个表示该超时排期的数值ID，该超时ID是这被排期执行代码的唯一标识符，可用于取消该任务（clearTimeout）。

为了调度代码的执行，JavaScript维护了一个任务队列。其中的任务会按照添加到队列的先后顺序执行，如果队列是空的，就会立即执行；如果非空，需要等待前面的任务执行完才能执行。

所有超时执行的代码（函数）都会在全局作用域中的一个匿名函数中运行（IIFE？）。

**setInterval()**——每隔指定时间就执行一次代码，直到取消循环定时或者页面卸载。——会返回一个循环定时ID，可用于在未来某个时间点上取消循环定时（clearInterval）。

浏览器不关心任务什么时候执行或者执行要花多长时间。因此，执行时间短、非阻塞的回调函数比较适合setInterval()。使用setTimeout()会在条件满足时自动停止，否则会自动设置另一个超时任务。这个模式是设置**循环任务的推荐做法**。setInterval()很少用于生产环境，因为一个任务结束和下一个任务开始的时间间隔无法保证。

#### 系统对话框

alert()、confirm()和prompt()方法，可以让浏览器**调用系统对话框**向用户显式消息。外观由操作系统或者浏览器决定，无法使用CSS设置。此外 ，这些都是**同步**的模态对话框，调用时代码会中断执行，关闭后代码恢复执行。

警告框：alert()——只接收一个参数。如果参数不是一个原始字符串，则调用这个值的toString()方法将其转换为字符串。——通常用于向用户显示一些他们无法控制的消息，如报错。用户唯一可选的操作就是关闭。

确认框：confirm()——有两个按钮：Cancel和OK，用户通过单击不同的按钮表明希望接下来执行什么操作。返回值为布尔值，true表示单击了OK按钮，false表示单击了Cancel或者关闭了确认框。——通常用于让用户确认执行某个操作。

提示框：prompt()——提示用户输入消息。除了Cancel和OK两个按钮，还会显示一个文本框。接收两个参数：显示给用户的文本，以及文本框的默认值（可以是空字串）。如果提示框被关闭，会返回null；否则点击OK按钮，返回文本框中的值。

Web应用程序最简单快捷的沟通手段。

很多浏览器针对系统对话框添加了**特殊功能**。如有多个系统对话框，则除第一个以外后续的对话框都会显示一个复选框，如果用户选中则会禁用后续的弹框，直到页面刷新。开发者无法获悉这些对话框是否显示了。

JavaScript还可以显示另外两种对话框：find()（查找对话框）和print()（打印对话框）。都是**异步显式**，即控制权会立即返回给脚本。两者都不会返回任何有关用户在对话框中执行了什么操作的信息。浏览器的对话框计数器不会涉及它们，并且用户选择禁用对话框对它们也没有影响。



### location对象

提供了当前窗口中加载文档的信息，以及通常的导航功能。

既是window的属性，也是document的属性。window.location和document.location指向同一个对象。

不仅保存着当前加载文档的信息，也保存着把URL解析为**离散片段**后能够通过属性访问的信息。

* location.hash。URL散列值（#号后跟0或多个字符，#号开头），没有则为空串
* location.host。服务器名及端口号
* location.hostname。服务器名
* location.href。当前加载页面的完整URL。是location.toString()的返回值
* location.pathname。URL中的路径和（或）文件名（host之后search之前的一段字符串？）
* location.port。请求的端口。没有则返回空串
* location.protocol。页面使用的协议。通常是http:和https:
* location.search。URL的查询字符串。以问号开头（[?到#)之间）
* location.username。域名前指定的用户名（？？？）
* location.password。域名前指定的密码（？？？）
* location.origin。URL的源地址。只读。截取href从协议到host的字符串（？）

`http://foouser:barpassword@www.wrox.com:80/WileyCDA/?q=javascript#contents`

#### 查询字符串

需求：逐个访问每个查询参数

**常用**：

```javascript
let getQueryStringArgs = function() {
  let qs = (location.search.length > 0 ? location.search.substring(1) : ""),
      args = {};
  for (let item of qs.split("&").map(kv => kv.split("="))) { // 用&分割成数组，元素的形式为name=value，再用map映射出新数组，元素的形式为[name, value]
    let name = decodeURIComponent(item[0]), // 查询字符串通常是被编码后的格式
        value = decodeURIComponent(item[1]);
    if(name.length) {
      args[name] = value;
    }
  }
  return args;
}
```

**URLSearchParams**：

提供了一组标准API方法，可以检查和修改查询字符串。给URLSearchParams构造函数传入一个查询字符串，就可以创建一个实例（new操作）。实例方法有get()、set()和delete()、has()等方法，可对查询字符串执行相应操作（类似Map？）。实例可用作可迭代对象（for...of）

#### 操作地址

通过修改location对象修改浏览器的地址。

* 最常见（直接修改）：使用**assign()方法**并传入一个URL。`location.assgin("xxx://xxxx");`

  会立即启动导航到新URL的操作，同时在浏览器历史记录中增加一条记录（当前页）。

  给location.href或window.location设置一个URL，会以同一个URL值调用assign()方法。

  修改location对象的属性也会修改当前加载的页面。其中，hash、search、hostname、pathname和port属性被设置为新值之后都会修改当前URL；**除了hash之外，只要修改location的一个属性，就会导致页面重新加载新URL（单页应用通常利用hash模拟前进后退，不会因导航而触发页面刷新）**。

* **replace()方法**。不增加历史记录。接收一个URL参数。调用之后不能返回到前一页。（后退按钮或history.go(-1)或history.back()不能回到前一页）

* **reload()方法**。不传参数的话，页面会以最有效的方式重新加载（不增加历史记录） ：如果页面自上次请求以来没有修改过，浏览器可能会从缓存中加载页面。如果想强制从服务器重新加载，可以给方法传个`true`。

  reload()调用之后的代码可能执行也可能不执行，取决于网络延迟和系统资源等因素。最好把reload()作为最后一行代码。



### navigator对象

客户端标识浏览器的标准。

只要浏览器启用JavaScript，navigator对象就一定存在。

一些定义的属性和方法：

* appVersion。浏览器版本，通常与实际的浏览器版本不一致（？？？）

  Chrome打印："5.0 (Macintosh; Intel Mac OS X 11_2_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.128 Safari/537.36"

  ff打印："5.0 (Macintosh)"

* geolocation。返回暴露Geolocation API的Geolocation对象

* plugins。浏览器安装的插件数组。

* share()。返回当前平台的原生共享机制（测试：Chrome和ff没有？）

* userAgent。返回浏览器的用户代理字符串

  ff打印："Mozilla/5.0 (Macintosh; Intel Mac OS X 10.16; rv:86.0) Gecko/20100101 Firefox/86.0"

  Chrome打印："Mozilla/5.0 (Macintosh; Intel Mac OS X 11_2_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.128 Safari/537.36"

* vendor。返回浏览器的厂商名称

  ff打印：空串

  Chrome打印："Google Inc."

* vendorSub。返回浏览器厂商的更多信息

* vibrate()。触发设备振动

* webdriver。返回浏览器当前是否被自动化程序控制

navigator对象的属性**通常用于确定浏览器的类型**。

#### 检测插件

检测浏览器是否安装了某个插件。（除IE10及更低版本外的浏览器）。plugins数组中的每一项都包含如下属性：

* name：插件名称
* description：插件介绍
* filename：插件的文件名
* length：由当前插件处理的MIME类型数量

name属性包含识别插件所需的必要信息，尽管不是特别准确。**检测插件就是遍历浏览器中可用的插件，并逐个比较插件的名称**。如下：

```javascript
let hasPlugin = function(name) {
  name = name.toLowerCase();
  for(let plugin of window.navigator.plugins) {
    if(plugin.name.toLowerCase().indexOf(name) > -1) {
      return true;
    }
  }
  return false;
}
alert(hasPlugin("Flash"));
alert(hasPlugin("QuickTime"));
```

以上方法可在ff、Safari、Opera和Chrome中检测插件。

plugins数组中的每个插件对象还有一组MimeType对象，可以通过中括号访问（数值下标）。每个MimeType对象有四个属性：description描述MIME类型，enabledPlugin是指向插件对象的指针，suffixes是该MIME类型对应扩展名的逗号分隔的字符串，type是完整的MIME类型字符串。

IE11中的ActiveXObject也从DOM隐身了，不能再用于检测特性。

**旧版本IE中的插件检测**

不支持Netscape式的插件。要使用专有的ActiveXObject，并尝试实例化特定的插件。IE中的插件是实现为COM对象的，由唯一的字符串标识。因此，要检测某个插件就必须知道其COM标识符。

```javascript
function hasIEPlugin(name) {
  try {
    new ActiveXObject(name); // 使用传入的标识符创建一个新ActiveXObject实例
    return true;
  } catch(ex) {
    return false;
  }
}
alert(hasIEPlugin("ShckwaveFlash.ShockwaveFlash"));
alert(hasIEPlugin("QuickTime.QuickTime"));
```

因为检测插件涉及两种方式，所以一般要针对特定插件写一个函数。

```javascript
// 在所有浏览器中检测Flash
function hasFlash() {
  var result = hasPlugin("Flash");
  if(!result) {
    result = hasIEPlugin("ShockwaveFlash.ShockwaveFlash");
  }
  return result;
}
```

#### 注册处理程序

现代浏览器支持navigator上的registerProtocolHandler()方法。可以把一个网站注册为**处理某种特定类型信息**应用程序。（在线RSS阅读器和电子邮件客户端）注册为像桌面软件一样的默认应用程序。

必须传入3个参数：要处理的协议（如“mailto”或“ftp”）、处理该协议的URL，以及应用名称。

🌰：

```javascript
navigator.registerProtocolHandler("mailto", "http://www.somemailclient.com?cmd=%s", "Some Main Client");
```

上例为mailto协议注册了一个处理程序，邮件地址可以通过指定的Web应用程序打开。第二个参数是负责处理请求的URL，%s表示原始的请求。



### screen对象

在编程中很少用的JavaScript对象。保存的纯粹是客户端能力信息，即浏览器窗口外面的**客户端显示器**的信息。如像素宽度和像素高度。每个浏览器会在screen对象上暴露不同的属性。通常用于评估浏览网站的设备信息。

* availHeight/Left/Top/Width：没有被系统组件占用的屏幕的高度/最左侧像素/最顶部像素/宽度
* colorDepth：屏幕颜色的位数：多数系统是32
* height/left/top/width：屏幕像素高度/左边的像素距离/顶部的像素距离/像素高度
* pixelDepth：屏幕的位数
* orientation：返回Screen Orientation API中屏幕的朝向。



### history对象

用于表示**当前窗口**首次使用以来用户的导航历史记录。每个window对象都有自己的history对象。出于安全，不会暴露用户访问过的URL，但可以通过它来前进和后退。（操纵浏览器历史记录的能力，以编程方式实现在历史记录中导航）

#### 导航

go()——可以在用户历史记录中沿任何方向导航，可以前进也可以后退。只接收一个参数，为整数时表示前进或后退多少步；为字符串时，会导航到历史中包含该字符串的第一个位置（可能前进也可能后退）。——如果没有匹配项就什么也不做。

两个简写方法：back()（后退一页）和forward()（前进一页）。模拟了浏览器的后退按钮和前进按钮。

length属性——表示历史记录中有多少个条目，历史记录的数量。对于窗口或标签页中加载的第一个页面，length等于1。通过测试这个值，可以确定用户浏览器的起点是不是你的页面。

history对象通常被用于创建”后退“和“前进”按钮，以及确定页面是不是用户历史记录中的第一条记录。

#### 历史状态管理

历史记录管理。

hashchange事件（17章）。HTML5也为history对象增加了方便的状态管理特性。

hashchange会在页面URL的散列变化时被触发。而状态管理API可以让开发者**改变浏览器URL而不会加载新页面**。

可以使用**history.pushState()方法**：接收3个参数（一个state对象、一个新状态的标题和一个（可选的）**相对URL**）。方法执行后，状态信息就会被推到历史记录中，浏览器地址栏也会改变以反映新的相对URL。

```javascript
let stateObject = {foo: 'bar'};
history.pushState(stateObject, "My title", "web");
```

不会向服务器发送请求。第二个参数暂时没用。第一个参数表示状态的对象大小是有限制的，通常是500K~1M。

pushState()会创建新的历史记录（影响history对象）。单击“后退”会触发**window对象上的popstate事件**，对应的事件对象有一个state属性，其中包含通过pushState()第一个参数传入的state对象。

```javascript
window.addEventListener("popstate", event => {
  let state = event.state;
  if(state) { // 默认为null
    processState(state);
  }
});
```

基于这个状态，应该把页面重置为状态对象所表示的状态。页面初次加载时没有状态。

**也可以使用replaceState()**并传入两个参数（state、title）来更新状态。更新状态不会创建新历史记录，只会覆盖当前状态。

state对象应该只包含可以被序列化的信息。

使用HTML5状态管理时，要确保通过pushState()创建的每个“假”URL背后都对应着服务器上一个真实的物理URL。否则，单击“刷新”按钮会导致404错误。（history模式？）

