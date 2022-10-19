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

/**
 * 条件类型
  */
declare function f1<T extends boolean>(arg: T): T extends true ? string : number;

// function f1<boolean>(arg: boolean): string | number
f1(Math.random() < 0.5);
// function f1<true>(arg: true): string
f1(true);
// function f1<false>(arg: false): number
f1(false);

// 条件类型与联合类型

// 裸类型参数：没有被包装在其他类型里
type NakedUsage<T> = T extends boolean ? "YES" : "NO";
// 非裸类型参数：类型参数被包装在元组内，即[T]
type WrappedUsage<T> = [T] extends [boolean] ? "YES" : "NO";

// 分布式有条件类型，例子
type Distributed = NakedUsage<number | boolean>; // Initial type: "NO" | "YES"
type NotDistributed = WrappedUsage<number | boolean>; // Initial type: "NO"

// 找出`T`类型中`U`类型不包含的部分
type Diff<T, U> = T extends U ? never : T;
type RR = Diff<"a"| "b" | "c" | "d", "a" | "c" | "f">; // "b" | "d"

type Filter<T, U> = T extends U ? T : never;
type R1 = Filter<string | number | (() => void), Function>; // () => void

type NewNonNullable<T> = Diff<T, null | undefined>;
type R2 = NewNonNullable<string | number | undefined>; // string | number

// 条件类型与映射类型
interface Part {
    id: number,
    name: string,
    subparts: Part[],
    updatePart(newName: string): void,
    log(): void
}

/*type FunctionPropertyNames<T> = {
    [K in keyof T]: T[K] extends Function ? K : never
}*/type FunctionPropertyNames<T> = { [K in keyof T] : T[K] extends Function ? K : never }[keyof T]


type R3 = FunctionPropertyNames<Part>;

interface People {
    id: string,
    name: string,
    age?: number,
    from?: string
}

type NullableKeys<T> = {
    [K in keyof T]-?: undefined extends T[K] ? K: never
}[keyof T]

type R = NullableKeys<People>;

// type NewRequired<T> = {
//     [P in keyof T]-?: T[P];
// };
// type R4 = NewRequired<People>;

/*
 * infer关键字
 */
// 获取函数的返回值类型
interface User9 {
    name: string,
    age: number,
    birthday?: string
}
type Foo1 = () => User9;
type NewReturnType<T> = T extends (...args: any[]) => infer P ? P : any;
type foo1 = NewReturnType<Foo1>;
// 获取函数的参数类型
type ParamType1<T> = T extends (arg: infer P) => any ? P : T;
type ParamType2<T> = T extends (...args: infer P) => any ? P : T;
type ParamType3<T> = T extends (a: infer P, b: infer P) => any ? P : T;
function add(a: number, b: number) {
    return a + b;
}
type test_return1 = NewReturnType<typeof add>; // number
type test_param1 = ParamType1<typeof add>; // (a: number, b: number) => number
type test_param2 = ParamType2<typeof add>; // [number, number]
type test_param3 = ParamType3<typeof add>; // number

function add2(a: number, b: string) {
    return a + b;
}
type test_return2 = NewReturnType<typeof add2>; // string
type test_param4 = ParamType1<typeof add2>; // (a: number, b: string) => string
type test_param5 = ParamType2<typeof add2>; // [number, string]
type test_param6 = ParamType3<typeof add2>; // never

function log11() {
    console.log('11');
}
type test_return3 = NewReturnType<typeof log11>; // void
type test_param7 = ParamType1<typeof log11>; // () => void extends ((arg: infer P) => any) ? P : (() => void)
type test_param8 = ParamType2<typeof log11>; // []
type test_param9 = ParamType3<typeof log11>; // () => void extends ((a: infer P, b: infer P) => any) ? P : (() => void)

function log12(name: string) {
    console.log(name);
}
type test_return4 = NewReturnType<typeof log12>; // void
type test_param10 = ParamType1<typeof log12>; // string
type test_param11 = ParamType2<typeof log12>; // [string]
type test_param12 = ParamType3<typeof log12>; // string

// 获取构造函数的参数类型
class TestClass1 {
    constructor(public name: string, public age: number) {}
}

type R5 = ConstructorParameters<typeof TestClass1> // [string, number]
type R4 = ConstructorParameters1<typeof TestClass1> // [string, number]

type ConstructorParameters1<T extends new (...args: any[]) => any> = T extends new (...args: infer P) => any ? P : never;
// type ConstructorParameters1<T> = T extends new (...args: infer P) => any ? P : never; 也可不给泛型T做约束

// 元组转为联合类型
type ElementOf<T> = T extends Array<infer E> ? E : never;
type TTuple = [string, number];
type TUnion = ElementOf<TTuple>; // string | number

type Res = TTuple[number]; // string | number，元组按下标取出所有的元素形成联合类型

// 联合类型变交叉类型
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;

type Result = UnionToIntersection<string | number>; // never
type Result2 = UnionToIntersection<{ id:number, name: string } | { name: string, age: number }>; // {id: number, name: string} & {name: string, age: number}

const result2: Result2 = {
    id: 1,
    name: 'haha',
    age: 18
}

/**
 * 常用工具类型
 */
// 类型递归
interface Company {
    id: number,
    name: string
}

interface Person1 {
    id: number,
    name: string,
    address: string,
    company: Company
}

type R6 = Partial<Person1>; // {id?: number, name?: string, address?: string, company?: Company}

type DeepPartial<T> = {
    [K in keyof T]?: T[K] extends object
        ? DeepPartial<T[K]>
        : T[K]
};
type R7 = DeepPartial<Person1>;
const rr6: R6 = {
    // company: {}
}
const rr7: R7 = {
    company: {}
}

// Omit
type Omit1<T, K> = Pick<T, Exclude<keyof T, K>>;

type Foo11 = Omit1<{name: string, age: number}, 'name'>; // { age: number }

// Merge
type O1 = {
    name: string
    id: number
}
type O2 = {
    id: string,
    from: string
}
type R8 = Merge<O1, O2>; // {name: string, id: number, from: string}
const rr8: R8 = {
    name: 'hh',
    id: 1,
    from: 'ss'
}

// `Compute`的作用是：将交叉类型合并
type Compute<A extends any> = A extends Function ? A : { [K in keyof A] : A[K] };

type R9 = Compute<{x: 'x'} & {y: 'y'}>; // {x: "x", y: "y"}
type R10 = Compute<number | string>; // number | string

// `Merge<O1, O2>`的作用：是将两个对象的属性合并
// type Merge<O1 extends object, O2 extends object> =
//     Compute<O1 & Omit<O2, keyof O1>>;
type Merge<O1 extends object, O2 extends object> = {
    [K in keyof O1 | keyof O2]: K extends keyof O1 & keyof O2
        ? O1[K] | O2[K]
        : K extends keyof O1
            ? O1[K]
            : K extends keyof O2
                ? O2[K]
                : never
}

// Intersection
type Props = {
    name: string,
    age: number,
    visible: boolean
}
type DefaultProps = {
    age: number,
    addr: string
}
// `Intersection<T, U>`的作用：是取出`T`的属性，条件是此属性也存在于`U`。
type DuplicatedProps = Intersection<Props, DefaultProps>;
// type Intersection<T extends object, U extends object> = Pick<
//     T,
//     // Extract from T those types that are assignable to U
//     // （使用属性名判断）取出T中可以赋值给U的部分，和U中可以赋值给T的部分，两者组成交叉类型
//     Extract<keyof T, keyof U> & Extract<keyof U, keyof T>
// >;
type Intersection<T extends object, U extends object> = {
    [K in keyof T & keyof U]: T[K]
}

// Overwrite
type Props1 = { name: string; age: number; visible: boolean };
type NewProps = { age: string; other: string };

type ReplacedProps = Overwrite<Props1, NewProps>; // {name: string, age: never, visible: boolean}
const rProps: ReplacedProps = {
    name: 'hh',
    age: '12',
    visible: true
}

// `Overwrite<T, U>`的作用，就是用U的属性覆盖T中的同名属性
// I: 取出`T`类型中`U`类型不包含的部分，同时取出U和T共同的部分，两者组成交叉类型
// type Overwrite<T extends object, U extends object, I = Diff<T, U> & Intersection<U, T>> = Pick<I, keyof I>;

type DiffObj<T, U> = Pick<T, Diff<keyof T, keyof U>/*{
    [K in keyof T]: K extends keyof U ? never: K
}[keyof T]*/>;
type Diff_test = DiffObj<Props1, NewProps>; // {name: string, visible: boolean}
type Inter_test = Intersection<NewProps, Props1>;


type Overwrite<
    T extends object,
    U extends object,
    // I = Diff<T, U> & Intersection<U, T> // {name: string, age: number, visible: boolean} & {age: string}
    I = DiffObj<T, U> & Intersection<U, T> // {name: string, visible: boolean} & {age: string}
    > = Pick<I, keyof I>;

// type Overwrite<T extends object, U extends object> = {
//     [K in keyof T]: K extends keyof U ? U[K] : T[K]
// }

// readonly
type Mutable<T> = {
    -readonly [P in keyof T]: T[P]
}
type AA_IM = {
    readonly name: string
}
type AA_M = Mutable<AA_IM>; // {name: string}
