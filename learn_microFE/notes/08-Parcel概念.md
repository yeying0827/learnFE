## Parcel 概念

`Parcel`是`single-spa`的一个高级特性。一个`single-spa`的`parcel`，指的是一个与框架无关的组件，由一系列功能构成，可以被应用手动挂载，无需担心由哪种框架实现。

`Parcel`和`application`的api一致，不同之处在于`parcel`组件需要手动挂载，而不是通过`activity`方法被激活。

一个`Parcel`可以大到一个应用，也可以小至一个组件，可以用任何语言实现，只要能导出正确的生命周期事件即可。

在`single-spa`应用中，可能会包括很多个注册应用，也可以包含很多`parcel`。

通常情况下我们建议你在挂载`parcel`时传入应用的上下文，因为parcel可能会和应用一起卸载。

如果你只使用了一种框架，建议使用框架组件（如react、vue、angular组件）而不是`parcel`共享功能。`Parcel`多包裹了一层中间层，而框架组件在应用间调用时会更容易，你可以通过`import`语法直接在注册应用里导入一个组件。只有在涉及到跨框架的应用之间进行组件调用时，我们才考虑`parcel`的使用。

### parcel的基本使用

```javascript
// 一个parcel的实现
const parcelConfig = {
  bootstrap() {
    // 初始化
    return Promise.resolve();
  },
  mount() {
    // 使用某个框架来创建和初始化dom
    return Promise.resolve();
  },
  unmount() {
    // 使用某个框架卸载dom，做其他的清理工作
    return Promise.resolve();
  }
};

// 挂载parcel
const domElement = document.getElementById('place-in-dom-to-mount-parcel');
const parcelProps = { domElement, customProp1: 'foo' };
const parcel = singleSpa.mountRootParcel(parcelConfig, parcelProps);
// parcel被挂载，在mountPromise中完成挂载
parcel.mountPromise.then(() => {
  console.log('finished mounting parcel!');
  // 如果我们想重新渲染parcel，可以调用update生命周期方法，其返回值是一个promise
  parcelProps.customProp1 = 'bar';
  return parcel.update(parcelProps);
})
.then(() => {
  // 在此处调用unmount生命周期方法来卸载parcel，返回promise
  return parcel.unmount();
});
```

### parcel配置

一个`parcel`是一个由3到4个方法组成的对象。

当挂载一个`parcel`时，你可以直接提供挂载对象，也可以提供`loading`方法来异步下载`parcel`对象。

`parcel`对象上的每个方法都是一个生命周期函数，返回值是`promise`。`parcel`有3个必填生命周期函数（bootstrap、mount、unmount）和1个可选生命周期函数update。强烈建议通过官方推荐的[生命周期库](https://zh-hans.single-spa.js.org/docs/ecosystem/#help-for-frameworks)来实现一个`parcel`。

一个React parcel示例：

```javascript
// myParcel.js
import React from 'react';
import ReactDom from 'react-dom';
import singleSpaReact from 'single-spa-react';
import MyParcelComponent from './my-parcel-component.js';
export const MyParcel = singleSpaReact({
  React,
  ReactDom,
  rootComponent: MyParcelComponent
});
```

此示例中，singleSpaReact 处理input并生成了一个含有生命周期函数的parcel

要使用上述例子生成的`parcel`，只需引用由[single-spa-react]提供的`Parcel`组件：

```jsx
// myComponent.js
import Parcel from 'single-spa-react/parcel';
import { MyParcel } from './myParcel.js';
export class myComponent extends React.Component {
  render() {
    return (
    	<Parcel
        config={MyParcel}
        { /* optional props */ }
        { /* and ant extra props you want here */ }
      />
    )
  }
}
```

### parcel 生命周期

* 初始化（bootstrap）

  此生命周期函数只在`parcel`第一次挂载前调用一次

  ```javascript
  function bootstrap(props) {
    return Promise
    	.resolve()
    	.then(() => {
        // 在这里做初始化相关工作
        console.log('bootstrapped!');
      });
  }
  ```

* 挂载（mount）

  在`mountParcel`方法被调用且`parcel`未挂载时触发，一般会创建DOM元素、初始化事件监听等，从而为用户提供展示内容

  ```javascript
  function mount(props) {
    return Promise
    	.resolve()
      .then(() => {
        // 在这里通知框架（如React等）渲染DOM
        console.log('mounted!');
      });
  }
  ```

* 卸载（unmount）

  这个生命周期函数被调用的时机是parcel已被挂载，且满足下列条件之一：

  * unmount()被调用
  * 父parcel或者应用被卸载

  当被调用时，这个方法会清除DOM元素、解绑DOM事件监听、清理内存泄漏、全局变量、事件订阅等在挂载`parcel`时创建的内容。

  ```javascript
  function unmount(props) {
    return Promise
      .resolve()
      .then(() => {
        // 在这里通过框架语言停止渲染和和移除dom
        console.log('unmounted!');
      });
  }
  ```

* 更新（update）

  ```javascript
  function update(props) {
    return Promise
    	.resolve()
    	.then(() => {
        // 在这里通过框架更新DOM
        console.log('update!');
      });
  }
  ```

  当调用`parcel.update()`会触发更新生命周期函数。`parcel`使用者需要在调用该方法之前确认其已经实现。

### 使用示例

模态框

`app1`处理和联系人相关的所有逻辑（高内聚），但`app2`中需要新建一个联系人。有以下方法在两个应用间共享功能：

* 如果两个应用使用同一个框架，可以export/import组件实现
* 重新实现一份创建联系人的逻辑（逻辑分散，不再内聚）
* 使用single-spa parcels

从`app1`导出一个`parcel`，包括创建联系人的功能，这样就可以在不丢失应用高内聚特性的基础上，在跨框架的应用间共享组件行为。`app1`可以将`modal`导出作为`parcel`，`app2`导入该`parcel`并使用。

在下面的例子中，一个主要的好处在于从`app1`导出的`parcel/modal`也将会被卸载，而无需卸载/加载`app1`。

```javascript
// app1.js
export const AddContactParcel = {
  bootstrap: bootstrapFn,
  mount: mountFn,
  unmount: unmountFn
};

// app2.js
// 获取parcel，该例子使用SystemJS和React
componentDidMount() {
  SystemJS.import('app1').then(app1 => {
    const domElement = document.body;
    App2MountProps.mountParcel(app1.AddContactParel, { domElement });
  });
}
```

### mountRootParcel和mountParcel

`single-spa`对外暴露了两套`parcels`相关接口，二者的区别主要在于调用者和调用接口的方式

| /        | mountRootParcel   | mountParcel             |
| -------- | ----------------- | ----------------------- |
| 上下文   | singleSpa         | application             |
| 卸载条件 | 手动卸载          | 手动卸载 + 应用被卸载时 |
| api位置  | singleSpa命名导出 | 生命周期属性中提供      |

#### 我应该使用哪个

通常建议使用`mountParcel`。`mountParcel`允许你将`parcel`在应用里当做一个普通组件处理，不需要考虑`parcel`由哪个框架实现，也不需要强制调用`unmount()`方法卸载`parcel`。

#### 如何获取mountParcel API？

为了能够绑定在应用的上下文中，`mountParcel`会作为生命周期属性进行传入。你需要在自己的应用中存储和管理其方法。

`mountParcel`API例子：

```javascript
// app1
let mountParcel
export const bootstrap = [
  (props) => {
    mountParcel = props.mountParcel;
    return Promise.resolve();
  },
  // 其他更多bootstrap
];
```

```text
注：一些类库（如React）支持在框架里存储和管理parcel。在这些情况下我们不需要写helper方法来存储和管理mountParcel方法。
```

