## 03 | 声明式绘图系统：如何用SVG图形元素绘制可视化图表？

描述SVG的XML语言本身和HTML非常接近，都是由标签 + 属性构成的

浏览器的CSS、JavaScript都能够正常作用于SVG元素。这让我们在操作SVG时，没什么特别大的难度。

**SVG就是HTML的增强版**

它既可以用JavaScript操作绘制各种几何图形，还可以作为浏览器支持的一种图片格式，来独立使用img标签加载或者通过Canvas绘制。

以下内容关于**SVG是怎么绘制可视化图表的，以及它的局限性是什么**。

SVG的基本用法和使用场景

### 利用SVG绘制几何图形

SVG属于声明式绘图系统；不需要用JavaScript操作绘图指令，只需要和HTML一样，声明一些标签就可以实现绘图了。

示例代码：SVG声明

```html
<svg xmlns="http://www.w3.org/2000/svg" version="1.1">
  <circle cx="100" cy="50" r="40" stroke="black" stroke-width="2" fill="orange"></circle>
</svg>
```

svg元素是SVG的根元素；属性xmlns是xml的名字空间。xmlns属性的值是`http://www.w3.org/2000/svg`，浏览器根据这个属性值就能够识别出这是一段SVG内容了。

svg元素下的circle元素表示这是一个绘制在SVG图像中的圆形，属性cx和cy是坐标，表示圆心的位置；属性r表示半径。

SVG坐标系和Canvas坐标系完全一样，都是以图像左上角为原点，X轴向右，Y轴向下的左手坐标系；而且在默认情况下，SVG坐标与浏览器像素对应。

在Canvas中，为了让绘制出来的图形适配不同的显示设备，我们要设置Canvas画布坐标。同理，我们也**可以通过给svg元素设置viewBox属性，来改变SVG的坐标系**。



### 利用SVG绘制层次关系图

```html
<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 1600 1600"></svg>
```



* 首先，将获取Canvas对象改为获取SVG对象

  ```javascript
  const svgroot = document.querySelector('svg');
  ```

* 然后，同样实现draw方法从root开始遍历数据对象

  * 通过创建SVG元素，将元素添加到DOM文档里，让图形显示出来。

  ```javascript
  function draw(parent, node, {fillStyle = 'rgba(0, 0, 0, 0.2)', textColor = 'white'} = {}) {
    // ...
    const {x, y, r} = node;
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', x);
    circle.setAttribute('cy', y);
    circle.setAttribute('r', r);
    circle.setAttribute('fill', fillStyle);
    parent.appendChild(circle);
    // ...
  }
  ```

  与使用`document.createElement`方法创建普通的HTML元素不同，**SVG元素要使用`document.createElementNS`方法来创建**。

  第一个参数是名字空间，对应SVG名字空间`http://www.w3.org/2000/svg`；第二个参数是要创建的元素的标签名。最后将circle元素添加到它的parent元素上去。

  * 接着，遍历下一级数据；这次来创建一个SVG的g元素，递归地调用draw方法。

  ```javascript
  function draw(parent, node, {fillStyle = 'rgba(0, 0, 0, 0.2)', textColor = 'white'} = {}) {
    // ...
    parent.appendChild(circle);
    
    if (children) {
      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      for (let i = 0; i < children.length; i ++) {
        draw(group, children[i], {fillStyle, textColor});
      }
      parent.appendChild(group);
    } 
    // ...
  }
  ```

  g元素表示一个分组，可以用它来对SVG元素建立起层级结构。而且，如果我们给g元素设置属性，那么它的子元素会继承这些属性。

  * 如果下一级没有数据了，那么给它添加文字。

  ```javascript
  function draw(parent, node, {fillStyle = 'rgba(0, 0, 0, 0.2)', textColor = 'white'} = {}) {
    // ...
    
    if (children) {
      // ...
    } else {
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('fill', textColor);
      text.setAttribute('font-family', 'Arial');
      text.setAttribute('font-size', '1.5rem');
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('x', x);
      text.setAttribute('y', y);
      const name = node.data.name;
      text.textContent = name;
      parent.appendChild(text);
    }
  }
  ```

  在SVG中添加文字，只需要创建text元素，然后给这个元素设置属性就可以了。



### SVG和Canvas的不同点

既然SVG和Canvas最终的实现效果没什么差别，那在实际使用的时候，该如何选择呢？

SVG和Canvas在使用上的不同主要可以分为两点：分别是**写法**上的不同和**用户交互实现**上的不同。

#### 1. 写法上的不同

SVG是以**创建图形元素**绘图的“声明式”绘图系统，Canvas是**执行绘图指令**绘图的“指令式”绘图系统。

以层次关系图的绘制过程为例来对比：

SVG先通过创建标签来表示图形元素，然后通过元素的setAttribute方法给图形元素赋属性值。

而Canvas通过上下文执行绘图指令来绘制图形；还通过上下文设置状态属性；设置的这些状态，在绘图指令执行时才会生效。

**SVG图形需要由浏览器负责渲染和管理，将元素节点维护在DOM树中**；这样做的缺点是，在一些动态的场景中，即，需要频繁地增加、删除图形元素的场景中，SVG与一般的HTML元素一样会带来DOM操作的开销，所以SVG的渲染性能相对比较低。

#### 2. 用户交互实现上的不同

例子：尝试给SVG版本的层次关系图添加一个功能：当鼠标移动到某个区域时，这个区域会高亮，并显示出对应的省 - 市信息。

因为SVG的一个图形对应一个元素，所以我们可以像处理DOM元素一样，很容易地给SVG图形元素添加对应的鼠标事件。

* 首先，给SVG的根元素添加mousemove事件

  ```javascript
  let activeTarget;
  svgroot.addEventListener('mousemove', e => {
    let target = e.target;
    if (target.nodeName === 'text') target = target.parentNode;
    if (activeTarget !== target) {
      if (activeTarget) activeTarget.setAttribute('fill', 'rgba(0, 0, 0, 0.2)')
    }
    target.setAttribute('fill', 'rgba(0, 128, 0, 0.1)');
    activeTarget = target;
  });
  ```

  通过事件冒泡处理每个圆上的鼠标事件

* 接着，实现显示对应的省 - 市信息

  * 修改draw方法

  把省、市信息通过扩展属性`data-name`设置到svg的图形元素上

  ```javascript
  function draw(parent, node, {fillStyle = 'rgba(0, 0, 0, 0.2)', textColor = 'white'} = {}) {
    // ...
    circle.setAttribute('data-name', node.data.name); // 设置扩展属性
    parent.appendChild(circle);
    
    if (children) {
      // ...
      group.setAttribute('data-name', node.data.name); // 设置扩展属性
      // ...
      parent.appendChild(group);
    } else {
      // ...
      text.setAttribute('data-name', node.data.name);
      // ...
      parent.appendChild(text);
    }
  }
  ```

  * 实现一个getTitle方法，从当前鼠标事件的target往上找parent元素，拿到“省 - 市”信息，把它赋给titleEl元素。

  ```javascript
  const titleEl = document.querySelector('h1');
  function getTitle(target) {
    const name = target.getAttribute('data-name');
    if (target.parentNode && target.parentNode.nodeName === 'g') {
      const parentName = target.parentNode.getAttribute('data-name');
      return `${parentName} - ${name}`;
    }
    return name;
  }
  ```

  * 至此，就可以在mousemove事件中更新titleEl的文本内容了。

  ```javascript
  let activeTarget;
  svgroot.addEventListener('mousemove', e => {
    let target = e.target;
    titleEl.innerText = getTitle(target);
    // ...
  });
  ```

总结来说，利用SVG的一个图形对应一个svg元素的机制，就可以像操作普通的HTML元素那样，给svg元素添加事件监听器实现用户交互了。即，SVG有一个非常大的优点，就是可以**让图形的用户交互非常简单**。

和SVG相比，利用Canvas对图形元素进行用户交互就没有那么容易了。

如果我们要绘制的图形不是圆、矩形这样的规则图形，而是一个复杂得多的多边形，该怎样确定鼠标在哪个图形元素的内部呢？这对于Canvas来说，就是一个比较复杂的问题了。



### 绘制大量几何图形时SVG的性能问题

SVG的设计给用户交互带来便利性的同时，也带来了局限性。

依靠浏览器的DOM树渲染；如果要绘制的图形非常复杂，这些元素节点的数量就会非常多；而节点数量多，就会大大增加DOM树渲染和重绘所需要的时间。

事实上，在一般情况下，**当SVG节点超过一千个的时候**，就能很明显感觉到性能问题了。

但，对于SVG的性能问题，也有解决方案；比如，可以使用虚拟DOM方案来尽可能地减少重绘，这样就可以优化SVG的渲染。但是这些方案只能解决一部分问题；当节点数太多时，这些方案也无能为力。

那在上万个节点的可视化应用场景中，SVG就真的一无是处了吗？也不是。SVG除了嵌入HTML文档的用法，还可以直接作为一种图像格式使用；作为一些局部的图形使用。



### 要点总结

SVG的基本用法、优点和局限性。

用SVG绘制可视化图形与用Canvas绘制有明显区别，SVG通过创建标签来表示图形元素，然后将图形元素添加到DOM树中，交给DOM完成渲染。

使用DOM树渲染可以让图形元素的用户交互实现起来非常简单；但如果图形复杂，SVG的图形元素就会非常多，这会导致DOM树渲染成为性能瓶颈。



### 小试牛刀

1. 尝试使用CSS，来设置例子中的层级关系图里，circle的背景色和文字属性。思考这样做有什么好处？

   > 有利于样式和节点解耦，样式的模块化和复用

2. 如果先用SVG生成层级关系图，再用Canvas来完成绘制的话，和单独使用它们来绘图有什么不同？

   > 和单独使用SVG绘图对比：
   >
   > 可以预先生成SVG格式图片，代码量更少；可以规避SVG节点过多时的性能瓶颈，但失去了交互的便利性
   >
   > 和单独使用Canvas绘图对比：
   >
   > 不用去记很多指令，只要通过setAttribute方法设置各种属性即可