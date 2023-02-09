## 调试：Vue Devtools

一个能全盘帮我们监控项目的方方面面，甚至在监控时，能精确到源码每一行的运行状态的调试工具，非常有必要。

在Chrome Devtools的基础之上，开发框架对应的调试插件，可以更方便地调试框架内部的代码；Vue Devtools可以帮助我们更好地调试Vuejs代码。

### Chrome调试工具

有几个tab是经常用到的：

* ElementsTab可以帮助我们调试页面的HTML和CSS
* ConsoleTab可以帮助我们调试JavaScript
* SourcesTab可以帮助我们调试开发中的源码
* ApplicationTab可以帮助我们调试本地存储和一些浏览器服务，比如Cookie、LocalStorage、通知等等
* NetworkTab在我们开发前后端交互接口的时候，可以让我们看到每个网络请求的状态和参数
* PerformanceTab则用来调试网页性能
* LightHouse是Google官方开发的插件，用来获取网页性能报告
* 还可以选中MoreTools来开启更多自带的插件
* Animations用于调试动画
* Security用于调试安全特性

#### ElementsTab和ConsoleTab

用于调试页面中的HTML+CSS+JavaScript，是使用频率最高的两个选项卡。

ElementsTab对于我们开发的页面布局和样式调整非常有帮助。

选中左侧某个元素时，点击右侧的element.style，可以给元素直接新增css属性，并在页面上看到效果。有一些页面布局上的bug可以用这种方式，在网页里实时调整后，再去修改代码。

在ConsoleTab中，可以直接调试JavaScript，并且也会显示JavaScript出现的报错信息。

点击报错信息的最右侧，还能精确地定位到项目中的文件以及代码的行数。精确的报错定位可以极大地提高我们的开发效率。

在src/main.js中加入下面这段代码，就可以在日志信息中直接复制报错内容中的链接，去StackOverflow中寻找答案。

```javascript
window.onerror = function (e) {
    console.log([`https://stackoverflow.com/search?q=[js]+${e}`]);
}
```

除了console.log，还有console.info、console.error等方法可以显示不同级别的报错信息。还可以使用console.table更便捷地打印数组消息。[MDN Console](https://developer.mozilla.org/zh-CN/docs/Web/API/Console)

**一道面试题：**在Console Tab中写代码，统计某网页一共有多少种HTML标签。

```javascript
new Set([...document.querySelectorAll('*')].map(n => n.nodeName)).size;
```



### Vue Devtools

Vue Devtools可以算是一个Elements Tab的Vue定制版本，调试页面左侧的显示内容并不是HTML，而是Vue的组件嵌套关系。

在调试Tab的左侧中，当我们点击组件的时候，所调试的页面上会高亮该组件的覆盖范围，Tab的右侧则显示着组件内部所有的数据和方法。

可以清晰地看到setup配置下的诸多变量，这些变量也是和页面实时同步的数据。

同时，我们也可以直接修改调试Tab里的数据，正在调试的前端页面也会同步数据的显示效果。

在Components的下拉框位置，我们还可以选择Vuex和RoutesTab，分别用来调试Vuex和vue-router。

可以在调试窗口的右侧看到Vuex内部所有的数据变化；当选择Routes时，Tab中会显示整个应用路由的配置、匹配状态、参数等。

同时在Components下拉框时，可以直接在编辑器中打开对应组件代码。



### 断点调试

太多的Console信息会让页面显得非常臃肿，为此还有专门去掉Console代码的webpack插件。

如果代码逻辑复杂，过多的Console信息也会难以调试；此时就需要断点调试。Chrome的调试窗口会识别代码中的**debugger**关键字，并中断代码的执行。

对于复杂代码逻辑的调试来说，使用断点调试，可以让整个代码执行过程清晰可见。



### 性能相关的调试

选择PerformanceTab，点击面板中的录制按钮，然后进行刷新页面的操作，就可以很清晰地看到网页页面加载的过程；包括函数和事件的执行顺序，以及一些性能指标（比如耗时）[Chrome Performance Doc](https://developer.chrome.com/docs/devtools/performance/)

还可以直接使用lighthouse插件。进入lighthouse tab，选择desktop桌面版后，点击生成报告。lighthouse会在浏览器上模拟刷新的操作后，给出一个网页评分。此外，根据性能、可访问性、最佳实践、SEO和PWA五个维度给出评分。

详细给出FCP、TTI、LCP等常见性能指标，还会很贴心给出建议，包括字体、图标宽高、DOM操作等等，我们按照这些建议依次修改，就可以实现对网页的性能优化了。并且网页优化后，性能分数的提升还可以很好地量化优化的结果。



### 总结

* Chrome调试工具中最基本的Elements和Console Tab
* Elements和Console可以完成页面的布局和JavaScript的调试工作，并且调试窗口还会识别代码中的debugger语句，可以让我们在Chrome中进行断点调试
* Performance和lighthouse则提供了对页面做性能测试的方法，从而能帮助我们更好地查看页面中性能的指标。
* 在Vue Devtools中可以很方便地调试Vue应用，比如查看Vue的组件嵌套、查看Vue组件内部的data等属性；VueDevtools还支持了Vuex和vue-router的调试，让整个页面的Vuex数据和路由都清晰可见。

通过调试工具快速地定位问题