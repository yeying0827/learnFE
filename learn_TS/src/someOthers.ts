/*
* 赋值断言、is关键字、可调用类型注解、类型推导
* */

// 赋值断言
class StrictClass {
    foo: number;
    bar = 'hello';
    baz!: boolean; // TS2564: Property 'baz' has no initializer and is not definitely assigned in the constructor.
    constructor() {
        this.foo = 42;
        this.init();
    }
    init() {
        this.baz = true;
    }
}

let so!: number;
initialize();
console.log(so + so); // TS2454: Variable 'so' is used before being assigned.
function initialize() {
    so = 10;
}

// is 关键字
function isString(str: any): str is string {
    return typeof str === 'string'
}

function someFunc(foo: number | string) {
    if(isString(foo)) {
        console.log(foo.length);
    }
}
someFunc('keyword: is');

// 可调用类型注解
interface ToString {
    (): string,
    new (): string
}
declare const sthToString: ToString;
sthToString(); // TS2349: This expression is not callable. Type 'ToString' has no call signatures.
new sthToString(); // TS7009: 'new' expression, whose target lacks a construct signature, implicitly has an 'any' type.

// 类型推导
let arr = [1, 'hello', 1n];
let [a1, b1] = arr;
// a1 = true;

const action = {
    type: 'update' as const,
    payload: {
        id: 10
    }
}

interface SomeAction {
    type: 'update',
    payload: {
        id: number
    }
}

const someAction: SomeAction = {
    type: "update",
    payload: {
        id: 10
    }
}
