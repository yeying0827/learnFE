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
        if (that.state === PENDING) {
            that.state = RESOLVED;
            that.value = value;
            that.resolvedCallbacks.forEach(cb => cb(value));
        }
    }

    function reject(reason) {
        if (that.state === PENDING) {
            that.state = REJECTED;
            that.value = reason;
            that.rejectedCallbacks.forEach(cb => cb(reason));
        }
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
    if (that.state === PENDING) {
        that.resolvedCallbacks.push(onResolved);
        that.rejectedCallbacks.push(onRejected);
    }
    if (that.state === RESOLVED) {
        onResolved(that.value);
    }
    if (that.state === REJECTED) {
        onRejected(that.value);
    }
}

let p = new MyPromise((resolve, reject) => {
    const add = (a, b) => a + b;
    resolve(add(1, 2));
    console.log(add(3, 4));
});
p.then(res => {
    console.log(res);
});
