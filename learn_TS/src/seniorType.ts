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

// 索引类型
const user = {
    username: 'Jessica Lee',
    id: 460000201904141743,
    token: '460000201904141743',
    avatar: 'http://dummyimage.com/200x200',
    role: 'vip'
};

// function pick1(o, names) {
//     return names.map(n => o[n]);
// }
// pick1(user, ['id']); // [460000201904141760]

interface Obj {
    [key: string]: any
}

function pick1(o: Obj, names: string[]) {
    return names.map(n => o[n]);
}

class Logo {
    public src: string = 'https://www.google.com.hk/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png'
    public alt: string = 'google'
    public width: number = 500
}

type propNames = keyof Logo;
type propsType = Logo[propNames];

// 映射类型
interface User {
    username: string,
    id: number,
    token: string,
    avatar: string,
    role: string
}

type partial<T> = {
    [K in keyof T]?: T[K]
}

type partialUser = partial<User>;

function pick<T, K extends keyof T>(o: T, names: K[]): T[K][] {
    return names.map(n => o[n]);
}

const res = pick(user, ["token", "id", "avatar"])
