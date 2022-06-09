export const utils = function () {
    console.log('test alias11213');
};
clearInterval()

// if (module.hot) {
//     module.hot.dispose((data) => {
//         // data用于传递数据，如果有需要传递的数据可以挂在data对象上，然后在模块代码更新后可以通过module.hot.data来获取
//         data.updateUtils = 1
//     })
//     console.log('module.hot.data', module.hot.data)
//     // 这里可以通过判断module.hot.data来区分该模块是否为更新后的第二次执行
//     if (module.hot.data) {
//         console.log(module.hot.data.updateUtils);
//     }
// }

/*
const data = [
    { name: 'foo', age: 16, city: 'shanghai' },
    { name: 'bar', age: 24, city: 'hangzhou' },
    { name: 'fiz', age: 22, city: 'shanghai' },
    { name: 'baz', age: 19, city: 'hangzhou' }
];

function query(data) {
    const obj = {};
    obj.data = data;
    return obj;
}

query.where = function (filter) {
    this.data = data.filter(filter)
}

query.orderBy = function () {
    const order = arguments[1] || false

    this.data = data.sort(function() {
        if (order) return a-b;
        else return b-a;
    })
}

query.groupBy = function () {

}

query.execute = function () {

}

query(data).where(item => item.age > 18)
    .orderBy('age')
    .groupBy('city')
    .execute();

*/
