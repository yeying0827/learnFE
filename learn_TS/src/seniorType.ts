/*
* 高级类型
* */
// 交叉类型
interface IAnyObject {
    [prop: string]: any
}

function mixin<T extends IAnyObject, U extends IAnyObject>(first: T, second: U): T & U {
    const result = <T & U>{};

    for (let k in first) {
        (<T>result)[k] = first[k];
    }

    for (let k in second) {
        (<U>result)[k] = second[k];
    }

    return result;
}

const m = mixin({ a: 'hello' }, { b: 42 });
// m同时拥有了a属性和b属性
console.log(m.a, m.b);

// 联合类型
function formatCommandline(command: string[] | string) {
    let line = "";
    if (typeof command === "string") {
        line = command.trim();
    } else {
        line = command.join(' ').trim();
    }
}

// 类型别名
// 类型别名只是一个名字，当提示类型时还是指向类型本身，而接口是会以接口的方式提示类型
type type1 = boolean | number;

const a: type1 = false;
const b: type1 = 1;
// const c: type1 = 's'; // TS2322: Type '"s"' is not assignable to type 'type1'.

type Container<T> = { value: T };

type Tree<T> = {
    value: string
    left: Tree<T>
    right: Tree<T>
}

type Alias = {
    num: number
}
interface Interface {
    num: number
}
declare function aliased(arg: Alias): Alias;
declare function interfaced(arg: Interface): Interface;

class AA implements Alias {
    num = 1
}

interface Interface2 extends Alias {
    // ...
}

interface Interface1 extends Interface {

}

interface Interface3 extends Interface1,Interface {

}

class BB implements Interface {
    num = 2
}
