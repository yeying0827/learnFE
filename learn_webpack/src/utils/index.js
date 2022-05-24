export const utils = function () {
    console.log('test alias');
};
clearInterval()

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
