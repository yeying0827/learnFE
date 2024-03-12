function Ajax(method, url, {query, params, headers, successCallback }) {
    // 1. 创建对象
    const xhr = new XMLHttpRequest();
    // 2. 初始化 设置请求类型和url
    method = method.toUpperCase();
    let queryString = '?';
    if (query && query instanceof Object) {
        for (const key in query) {
            queryString += `${key}=${query[key]}&`
        }
        url += queryString.substring(0, queryString.length - 1);
    }
    xhr.open(method, url);
    // 3. 设置请求头
    for (const key in headers) {
        xhr.setRequestHeader(key, headers[key]);
    }
    // 4. 发送请求
    let paramString = '';
    if (params && params instanceof Object) {
        for (const key in params) {
            paramString += `${key}=${params[key]}&`
        }
        paramString = paramString.substring(0, paramString.length - 1);
    }
    xhr.send(paramString);
    // 5. 事件绑定 处理服务端返回的结果
    // on 当...的时候
    // readystate 0-初始化创建的时候 1-open的时候 2-send的时候 3-服务端部分返回的时候 4-服务端返回全部的时候
    // change 改变
    xhr.onreadystatechange = function () {
        // 判断 服务端返回了所有的结果
        if (xhr.readyState === 4) {
            // 判断响应状态码 200 404 403 401 500
            // 2xx 成功
            if (xhr.status >= 200 && xhr.status < 300) {
                let result = {
                    status: xhr.status, // 状态码
                    statusText: xhr.statusText, // 状态字符串
                    responseHeaders: xhr.getAllResponseHeaders(), // 所有响应头
                    response: xhr.response // 响应体
                }
                successCallback(result);
            }
        }
    }
}

async function AjaxAdapter(method, url, {query, params, headers, successCallback }) {}

async function Ajax(method, url, {query, params, headers, successCallback }) {
    return AjaxAdapter(method, url, {query, params, headers, successCallback });
}
