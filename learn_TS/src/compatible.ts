/*
* 类型兼容性
* */
// 结构类型
class Person {
    constructor(public weight: number, public name: string, public born: string) {
    }
}

interface Dog {
    name: string
    weight: number
}

let x: Dog
x = new Person(8, 'lily', '1996-12-12');

let y: Person
// y = { name: 'lucy', weight: 50 } as Dog; // TS2741: Property 'born' is missing in type 'Dog' but required in type 'Person'.

// 函数类型
let t1 = (a: number) => 0;
let t2 = (b: number, s:string) => 0;

// t1 = t2; // TS2322: Type '(b: number, s: string) => number' is not assignable to type '(a: number) => number'.
t2 = t1; // ok

let foo = (x: number, y: number) => {};
let bar = (x?: number, y?: number) => {};
let bas = (...args: number[]) => {};

// bas = bar; // ok
// bas = foo; // ok

// TS2322: Type '(...args: number[]) => void' is not assignable to type '(x?: number | undefined, y?: number | undefined) => void'.
//   Types of parameters 'args' and 'x' are incompatible.
//     Type 'number | undefined' is not assignable to type 'number'.
//       Type 'undefined' is not assignable to type 'number'.
// bar = bas;
// TS2322: Type '(x: number, y: number) => void' is not assignable to type '(x?: number | undefined, y?: number | undefined) => void'.
//   Types of parameters 'x' and 'x' are incompatible.
//     Type 'number | undefined' is not assignable to type 'number'.
//       Type 'undefined' is not assignable to type 'number'.
// 调用bar时传递的第一个参数可能是number或undefined，如果更新为foo指向的函数，前面调用bar的地方可能会出现第一个参数类型不兼容
// bar = foo;

// 调用foo时传递的第一个参数只可能是number，如果更新为bar指向的函数，前面调用foo的地方不会出现类型不兼容
foo = bar; // ok
// foo = bas; // ok

// 枚举类型
enum Status {
    Ready,
    NotReady
}

let sts = Status.Ready;
let num = 0;

// 与数字类型相互兼容
// sts = num; // ok
num = sts; // ok

// 类的类型
class House {
    protected plate: number;
    constructor(name: string, plate: number) {
    }
}

class Shop extends House {

}

class School {
    plate: number;
    constructor(teacherNum: number) {
    }
}

let house: House = new House('h1', 50);
let school: School = new School(100);

let shop: Shop = new Shop('s1', 50);

// house = school; // ok. Property 'plate' is protected but type 'School' is not a class derived from 'House'.
// school = house; // ok. Property 'plate' is protected in type 'House' but public in type 'School'.

// house = shop; // ok
// shop = house; // ok

// 泛型的类型
// interface Teacher<T> {
//
// }
// let teacher1: Teacher<number> = {};
// let teacher2: Teacher<string> = {};
//
// teacher1 = teacher2; // ok
// teacher2 = teacher1; // ok

interface Teacher<T> {
    name: T
}
let teacher1: Teacher<number> = { name: 1 };
let teacher2: Teacher<string> = { name: '1' };

// teacher1 = teacher2; // TS2322: Type 'Teacher<string>' is not assignable to type 'Teacher<number>'. Type 'string' is not assignable to type 'number'.
// teacher2 = teacher1; // TS2322: Type 'Teacher<number>' is not assignable to type 'Teacher<string>'. Type 'number' is not assignable to type 'string'.
