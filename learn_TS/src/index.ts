function greeting(person: string) {
    return "Hello, " + person;
}

const user = "Becky";

/*
 * 原始数据类型
 */
// ============= boolean
const isLoading: boolean = false;

// ============= number
const decLiteral: number = 6;
const hexLiteral: number = 0xf00d;
const binaryLiteral: number = 0b1010;
const octalLiteral: number = 0o744;

// ============= string
const book: string = '深入浅出TypeScript';

// ============= void
function warnUser(): void {
    alert('This is a warning message');
}
const a: void = undefined;
// const b: void = null; // 需要strictNullChecks为false时才支持此种写法

// ============= null && undefined
let x: undefined = undefined;
let y: null = null;
// 以下是否报错与strictNullChecks有关
// let x1: undefined = null;
// let y1: null = undefined;
// let z1: number = null;
// let z2: number = undefined;

// ============= symbol
const sym1 = Symbol('key1');
const sym2 = Symbol('key2');

// ============= BigInt
const max = BigInt(Number.MAX_SAFE_INTEGER);
const max1 = max + BigInt(1); // max + 1n;
const max2 = max + BigInt(2); // max + 2n; 需要将tsconfig.json中的target改为ES2020才支持此种写法

// declare let foo: number;
// declare let bar: bigint;
//
// bar = foo;


/*
 * 其他数据类型
 */
// ============= any
let notSure: any = 4;
notSure = 'maybe a string instead';
notSure = Symbol('anytype');
notSure = {};
notSure = [];
notSure = true;

let anyValue: any;
// anyValue.foo.bar;
// anyValue();
// new anyValue();
// anyValue[0][1];

// ============= unknown
let notKnown: unknown = 4;
notKnown = 'maybe a string instead';
notKnown = Symbol('anytype');
notKnown = {};
notKnown = [];
notKnown = true;

let unknownValue: unknown;
// unknownValue.foo.bar; // TS2571: Object is of type 'unknown'.
// unknownValue(); // TS2571: Object is of type 'unknown'.
// new unknownValue(); // TS2571: Object is of type 'unknown'.
// unknownValue[0][1]; // TS2571: Object is of type 'unknown'.

function getValue(value: unknown): string {
    if (value instanceof Date) { // 把value的类型范围缩小至Date实例，所以可以调用Date的实例方法
        return value.toISOString();
    }

    return String(value);
}

// ============= never
// let neverValue: never = 1; // TS2322: Type 'number' is not assignable to type 'never'.
let neverArray: never[] = [];
// let anArr: [] = neverValue; // TS2454: Variable 'neverValue' is used before being assigned.
// neverValue = anyValue; // TS2322: Type 'any' is not assignable to type 'never'.
// let n1: number = neverArray; // TS2322: Type 'never[]' is not assignable to type 'number'.
// let n2: number = neverValue; // TS2454: Variable 'neverValue' is used before being assigned.

// 两种使用never的常见情景
// 1.抛出异常的函数永远不会有返回值
function error(message: string): never {
    throw new Error(message);
}
// let n3: number = error('123'); // ok
// 2.空数组，而且永远是空的
const empty: never[] = [];
// empty.push(1); // TS2345: Argument of type 'number' is not assignable to parameter of type 'never'.

// ============= 数组
const list: Array<number> = [1, 2, 3]; // 使用泛型
const table: number[] = [1, 2, 3];
// list.push('123'); // TS2345: Argument of type 'string' is not assignable to parameter of type 'number'.

// ============= 元组Tuple
let tt: [string, number];
// tt = ['hello', 10, false]; // TS2322: Type '[string, number, boolean]' is not assignable to type '[string, number]'. Source has 3 element(s) but target allows only 2.
// tt = [10, 'hello']; // TS2322: Type 'number' is not assignable to type 'string'. Type 'string' is not assignable to type 'number'.
// tt = ['hello']; // TS2322: Type '[string]' is not assignable to type '[string, number]'. Source has 1 element(s) but target requires 2.
// 以上，严格规定每个元素数据类型和数组长度
tt = ['hello', 10];
tt.push(2);
console.log(tt);
// console.log(tt[2]); // TS2493: Tuple type '[string, number]' of length '2' has no element at index '2'.

// ============= object
enum Direction {
    Center = 1
}
let oo: object;

oo = Direction;
oo = [1];
oo = tt;
oo = {};
// 普通JavaScript对象、数组、元祖、枚举 都是object类型

/*
 * 枚举类型
 */
enum Directions {
    Up = 10,
    Down = 10,
    Left,
    Right
}
enum Directions {
    Center
}

console.log(Directions.Up, Directions.Down, Directions.Left, Directions.Right, Directions.Center);
console.log(Directions[10]);

enum Directionss {
    Up = 'UP',
    Down = 'DOWN',
    Left = 'LEFT',
    Right = 'RIGHT'
}

console.log(Directionss.Up, Directionss['Right']);

enum booleanEnum {
    No = 0,
    Yes = 'YES',
}
const enum Languages {
    Chinese,
    English,
    French
}
const language = Languages.Chinese;
const l2: Languages = 100; // Enums are compatible with numbers, and numbers are compatible with enums

const l = 0;

// 把成员当作值来使用
console.log(l === Languages.Chinese); // true

type c = 0;

declare let c1: c;

// c1 = 1; // TS2322: Type '1' is not assignable to type '0'.
// c1 = Languages.Chinese; // ok
// 把成员当作类型来使用
// c1 = Languages.English; // Type 'Languages.English' is not assignable to type '0'.

declare let d: Directions;

enum Animals {
    Cat,
    Dog
}

// d = Directions.Up; // ok
// d = Animals.Cat; // TS2322: Type 'Animals.Cat' is not assignable to type 'Directions'.

enum Month {
    January,
    February,
    March,
    April,
    May,
    June,
    July,
    August,
    September,
    October,
    November,
    December
}
namespace Month {
    export function isSummer(month: Month) {
        switch(month) {
            case Month.June:
            case Month.July:
            case Month.August:
                return true;
            default:
                return false;
        }
    }
}

console.log(Month.isSummer(Month.March));

/*
* interface
* */
// const getUserName = (user) => user.name; // TS7006: Parameter 'user' implicitly has an 'any' type.
const getUserName = (user: User) => user.name;
const getUserAge = (user: User) => user.age;

interface Say {
    (words: string): string
}

interface Email {
    [name: string]: string
}

interface User {
    name: string
    age?: number
    readonly gender: boolean
    say?: Say,
    email?: Email
}

let u: User = {
    name: 'Becky',
    gender: false
};
u.say = function (word: string) { // TS2339: Property 'say' does not exist on type 'User'.
    return 'hello world!';
}

// const modifyGender = (user: User) => user.gender = true; // TS2540: Cannot assign to 'gender' because it is a read-only property.

interface Config {
    width?: number
}

function calculateAreas(config: Config): { areas: number } {
    let result = 100;
    console.log('config', config) // config { widdth: 5 }
    if (config.width) {
        result = config.width * config.width;
    }

    return { areas: result };
}

// let mySquare = calculateAreas({ widdth: 5 }); // TS2345: Argument of type '{ widdth: number; }' is not assignable to parameter of type 'Config'. Object literal may only specify known properties, but 'widdth' does not exist in type 'Config'.
let mySquare = calculateAreas({ widdth: 5 } as Config);

// let options: any = { widdth: 5 };
// let mySquare = calculateAreas(options);

interface Member {
    level: number
}

interface VIPUser extends User, Member {
    broadcast: () => void
}

/*
* Class
* */
abstract class Animal {
    abstract makeNoise(): void;

    move(): void {
        console.log('roaming the earch...');
    }
}
// let animal = new Animal(); // TS2511: Cannot create an instance of an abstract class.
class Cat extends Animal {
    makeNoise() {
        console.log('miao~');
    }
}

const cat = new Cat();
cat.move(); // roaming the earch...
cat.makeNoise(); // miao~

class Vehicle {
    protected startRun(): void {
        console.log('starting ...');
    }
}

class Car extends Vehicle {
    init() {
        this.startRun();
    }
}

const vehicle = new Vehicle();
const car = new Car();
// vehicle.startRun(); // TS2445: Property 'startRun' is protected and only accessible within class 'Vehicle' and its subclasses.
// car.startRun(); // TS2445: Property 'startRun' is protected and only accessible within class 'Vehicle' and its subclasses.
car.init();

class Props {
    public children: Array<any> | never[] = []
    public speed: number = 500
    public height: number = 160
    public animation: string = 'easeInOutQuad'
    public isAuto: boolean = true
    public autoPlayInterval: number = 4500
    public afterChange: () => void = () => {}
    public beforeChange: Function = () => {}
    public selectedColor: string = ''
    public showDots: boolean = true
}

const defaultProps = new Props();

/*
* Function
* */
// const add = (a: number, b: number) => a + b;
interface Add {
    (a: number, b: number): number
}
const add: Add = (a:number, b:number = 0) => a + b;

const add2 = (a: number, ...rest: number[]) => rest.reduce((a, b) => a+ b, a);

console.log(add2(1, 2, 3, 4));

interface Position {
    top: number,
    right?: number,
    bottom?: number,
    left?: number
}

function assigned(all: number): Position;
function assigned(topAndBottom: number, leftAndRight: number): Position;
function assigned(top: number, right: number, bottom: number, left: number): Position;

function assigned(a: number, b?: number, c?: number, d?: any) {
    if (b === undefined && c === undefined && d === undefined) {
        b = c = d = a;
    } else if (c === undefined && d === undefined) {
        c = a;
        d = b;
    }
    return {
        top: a,
        right: b,
        bottom: c,
        left: d
    };
}

assigned(1);
assigned(1, 2);
// assigned(1, 2, 3); // TS2575: No overload expects 3 arguments, but overloads do exist that expect either 2 or 4 arguments.
assigned(1, 2, 3, 4);

// interface与type区别（？）：interface可以被继承，type不可以
type f = {
    name: string
    age?: number
}

/*
* generic
* */
// 基础使用
// function returnItem<T>(para: T): T {
//     return para;
// }

// 多个类型参数
function swap<T, U>(tuple: [T, U]): [U, T] {
    return [tuple[1], tuple[0]];
}

console.log(swap([7, 'seven'])); // [ 'seven', 7 ]

// 泛型变量
function getArrayLength<T>(arg: T[]) {
    console.log(arg.length);

    return arg;
}

getArrayLength<number>([1, 2, 3, 4]); // 4

// 泛型接口
interface ReturnItemFn<T> {
    (para: T): T
}

const returnItem: ReturnItemFn<number> = para => para;

// 泛型类
class Stack<T> {
    private arr: T[] = [];

    public push(n: T) {
        this.arr.push(n);
    }

    public pop() {
        this.arr.pop();
    }
}

// 泛型约束（限制泛型的类型范围）
type Params = string | number

class Queue<T extends Params> {

}

const q1 = new Queue<number>();
// const q2 = new Queue<boolean>(); // TS2344: Type 'boolean' does not satisfy the constraint 'Params'.

function getObjProperty<T extends object, U extends keyof T>(obj: T, key: U) {
    return obj[key];
}

const person = {
    id: 1,
    name: 'lily'
}

getObjProperty(person, 'name');

interface firstInterface {
    doSomething(): number
}

interface secondInterface {
    doAnother: () => number
}

interface childInterface extends firstInterface, secondInterface {}

class Demo<T extends childInterface> {
    private genericProperty: T;

    useT() {
        this.genericProperty.doSomething();
        this.genericProperty.doAnother();
    }
}

class Demo2<T extends firstInterface&secondInterface> {
    private genericProperty: T;

    useT() {
        this.genericProperty.doSomething();
        this.genericProperty.doAnother();
    }
}

interface T1<T> {
    new(): T
}

function factory1<T>(type: T1<T>): T {
    return new type();
}

const factory2 = <T>(type: {new(): T}): T => {
    return new type();
}
