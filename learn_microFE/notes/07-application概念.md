## application 概念

在一个`single-spa`中，你的spa包含许多注册的应用，而各个应用可以使用不同的框架。

被注册的这些应用维护自己的客户端路由，使用自己需要的框架或者类库。应用只要通过挂载，就可以渲染自己的html页面，并自由实现功能。

“挂载（mount）”指的是注册的应用内容是否已展示在DOM上。我们可以通过应用的`activity function`来判断其是否已被挂载。应用在未挂载之前，会一直保持休眠状态。

### 注册一个应用程序

要添加一个应用，首先需要注册该应用。被注册的应用，必须在其入口文件（entry file）实现一些必要的生命周期函数。

注册的方法，就是`registerApplication()`。

### 应用的生命周期

在一个`single-spa`页面，注册的应用会经过下载loaded、初始化initialized、挂载mounted、卸载unmounted和移除unloaded等过程。`single-spa`会通过“生命周期”为这些过程提供钩子函数。

`single-spa	`会在各应用的主文件中，查找对应的函数名并进行调用。定义规则如下：

* `bootstrap`、`mount`、`unmount`是必须的，`unload`是可选的
* 生命周期函数必须有返回值，为一个`Promise`，或者本身是`async`函数
* 如果导出的钩子是函数数组而不是单个函数，这些函数会被依次调用，对于`Promise`，会等到`resolve`之后再调用下一个函数
* 如果`single-spa`未启动，各个应用会被下载，但是不能初始化、挂载或卸载

> 在single-spa生态中，有各个主流框架对于生命周期函数的实现，这些文档有助于理解这些helper执行的操作，也有助于你自己实现生命周期函数。

#### 生命周期参数

生命周期函数使用`props`传参，这个对象包含`single-spa`相关信息和其他的自定义属性：

```js
export function bootstrap(props) {
  const {
    name, // 应用名称
    singleSpa, // singleSpa实例
    mountParcel, // 手动挂载的函数
    customProps // 自定义属性
  } = props; // props会传给每个生命周期函数
  return Promise.resolve();
};
```

* 内置参数

  * name：注册到single-spa的应用名称
  * singleSpa：对singleSpa实例的引用，方便各应用和类库调用singleSpa提供的API时不需再导入它。可以解决有多个webpack配置文件构建时无法保证只引用一个singleSpa实例的问题。
  * mountParcel：[mountParcel](https://zh-hans.single-spa.js.org/docs/parcels-api/#mountparcel)函数，可用于共享组件

* 自定义参数

  传入的方式是在root-config.js文件中调用`registerApplication`方法时，传入第四个参数，或customProps。

  ```js
  singleSpa.registerApplication({
    name: 'app1',
    activeWhen,
    app,
    customProps: { authToken: '123456' }, // 或者
    customProps: (name, location) => {
      return { authToken: '123456' };
    }
  });
  ```

  ```js
  export function mount(props) {
    console.log(props.customProps.authToken); // 可以获取到注册时传入的authToken参数
    return reactLifecycles.mount(props);
  }
  ```

  可以应用的场景：

  * 各个应用共享一个公共的access token
  * 下发初始化信息，如渲染目标
  * 传递对事件总线（event bus）的引用，方便各应用之间进行通信

  如果没有传入自定义参数，默认会返回一个空对象。

#### 生命周期帮助类

有一些帮助类库会针对主流框架的生命周期函数进行实现以方便使用，具体可参见[single-spa生态](https://zh-hans.single-spa.js.org/docs/ecosystem/)

#### 生命周期列举

* 下载（load）

  注册的应用会被懒加载，该应用的代码会从服务器端下载并执行。

  注册的应用在`activity function`第一次返回`true`时，下载动作会发生。在下载过程中，建议尽可能执行少的操作，可以在`bootstrap`生命周期之后再执行各项操作，如确实有在下载时需要执行的操作，可将代码放在子应用入口文件的最外层代码中。如：

  ```javascript
  console.log("The registered application has been loaded!");
  export function bootstrap(props) {}
  export function mount(props) {}
  export function unmount(props) {}
  ```

* 初始化（应用启动）

  会在应用第一次挂载前执行一次

  ```javascript
  export function bootstrap(props) {
    return Promise
    	.resolve()
    	.then(() => {
      	// one-time initialization code goes here
      	console.log('bootstrapped!');
    	})
  }
  ```

* 挂载

  当应用的`activity function`返回`true`，但该应用处于未挂载状态时，挂载的生命周期函数会被调用。

  调用时，函数会根据URL来确定当前被激活的路由，创建DOM元素、监听DOM事件等以向用户呈现渲染的内容。但是子路由的改变不会触发mount，需要各应用自行处理。

  ```javascript
  export function mount(props) {
    return Promise
    	.resolve()
    	.then(() => {
  			// Do framework UI rendering here
        console.log('mounted!');
      });
  }
  ```

* 卸载

  当应用的`activity function`返回假值，且应用已挂载，卸载的生命周期函数就会被调用。

  卸载函数被调用时，会清理在应用挂载时被创建的DOM元素、事件监听、内存、全局变量和消息订阅等。

  ```javascript
  export function unmount(props) {
    return Promise
    	.resolve()
    	.then(() => {
        // Do framework UI rendering here
        console.log('unmounted!');
      });
  }
  ```

* 移除

  此生命周期函数的实现是可选的。它只在[unloadApplication](https://zh-hans.single-spa.js.org/docs/api/#unloadapplication)被调用时才会触发。

  如果一个已注册的应用没有实现这个生命周期函数，则假设这个应用无需被移除。

  移除的目的是各应用在移除之前执行部分逻辑，一旦应用被移除，它的状态就会变成NOT_LOADED，下次激活时会被重新初始化。

  移除函数的设计动机是对所有注册的应用实现“热重载”，不过在其他有些场景中也有用，比如想要重新初始化一个应用，且想在重新初始化之前执行一些逻辑操作时：

  ```javascript
  export function unload(props) {
    return Promise
    	.resolve()
    	.then(() => {
        // Hot-reloading implementation goes here
        console.log('unloaded!');
      });
  }
  ```

* 超时

  默认情况下，所有注册的应用遵循[全局超时配置]，但对于每个应用，也可以通过在主入口文件导出一个timeouts对象来重新定义超时时间。如：

  ```javascript
  export function bootstrap(props) {}
  export function mount(props) {}
  export function unmount(props) {}
  export const timeouts = {
    bootstrap: {
      millis: 5000,
      dieOnTimeout: true,
      warningMillis: 2500,
    },
    mount: {
      millis: 5000,
      dieOnTimeout: false,
      warningMillis: 2500,
    },
    unmount: {
      millis: 5000,
      dieOnTimeout: true,
      warningMillis: 2500,
    },
    unload: {
      millis: 5000,
      dieOnTimeout: true,
      warningMillis: 2500,
    }
  };
  ```

  millis是超时警告的毫秒数，warningMillis是将警告打印到控制台的间隔的毫秒数

### 切换应用时过渡

如果想在应用挂载和卸载时加一些过渡效果（动画等），则需要将其和`bootstrap`、`mount`和`unmount`等生命周期函数关联。

demo：[single-spa过渡](https://github.com/frehner/singlespa-transitions)

