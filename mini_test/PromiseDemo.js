const PENDING = 'pending';
const RESOLVED = 'resolved';
const REJECTED = 'rejected';

function MyPromise(fn) {
    const that = this;
    that.state = PENDING;
    that.value = null;
    that.rejectedCallbacks = [];
    that.resolvedCallbacks = [];

    function resolve(value) {
        if (value instanceof MyPromise) {
            return value.then(resolve, reject);
        }
        queueMicrotask(() => {
            if (that.state === PENDING) {
                that.state = RESOLVED;
                that.value = value;
                that.resolvedCallbacks.forEach(cb => cb(that.value));
            }
        })
    }

    function reject(reason) {
        queueMicrotask(() => {
            if (that.state === PENDING) {
                that.state = REJECTED;
                that.value = reason;
                that.rejectedCallbacks.forEach(cb => cb(that.value));
            }
        })
    }

    try {
        fn(resolve, reject);
    } catch (e) {
        reject(e);
    }
}
MyPromise.prototype.then = function (onResolved, onRejected) {
    const that = this;
    onResolved = typeof onResolved === 'function'? onResolved: v=> v;
    onRejected = typeof onRejected === 'function'
        ? onRejected
        : r => {
            throw r;
        }
    let promise2;
    if (that.state === PENDING) {
        return promise2 = new Promise((resolve, reject) => {
            that.resolvedCallbacks.push(() => {
                try {
                    const x = onResolved(that.value);
                    resolutionProcedure(promise2, x, resolve, reject);
                } catch(r) {
                    reject(r);
                }
            })
            that.rejectedCallbacks.push(() => {
                try {
                    const x = onRejected(that.value);
                    resolutionProcedure(promise2, x, resolve, reject);
                } catch(e) {
                    reject(r);
                }
            })
        })
    }
    if (that.state === RESOLVED) {
        return promise2 = new MyPromise((resolve, reject) => {
            queueMicrotask(() => {
                try {
                    const x = onResolved(that.value);
                    resolutionProcedure(promise2, x, resolve, reject);
                } catch(e) {
                    reject(e);
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
                } catch(e) {
                    reject(e);
                }
            });
        })
    }
}

function resolutionProcedure(promise2, x, resolve, reject) {
    if (x === promise2) {
        return reject(new TypeError('Error'));
    }
    if (x instanceof  MyPromise) {
        x.then(function (value) {
            resolutionProcedure(promise2, value, resolve, reject)
        }, reject);
    } else {
        let called = false;
        if (x !== null && (typeof x === 'function' || typeof x === 'object')) {
            try {
                let then = x.then;
                if (typeof then === 'function') {
                    then.call(
                        x,
                        y => {
                            if (called) return;
                            called = true;
                            resolutionProcedure(promise2, y, resolve, reject)
                        },
                        r => {
                            if (called) return;
                            called = true;
                            reject(r);
                        }
                    )
                } else {
                    resolve(x);
                }
            } catch(e) {
                if (called) return;
                called = true;
                reject(e);
            }
        } else {
            resolve(x);
        }
    }
}

let p = new MyPromise((resolve, reject) => {
    const add = (a, b) => a + b;
    resolve(add(1, 2));
    console.log(add(3, 4));
})
p.then(res => {
    console.log(res);
    return res;
}).then(res => {
    console.log('then', res);
})

p.then(res => {
    return {
        name: 'x',
        then: function (resolvePromise, rejectPromise) {
            resolvePromise(this.name + res);
        }
    }
}).then(res => {
    console.log(res);
})
