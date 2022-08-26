## Root Config 概念

`root config`的配置主要用于启动微应用

### index.ejs

内容是脚手架自动生成的，主要包含import maps的配置，对本地服务的路径解析配置，开发工具配置。

使用`single-spa`不是必须要使用`SystemJS`，不过为了能够独立部署各应用，推荐使用`SystemJS`。

### root-config.js

#### 注册应用

调用`registerApplication()`方法来注册应用，方法的参数有两种形式，一种是逐个传入参数，另一种是使用对象作为参数。

* 第一种形式的各个参数

  * 第一个参数：name。表示应用名称，`string`类型

  * 第二个参数是加载函数或应用。可以是一个返回值为`Promise`类型的加载函数，也可以是一个`application对象。`

    * `application`对象：一个包含各个生命周期函数的对象。可以从外部引入，也可以直接在root-config.js中定义

      ```js
      const application = {
        bootstrap: () => Promise.resolve(),
        mount: () => Promise.resolve(),
        unmount: () => Promise.resolve()
      };
      
      registerApplication('applicationName', application, activityFunction)
      ```

    * 加载函数：必须返回`promise`对象的函数。加载函数没有入参，会在应用第一次被下载时调用，返回的Promise在resolve之后必须是一个可以被解析的应用，最常见的是使用`import`方法：

      ```js
      registerApplication('applicationName', () => import('/path/to/application.js'), activityFunction)
      ```

  * 第三个参数是应用的激活判断条件。可以是一个函数，window.location作为函数的参数，当函数返回值为`true`时，应用会被激活。

    通常情况下，会根据location中的path信息进行判断。

    另一种激活的条件，`single-spa`根据顶级路由查找应用，而每个应用会处理自身的子路由。

    在以下操作，`single-spa`会调用应用的`activity function`：

    * `hashchange`或者`popstate`事件触发
    * `pushState`或`replaceState`被调用
    * 在`single-spa`中手动调用`triggerAppChange`方法
    * `checkActivityFunctions`方法被调用时

  * 第四个参数是可选的对象类型字段。这个对象的属性将传递给application对象的生命周期函数，这个对象也可以是一个函数的返回值，这个函数默认接收应用名称和`window.location`作为参数。

* 第二种形式的对象类型参数所包含的属性：
  * name：与第一种形式中的第一个参数一样
  * app：与第一种形式中的第二个参数一样
  * activeWhen：与第一种形式中的第三个参数作用一样。可以是一个函数、路径前缀或者两者的数组。
    * 路径前缀会匹配url，允许以下每一种前缀：'/app1'、'/users/:userId/profile'、'/pathname/#/hash'、['/pathname/#/hash', '/app1']
  * customProps：与第一种形式中的第四个参数一样

#### 调用singleSpa.start()

start()方法必须被调用，应用才会被真正挂载。

在`start()`被调用之前，应用会先被下载，但不能初始化、挂载、卸载。

我们可能会马上注册一个应用（为了提前下载代码），但不能马上就在DOM节点上挂载该应用，可能需要等待一个ajax请求完成，再根据结果进行挂载，这种情况下，就需要先调用`registerApplication`，等待ajax请求完成，再调用`start`。



### 同时注册两个路由

实现此目的的一种方法，是为每个应用程序创建一个`<div>`，这样它们就永远不会尝试同时修改同一DOM。

div需要设置id，以`single-spa-application:`为前缀，后面跟上应用程序名称。例如应用程序名称为`app-name`，div的id就是`single-spa-application:app-name`。

```html
<div id="single-spa-application:app-name"></div>
```



