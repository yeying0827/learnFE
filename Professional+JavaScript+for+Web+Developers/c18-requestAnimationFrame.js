function updateProgress(timestamp) {
    // console.log(timestamp);
    var div = document.getElementById('status');
    div.style.width = (parseInt(div.style.width, 10) + 5) + '%';

    if(div.style.width != "100%") {
        requestAnimationFrame(updateProgress);
    }

    // let id = requestAnimationFrame(updateProgress);
    // if(div.style.width == "100%") {
    //     cancelAnimationFrame(id);
    // }
}
requestAnimationFrame(updateProgress);





function expensiveOperation1() {
    console.log('111 Invoked at', Date.now());
}
function expensiveOperation2() {
    console.log('222 Invoked at', Date.now());
}
let enqueued = false;
function expensiveOperation3() {
    console.log('333 Invoked at', Date.now());
    enqueued = false;
}
let enabled = true;
function expensiveOperation4() {
    console.log('444 Invoked at', Date.now());
}
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
    // 配合使用一个计时器来限制操作执行的频率
    if(enabled) {
        enabled = false;
        window.requestAnimationFrame(expensiveOperation4);
        window.setTimeout(() => enabled = true, 50);
    }
});