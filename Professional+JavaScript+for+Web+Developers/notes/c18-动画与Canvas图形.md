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

故，**实现平滑动画最佳的重绘间隔为1000毫秒/60，大约17毫秒。**如果同时运行多个动画，可能需要加以限流。

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





### WebGL

画布的3D上下文。不是W3C制定的标准，而是Khronos Group的标准。

作为浏览器中WebGL基础的OpenGL ES2.0，要使用WebGL最好熟悉它，因为很多概念可以照搬过来。

一个WebGL教程网站：[Learn WebGL](http://learnwebgl.brown37.net/)

注：定型数组是在WebGL中执行操作的重要数据结构

#### WebGL上下文

在完全支持的浏览器中，WebGL2.0上下文的名字叫“webgl2”，WebGL1.0上下文的名字叫“webgl1”。如果浏览器不支持WebGL，则尝试访问WebGL上下文会返回null。**在使用之前，应该先检测返回值是否存在**：

```javascript
let drawing = document.getElementById("drawing");

if(drawing.getContext) {
  let gl = drawing.getContext("webgl");
  
  if(gl) {
    // 使用WebGl
  }
}
```

大多数WebGL应用和例子遵循约定：把WebGL Context对象命名为gl，因为OpenGL ES 2.0方法和值通常以“gl”开头。这样可以让JavaScript代码看起来更接近OpenGL程序。

#### WebGL基础

取得WebGL上下文后，就可以开始3D绘图了。

WebGL中涉及的概念，实际上是JavaScript所实现的OpenGL概念

在**调用getContext()取得WebGL上下文时可以指定一些选项。**这些选项通过一个参数对象传入，选项就是这个参数对象的一个或多个属性。

* alpha：布尔值，表示是否为上下文创建透明通道缓冲区，默认true。
* depth：布尔值，表示是否使用16位深缓冲区，默认true。
* stencil：布尔值，表示是否使用8位模板缓冲区，默认false。
* antialias：布尔值，表示是否使用默认机制执行**抗锯齿操作**，默认true。
* premultipliedAlpha：布尔值，表示绘图缓冲区是否预乘透明度值，默认true。
* preserveDrawingBuffer：布尔值，表示绘图完成后是否保留绘图缓冲区，默认false。（建议充分了解后再修改，可能会影响性能）

这些上下文选项大部分适合开发高级功能。

**某些浏览器调用getContext()不能创建WebGL上下文，会抛出错误**，故最好使用try/catch块包装：

```javascript
let drawing = document.getElementById("drawing"),
    gl;

// 确保浏览器支持<canvas>
if(drawing.getContext) {
  try {
    gl = drawing.getContext("webgl", { alpha: false });
  } catch(ex) {
    // do nothing
  }
  if(gl) {
    // use WebGL
  } else {
    alert("WebGL context could not be created.");
  }
}
```

##### 1. 常量

在OpenGL中以GL_xxx开头（如GL_COLOR_BUFFER_BIT）；

在WebGL中以context对象的属性方式gl.xxx访问（如gl.COLOR_BUFFER_BIT，不包含GL_前缀）。WebGL支持大部分OpenGL常量

##### 2. 方法命名

很多方法会包含相关的数据类型信息。接收不同类型和不同数量参数的方法，会通过**方法名的后缀**体现这些信息。

表示参数数量的数字（1~4）在先，表示数据类型的字符串（“f“浮点数，”i“整数）在后。

如：gl.uniform4f()——需要4个浮点数值参数，gl.uniform3i()——需要3个整数值参数

另外接收数组，这类方法用字母”v“（vector）来表示，如：gl.uniform3iv()——需要一个包含3个整数值的数组参数

##### 3. 准备绘图

准备**使用WebGL上下文之前，通常需要先指定一种实心颜色清除`<canvas>`**。为此，需要调用clearColor()方法并传入4个参数，分别表示红、绿、蓝与透明度值，每个参数必须是0~1范围内的值，表示各个组件在最终颜色的强度。如：

```javascript
gl.clearColor(0, 0, 0, 1); // 黑色
gl.clear(gl.COLOR_BUFFER_BIT);
```

以上代码将**清理颜色缓冲区的值**（？不明白干啥用的）设置为黑色，然后调用clear()方法（这个方法相当于OpenGL中的glClear()方法）。参数gl.COLOR_BUFFER_BIT告诉WebGL使用之前定义的颜色填充画布。

**通常，所有绘图操作之前都需要先清除绘制区域。**

##### 4. 视口与坐标

**绘图前还要定义WebGL视口**。

默认情况下，视口使用整个`<canvas>`区域。要改变视口，可以调用viewport()方法并传入视口相对于`<canvas>`元素的x、y坐标及宽度和高度。如：

```javascript
gl.viewport(0, 0, drawing.width, drawing.height); // 相当于使用整个<canvas>元素
```

以上定义的视口的x和y坐标起点(0, 0)表示`<canvas>`元素的**左下角**，向上、向右增长，可以用点(width-1, height-1)定义。

使用`<canvas>`元素的一部分来绘图，例子：

```javascript
gl.viewport(0, drawing.height/2, drawing.width/2, drawing.height/2); // 视口是左上角四分之一
```

视口自身的坐标系统中，坐标原点(0, 0)是**视口的中心点**。左下角是(-1, -1)，右上角是(1, 1)。

如果绘图时使用了视口外部的坐标，则绘制结果会被视口剪切。

##### 5. 缓冲区

在JavaScript中，**顶点信息**保存在定型数组中。要**使用这些信息，必须先把它们转换为WebGL缓冲区**。

使用步骤：

1）创建缓冲区。调用gl.createBuffer()方法；

2）将缓冲区绑定到WebGL上下文。调用gl.bindBuffer()方法；

3）用数据填充缓冲区。所有缓冲区操作都在buffer上直接执行。

例子：

```javascript
let buffer = gl.createBuffer(); // 创建缓冲区
gl.bindBuffer(gl.ARRAY_BUUFER, buffer); // 将buffer设置为上下文的当前缓冲区
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0.5, 1]), gl.STATIC_DRAW); // 虽然没有包含对buffer的直接引用，但仍然是在它上面执行

// 上例中，使用一个Float32Array（通常把所有顶点信息保存在Float32Array中）初始化了buffer。如果想输出缓冲区内容，可以调用drawElements()方法并传入gl.ELEMENT_ARRAY_BUFFER。
```

gl.bufferData()方法的最后一个参数表示如何使用缓冲区。可以是下列值：

* gl.STATIC_DRAW：数据加载一次，可以在多次绘制中使用；
* gl.STREAM_DRAW：数据加载一次，只能在几次绘制中使用；
* gl.DYNAMIC_DRAW：数据可以重复修改，在多次绘制中使用

大多数情况下对缓冲区使用gl.STATIC_DRAW

缓冲区会一直驻留在内存中，直到页面卸载。如果不再需要缓冲区，最好调用gl.deleteBuffer()方法释放其占用的内存：

`gl.deleteBuffer(buffer);`

##### 6. 错误

**在WebGL操作中通常不会抛出错误**。必须在调用可能失败的方法后，调用gl.getError()方法。这个方法返回一个常量，表示发生的错误类型。可以是下列值：

* gl.NO_ERROR：上一次操作没有发生错误（0值）；
* gl.INVALID_ENUM：上一次操作没有传入WebGL预定义的常量；
* gl.INVALID_VALUE：上一次操作需要无符号数值，但是传入了负数；
* gl.INVALID_OPERATION：上一次操作在当前状态下无法完成；
* gl.OUT_OF_MEMORY：上一次操作因内存不足而无法完成
* gl.CONTEXT_LOST_WEBGL：上一次操作因外部事件（如设备掉电）而丢失了WebGL上下文

每次调用gl.getError()方法会返回一个错误值。第一次调用之后，再调用gl.getError()可能会返回另一个错误值。如果有多个错误，则可以重复这个过程，循环调用getError()，直到返回gl.NO_ERROR。如：

```javascript
let errorCode = gl.getError();
while(errorCode) {
  console.log("Error occurred: " + errorCode);
  errorCode = gl.getError();
}
```

如果WebGL代码没有产出想要的输出结果，那么可以调用几次getError()，有可能找到问题所在。

##### 7. 着色器

[codepen-webgl](https://codepen.io/yeying0827/pen/mdQGbYQ)

**顶点着色器**，用于把3D顶点转换为可以渲染的2D点。

**片段（或像素）着色器**，用于计算绘制一个像素的正确颜色。

不是JavaScript实现的，使用GLSL（OpenGL Shading Language，类C语言）编写。因为WebGL是OpenGL ES 2的实现，所以OpenGL中的着色器可以直接在WebGL中使用，这让桌面应用可以更方便地移植到Web上。

* 编写着色器

  GLSL专门用于编写OpenGL着色器

  每个着色器都有一个`main()`方法，在绘制期间会**重复**执行。给着色器传递数据的方式有两种：attribute和uniform。

  attribute：用于将顶点传入顶点着色器，

  uniform：用于将常量值传入任何着色器

  定义方式：值类型关键字（attribute或uniform） 数据类型 变量名

  ```html
  <!-- OpenGL 着色器语言 -->
  <!-- 值类型 数据类型 变量名 -->
  <script type="x-webgl/x-vertex-shader" id="vertexShader">
  		attribute vec2 aVertexPosition; // 顶点着色器，vec2：包含两项的数组
  		void main() {
  			gl_Position = vec4(aVertexPosition, 0.0, 1.0);
  		}
  </script>
  <script type="x-webgl/x-fragment-shader" id="fragmentShader">
  		precision mediump float; // 添加如下精度描述，不加会报错
  		uniform vec4 uColor; // 片段着色器
  		void main() {
  			gl_FragColor = uColor;
  		}
  </script>
  ```

  vec2表示aVertexPosition是一个包含两项的数组（数据类型为vec2），代表x和y坐标。这个着色器创建了一个新的包含4项的数组（vec4），缺少的坐标会补充上，把2D坐标转换为了3D坐标。

  片段着色器必须返回一个值保存到变量gl_FragColor中，表示绘制时使用的颜色。vec4包含颜色的4个组件（rgba），uColor的值在着色器内不能改变。

* 创建着色器程序

  浏览器并不理解原生GLSL代码，所以GLSL代码的字符串必须经过编译并链接到一个着色器程序中。使用步骤：

  0. 通常使用带有自定义type属性的`<script>`元素把着色器代码包含在网页中。如果type属性无效，则浏览器不会解析`<script>`的内容，但这并不妨碍读写其中的内容。（更复杂的WebGL应用可以动态加载着色器）

  1. 要使用着色器，必须先拿到GLSL代码的字符串。

     ```javascript
     let vertexGlsl = document.getElementById("vertexShader").text;
     ```

  2. 下一步是创建shader对象（着色器）。调用`gl.createShader`方法，入参为想要创建的着色器类型（gl.VERTEX_SHADER或gl.FRAGMENT_SHADER）。

     ```javascript
     let vertexShader = gl.createShader(gl.VERTEX_SHADER);
     ```

  3. 调用`gl.shaderSource()`方法把GLSL代码应用到着色器

     ```javascript
     gl.shaderSource(vertexShader, vertexGlsl);
     ```

  4. 调用`gl.compileShader()`编译着色器

     ```javascript
     gl.compileShader(vertexShader);
     ```

  5. 把shader对象链接到着色器程序。`gl.linkProgram()`

     ```javascript
     let program = gl.createProgram(); // 创建着色器程序
     gl.attachShader(program, vertexShader); // 添加着色器
     gl.attachShader(program, fragmentShader);
     gl.linkProgram(program); // 将两个着色器链接到变量program中
     ```

  6. 链接到程序之后，就可以通过`gl.useProgram()`方法让WebGL上下文使用这个程序了，所有后续的绘制操作都会使用这个程序。

     ```javascript
     gl.useProgram(program);
     ```

* 给着色器传值

  前面定义的每个着色器，都需要传入一个值，才能完成工作。

  要给着色器传值，必须先找到要接收值的变量。

  * uniform变量
    * 调用`gl.getUniformLocation()`方法。这个方法返回一个对象，表示该uniform变量在内存中的位置
    
      ```javascript
      let uColor = gl.getUniformLocation(program, 'uColor');
      ```
    
    * 使用这个位置来完成赋值。`gl.uniform4fv()`
    
      ```javascript
      gl.uniform4fv(uColor, [0, 0, 0, 1]);
      ```
    
  * attribute变量
    * 调用`gl.getAttribLocation()`方法，找到变量的内存地址
    
      ```javascript
      let aVertexPosition = gl.getAttribLocation(program, 'aVertexPosition');
      ```
    
    * 调用`gl.enableVertexAttribArray()`来启用
    
      ```javascript
      gl.entableVertextAttribArray(aVertexPosition);
      ```
    
    * 创建一个指向调用`gl.bindBuffer()`指定的缓冲区的指针，并将他保存在aVertexPosition中，可以在后面由顶点着色器使用。
    
      ```javascript
      gl.vertexAttribPointer(aVertexPosition, itemSize, gl.FLOAT, false, 0, 0);
      ```

* 调试着色器和程序

  与WebGL中的其他操作类似，着色器操作也可能失败，而且是静默失败。

  如果想知道发生了什么错误，必须手工通过WebGL上下文获取关于着色器或程序的信息。

  对于**着色器**，可以调用`gl.getShaderParameter()`方法取得编译之后的编译状态。比如下面的代码：

  ```javascript
  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
  		alert(gl.getShaderInfoLog(vertexShader));
  }
  ```

  检查了vertexShader编译的状态。如果编译成功，调用`gl.getShaderParameter`时会返回true，如果返回false则说明编译出错了，此时可以调用`gl.getShaerInfoLog`并传入着色器取得错误信息，这个方法返回一个字符串消息，显示问题所在。

  以上方式即可用于顶点着色器，也可用于片段着色器。

  **着色器程序**也可能失败，也有类似的方法。`gl.getProgramParameter`用于检测状态。

  最常见的程序错误发生在链接阶段，可以使用以下代码来检查：

  ```javascript
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
  		alert(gl.getProgramInfoLog(program));
  }
  ```

  同样，`gl.getProgramParameter`会在链接成功时返回true，失败时返回false。

  以上这些方法主要在开发时用于辅助调试。只要没有外部依赖，在产品环境中就可以放心地删除它们。

* GLSL 100升级到GLSL 300

  WebGL2的主要变化是升级到了GLSL 3.00 ES着色器，这个升级暴露了很多新的着色器功能，包括3D纹理等在支持OpenGL ES 3.0的设备上都有的功能。
  
  首先getContext要获取webgl2的上下文:
  
  ```javascript
  gl = drawing.getContext("webgl2", { alpha: false }); 
  ```
  
  要使用升级版的着色器，着色器代码的第一行必须是：
  
  ```
  #version 300 es
  ```
  
  其他一些语法的变化：
  
  1. 顶点attribute变量要使用in而不是attribute关键字声明
  
     ```glsl
     in vec2 aVertexPosition; // 顶点着色器
     void main() {
     	gl_Position = vec4(aVertexPosition, 0.0, 1.0);
     }
     ```
  
  2. 使用varying关键字为顶点或片段着色器声明的变量，现在必须根据相应着色器的行为改为使用in或out。
  
  3. 预定义的输出变量`gl_FragColor`没有了，片段着色器必须为颜色输出声明自己的out变量。
  
     ```glsl
     precision mediump float; // 添加如下精度描述，不加这行会看到报错
     uniform vec4 uColor; // 片段着色器
     out vec4 fragColor; // 预定义的输出变量gl_FragColor没有了，必须为颜色输出声明自己的out变量
     void main() {
     	fragColor = uColor;
     }
     ```
  
  4. 纹理查找函数`texture2D`和`textureCube`统一成了一个`texture`函数

##### 8. 绘图

[codepen-webgl2](https://codepen.io/yeying0827/pen/LYXJEMN)

**WebGL只能绘制三种形状：点、线和三角形**。其他形状必须通过这三种基本形状在3D空间的组合来绘制。

WebGL绘图要使用`drawArrays()`和`drawElements()`方法，前者使用数组缓冲区，后者操作元素数组缓冲区。

`drawArrays`和`drawElements`的第一个参数都表示要绘制形状的常量，有如下常量可选：

* `gl.POINTS`：将每个顶点当成一个点来绘制

* `gl.LINES`：将数组作为一系列顶点，在这些顶点间绘制直线。

  每个顶点既是起点也是终点。因此数组中的顶点必须是偶数个才能开始绘制。

* `gl.LINE_LOOP`：将数组作为一系列顶点，从第一个顶点到第二个顶点绘制一条直线，再从第二个顶点到第三个顶点绘制一条直线，以此类推，直到绘制到最后一个顶点；再从最后一个顶点到第一个顶点绘制一条直线。

  绘制出形状的轮廓。闭环。

* `gl.LINE_STRIP`：与`LINE_LOOP`类似，区别在于不会从最后一个顶点到第一个顶点绘制直线。

* `gl.TRIANGLES`：将数组作为一系列顶点，在这些顶点间绘制三角形。如无特殊指定，每个三角形都分开绘制，不共享顶点。

* `gl.TRIANGLES_STRIP`：类似于`TRIANGLES`，区别在于从第四个点开始，每个点会作为第三个顶点与其前面的两个顶点构成三角形。

* `gl.TRIANGLES_PAN`：类似于`TRIANGLES`，区别在于从第四个点开始，每个点会作为第三个顶点与其前面的一个顶点和第一个顶点构成三角形。

`drawArrays`的第二个参数，是数组缓冲区的起点索引

第三个参数，是数组缓冲区包含的顶点集合的数量。

以下代码示例在画布绘制一个三角形：

```javascript
function drawTriangle(gl, program) {
   // 定义3个顶点的x坐标和y坐标
   let vertices = new Float32Array([0, 1, 1, -1, -1, -1]),
      buffer = gl.createBuffer(),
      vertextSetSize = 2,
      vertextSetCount = vertices.length / vertextSetSize, // 计算顶点数
      uColor,
      aVertexPosition;
   // 将数据放入缓冲区
   gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
   gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW); // 数据（顶点信息）加载一次，在多次绘制中使用
   // 给片段着色器传入颜色
   uColor = gl.getUniformLocation(program, "uColor");
   gl.uniform4fv(uColor, [0, 1, 0, 1]); // 绿色，颜色信息传递给片段着色器
   // 把顶点信息传给着色器
   aVertexPosition = gl.getAttribLocation(program, "aVertexPosition");
   gl.enableVertexAttribArray(aVertexPosition); // 启用缓冲区
   // 每两个点代表一个顶点信息，三个顶点坐标[0,1]（顶上中间） [1,-1]（右下角） [-1,-1]（左下角）
   gl.vertexAttribPointer(aVertexPosition, vertextSetSize, gl.FLOAT, false, 0, 0); // 创建指针指向缓冲区
   // 绘制三角形
   gl.drawArrays(gl.TRIANGLES, 0, vertextSetCount);
}
```

说明：

* 首先，定义一个Float32Array变量，它包含3组顶点信息。

  一个顶点的位置信息使用一个包含2个元素的数组表示（vertextSetSize，数组大小），计算出顶点的数量（vertextSetCount）。顶点信息保存在了缓冲区。

* 把颜色信息传给片段着色器

* 调用`vertexAttribPointer`，使用缓冲区

  * `gl.FLOAT`表示顶点坐标数值类型
  * 第四个参数为布尔值，表示坐标不是标准的
  * 第五个参数是步长值（stride value），表示跳过多个数组元素取得下一个值，不用跳过就传入0
  * 最后一个参数是起始偏移量，0表示从第一个数组元素开始

* 调用`drawArrays`绘制三角形

  第一个参数指定为`TRIANGLES`，就可以从(0,1)到(1,-1)再到(-1,-1)绘制一个三角形，并填充传给片段着色器的颜色。

  第二个参数表示缓冲区的起始偏移量。

  第三个参数是要读取的顶点数量。

  通过修改第一个参数，可以修改绘制三角形的方式，比如：`gl.LINE_LOOP`、`gl.LINE_STRIP`。

##### 9. 纹理

WebGL纹理可以使用DOM中的图片。

* 使用`gl.createTexture()`方法创建新的纹理；

* 将图片绑定到这个纹理；

  如果图片还没有加载，则可以创建一个Image对象来动态加载。

  图片加载完成后才能初始化纹理，因此在图片的load事件之后才能使用纹理。例子：

  ```javascript
  let image = new Image(),
      texture;
  image.src = "smile.gif";
  image.onload = function () {
    texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParamateri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    
    // 清除当前纹理
    gl.bindTexture(gl.TEXTURE_2D, null);
  }
  ```

除了使用DOM图片，这些步骤跟在OpenGL中创建纹理是一样的，最大的区别：使用`gl.pixelStorei()`设置了像素存储格式。

常量`gl.UNPACK_FLIP_Y_WEBGL`是WebGL独有的，在基于Web加载图片时通常要使用。原因在于：GIF、JPEG和PNG图片使用的坐标系统与WebGL内部的坐标系统不一样；如果不使用这个标志，图片就会倒过来。

注：用于纹理的图片必须跟当前页面同源，或者是来自启用了跨源资源共享（CORS，Cross-Origin Resource Sharing）的服务器上。

上述书中贴的代码暂时还没搞清楚怎么运行，以下是查到的一点资料：

* [WebGL基础-WebGL图像处理](https://webglfundamentals.org/webgl/lessons/zh_cn/webgl-image-processing.html)

* [WebGL基础-WebGL渲染到纹理](https://webglfundamentals.org/webgl/lessons/zh_cn/webgl-render-to-texture.html)
* [MDN-在WebGL中使用纹理](https://developer.mozilla.org/zh-CN/docs/Web/API/WebGL_API/Tutorial/Using_textures_in_WebGL)

##### 10. 读取像素

读取像素的`readPixels()`方法与OpenGL中的方法有同样的参数，只不过最后一个参数必须是定型数组。

像素信息是从帧缓冲区读出来并放到这个定型数组中的。

`readPixels()`方法的参数包括：x和y坐标、宽度、高度、图像格式、类型和定型数组。

* 前四个参数用于指定要读取像素的位置；
* 图像格式：几乎总是`gl.RGBA`；
* 类型：指的是要存储在定型数组中的数据类型
  * `gl.UNSIGNED_BYTE`：定型数组必须是`Uint8Array`
  * `gl.UNSIGNED_SHORT_5_6_5`、`gl.UNSIGNED_SHORT_4_4_4_4`或`gl.UNSIGNED_5_5_5_1`：定型数组必须是`Uint16Array`

例子：

```javascript
let pixels = new Uint8Array(25*25);
gl.readPixels(0, 0, 25, 25, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
```

读取了帧缓冲区中25像素 x 25像素大小的区域，并把读到的像素信息保存在pixels数组中，其中每个像素的颜色在这个数组中都以4个值表示，分别代表红、绿、蓝和透明度，每个数组值的取值范围是0~255。

别忘了先按照预期存储的数据量初始化定型数组。

> 注：
>
> 在浏览器绘制更新后的WebGL图像之前调用`readPixels()`没有问题。但在绘制完成后，帧缓冲区会恢复到其初始清除状态，此时调用`readPixels()`会得到与清除状态一致的像素数据。
>
> 如果想在绘制之后读取像素，则必须使用前面所说的`preserveDrawingBuffer`选项初始化WebGL上下文：
>
> `let gl = drawing.getContext("webgl", { preserveDrawingBuffer: true });`
>
> 设置这个标志可以强制帧缓冲区在下一次绘制之前保持上一次绘制的状态。这个选项可能会影响性能，因此尽量不要使用。

#### WebGL1与WebGL2

WebGL1代码几乎完全与WebGL2兼容。

在使用WebGL2上下文时，唯一可能涉及修改代码以保证兼容性的就是扩展。在WebGL2中，很多扩展都变成了默认功能。

例子：

```javascript
// 在WebGL1中使用绘制缓冲区，需要先测试相应扩展后再使用：
let ext = gl.getExtension('WEBGL_draw_buffers');

if (!ext) {
  // 没有扩展的代码
} else {
  ext.drawBuffersWEBGL([/*...*/])
}
                       
// 在WebGL2中，这里的检测代码就不需要了，因为这个扩展已经直接暴露在上下文对象上了
gl.drawBuffers([/*...*/]);
```

以下特性都已成为WebGL2的标准特性：

* ANGLE_instanced_arrays
* EXT_blend_minmax
* EXT_frag_depth
* EXT_shader_texture_lod
* OES_element_index_uint
* OES_standard_derivatives
* OES_texture_float
* OES_texture_float_linear
* OES_vertex_array_object
* WEBGL_depth_texture
* WEBGL_draw_buffers
* Vertex shader texture access

要了解WebGL更新的内容，可以参考WebGL2Fundamentals网站上的文章[WebGL2 from WebGL1](https://webgl2fundamentals.org/webgl/lessons/webgl1-to-webgl2.html)
