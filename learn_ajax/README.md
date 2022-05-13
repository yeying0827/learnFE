### Ajax介绍：

Asynchronous JavaScript and xml

在页面不刷新的情况下向服务器发送请求，实现数据的交换，用户体验更好

懒加载，按需加载——>资源利用率提高，整体页面加载速度变快（首屏加载）



### XML Vs. JSON

#### XML

设计被用来传输和存储数据。

HTML用来在网页当中呈现数据。

HTML都是预定义标签，XML中没有预定义标签，都是自定义标签。

最开始Ajax在进行数据交换的时候使用的格式就是XML（服务器端返回给客户端的就是XML格式的字符串）

#### JSON

JSON更简洁，传输的体积更小，数据转换也更加容易，可以直接借助JSON API的一些方法，快速将字符串转成JS对象



### Ajax的优缺点：

#### 优点

* 无需刷新页面就可以服务器发送请求
* 允许根据用户事件向服务端发送请求，对页面局部刷新

#### 缺点

* 没有浏览历史，不能回退
* 存在跨域问题（同源）
* SEO（Search Engine Optimization）不友好：爬虫爬不到



### HTTP

Hypertext Transport protocol（超文本传输协议），协议详细规定了浏览器和服务器之间互相通信的规则

#### 请求报文

重点是格式与参数

```
行  POST /?ie=utf-8 HTTP/1.1     请求类型、路径、协议版本
头  Host: aiguigu.com
    Cookie: name=guigu
    Content-type: application/x-www-form-ulrencoded                    请求体内容的类型
    User-Agent: chrome 83
空行
体  username=admin&password=admin        GET请求的请求体为空
```

GET - Query String parammeters请求参数的解析显示

Form Data/request payload

#### 响应报文

```
行  HTTP/1.1 200 OK    协议版本、响应状态码、状态字符串
头  Content-Type:text/html;charset=utf-8
    Content-length: 2048
    Content-encoding: gzip
    对响应体内容做相关描述：类型、长度、压缩方式
空行
体   主要返回的结果
     <html>
     	<head></head>
     	<body>
     	 <h1>尚硅谷></h1>
     	</body>
     </html>
```

404-找不到Not Found

403-没有权限

401-未授权

303-See Other

500-内部错误

200-请求成功



### Node.js

一个应用程序，可以解析JS代码，通过JS代码可以对计算机资源进行操作

#### Express的基本使用

```shell
## 安装
npm i express
```

```javascript
// 使用
// 1.引入express
const express = require('express');

// 2.创建应用对象
const app = express();

// 3.创建路由规则
// request 是对请求报文的封装
// response 是对响应报文的封装
app.get('/', (request, response) => {
  // 设置响应
	response.send('Hello Express');
})

// 4.监听端口并启动服务
app.listen(8000, () => {
  console.log('服务已启动，8000端口监听中...');
})
```



### 基本的Ajax操作

```javascript
// 创建对象
const xhr = new XMLHttpRequest();

// 初始化 设置请求方法和url
xhr.open('GET', 'http://127.0.0.1:8000/server?a=100&b=200&c=300');

// 发送请求
xhr.send();

// 事件绑定 处理服务端返回的结果
// stateready 0-初始化 1-open 2-send 3-服务端返回部分结果 4-服务端返回所有结果
xhr.onstatereadychange = function () {
  // 判断 服务端返回全部的结果
  if (xhr.stateReady === 4) {
    // 判断 响应状态码 200 404 403 401 500
    // 成功 2xx
    if (xhr.status >= 200 && xhr.status < 300) {
      // 处理成功的结果
      console.log(xhr.status); // 响应状态码
      console.log(xhr.statusText); // 状态字符串
      console.log(xhr.getAllResponseHeaders()); // 所有响应头
      console.log(xhr.response); // 响应体
    }
  }
}
```

#### 发送post请求

```javascript
// 初始化 设置请求类型和url
xhr.post('POST', 'http://127.0.0.1:8000/server');

// 设置请求体并发送请求
xhr.send('a=100&b=200&c=300');
```

#### 设置请求头

```javascript
xhr.setHeader('Content-Type', 'application/x-www-form-urlencoded');
xhr.setHeader('name', 'atguigu'); // 不是预定义的请求头，是自定义的，会有安全机制限制，服务端需要做头部处理，允许携带的头部字段 response.setHeader('Access-Control-Allow-Headers', '*');
```

#### 处理服务端返回的json数据

```javascript
// 服务端返回
response.send({ name: 'atguigu' });

// 客户端接收
// 1. 手动转换
const data = JSON.parse(xhr.response); // 得到json数据

// 2. 自动转换：设置responseType
xhr.responseType = 'json';
// ...
const data = xhr.response;
```

#### 处理超时和网络异常

```javascript
// 设置超时 2s超时
xhr.timeout = 2000;
// 网络超时后的回调
xhr.ontimeout = function () {
  alert('网络异常，请重新刷新！！')；
}
// 网络异常的回调
xhr.onerror = function () {
  alert('您的网络似乎有一些问题！')；
}
```

请求取消

```javascript
xhr.abort();
```

重复请求：场景——连续多次点击按钮发送请求

```javascript
let isSending = false; // 标识变量 是否正在发送Ajax请求

if(isSending) xhr.abort(); // 如果正在发送请求，则取消正在发送的请求，重新创建一个新的请求
xhr = new XMLHttpRequest();
isSending = true; // 修改 标识变量的值
xhr.open('method', 'url');
xhr.send();
xhr.onreadystatechange = function () {
  if(xhr.readyState === 4) {
    isSending = false; // 重置 标识变量
  }
}
```



### jQuery发送请求

```javascript
// get请求, 第四个参数是响应体结果类型
$.get('url', {a: 100, b: 200}, function(data) {
  console.log(data);
}, 'json');

// post请求
$.post('url', {a: 100, b: 200}, function(data) {
  console.log(data);
});

// 通用型方法ajax,满足个性化需求
$.ajax({
  // url
  url: '',
  method: '',
  // get请求的url参数，post请求的请求体参数
  data: {
    a: 100,
    b: 200
  },
  // 响应体结果的类型
  dataType: 'json',
  // 成功的回调
  success: function(data) {
    console.log(data);
  },
  // 超时时间
  timeout: 2000,
  // 失败的回调（包括超时）
  error: function() {
    console.log('出错啦！');
  },
  // 头信息
  headers: {
    name: 'xxx',
    token: '123'
  }
});
```



### Axios发送ajax请求

```javascript
// 设置baseURL
axios.defauts.baseURL = 'http://127.0.0.1:8000';

axios.get('/axios-server', {
  // url参数
  params: {
    name: 'tom',
    age: 18
  },
  // 头信息参数
  headers: {
    username: 'hh',
    token: '123'
  }
}).then(value => {
  console.log(value);
})

axios.post('/axios-server', {
  // 请求体参数
  password: 'admin',
  username: 'admin'
}, {
  params: {
    name: 'jack',
    age: 19
  },
  headers: {
    username: 'hh',
    token: '123'
  }
});

// 通用型方法
axios({
  url: '/axios-server',
  method: 'POST',
  // url参数
  params: {
    name: 'green',
    age: 20
  },
  headers: {
    username: 'hh',
    token: '123'
  },
  // 请求体参数
  data: {
    password: 'admin1',
    username: 'admin1'
  }
}).then(response => {
  console.log(response.status); // 响应状态码
  console.log(response.statusText); // 响应状态码字符串
  console.log(response.headers); // 响应头信息
  console.log(response.data); // 响应体
})
```



### fetch发送请求

```javascript
fetch('http://127.0.0.1:8000/fetch-server', {
  method: 'POST',
  headers: {
    token: '123'
  },
  body: 'a=100&b=200'
}).then(response => {
  // return response.text(); // 响应体解析为普通文本
  return response.json(); // 响应体解析为json
}).then(data => {
  console.log(data); // 响应体
});
```



### 请求体

原生ajax请求：默认request payload

jQuery：默认form data

axios：默认request payload

fetch：默认request payload



### 同源策略

协议、域名、端口号完全一致

解决跨域的方案：

#### 1. JSONP （JSON with Padding）

只支持get请求。利用script标签可获取跨域资源的特点，可跨域的标签还有img、link、iframe、script等。

服务端响应的是js代码，返回函数调用，并把参数传递进去。浏览器对代码进行解析并执行，函数声明由前端自己定义。

```javascript
// node部分
app.get('/jsonp-server', (request, response) => {
  const data = {
    name: 'atguigu'
  }
  const str = JSON.stringfy(data);
  response.end(`handle(${str})`);
});
```

```html
<!-- 前端部分 -->
<script>
	function handle(data) {
    const btn = document.getElementById('result');
    btn.innerHTML = data.name;
  }
</script>
<script src="http://127.0.0.1:8000/jsonp-server"></script>
```

实践

```javascript
const input = document.querySelector('input');
const p = document.querySelector('p');

function handle(data) {
  p.innerHTML = data.msg;
  input.style.border = 'solid 1px #f00';
}

input.onblur = function () {
  const script = document.createElement('script');
  script.src = 'http://127.0.0.1:8000/check-username';
  document.body.appendChild(script);
}
```

jQuery中使用JSONP

```javascript
// node部分
app.get('/jquey-jsonp-server', (request, response) => {
  const data = {
    name: 'atguigu',
    city: ['北京', '上海', '深圳']
  }
  const str = JSON.stringfy(data);
  const cb = request.query.callback;
  response.end(`${cb}(${str})`);
});

// ?callback=?是固定写法，jQuery会随机生成一个回调函数名称，服务端可以调用这个函数，相当于调用getJSON的第二个参数（函数）
$.getJSON('http://127.0.0.1:8000/jquey-jsonp-server?callback=?', function (data) {
  $('#result').html(`
  	名字：${data.name},
  	校区：${data.city}
  `);
})
```

#### 2. CORS(Cross-Origin Resource Sharing)

跨域资源共享

新增了一组HTTP首部字段（header）来解决跨域问题，允许服务器声明哪些源站通过浏览器有权限访问哪些资源

```javascript
response.setHeader('Access-Control-Allow-Origin', '*'); // 允许的请求来源
response.setHeader('Access-Control-Allow-Headers', '*'); // 允许携带的头信息，用于预检请求的响应
response.setHeader('Access-Control-Allow-Methods', '*'); // 允许的请求类型，用于预检请求的响应
response.setHeader('Access-Control-Expose-Headers', 'token'); // 允许浏览器可以拿到的自定义响应头
```

[具体可设置的CORS头信息可以参考MDN](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/CORS)
