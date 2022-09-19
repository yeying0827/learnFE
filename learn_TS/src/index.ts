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
// c1 = Languages.English; // Type 'Languages.English' is not assignable to type '0'.

declare let d: Directions;

enum Animal {
    Cat,
    Dog
}

// d = Directions.Up; // ok
// d = Animal.Cat; // TS2322: Type 'Animal.Cat' is not assignable to type 'Directions'.

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

