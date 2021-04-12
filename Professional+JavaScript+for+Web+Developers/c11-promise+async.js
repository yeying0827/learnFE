/* 异步操作代码
let x = 3;
setTimeout(() => x = x + 4, 1000);*/

/* 异步函数
function double(value) {
	setTimeout(() => setTimeout(console.log, 0, value * 2), 1000);
}
double(3);*/

/* 给异步函数添加回调函数
function double(value, callback) {
	setTimeout(() => callback(value * 2), 1000);
}
double(3, (x) => console.log(`I was given ${x}`));*/

/* 给异步函数添加成功回调函数和失败回调函数
function double(value, success, failure) {
	setTimeout(()=> {
		try {
			if(typeof value !== 'number') {
				throw 'Must provide number as first argument';
			}
			success(value * 2);
		} catch(e) {
			failure(e);
		}
	}, 1000);
}
const successCallback = (x) => console.log(`Success: ${x}`);
const failureCallback = (e) => console.log(`Failure: ${e}`);

double(3, successCallback, failureCallback);
double('p', successCallback, failureCallback);
// Success: 6
// Failure: Must provide number as first argument*/

/*
let p1 = new Promise((resolve, reject) => resolve());
setTimeout(console.log, 0, p1);
// Promise {<fulfilled>: undefined}     Chrome控制台
// Promise { undefined }       node运行
let p2 = new Promise((resolve, reject) => reject());
setTimeout(console.log, 0, p2);
// Uncaught (in promise) undefined    Chrome控制台
// Promise {<rejected>: undefined}
// UnhandledPromiseRejectionWarning: undefined    node运行
// Promise { <rejected> undefined }*/

/* executor函数在其他同步代码执行之后会同步执行 */
new Promise(()=> setTimeout(console.log, 0, 'executor'));
setTimeout(console.log, 0, 'promise initialized');
// executor
// promise initialized

/*
let p = new Promise((resolve, reject) => setTimeout(resolve, 1000));
setTimeout(console.log, 0, p); // Promise { <pending> }*/

/* 落定的状态不可撤销
let p = new Promise((resolve, reject) => {
	resolve();
	reject();
});
setTimeout(console.log, 0, p); // Promise {<fulfilled>: undefined}*/

/* 定时退出，避免期约卡在待定状态
let p = new Promise((resolve, reject) => {
	setTimeout(reject, 10000);
});
setTimeout(console.log, 0, p);
setTimeout(console.log, 11000, p);
// Promise {<pending>}
// (10秒后)
// Uncaught (in promise) undefined
// (1秒后)
// Promise {<rejected>: undefined}*/

/*
// Promise.resolve
// 参数为期约值时，等于透传=>幂等
// 参数为非期约值时，将其转换为解决的期约（实例化一个解决的期约）
let p1 = new Promise((resolve, reject) => resolve());
let p2 = Promise.resolve();
setTimeout(console.log, 0, p1);
// Promise {<fulfilled>: undefined}
// 	__proto__: Promise
// 	[[PromiseState]]: "fulfilled"
// 	[[PromiseResult]]: undefined
setTimeout(console.log, 0, Promise.resolve(3));
// Promise {<fulfilled>: 3}
// 	__proto__: Promise
// 	[[PromiseState]]: "fulfilled"
// 	[[PromiseResult]]: 3

console.log(p1 === Promise.resolve(p1)); // true
console.log(Promise.resolve(9)); // Promise {<fulfilled>: 9}*/

// Promise.reject
// 实例化一个拒绝的期约并抛出一个异步错误，参数为拒绝的理由。
// 这个参数会继续传给后续的拒绝处理程序
let p = Promise.reject(3);
setTimeout(console.log, 0, p); // Promise { <rejected> 3 }
p.then(null, (e)=>setTimeout(console.log, 0, e)); // 3

p = Promise.reject(Promise.resolve());
// Promise {<rejected>: Promise}
// Uncaught (in promise) Promise {<fulfilled>: undefined}
setTimeout(console.log, 0, p); // Promise { <rejected> Promise { undefined } }
// Promise {<rejected>: Promise}
p.then(null, (e)=>setTimeout(console.log, 0, e)); // Promise {<fulfilled>: undefined}

/*
Promise.prototype.then()
返回一个新的期约实例。
若期约还没有落定，就是一个pending中的期约实例。

若期约实例的状态落定为resolve，就是被onResolved处理程序的返回值 通过Promise.resolve()包装来生成新期约。
如果onResolve处理程序抛出异常(throw)，就返回拒绝的期约

若期约实例的状态落定为reject，就是被onRejected处理程序的返回值 通过Promise.resolve()包装来生成新期约。
 */
// function onResolved(id) {
// 	setTimeout(console.log, 0, id, 'resolved');
// }
// function onRejected(id) {
// 	setTimeout(console.log, 0, id, 'rejected');
// }
// let p1 = new Promise((resolve, reject) => setTimeout(resolve, 1000));
// let p2 = new Promise((resolve, reject) => setTimeout(reject, 1000));
// /*p1.then('not function test');*/ p1.then(() => onResolved('p1'), () => onRejected('p1')); // p1 resolved
// p2.then(null, () => onRejected('p2')); // p2 rejected

/*
let p1 = Promise.resolve('foo');
// 没有onResolve处理程序，通过Promise.resolve()包装期约实例来生成新期约。
let p2 = p1.then();
setTimeout(console.log, 0, p1); // Promise { 'foo' }
setTimeout(console.log, 0, p2); // Promise { 'foo' }
console.log(p1 === p2); // false
// onResolve处理程序没有显式返回，就把默认的返回值undefined包装成期约
// 否则，就把返回的值包装成期约（非期约值包装成解决的期约，期约值包装成它的副本期约）
// 如果处理程序抛出异常(throw)，就返回拒绝的期约
let p3 = p1.then(() => undefined);
let p4 = p1.then(() => {}); // 无返回值
let p5 = p1.then(() => Promise.resolve());
setTimeout(console.log, 0, p3); // Promise { undefined } => Promise.resolve(undefined)
setTimeout(console.log, 0, p4); // Promise { undefined } => Promise.resolve(undefined)
setTimeout(console.log, 0, p5); // Promise { undefined } => Promise.resolve(Promise.resolve())
let p6 = p1.then(() => 'bar');
let p7 = p1.then(() => Promise.resolve('bar'));
setTimeout(console.log, 0, p6); // Promise { 'bar' } => Promise.resolve('bar')
setTimeout(console.log, 0, p7); // Promise { 'bar' } => Promise.resolve(Promise.resolve('bar'))
let p8 = p1.then(() => new Promise(() => {}));
setTimeout(console.log, 0, p8); // Promise { <pending> }
let p9 = p1.then(() => Promise.reject());
setTimeout(console.log, 0, p9); // Promise { <rejected> undefined }
let p10 = p1.then(() => { throw 'baz'});
setTimeout(console.log, 0, p10); // Promise { <rejected> 'baz' }
let p11 = p1.then(() => Error('qux'));
setTimeout(console.log, 0, p11);
// Promise {
// 	Error: qux
// 	at .../c11-promise+async.js:155:25
// 	at processTicksAndRejections (internal/process/task_queues.js:93:5)
// }
*/

/*
let p1 = Promise.reject('foo');
// 没有onRejected处理程序，p2就是p1的副本期约
let p2 = p1.then();
// Uncaught (in promise) foo
setTimeout(console.log, 0, p2); // Promise {<rejected>: "foo"}
let p3 = p1.then(null, () => undefined);
let p4 = p1.then(null, () => {});
let p5 = p1.then(null, () => Promise.resolve());
setTimeout(console.log, 0, p3); // Promise {<fulfilled>: undefined}
setTimeout(console.log, 0, p4); // Promise {<fulfilled>: undefined}
setTimeout(console.log, 0, p5); // Promise {<fulfilled>: undefined}
let p6 = p1.then(null, () => 'bar');
let p7 = p1.then(null, () => Promise.resolve('bar'));
setTimeout(console.log, 0, p6); // Promise {<fulfilled>: "bar"}
setTimeout(console.log, 0, p7); // Promise {<fulfilled>: "bar"}
let p8 = p1.then(null, () => new Promise(() => {}));
setTimeout(console.log, 0, p8); // Promise {<pending>}
let p9 = p1.then(null, () => Promise.reject());
// Uncaught (in promise) undefined
setTimeout(console.log, 0, p9); // Promise {<rejected>: undefined}
let p10 = p1.then(null, () => { throw 'baz'});
// Uncaught (in promise) baz
setTimeout(console.log, 0, p10); // Promise {<rejected>: "baz"}
let p11 = p1.then(null, () => Error('qux'));
setTimeout(console.log, 0, p11);
// Promise {<fulfilled>: Error: qux
//     at <anonymous>:3:31}*/

/*
    Promise.prototype.catch()
let pp = Promise.reject();
let onRejected = function (e) {
    setTimeout(console.log, 0, 'rejected');
};
pp.then(null, onRejected); // rejected
pp.catch(onRejected); // rejected
let p1 = new Promise(() => {});
let p2 = p1.catch();
setTimeout(console.log, 0, p2); // Promise { <pending> }*/

/*
* Promise.prototype.finally()
* 返回一个新期约实例。
* 多数情况下，返回的是原期约实例的副本；
* 若onFinally返回的是一个待定的期约，或是拒绝的期约（或抛出异常），则返回相应状态的期约实例。如果待定的期约状态落定了，新期约还是会转换为原期约实例的副本。
* */
let p1 = Promise.resolve();
let p2 = Promise.reject();
let onFinally = function () {
    setTimeout(console.log, 0, 'Finally!');
};
p1.finally(onFinally); // Finally!
p2.finally(onFinally); // Finally!
/*
p1 = Promise.resolve('foo');
p2 = p1.finally(() => new Promise((resolve, reject)=> setTimeout(()=> resolve('bar'), 100)));
setTimeout(console.log, 0, p2); // Promise { <pending> }
setTimeout(()=> setTimeout(console.log, 0, p2), 200); // Promise { 'foo' }*/
/*
p1 = new Promise(((resolve, reject) => resolve('foo')));
p1.then((value => console.log(value))); // foo
p2 = new Promise(((resolve, reject) => reject('bar')));
p2.catch(reason => console.log(reason)); // bar*/

let pp1 = new Promise(((resolve, reject) => {
    console.log('p1 executor');
    setTimeout(resolve, 1000);
}));
pp1.then(() => new Promise((resolve, reject) => {
    console.log('p2 executor');
    setTimeout(resolve, 1000);
}))
    .then(() => new Promise(((resolve, reject) => {
        console.log('p3 executor');
        setTimeout(resolve, 1000);
    })))
    .then(() => new Promise(((resolve, reject) => {
        console.log('p4 executor');
        setTimeout(resolve, 1000);
    })));

function delayedExecute(str, callback=null) {
    setTimeout(()=> {
        console.log(str);
        callback && callback();
    }, 1000);
}
delayedExecute('p1 callback', ()=> {
    delayedExecute('p2 callback', ()=> {
        delayedExecute('p3 callback', ()=> {
            delayedExecute('p4 callback');
        });
    });
});

// 有向非循环。层序遍历。
let A = new Promise(((resolve, reject) => {
    console.log('A');
    resolve();
}));
let B = A.then(()=> console.log('B'));
let C = A.then(()=> console.log('C'));
B.then(()=> console.log('D'));
B.then(()=> console.log('E'));
C.then(()=> console.log('F'));
C.then(()=> console.log('G'));
A.then(()=> console.log('H'));
// A
// B
// C
// H
// D
// E
// F
// G

let ppp = new Promise(((resolve, reject) => reject('ppp')));
let ppp1 = new Promise(((resolve, reject) => reject('ppp1')));
let all = Promise.all([
    new Promise(((resolve, reject) => setTimeout(reject, 1000))),
    ppp,
    ppp1
]);
all.catch(reason => setTimeout(console.log, 0, 2, reason));
ppp1.then((value)=> console.log(value), (reason)=> console.log(11, reason));
ppp.then((value)=> console.log(value), (reason)=> console.log(1, reason));
// 11 "ppp1"
// 1 "ppp"
// 2 "ppp"

function addTwo(x) { return x + 2 };
function addThree(x) { return x + 3 };
function addFive(x) { return x + 5 };
function compose(...fns) {
    return x => fns.reduce((promise, fn) => promise.then(fn), Promise.resolve(x));
}
let addTen = compose(addTwo, addFive, addThree);
addTen(8).then(console.log); // 18

