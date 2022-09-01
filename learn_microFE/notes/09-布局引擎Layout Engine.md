## 布局引擎Layout Engine

[single-spa-layout](https://github.com/single-spa/single-spa-layout/)

### 前言

该npm包是`single-spa`的可选附加组件。布局引擎提供了一个路由API，用于控制顶级路由、应用程序和DOM元素。

使用`single-spa-layout`可以更轻松地完成以下任务：

* DOM放置和应用程序排序
* 下载应用程序时加载UI
* 未找到/404页的默认路由
* 路由之间的转换
* single-spa应用的服务端渲染
* 错误页面

在浏览器端，布局引擎执行两项主要任务：

* 从HTML元素或JSON对象生成`single-spa`注册配置
* 监听路由事件，以确保在挂载`single-spa`应用程序之前正确放置所有DOM元素

在服务端，布局引擎执行也执行两项任务：

* 从HTML模板构建一个服务端布局对象
* 基于服务器布局对象和当前路由，向浏览器发送一个HTML文档



### 安装

只需要将布局引擎安装到[root-config](https://zh-hans.single-spa.js.org/docs/configuration/)中即可（无需在任何其他应用程序中安装）

```shell
npm install --save single-spa-layout
// or
yarn add single-spa-layout
```

#### 项目状态

`single-spa-layout`

#### 浏览器支持

`single-spa-layout`在支持`single-spa`的所有浏览器（包括IE11）中均可使用。在服务端所有支持ESM的node版本都支持使用。

#### 要求

必须使用`single-spa` >==5.4.0才能使布局引擎正常工作。此外，不要为任何一个single-spa应用提供自定义的`domElementGetter`方法，它们会覆盖`single-spa-layout`中的配置。



### 基本用法

* 在根html文件中，将`<template>`元素添加在头部，它应该有一个`<single-spa-router>`标签包含`<route>`元素、`<application>`元素和任何其他dom元素

```html
<html>
  <head>
    <template id="single-spa-layout">
    	<single-spa-router>
      	<nav class="topnav">
        	<application name="@organization/nav"></application>
        </nav>
        <div class="main-content">
          <route path="settings">
          	<application name="@organization/settings"></application>
          </route>
          <route path="clients">
          	<application name="@organization/clients"></application>
          </route>
        </div>
        <footer>
        	<application name="@organizaiton/footer"></application>
        </footer>
      </single-spa-router>
    </template>
  </head>
</html>
```

* 接着在root-config中，添加以下内容：

```javascript
import { registerApplication, start } from 'single-spa';
import {
  constructApplications,
  constructRoutes,
  constructLayoutEngine,
} from 'single-spa-layout';
const routes = constructRoutes(document.querySelector('#single-spa-layout'));
const applications = constructApplications({
  routes,
  loadApp({ name }) {
    return System.import(name);
  }
});
const layoutEngine = constructLayoutEngine({ routes, applications });
applications.forEach(registerApplication);
start();
```



### 布局定义

一个布局是`HTMLElement`、路由和`single-spa`应用程序的组合体。布局被静态定义在root-config中，用以处理顶级路由和dom元素。

`single-spa-layout`不应该在root-config之外使用；相反，UI框架（React、Angular、Vue）应该在应用程序中处理布局。

你可以使用HTML模板或者JSON对象来定义布局。JSON格式的定义可用于对倾向将布局定义存储在数据库中而不是代码中的组织提供支持，HTML和JSON布局具有相同的功能集，然而，更推荐在代码中存储布局。如果是刚上手`single-spa-layout`，我们推荐使用HTML模板。

一旦你开始定义布局，你需要使用`constructRoutes`、`constructApplications`和`constructLayoutEngine`方法，来构建路由、应用和布局。

#### HTML布局

你可以在`root-config`的`index.html`文件中，或者可以被解析为HTML的JavaScript字符串中，去定义HTML布局。通常更推荐在index.html文件中定义。

要在`index.html`文件中定义布局，请创建一个`<template id="single-spa-layout">`包含布局的元素，在模板内，添加一个`<single-spa-router>`元素以及所有路由、应用程序和dom元素。

需要注意的是，在布局中定义的HTMLElement是静态的——无法强制重新呈现或更改它们。

```ejs
<!-- index.ejs -->
<html>
  <head>
    <template>
    	<single-spa-router>
      	<div class="main-contente">
          <route path="settings">
          	<application name="settings"></application>
          </route>
        </div>
      </single-spa-router>
    </template>
  </head>
</html>
```

```javascript
const doc = new DOMParser().parseFromString(`
	<single-spa-router>
		<div class="main-contente">
      <route path="settings">
         <application name="settings"></application>
      </route>
    </div>
	</single-spa-router>
`, "text/html").documentElement;
```

#### JSON布局

您可以将布局定义为JSON，包括路由、应用程序和任意dom元素。

```javascript
const layout = {
  "routes": [
    {
      "type": "route",
      "path": "settings",
      "routes": [
        {
          "type": "application",
          "name": "settings"
        }
      ]
    }
  ]
};
```



### 布局元素

布局元素是HTMLElement或者JSON对象，代表dom节点、路由或应用程序。

#### `<template>`

仅当将布局定义为HTML时才使用`template`元素。它的目的是防止其内容被浏览器显示，因为布局定义对用户不可见。

```html
<template>
	<!-- 在这里定义布局 -->
  <single-spa-router></single-spa-router>
</template>
```

需要注意，IE11并没有完全支持`<template>`。但你无需为了在`single-spa-layout`中使用它们而做兼容，只需给template添加样式`style="display: none;"`防止它的内容被显示出来。

```html
<template style="display: none;">
	<!-- 在这里定义布局 -->
  <single-spa-router></single-spa-router>
</template>
```

#### `<single-spa-router>`

该元素是必需的布局的顶层容器。所有属性都是可选的：

```html
<single-spa-router mode="hash|history" base="/" disableWarnings></single-spa-router>
```

```json
{
  "mode": "hash|history",
  "base": "/",
  "disableWarnings": false,
  "containerEl": "#container",
  "routes": []
}
```

它的属性：

* mode：必需为hash或history，默认为history。指示路由是否应与location路径名或hash匹配
* base：匹配路由路径时将考虑的字符串URL前缀
* disableWarnings：布尔值，当提供的元素不正确时，关闭single-spa-layout的控制台警告
* containerEl：字符串CSS选择器或HTMLElement，用作所有single-spa dom元素的容器，默认为body

#### `<route>`

该元素用于控制顶级URL路由显示哪些应用程序和dom元素。它可能包含HTMLElement、应用程序或其他路由。

```html
<route path="clients">
	<applicaiton name="clients"></applicaiton>
</route>
<route default>
	<application name="clients"></application>
</route>
```

```json
{
  "type": "route",
  "path": "clients",
  "routes": [
    {
      "type": "application",
      "name": "clients"
    }
  ],
  "default": false
}
```

路由必须具有路径或为默认路由。

它的属性：

* routes（必填）：激活路由时将显示的子元素数组
* path：一个将与浏览器的URL匹配的路径。路径是相对于其父路由（或基本URL）而言的。开头和结尾的`/`字符是不必要的，会自动应用。路径可以通过使用`:`字符来包含“动态片段”（如：`clients/:id/reports`）。`single-spa-layout`使用`single-spa`的`pathToActiveWhen`方法将路径字符串转换为活动函数（activity function）。默认情况下，路径是一个前缀，因为它将在路径的任何子路径匹配时进行匹配。关于精确匹配，请参见`exact`属性。
* default：一个布尔值，决定该路由是否会匹配所有未被同级路由定义的剩余URL。
* exact：一个布尔值，决定路径是否应被视为前缀或精确匹配。当为true时，如果URL路径中有未在路径属性中指定的尾部字符，路由将不会激活。
* props：当应用程序被安装时，将提供给应用程序的一个single-spa自定义属性的对象。请注意，对于同一应用程序，在不同的路由上可以有不同的定义。你可以在下面的文档中阅读更多关于在你的HTML中定义props的信息。

#### `<application>`

该元素被用于渲染一个`single-spa`应用程序。应用程序可以包含在路由元素中，也可以作为应用程序存在于顶层，将始终被渲染。

当应用程序被渲染时，一个容器`HTMLElement`将被`single-spa-layout`创建。容器 `HTMLElement` 是以 `single-spa-application:appName `的 id 属性创建的，这样你的[框架助手](https://single-spa.js.org/docs/ecosystem/)在装载应用程序时就会自动使用它。

同一个应用程序可以在你的布局中多次出现，在不同的路由下。但是，每个应用程序在每条路由上只能定义一次。

```html
<!-- 基本用法 -->
<application name="appName"></application>
<!-- 使用在JavaScript中定义的命名加载程序 -->
<applicaiton name="appName" loader="mainContentLoader"></applicaiton>
<!-- 将single-spa 自定义props添加到应用程序中，props的值在JavaScript中定义 -->
<application name="appName" props="myProp,authToken"></application>
```

```javascript
// 基本用法
{
  "type": "application",
  "name": "appName"
}
// 使用single-spa parcel作为加载UI，也可以使用Angular、vue等
const parceConfig = singleSpaReact({/*...*/});
{
  "type": "application",
  "name": "appName",
  "loader": parcelConfig
}
// 使用HTML字符串作为加载UI
{
  "type": "application",
  "name": "appName",
  "loader": "<img src='loading.gif'>"
}
// 添加single-spa自定义属性
{
  "type": "application",
  "name": "appName",
  "props": {
    "myProp": "some-value"
  }
}
```

它的属性：

* name（必填）：应用程序名称
* loader：HTML字符串或single-spa parcel配置对象。在等待应用程序的加载方法解析时，加载程序将被加载到DOM中。
* props：single-spa自定义属性的对象，在安装时将提供给应用程序。注意，对于不同路由上的同一应用程序，可以对它们进行不同的定义。

#### DOM元素

可以将任意HTMLElement放置在布局中的任何位置。要在HTML中执行此操作，只需像通常一样添加HTMLElement。你可以在HTML和JSON中定义任意的dom元素。

`single-spa-layout`只支持在路由转换期间更新DOM元素。不支持任意的重新渲染和更新。

在路由中定义的DOM元素将在路由被激活/取消激活时被挂载/取消挂载。如果你在不同的路由下定义了两次相同的DOM元素，当在路由之间导航时，它将被销毁并重新创建。

```html
<nav class="topnav"></nav>
<div class="main-content">
  <button>
    A button
  </button>
</div>
```

```json
{
  "type": "div",
  "attrs": [
    {
      "name": "class",
      "value": "blue"
    },
  ],
  "routes": [
    {
      "type": "button"
    }
  ]
}
```



### 属性

`single-spa`自定义属性可以在`route`和`application`元素上定义。

任何路由属性将与应用属性合并，以创建最终的属性，并传递给single-spa生命周期函数。

#### JSON格式

在JSON布局定义中，你可以使用props字段来定义应用程序和路由上的自定义属性：

```javascript
import { constructRoutes } from 'single-spa-layout';
constructRoutes({
  routes: [
    { type: "application", name: "nav", props: { title: "Title" } },
    { type: "route", path: "settings", props: { otherProp: "Some value" } },
  ]
});
```

#### HTML

在JSON对象上定义属性很直接，因为它们是一个可以包含字符串、数字、布尔值、对象、数组等的对象；然而在HTML中定义复杂的数据类型并不是那么简单，因为HTML属性始终是字符串。要解决此问题，single-spa-layout允许你在HTML中命名自定义属性，但在JavaScript中定义其值。

```html
<application name="settings" props="authToken,loggedInUser"></application>
```

```javascript
import { constructRoutes } from 'single-spa-layout';
const data = {
  props: {
    authToken: '123456',
    loggedInUser: fetch('/api/logged-in-user').then(r => r.json())
  }
};
const routes = constructRoutes(document.querySelector('#single-spa-template'), data);
```

`constructRoutes` API的完整API文档详细解释了data这个对象。



### 加载UI

在等待应用程序的代码下载和执行时，通常希望显示一个加载UI。`single-spa-layout`允许你定义每个应用程序的加载程序，这些加载程序将在应用程序的加载方法挂起时挂载到DOM。多个应用程序可以共享相同的加载UI。

加载的UI定义为HTML字符串或parcel配置对象。HTML字符串最适合用于静态、非交互式的加载器，而当你想使用框架（vue、react、angular等）动态呈现加载器时，`parcels`最适合。

通过JavaScript对象定义加载程序非常简单，因为它们是一个可以包含字符串、数字、布尔值、对象、数组等的对象。但在HTML中定义复杂的数据类型并不是那么简单，因为HTML属性始终是字符串。要解决此问题，single-spa-layout允许你在HTML中命名加载程序，但可以在JavaScript中定义其值。

```html
<application name="topnav" loader="topNav"></application>
<application name="topnav" loader="settings"></application>
```

```javascript
import { constructRoutes } from 'single-spa-layout';
// 你也可以使用angular、vue等
const settingLoader = singleSpaReact({/*...*/});
const data = {
  loaders: {
    topNav: `<nav class="placeholder"></nav>`,
    settings: settingLoader
  }
};
const routes = constructRoutes(document.querySelector('#single-spa-template'), data);
```

`constructRoutes` API的完整API文档详细解释了data这个对象。



### 转场

已计划支持路由转场，但尚未实现。



### 默认路由（404）

默认路由是当没有其他同级路由与当前URL匹配时激活的路由。它们没有URL路径，是可以包含DOM元素和single-spa应用程序的任意组合。

```html
<single-spa-router>
	<route path="cart"></route>
  <route path="product-detail"></route>
  <route default>
  	<h1>
      404 Not Found
    </h1>
  </route>
</single-spa-router>
```

默认路由是与它们的同级路由相匹配的，这允许嵌套：

```html
<single-spa-router>
	<route path="cart"></route>
  <route path="product-detail/:productId">
  	<route path="reviews"></route>
    <route path="images"></route>
    <route default>
    	<h1>
        Unknow product page
      </h1>
    </route>
  </route>
  <route default>
  	<h1>
      404 Not Found
    </h1>
  </route>
</single-spa-router>
```

同级路由被定义为共享一个 "最近的父路由"。这意味着它们在你的HTML/JSON中不一定是直接的同级关系，也可以嵌套在DOM元素中。

```html
<single-spa-router>
	<route path="cart"></route>
  <route path="product-detail/:productId">
    <div class="product-content">
      <route path="reviews"></route>
    	<route path="images"></route>
    </div>
    <!-- 评论和图片路径是同级的，因为它们共享最近的父路由 -->
    <!-- 当URL与评论或图片不匹配时，默认路由将激活 -->
    <route default>
    	<h1>
        Unknow product page
      </h1>
    </route>
  </route>
</single-spa-router>
```

### 错误UI

当一个single-spa应用程序无法加载、挂载或卸载时，它就会转到SKIP_BECAUSE_BROKEN或LOAD_ERROR状态。当处于SKIP_BECAUSE_BROKEN状态时，通常用户看不到任何东西，他们不会理解为什么应用程序不显示。你可以调用 unloadApplication 将应用程序回退到 NOT_LOADED 状态，这将导致 single-spa 重新尝试下载和安装它。然而，当应用程序出错时，显示错误状态往往是可取的。

一个错误UI被定义为HTML字符串或parcel配置对象。HTML字符串最适合静态的、非交互式的错误状态，而当你想使用一个框架（Vue、React、Angular等）来动态渲染错误状态时，parcels是最好的。只要应用程序的状态是SKIP_BECAUSE_BROKEN或LOAD_ERROR，就会显示错误UI。

请注意，错误UI parcels被赋予了一个名为error的属性，它是导致应用程序在加载/安装时失败的Error。

通过javascript对象定义错误UI是很简单的，因为字符串或parcel可以通过error属性在应用程序对象中定义。

```json
{
  "type": "application",
  "name": "nav",
  "error": "<h1>Oops! The navbar isn't working right now</h1>"
}
```

```javascript
const myErrorParcel = singleSpaReact({...})

{
  "type": "application",
  "name": "nav",
  "error": myErrorParcel
}
```

然而，在HTML中定义错误UI就不那么简单了，因为HTML属性总是字符串，因此不能是一个parcel配置对象。为了解决这个问题，错误UI在HTML中被命名，但在javascript中定义

```html
<template id="single-spa-layout">
  <single-spa-router>
    <application name="nav" error="navError"></application>
  </single-spa-router>
</template>
```

```javascript
const myErrorParcel = singleSpaReact({...})

const routes = constructRoutes(document.querySelector('#single-spa-layout'), {
  errors: {
    navError: myErrorParcel
    // alternatively:
    // navError: "<h1>Oops! The navbar isn't working right now</h1>"
  }
})
```

