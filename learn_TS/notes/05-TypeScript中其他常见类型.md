## TypeScript中其他常见类型

### 1. 计算机类型系统理论中的[顶级类型](https://en.wikipedia.org/wiki/Top_type)

也称为通用类型，所有类型都是它的子类型

* any
* unknown

**any**

为那些在编程阶段还不清楚类型的变量指定一个类型，这些值可能来自于动态的内容，比如来自用户输入或第三方代码库。

这些情况下，我们不希望类型检查器对这些值进行检查而是直接让它们通过编译阶段的检查。此时可以使用any类型来标记这些变量：

```typescript
let notSure: any = 4;
notSure = 'maybe a string instead';
```

注意：`any`类型是多人协作项目的大忌，很可能把TypeScript变成AnyScript，除非不得已，不应首先考虑使用此类型。

**unknown**

`unknown`是TypeScript3.0引入的新类型，是`any`类型对应的安全类型。

他们的共同点是，可以被赋值任何类型的值。

```typescript
// any
let notSure: any = 4;
notSure = 'maybe a string instead';
notSure = Symbol('anytype');
notSure = {};
notSure = [];
notSure = true;
// unknown
let notKnown: unknown = 4;
notKnown = 'maybe a string instead';
notKnown = Symbol('anytype');
notKnown = {};
notKnown = [];
notKnown = true;
```

两者的主要区别是，`unknown`类型会更加严格：在对`unknown`类型的值执行大多数操作之前，必须进行某种形式的检查，而对`any`类型的值执行操作前，不必做任何检查。

```typescript
// any
let anyValue: any;
anyValue.foo.bar;
anyValue();
new anyValue();
anyValue[0][1];
// unknown
let unknownValue: unknown;
// unknownValue.foo.bar; // TS2571: Object is of type 'unknown'.
// unknownValue(); // TS2571: Object is of type 'unknown'.
// new unknownValue(); // TS2571: Object is of type 'unknown'.
// unknownValue[0][1]; // TS2571: Object is of type 'unknown'.
```

可以看到，`unknown`类型被确定是某个类型之前，它不能被进行任何操作比如实例化、getter、函数调用等等，而`any`是可以的。这也是`unknown`比`any`更安全的原因。

`any`由于过于灵活，导致与JavaScript没有太多区别，很容易产生低级错误，很多场景下可以选择`unknown`作为更好的替代品。

什么情况下可以对`unknown`执行操作呢？那就是缩小其类型范围之后，比如：

```typescript
function getValue(value: unknown): string {
    if (value instanceof Date) { // 把value的类型范围缩小至Date实例，所以可以调用Date的实例方法
        return value.toISOString();
    }

    return String(value);
}
```



### 2. 类型系统中的[底部类型](https://en.wikipedia.org/wiki/Bottom_type)

* never

`never`类型表示的是那些永不存在的值的类型，是任何类型的子类型，可以赋值给任何类型（？）；但是，没有类型可以赋值给never类型（除了never类型本身之外）。

```typescript
const never1: never = testNever();
const num2: number = never1;

function testNever(): never {
	throw 'error';
}

let neverValue: never = 1; // TS2322: Type 'number' is not assignable to type 'never'.
let anyValue: any = 1;
neverValue = anyValue; // TS2322: Type 'any' is not assignable to type 'never'.

let neverArray: never[] = [];
```

never类型常见的两种使用场景：

```typescript
// 1.抛出异常的函数永远不会有返回值
function error(message: string): never {
    throw new Error(message);
}
let n3: number = error('123'); // ok
// 2.空数组，而且永远是空的
const empty: never[] = [];
// empty.push(1); // TS2345: Argument of type 'number' is not assignable to parameter of type 'never'.
```



### 3. 数组、元组等

* array

* tuple

**数组**

数组有两种定义方式：

```typescript
// 1. 使用泛型
const list: Array<number> = [1, 2, 3];
// 2. 在类型后面加上`[]`
const table: number[] = [1, 2, 3];
// list.push('123'); // TS2345: Argument of type 'string' is not assignable to parameter of type 'number'.
```

**元组**

元组与数组类似，表示一个已知长度和元素类型的数组，各元素的类型不必相同。

元组数据如果与声明的元素类型不一致、或者长度不一致，就会报错，必须严格跟事先声明的类型和顺序保持一致。

```typescript
let tt: [string, number];
// tt = ['hello', 10, false]; // TS2322: Type '[string, number, boolean]' is not assignable to type '[string, number]'. Source has 3 element(s) but target allows only 2.
// tt = [10, 'hello']; // TS2322: Type 'number' is not assignable to type 'string'. Type 'string' is not assignable to type 'number'.
// tt = ['hello']; // TS2322: Type '[string]' is not assignable to type '[string, number]'. Source has 1 element(s) but target requires 2.
```

可以把元组看成严格版的数组，如`[string, number]`可以看成是：

```typescript
interface Tuple extends Array<string | number> {
  0: string;
  1: number;
  length: 2;
}
```

元组继承于数组，但比数组拥有更严格的类型检查。

此外，还存在一个元组越界问题，如TypeScript允许向元组中使用push方法插入新元素，但访问越界的元素时会报错：

```typescript
tt = ['hello', 10];
tt.push(2);
console.log(tt);
// console.log(tt[2]); // TS2493: Tuple type '[string, number]' of length '2' has no element at index '2'.
```



### 4. 非原始类型（non-primitive type）

* object

object表示非原始类型，也就是除number、string、boolean、symbol、null和undefined之外的类型。

```typescript
enum Direction {
    Center = 1
}
let oo: object;

oo = Direction;
oo = [1];
oo = tt;
oo = {};
```

可以看到，普通对象、枚举、数组、元组都是`object`类型。