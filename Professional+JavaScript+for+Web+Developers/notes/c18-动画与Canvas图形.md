## c18-动画与Canvas图形

summary：

视觉上复杂的功能要求：性能调优和硬件加速，不能拖慢浏览器

`<canvas>`元素会占据一块页面区域，让JavaScript可以动态在上面绘制图片。苹果最早提出，HTML5将其纳入标准。

`<canvas>`提供的API，其中包括支持基础绘图能力的2D上下文和被称为WebGL的3D上下文。并非所有浏览器都支持。





### 使用requestAnimationFrame

该方法会告诉浏览器要执行动画了，接着浏览器可以通过最优方式确定重绘的时序。

#### 早期定时动画

基本上就是使用`setInterval()`来控制动画的执行。基本模式：

```javascript
(function() {
  function updateAnimations() {
    doAnimation1();
    doAnimation2();
    // other tasks
  }
  setInterval(updateAnimation, 100);
})();
```

周期性运行注册的动画任务，并反映出每个任务的变化。

问题：无法**准确**知晓循环之间的延时。定时间隔必须足够短，才能让不同的动画类型都能平滑顺畅，但又要足够长，以便产生浏览器可以渲染出来的变化。

一般计算机显示器的屏幕刷新率都是60Hz，意味着每秒需要重绘60次。重绘频率超过刷新率，用户也感知不到，大多数浏览器会限制。

故，实现平滑动画最佳的重绘间隔为1000毫秒/60，大约17毫秒。如果同时运行多个动画，可能需要加以限流。

无论`setInterval()`还是`setTimeout()`都是不能保证时间精度的。第二个参数只能保证何时把代码添加到浏览器的任务队列，不能保证执行时间。

#### 时间间隔的问题

**知道何时绘制下一帧**是创造平滑动画的关键。

浏览器的计时器精度不足毫秒。更麻烦的是，浏览器又开始对切换到后台或不活跃标签页中的计时器执行限流。因此即使将时间间隔设定为最优，也只能得到近似的结果。

#### requestAnimationFrame

浏览器知道CSS过渡和动画应该什么时候开始，并据此计算出正确的时间间隔，到时间就去刷新用户界面。但对于JavaScript动画，浏览器不知道动画什么时候开始。

该方法**通知浏览器某些JavaScript代码要执行动画了**。这样浏览器就可以在运行某些代码后进行适当的优化。

该方法接收一个参数，即一个要在重绘屏幕前调用的函数：修改DOM样式以反映下一次重绘有什么变化的地方。

为了实现动画循环，可以把多个requestAnimationFrame()调用串联起来。🌰：

```javascript
function updateProgress(timestamp) {
    // console.log(timestamp);
    var div = document.getElementById('status');
    div.style.width = (parseInt(div.style.width, 10) + 5) + '%';
    if(div.style.width != "100%") {
        requestAnimationFrame(updateProgress);
    }
}
requestAnimationFrame(updateProgress);
```

该方法只会调用一次传入的函数，每次更新用户界面时需要手动调用。

传给requestAnimationFrame()的函数实际上可以接收一个参数，此参数是一个DOMHighResTimeStamp的实例（如performance.now()返回的值），表示下次重绘的时间。这一点实际上把重绘任务安排在了未来一个已知的时间点上。基于这个参数，可以更好地决定如何调优动画了。

#### cancelAnimationFrame

requestAnimationFrame()也返回一个请求ID，可以用于通过另一个方法cancelAnimationFrame()来取消重绘任务。

```javascript
let requestID = window.requestAnimationFrame(() => {
  console.log('Repaint!');
});
window.cancelAnimation(requestID);
```

#### 通过requestAnimationFrame节流

支持这个方法的浏览器，实际上会暴露出作为钩子的回调队列。所谓钩子（hook），就是浏览器在执行下一次重绘之前的一个点。这个回调队列是一个可修改的函数列表，包含应该在重绘之前调用的函数。

每次调用这个方法，都会在队列上推入一个回调函数，队列长度没有限制。**这个回调队列的行为不一定跟动画有关。不过可以保证每次重绘最多只调用一个回调函数。** =>  一个非常好的节流工具。在频繁执行影响页面外观的代码时（如滚动事件监听器），可以利用这个回调队列进行节流。

```javascript
let enqueued = false;
window.addEventListener('scroll', () => {
    // 原生实现
    expensiveOperation1();
    // 把事件处理程序的调用限制在每次重绘前发生
    window.requestAnimationFrame(expensiveOperation2);
    // 使用一个标志变量，将多余的调用屏蔽
    if(!enqueued) {
        enqueued = true;
        window.requestAnimationFrame(expensiveOperation3);
    }
});
```

这样会把所有回调的执行集中在重绘钩子，但不会过滤掉每次重绘的多余调用。此时，定义一个标志变量，由回调设置其开关状态，就可以**将多余的调用屏蔽**。

因为重绘是非常频繁的操作，更好的办法是**配合使用一个计时器来限制操作执行的频率**。这样，计时器可以限制实际的操作执行间隔，而requestAnimationFrame()控制在浏览器的哪个渲染周期中执行。





### 基本的画布功能

`<canvas>`元素至少要设置width和height属性，才能告诉浏览器在多大面积上绘图。

在开始标签和结束标签之间的内容是后备数据，会在浏览器不支持canvas元素时显示。

元素在添加样式或实际绘制内容前是不可见的。

要在画布上绘制图形，首先要取得绘图上下文。=> **使用元素的getContext()方法可以获取对绘图上下文的引用**。对于平面图形，需要传入参数“2d”，表示要获取2D上下文对象。（最好先使用特性检测getContext()方法是否存在）

**可以使用元素的toDataURL()方法导出`<canvas>`元素上的图像。**接收一个参数：要生成的图像的MIME类型。浏览器默认将图像编码为PNG格式，除非另行指定。

```javascript
let drawing = document.getElementById("drawing");
// 确保浏览器支持<canvas>
if(drawing.getContext) {
  let context = drawing.getContext("2d");
  // console.log(context);

  // 取得图像的数据URI, 默认为"image/png"
  let imgURI = drawing.toDataURL(); // drawing.toDataURL("image/jpeg");
  // 显示图片
  let image = document.createElement("img");
  image.src = imgURI;
  document.body.appendChild(image);
}
```

注：如果画布中的图像是其他域绘制过来的，toDataURL()方法会抛出错误。（未测试）





### 2D绘图上下文

提供了绘制2D图形的方法，包括矩形、弧形和路径。

2D上下文的坐标原点(0, 0)在`<canvas>`元素的左上角。**所有坐标值都相对于该点计算**。默认情况下，width和height表示两个方向上像素的最大值。

#### 填充和描边

2D上下文的**两个基本绘制操作**。以指定样式（颜色、渐变或图像）。

大多数2D上下文操作有填充和描边的变体，显示**效果取决于两个属性：fillStyle和strokeStyle**。（可以是字符串、渐变对象或图案对象，默认值都是”#000000“）。字符串表示颜色值，可以是CSS支持的任意格式：名称、十六进制代码、rgb、rgba、hsl、hsla。

```javascript
let drawing = document.getElementById("drawing");
if(drawing.getContext) {
  let context = drawing.getContext("2d");
  context.strokeStyle = "red";
  context.fillStyle = "#0000ff";
}
```

#### 绘制矩形

唯一一个可以直接在2D绘图上下文中绘制的形状。

与绘制矩形相关的3个方法：fillRect()、strokeRect()和clearRect()。都接收4个参数：矩形x坐标、矩形y坐标、矩形宽度和矩形高度。（单位默认像素）

* fillRect()根据fillStyle指定的样式在画布上绘制并填充矩形；

* strokeRect()根据strokeStyle指定的样式绘制矩形轮廓；**描边的样式可以通过context的以下属性设置：**

  * lineWidth：描边宽度，任意整数值（取整）。一半宽在矩形内部，一半宽在矩形外部
  * lineCap：控制线条端点的形状，包括”butt“平头、”round“圆头或”square“方头（好像矩形边框没影响）
  * lineJoin：控制线条交点的形状，包括”round“圆转、”bevel“取平或”miter“出尖（默认）

* clearRect()：擦除画布中某个区域，用于把绘图上下文中的某个区域变透明。通过先绘制形状再擦除指定区域

  ```javascript
  let context = drawing.getContext("2d");
  // ...
  context.clearRect(40, 40, 10, 10);
  ```

#### 绘制路径

通过路径可以创建复杂的形状和线条。

绘制步骤：

1. 绘制路径时，必须首先调用`beginPath()`方法以表示要开始绘制新路径；
2. 然后调用以下方法来绘制路径：

* `arc(x, y, radius, startAngle, endAngle, counterclockwise)`

  以坐标(x,y)为**圆心**，以radius为半径绘制一条弧线，起始角度为startAngle、结束角度为endAngle。最后一个参数表示**是否逆时针**计算起始角度和结束角度（默认顺时针）（路径最开始从(x+radius, y)点开始绘制）

* `arcTo(x1, y1, x2, y2, radius)`

  以给定半径radius，经由(x1, y1)绘制一条从上一点到(x2, y2)的弧线。（测试：前四个参数应该是指的控制点的坐标）

* `bezierCurveTo(c1x, c1y, c2x, c2y, x, y)`

  以(c1x, c1y)和(c2x, c2y)为控制点，绘制一条从上一点到(x, y)的弧线（三次贝塞尔曲线）

* `lineTo(x, y)`

  绘制一条从上一点到(x, y)的直线

* `moveTo(x, y)`

  把绘制光标移动到(x, y)。**不绘制**

* `quadraticCurveTo(cx, cy, x, y)`

  以(cx, cy)为控制点，绘制一条从上一点到(x, y)的弧线（二次贝塞尔曲线）

* `rect(x, y, width, height)`

  以给定宽高在坐标点(x, y)绘制一个矩形。**与绘制矩形的方法区别**在于，创建的是一条路径，而不是独立的图形。

3. 创建路径后，可以使用`closePath()`方法绘制一条返回起点的线。（可选）

4. 路径完成后，可进行的后续操作：

* 指定fillStyle属性并调用fill()方法来填充路径
* 指定strokeStyle属性并调用stroke()方法来描画路径
* 调用clip()方法基于已有路径创建一个新剪切区域

路径是2D上下文的主要绘制机制，为绘制结果提供了很多控制。

`isPointInPath()`方法，接收x轴和y轴坐标作为参数，用于确定指定的点是否在路径上（路径内部），可以在关闭路径前随时调用。

2D上下文的路径API非常可靠，可用于创建涉及各种填充样式、描述样式等的复杂图像。

#### 绘制文本

2D绘图上下文提供了绘制文本的方法：fillText()和strokeText()。都接收4个参数：要绘制的字符串、x坐标、y坐标和可选的**最大像素宽度**。最终绘制结果取决于以下3个属性：

* font：以CSS语法指定的字体样式、大小等
* textAlign：指定文本的对齐方式。可选值：start、end、left、right和center。推荐start和end，而不是left和right，无论从左到右书写的语言、还是从右到左书写的语言中，含义都更明确。（默认start）
* textBaseline：指定文本的基线（垂直对齐方式）。可选值：top、hanging、middle、alphabetic、ideographic和bottom。（默认alphabetic）。
  * top：y坐标表示文本顶部
  * bottom：表示文本底部
  * hanging | alphabetic | ideographic：分别引用字体中特定的基准点

fillText()用的更多一些，模拟了在网页中渲染文本。

2D上下文还提供了用于辅助确定文本大小的`measureText()`方法。接收一个参数，即要绘制的文本，然后返回一个TextMetrics对象，包含一个属性width。（使用font、textAlign和textBaseline属性当前的值计算绘制指定文本后的大小）。

```javascript
let fontSize = 100;
context.font = `${fontSize}px Arial`;
context.textAlign = "start";
context.textBaseline = "top";
while (context.measureText("Hello world!").width > 140) { // 将文本放到一个140像素宽的矩形中（递减字体大小，直到文本大小合适）
  fontSize --;
  context.font = `${fontSize}px Arial`;
}
context.fillText("Hello world!", 10, 10);
context.fillText(`Font size is ${fontSize}px`, 10, 50);
```

如果不设置合适的字体大小，直接使用第4个参数指定最大像素宽度，可能导致字符被水平压缩（字体偏大），以达到限定宽度。

#### 变换

在创建绘制上下文时，会以默认值初始化变换矩阵，从而让绘制操作如实应用到绘制结果上。

应用变换，可以以不同的变换矩阵应用绘制操作，从而产生不同的结果。一些改变变换矩阵的方法：

* `rotate(angle)`：**围绕原点**把图像旋转angle角度。（正数顺时针）坐标系被转动

* `scale(scaleX, scaleY)`：通过在x轴乘以scaleX，在y轴乘以scaleY来缩放图像。默认值都是1.0

* `translate(x, y)`：把**原点移动**到(x, y)。执行后，实际上的(x, y)就变成了(0, 0)。后续坐标(x1, y1)的实际值为(x1+x, y1+y)

* `transform(m1_1, m1_2, m2_1, m2_2, dx, dy)`：通过矩阵乘法直接修改矩阵

  ```
  m1_1 m1_2 dx
  m2_1 m2_2 dy
  0    0    1
  ```

* `setTransform(m1_1, m1_2, m2_1, m2_2, dx, dy)`：把矩阵重置为默认值，再以传入的参数调用transform()。

```javascript
context.translate(100, 100); // 将实际上的(100, 100)变成(0, 0)
context.rotate(Math.PI/2); // 围绕原点旋转
```

**所有变换，包括fillStyle和strokeStyle属性**，会一直保留在上下文中，直到再次被修改。**没有办法明确地将所有值重置**为默认值，但可以通过两个方法**跟踪变化**。

* 如果后续需要切换会当前的属性和变换状态，可以调用**save()**方法。所有这一时刻的设置会被放到一个暂存栈中。
* 在需要恢复之前的上下文时，可以调用**restore()**方法。可以从暂存栈中取出并恢复之前保存的设置。
* 可多次调用save()，后续通过restore()**以后进先出的顺序**恢复。

```javascript
context.fillStyle = "#ff0000";
context.save(); // 保存设置红色填充
context.fillStyle = "#00ff00";
context.translate(100, 100);
context.save(); // 保存设置绿色填充，和矩阵变换
context.fillStyle = "#0000ff";
context.fillRect(0, 0, 100, 100); // -> 蓝色矩形
context.restore(); // 恢复绿色
context.fillRect(10, 10, 100, 100); // -> 绿色矩形
context.restore(); // 恢复红色，重置矩阵变换
context.fillRect(0, 0, 100, 100); // -> 红色矩形
```

注：save()只保存应用到绘图上下文的设置，不保存绘图上下文的内容。

#### 绘制图像

2D绘图上下文内置支持操作图像。`drawImage()`方法。可接收三组参数：

1. 3个参数：传入一个HTML的`<img>`元素，以及绘制目标的x和y坐标，把图像绘制到指定位置

   绘制出来的图像与原来的图像一样大。

2. 5个参数：再传入两个参数，目标宽度和目标高度。缩放只会影响绘制的图像，不影响上下文的变换矩阵。（原图可能缩放）

3. 9个参数，分别是：要绘制的图像、源图像x坐标、源图像y坐标、源图像宽、源图像高、目标区域x坐标、目标区域y坐标、目标区域宽、目标区域高。（原图可能缩放或裁切）（把图像的一部分绘制到上下文中的一个区域）

   ```javascript
   context.drawImage(image, 0, 10, 50, 50, 0, 100, 40, 60);
   ```

   这样原始图像中只有一部分会绘制到画布上。从(0, 10)开始，50像素宽，50像素高，绘制到画布上，从(0, 100)开始绘制，目标为40像素宽，60像素高。

```javascript
let image = document.getElementById('image');
if(image.getContext) {
  let img = document.images[0];
  let context = image.getContext("2d");
  // context.drawImage(img, 0, 0);
  // context.drawImage(img, 0, 0, 300, 300);
  context.drawImage(img, 0, 10, 100, 200, 0, 50, 300, 300);
}
```

第一个参数要绘制的图像，也可以是另一个`<canvas>`元素，相当于把一个画布的内容绘制到当前画布上。

操作的结果可以使用`toDataURL()`方法获取。注：绘制的图像来自其他域而非当前页面所在域，则不能获取其数据。此时调用`toDataURL()`会抛出错误。

#### 阴影

2D上下文可以设置下列属性为已有形状或路径生成阴影：

* shadowColor：CSS颜色值，表示阴影颜色，默认黑
* shadowOffsetX：阴影相对于形状或路径的x坐标的偏移量，默认0
* shadowOffsetY：阴影相对于形状或路径的y坐标的偏移量，默认0
* shadowBlur：像素，表示阴影的模糊量。默认0，表示不模糊（边界清晰）

只要在绘制图形或路径前给这些属性设置好适当的值，阴影就会自动生成。

```javascript
// =================start 设置阴影
context.shadowOffsetX = -5;
context.shadowOffsetY = 5;
context.shadowBlur = 20;
context.shadowColor = "rgba(0, 0, 0, 0.5)";
context.fillStyle = "#0000ff";
context.fillRect(0, 0, 100, 100); // -> 蓝色矩形
```

#### 渐变

通过CanvasGradient的实例表示。

创建一个线性渐变：

1. 调用上下文的`createLinearGradient()`方法。接收4个参数：起点x坐标、起点y坐标、终点x坐标、终点y坐标

   该方法会以指定大小创建一个新的CanvasGradient对象并返回实例。

2. 使用gradient对象的`addColorStop()`方法为渐变指定色标。接收2个参数：色标位置和CSS颜色字符串。色标位置通过0~1范围内的值表示，0是第一种颜色，1是最后一种颜色

3. 把这个gradient对象赋值给fillStyle或strokeStyle属性，从而以渐变填充或描画绘制的图形。

为了让渐变覆盖整个矩形，而不只是其中一部分，两者的坐标必须搭配合适。（如果矩形没有绘制到渐变的范围内，则只会显示部分渐变）=> 保持渐变与形状的一致非常重要，有时可能需要写个函数计算相应的坐标，如`createRectLinearGradient()`

创建一个径向渐变（或放射性渐变）：

1. 调用`createRadialGradient()`方法。接收6个参数，分别对应两个圆形圆心的坐标和半径。起点圆形中心的x、y坐标和半径，终点圆形中心的x、y坐标和半径。
2. 其他使用与线性渐变一样

要创建起点圆心在形状中心并向外扩散的径向渐变，需要将两个圆形设置为同心圆。

#### 图案

用于填充和描画图形的重复图像。

创建新图案：

1. 调用上下文的`createPattern()`方法。传入两个参数：一个HTML`<img>`元素，一个表示如何重复图像的字符串（与background-repeat属性是一样，包括repeat、repeat-x、repeat-y和no-repeat）。
2. 把返回的pattern对象赋值给fillStyle或strokeStyle属性。

图案的起点实际上是画布的原点(0, 0)。将填充样式设置为图案，表示在指定位置开始显示图案。（可以移动原点）

传给`createPattern()`的第一次参数也可以是`<video>`元素（？）或者另一个`<canvas>`元素。

#### 图像数据

2D上下文可以使用`getImageData()`方法获取原始图像数据。接收4个参数：要取得数据中第一个像素的左上角坐标和要取得的像素宽度及高度。

返回的对象是一个ImageData的实例。每个ImageData对象都包含3个属性：width、height和data。其中data属性是包含图像的原始像素信息的数组。每个像素在data数组中都由4个值表示，分别是红、绿、蓝和透明度值。故，第一个像素的信息包含在第0到第3个值中：

```javascript
let data = imageData.data,
    red = data[0],
    green = data[1],
    blue = data[2],
    alpha = data[3];
```

每个值的范围是[0, 255]

使用场景：通过更改图像数据可以创建一个简单的灰阶过滤器

```javascript
let imageData, data, i, len, average, red, green, blue, alpha;
imageData = context.getImageData(10, 10, 50, 50);
data = imageData.data;
for(i = 0, len = data.length; i < len; i += 4) {
  red = data[i];
  green = data[i+1];
  blue = data[i+2];
  alpha = data[i+3];
	// 取得RGB平均值
  average = Math.floor((red + green + blue) / 3);

  data[i] = average;
  data[i+1] = average;
  data[i+2] = average;
}
imageData.data = data;
// 将修改后的数据应用到画布上显式出来
context.putImageData(imageData, 10, 10);
```

把原来的值修改为平均值，实际上相当于过滤掉了颜色信息，只留下类似亮度的灰度信息。最后调用`putImageData()`方法，把图像数据再绘制到画布上，就得到了原始图像的黑白版。

更多内容可参考Ilmari Heikkinen的文章[”Making Image Filters with Canvas“](https://www.html5rocks.com/en/tutorials/canvas/imagefilters/)。

注：只有在画布没有加载跨域内容时，才可获取图像数据。

#### 合成

2D上下文中绘制的所有内容都会应用两个属性：globalAlpha和globalCompositeOperation。

globalAlpha是一个范围在0~1的值（包括0和1），用于指定所有绘制内容的透明度，[默认为1](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalAlpha)。如果有需要，可以将globalAlpha设置为适当的值，执行绘制，然后再重置为1。

globalCompositeOperation属性，表示新绘制的形状如何与上下文中已有的形状融合。是一个字符串，可以是下列值：

* **source-xxx**：新图形在原有图形上面
* source-over：默认值，新图形在原有图形上面
* source-in：新图形只绘制出与原有图形重叠的部分，画布上其余部分全部透明
* source-out：新图形只绘制出不与原有图形重叠的部分，画布上其余部分全部透明。（画布上只有新图形不与老图形交集的部分）
* source-atop：新图形只绘制出与原有图形重叠的部分，**原有图形不受影响**。（老+新老交集）
* **destination-xxx**：新图形在原有图形下面
* destination-over：重叠部分只有原图形透明像素下的部分可见。
* destination-in：画布上只剩下二者重叠的部分，其余部分完全透明
* destination-out：新图形与原有图形重叠的部分完全透明（受全局透明度影响），原图形其余部分不受影响，其余部分透明。（画布上只有老图形不与新图形交集的部分）
* destination-atop：原有图形与新图形不重叠的部分完全透明，新图形绘制不受影响（新+新老交集）
* lighter：新图形与原有图形重叠部分的像素值相加，使该部分变亮。
* copy：将原有图形擦除，再绘制新图形
* xor：新图形与原有图形重叠部分的像素执行”异或“计算

不同浏览器的实现可能存在差异，如果使用需要进行兼容性测试

