## TypeScript的原始类型

TypeScript的原始类型包括：boolean、number、string、void、undefined、null、symbol、bigint。

### 布尔类型：boolean

使用`boolean`来表示布尔类型，注意开头是小写的。如果大写`Boolean`那代表是JavaScript中的布尔对象。

> 很多TypeScript的原始类型如boolean、number、string等等，在JavaScript中都有类似的关键字Boolean、Number、String，这些是JavaScript的函数，比如将Number用于数字类型转化或者构造Number对象，而TypeScript中的number类型仅仅是表示类型。

```typescript
const isLoading: boolean = false;
```

### 数字类型：number

TypeScript中的二进制、十进制、十六进制等数字都可以用`number`类型表示。

```typescript
const decLiteral: number = 6;
const hexLiteral: number = 0xf00d;
const binaryLiteral: number = 0b1010;
const octalLiteral: number = 0o744;
```

### 字符串：string

```typescript
const book: string = '深入浅出TypeScript';
```

### 空值：void

表示没有任何类型。

当一个函数没有返回值时，通常会见到其返回值类型是void：

```typescript
function warnUser(): void {
  alert("This is a warning message.");
} // 编译出的.d.ts => declare function warnUser(): void;
```

实际上只有`null`和`undefined`可以赋值给`void`(与strictNullChecks设置有关)：

```typescript
const a: void = undefined;
```

### null和undefined

在TypeScript中，undefined和null两者各自有自己的类型分别是undefined和null，和void相似，它们本身的类型用处不是很大：

```typescript
let x: undefined = undefined;
let y: null = null;

// strictNullChecks: true
const a: void = undefined; // ok
const b: void = null; // TS2322: Type 'null' is not assignable to type 'void'.
let x1: undefined = null; // TS2322: Type 'null' is not assignable to type 'undefined'.
let y1: null = undefined; // TS2322: Type 'undefined' is not assignable to type 'null'.
let z1: number = null; // TS2322: Type 'null' is not assignable to type 'number'.
let z2: number = undefined; // TS2322: Type 'undefined' is not assignable to type 'number'.

// strictNullChecks: false
const a: void = undefined; // ok
const b: void = null; // ok
let x1: undefined = null; // ok
let y1: null = undefined; // ok
let z1: number = null; // ok
let z2: number = undefined; // ok
```

默认情况下，null和undefined是所有类型的子类型，就是说你可以把null和undefined赋值给number类型的变量。

但在正式项目中一般都开启`strictNullChecks`检测，即null和undefined只能赋值给any和各自的类型（undefined还能赋值给void），可以规避非常多的问题。

### symbol

**注：使用`symbol`时，必须添加`es6`的编译辅助库：**

```json
// tsconfig.json
{
  "lib": ["es6", ...]
}
```

Symbol是在ES2015之后成为新的原始类型，它通过`Symbol`函数创建：

```typescript
const sym1 = Symbol('key1');
const sym2 = Symbol('key2'); // 编译出的.d.ts => declare const sym2: unique symbol;
```

Symbol的值是唯一不变的。

```typescript
Symbol('key1') === Symbol('key1') // false
```

### 大整数类型：BigInt

`BigInt`类型在TypeScript3.2版本被内置，使用`BigInt`可以安全地存储和操作大整数，即使这个数已经超出了JavaScript中`Number`所能表示的安全整数范围。

**注：使用`BigInt`时，必须添加`ESNext`的编译辅助库**：

```json
// tsconfig.json
{
  "lib": ["ESNext", ...]
}
```

在JavaScript中采用双精度浮点数，这导致精度有限，比如`Number.MAX_SAFE_INTEGER`表示可以安全递增的最大可能整数，即`2*53-1`。

```javascript
const max = Number.MAX_SAFE_INTEGER;

const max1 = max + 1;
const max2 = max + 2;

max1 === max2; // true
```

出现上述结果的原因就是超过了精度范围。BigInt就可以解决此类问题：

```typescript
// 此处是JavaScript代码，不是TypeScript
const max = BigInt(Number.MAX_SAFE_INTEGER);

const max1 = max + 1n;
const max2 = max + 2n; // TS2737: BigInt literals are not available when targeting lower than ES2020. 需要将tsconfig.json中的target改为ES2020才支持此种写法

max1 === max2; // false
```

注：我们需要用`BigInt(number)`把Number转化为BigInt，同时如果类型是`BigInt`的字面量，数字后面需要加`n`。

在TypeScript中，`number`类型虽然和`BigInt`都用于表示数字，但实际上两者类型是不同的：

```typescript
declare let foo: number;
declare let bar: bigint;

foo = bar; // TS2322: Type 'bigint' is not assignable to type 'number'.
bar = foo; // TS2322: Type 'number' is not assignable to type 'bigint'.
```

