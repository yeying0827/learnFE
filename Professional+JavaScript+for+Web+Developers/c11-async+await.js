/*
let p = new Promise(((resolve, reject) => setTimeout(resolve, 1000, 3)));
p.then(x => console.log(x));
// (1秒后)3*/

/*
async function foo() {
    console.log(1);
}
foo();
console.log(2);
// 1
// 2*/

async function foo() {
    console.log(1);
    return Promise.resolve(3); // 3;
}
foo().then(console.log);
console.log(2);
// 1
// 2
// 3
async function bar() {
    return ['bar'];
}
bar().then(console.log);
// 1
// 2
// [ 'bar' ]
// 3
/*
1.先执行同步代码，打印1，把Promise.resolve落定后执行的任务插入消息队列
2.执行同步代码，打印2
3.把bar().then()的任务插入消息队列
4.完成Promise.resolve落定后执行的任务出列执行，把foo().then()的任务插入消息队列
5.把bar().then()的任务出列执行：打印['bar']
6.把foo().then()的任务出列执行：打印3
 */
async function baz() {
    const thenable = {
        then(callback) {
            callback('baz');
        }
    };
    return thenable;
}
baz().then(console.log);
// baz
async function qux() {
    return Promise.resolve('qux');
}
qux().then(console.log); // qux

async function foo1() {
    console.log(11);
    throw 33;
}
foo1().catch(console.log); // 33 onRejected处理程序打印

async function foo2() {
    console.log(111);
    // console.log( 'await', await Promise.resolve(333) );
    Promise.reject(333);
    console.log(334);
}
foo2().catch(console.log);
console.log(222);