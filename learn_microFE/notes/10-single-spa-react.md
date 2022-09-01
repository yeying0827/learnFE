## single-spa-react

`single-spa-react`是一个辅助库，它可以帮助React应用程序实现`single-spa`需要的生命周期函数（bootstrap、mount和unmount）。可查看[single-spa-react repo](https://github.com/single-spa/single-spa-react)

### 安装

`yarn add single-spa-react`

或者

通过添加`<script src="https://unpkg.com/single-spa-react">`并访问全局变量`singleSpaReact`来使用`single-spa-react`

更推荐使用`npm init single-spa --framework react`脚手架安装



### 脚手架项目结构

#### 入口文件

名字是根据在安装过程中，通过`Organization name`和`Project name`组合而成的，是`O-P`的结构（[orgName]-[proName].js）。

```javascript
import React from "react";
import ReactDOM from "react-dom";
import singleSpaReact from "single-spa-react";
import Root from "./root.component";

const lifecycles = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: Root,
  errorBoundary(err, info, props) {
    // Customize the root error boundary for your microfrontend here.
    return null;
  },
});

export const { bootstrap, mount, unmount } = lifecycles;
```

最主要的是使用了`singleSpaReact`这个react的微应用生成方法，用于创建一个application对象，参数为一个对象包含以下属性：

* React（必填）

* ReactDOM（必填）

* rootComponent（与loadRootComponent二选一）：将被渲染的顶层React组件。

* loadRootComponent（与rootComponent二选一）：一个加载函数，它接收自定义的single-spa props并返回一个解析为parcel的promise。如果提供了rootComponent选项，它将取代rootComponent。它的目的是帮助那些想为他们的根组件懒加载源代码的人，源代码将在bootstrap生命周期中被懒加载。

* suppressComponentDidcatchWarning：一个布尔值，表示当`rootComponent`没有实现`componentDidCatch`时，`single-spa-react`是否应该发出警告，默认值为`false`。最好是实现errorBoundary，而不是关闭这个警告。

* domElementGetter：一个接收single-spa props并返回一个DOM元素的函数。这个dom元素是React应用程序将被初始化、挂载和卸载的地方。当该选项被省略时，single-spa中的自定义属性`domElementGetter`或`domElement`将被使用。要使用这些属性，请执行`singleSpa.registerApplication({ name, app, activeWhen, customProps: { domElementGetter: function() {} } })`或者`singleSpa.registerApplication({ name, app, activeWhen, { domElement: document.getElementById(...) } })`。

  如果通过这些方法中的任何一个都找不到dom元素，那么就会创建一个容器div并附加到`document.body`中。

* parcelCanUpdate：一个布尔值，控制是否为返回的parcel创建一个更新生命周期。请注意，该选项不影响single-spa应用，只影响parcel。默认值为true。

* renderType：是一个枚举值，可选值为：['render', 'hydrate', 'createRoot', 'unstable_createRoot', 'createBlockingRoot', ' unstable_createBlockingRoot']。默认为render，允许你选择你想为你的应用程序使用的ReactDOM渲染方法。从single-spa-react@4.6.0，renderType可以是一个函数，返回一个字符串，用于动态计算renderType。

singleSpaReact方法的返回值是一个对象，包含当前微应用的所有生命周期方法。

#### 业务代码入口

`root.component.js`

包含正常的`react`业务开发的代码

#### 公共路径

`set-public-path.js`（没看到这个文件？）

是`systemjs`框架内，用于提供公共目录入口的文件

> 注：对于react@>=16，最好的做法是让每个`single-spa`应用程序的根应用程序实现`componentDidCatch`，以避免整个应用程序在发生错误时意外卸载。更多细节请参见[react文档](https://reactjs.org/blog/2017/07/26/error-handling-in-react-16.html)



### Parcels

`single-spa-react`也可以用来创建一个`single-spa` `parcel`（而不是single-spa应用程序）。要做到这点，只需调用`singleSpaReact()`，就像创建应用程序一样，除了没有`domElementGetter`之外（因为这些都是由挂载`parcel`的代码提供的）。

此外，`single-spa-react`提供了一个`<Parcel>`组件，使得使用与框架无关的`single-spa parcel`更容易。这允许你可以把`parcel`放到`render`方法返回的jsx中，而不需要实现`componentDidMount`和`componentWillUnmount`。你可以通过npm安装该库并导入`single-spa-react/parcel`，或者通过添加`<script src="https://unpkg.com/single-spa-react/parcel"></script>`，然后用`window.Parcel.default`去访问`Parcel`组件。
#### Parcel props

* config（必填）：要么是一个`single-spa parcel` 配置对象，要么是一个“加载函数”，返回一个可解析为`parcel`配置的Promise。
* wrapWith：`tagName`字符串。将创建一个该类型的dom节点，以便将parcel挂载。默认为div。
* appendTo：将`parcel`追加到此dom元素下。默认情况下，这是不需要的，因为parcel将挂载在parcel组件被渲染的DOM中。对于将parcel追加到document.body或DOM的其他独立部分非常有用。
* `mountParcel`（有时是必填）：single-spa提供的mountParcel函数。一般来说，最好使用应用程序的 mountParcel 函数而不是 single-spa 的根 mountParcel 函数，这样 single-spa 就可以跟踪父子关系并在应用程序卸载时自动卸载应用程序的parcel。请注意，如果` <Parcel>` 组件被一个使用 single-spa-react 的 single-spa 应用程序渲染，就没有必要传入prop，因为`<Parcel>`可以从 [SingleSpaContext](https://single-spa.js.org/docs/ecosystem-react#singlespacontext) 获取prop
* handleError：一个将被调用的函数，用于处理parcel抛出的错误。如果没有提供，默认情况下，错误将在窗口中抛出。
* parcelDidMount：一个在parcel完成加载和挂载时将被调用的函数

#### 例子

```jsx
function CustomDomFn() {
  return <div>123</div>
}
const CustomDom = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: CustomDomFn
});
export default function Root(props) {
  console.log(CustomDom);
  
  return (
  	<div>
    	{props.name} is mounted!
      <Parcel
        config={CustomDom}
        />
    </div>
  )
}
```

