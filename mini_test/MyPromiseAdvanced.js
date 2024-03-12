const PENDING = 'pending';
const RESOLVED = 'resolved';
const REJECTED = 'rejected';

function MyPromise(fn) {
    const that = this;
    that.state = PENDING;
    that.value = null;
    that.resolvedCallbacks = [];
    that.rejectedCallbacks = [];

    function resolve(value) {
        if (value instanceof MyPromise) {
            return value.then(resolve, reject);
        }

        // 调用queueMicrotask，将代码插入微任务的队列
        queueMicrotask(() => {
            if (that.state === PENDING) {
                that.state = RESOLVED;
                that.value = value;
                that.resolvedCallbacks.forEach(cb => cb(value));
            }
        })
    }

    function reject(reason) {
        queueMicrotask(() => {
            if (that.state === PENDING) {
                that.state = REJECTED;
                that.value = reason;
                that.rejectedCallbacks.forEach(cb => cb(reason));
            }
        });
    }

    try {
        fn(resolve, reject);
    } catch (e) {
        reject(e);
    }
}

MyPromise.prototype.then = function (onResolved, onRejected) {
    const that = this;
    onResolved = typeof onResolved === 'function' ? onResolved: v => v;
    onRejected = typeof onRejected === 'function'
        ? onRejected
        : r => {
            throw r;
        };
    let promise2; // then方法必须返回一个promise
    if (that.state === PENDING) {
        return promise2 = new MyPromise((resolve, reject) => {
            that.resolvedCallbacks.push(() => {
                try {
                    const x = onResolved(that.value); // 执行原promise的成功处理程序，如果未定义就透传
                    // 如果正常得到一个解决值x，即处理程序的返回值，就解决新的promise2，即调用resolutionProcedure函数，这是对[[Resolve]](promise, x)的实现
                    // 将新创建的promise2，处理程序返回结果x，以及与promise2关联的resolve和reject函数作为参数传递给 这个函数
                    resolutionProcedure(promise2, x, resolve, reject);
                } catch(r) { // 如果onResolved程序执行过程中抛出异常，promise2就被标记为失败
                    reject(r);
                }
            });
            that.rejectedCallbacks.push(() => {
                try {
                    const x = onRejected(that.value); // 执行原promise的失败处理程序，如果未定义就抛出异常
                    resolutionProcedure(promise2, x, resolve, reject); // 解决新的promise2
                } catch(r) {
                    reject(r);
                }
            });
        })
    }
    if (that.state === RESOLVED) {
        return promise2 = new MyPromise((resolve, reject) => {
            queueMicrotask(() => {
                try {
                    const x = onResolved(that.value);
                    resolutionProcedure(promise2, x, resolve, reject);
                } catch (r) {
                    reject(r);
                }
            });
        })
    }
    if (that.state === REJECTED) {
        return promise2 = new MyPromise((resolve, reject) => {
            queueMicrotask(() => {
                try {
                    const x = onRejected(that.value);
                    resolutionProcedure(promise2, x, resolve, reject);
                } catch(r) {
                    reject(r);
                }
            })
        })
    }
}

function resolutionProcedure(promise2, x, resolve, reject) {
    if (promise2 === x) { // 如果x和promise2相等，以 TypeError 为拒因 拒绝执行 promise2
        return reject(new TypeError('Error'));
    }
    if (x instanceof MyPromise) { // 如果x为Promise类型，则使 promise2 接受 x 的状态
        x.then(function (value) {
            // 等到x状态落定后，再去解决promise2，也就是递归调用resolutionProcedure这个函数
            resolutionProcedure(promise2, value, resolve, reject);
        }, reject/*如果x落定为拒绝状态，就用同样的拒因拒绝promise2*/);
    } else { // 如果x不是Promise类型，就进入下面的判断
        let called = false;
        if (x !== null && (typeof x === 'object' || typeof x === 'function')) { // 首先，如果x为对象或函数类型
            try {
                let then = x.then;
                if (typeof then === 'function') { // 判断then的类型是否为函数，是就使用call进行调用
                    then.call(
                        x, // 将this指向x
                        y => { // 第一个参数叫做resolvePromise
                            if (called) return;
                            called = true;
                            resolutionProcedure(promise2, y, resolve, reject);
                        },
                        r => { // 第二个参数叫做rejectPromise
                            if (called) return;
                            called = true;
                            reject(r);
                        }
                    )
                } else { // 如果then不是函数，就将x传递给resolve，执行promise2的resolve函数
                    resolve(x);
                }
            } catch (e) {
                if (called) return;
                called = true;
                reject(e);
            }
        } else { // 如果x是其他类型，就将x传递给resolve
            resolve(x);
        }
    }
}

let p = new MyPromise((resolve, reject) => {
    const add = (a, b) => a + b;
    resolve(add(1, 2));
    console.log(add(3, 4));
});
p.then(res => {
    console.log(res);
    return res;
}).then(res => {
    console.log(res);
});
p.then(res => {
    return {
        name: 'x',
        then: function (resolvePromise, rejectPromise) {
            resolvePromise(this.name + res);
            resolvePromise(this.name + res);
        }
    }
}).then(res => {
    console.log(res);
})
