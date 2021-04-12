async function foo() {
    console.log(await Promise.resolve('foo'));
}
foo(); // foo

async function bar() {
    return await Promise.resolve('bar');
}
bar().then(console.log); // bar

async function baz() {
    await new Promise((resolve, reject) => setTimeout(resolve, 1000));
    console.log('baz');
}
baz(); // (1秒后)baz

async function foo1() {
    console.log(await 'foo1');
}
foo1();
async function bar1() {
    console.log(await ['bar1']);
}
bar1();
async function baz1() {
    const thenable = {
        then(callback) {
            callback('baz1');
        }
    };
    console.log(await thenable);
}
baz1();
async function qux1() {
    console.log(await Promise.resolve('qux1'));
}
qux1();
async function fooT() {
    console.log(1);
    await (() => {
        throw 33;
    })();
}
fooT().catch(console.log);
console.log(2);

async function test() {
    console.log(await Promise.resolve().then(() => 'test'));
}
test();

(async function() {
    console.log(await Promise.resolve(331));
})();

async function sleep(delay) {
    return new Promise((resolve => setTimeout(resolve, delay)));
}
async function foox() {
    const t0 = Date.now();
    await sleep(1500);
    console.log('diff', Date.now() - t0); // diff 1504
}
console.log(5);
foox();

async function randomDelay(id) {
    const delay = Math.random() * 1000;
    return new Promise((resolve) => setTimeout(() => {
        console.log(`${id} finished`);
        resolve(id);
    }, delay));
}
async function fooy() {
    const t0 = Date.now();
    /*const p0 = randomDelay(0);
    const p1 = randomDelay(1);
    const p2 = randomDelay(2);
    const p3 = randomDelay(3);
    const p4 = randomDelay(4);
    await p0;
    await p1;
    await p2;
    await p3;
    await p4;*/
    const promises = Array(5).fill(null).map((_, i) => randomDelay(i));
    for (const p of promises) {
        console.log(`awaited ${await p}`);
    }
    /*for(let i = 0; i < 5; ++ i) {
        await randomDelay(i);
    }*/
    console.log(`${Date.now() - t0}ms elapsed`);
}
fooy();

/*async */function addTwo(x) { return x + 2; }
/*async */function addThree(x) { return x + 3; }
/*async */function addFive(x) { return x + 5; }
async function addTen(x) {
    for(const fn of [addTwo, addThree, addFive]) {
        x = await fn(x);
    }
    return x;
}
addTen(9).then(console.log); // 19