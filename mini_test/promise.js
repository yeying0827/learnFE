let p1 = new Promise((resolve, reject) => {
    let add = (a, b) => a + b;
    // resolve(add(1, 2));
    reject(add(1, 2));
    console.log(add(3, 4));
    resolve(add(5, 6));
});
// p1.then(result => {
//     console.log(result);
// }/*, reason => {
//     console.log(reason);
// }*/).catch(reason => {
//     console.log(reason);
// });
async function test() {
    // try {
        console.log(await p1);
    // } catch (e) {
    //     console.log('catch', e);
    // }
}
// test();

let p2 = p1.then(() => {

}/*, r => {
    console.log(r);
    return r;
}*/);
p2.then((v) => {
    console.log('p2 resolve', v);
}, r => {
    console.log('p2 reject', r);
})
// console.log(p2);


// console.log(p1);
