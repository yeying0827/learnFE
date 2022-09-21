## 函数Function

函数是JavaScript应用程序的基础，它帮助你实现抽象层、模拟类、信息隐藏和模块。

在TypeScript中，虽然已经支持类、命名空间和模块，但函数仍然是主要的定义行为的地方，TypeScript为JavaScript函数添加了额外的功能，让我们可以更容易地使用。

### 定义函数类型

在TypeScript中的函数并不需要刻意去定义，比如实现一个加法函数：

```typescript
const add = (a: number, b: number) => a + b;
```

实际只定义了函数的值，此时函数的类型虽然没有被显式定义，但TypeScript编译器能「感知」到这个函数的类型。

把鼠标移到变量`add`上，会看到IDE的提示：

```text
function add(     a: number,     b: number): number
```

TypeScript已经推断出了函数的类型，虽然我们并没有显式定义出来，这就是所谓的「类型推断」。

那应该如何显式定义一个函数的类型呢？

```typescript
const add: (a: number, b: number) => number = (a:number, b: number) => a + b;
```

`add`后面冒号跟的就是`add`这个变量的类型，此处就是一个函数类型：`(a: number, b: number) => number`，声明了参数及其类型以及返回值的类型，相当于下面这种写法：

```typescript
interface Add {
    (a: number, b: number): number
}
const add: Add = (a:number, b: number) => a + b;
```



### 函数的参数详解

#### 可选参数

如果一个函数的参数可能不存在，那就需要使用可选参数来定义。

我们只需在参数后面加上`?`即代表参数可能不存在。

```typescript
const add: Add = (a:number, b?: number) => a + (b || 0);
```

参数`b`有`number`和`undefined`两种可能。

```text
b?: number | undefined
```

#### 默认参数

默认参数在JavaScript同样存在，即在参数后赋值即可。

```typescript
const add: Add = (a:number, b = 0) => a + b;
const add: Add = (a:number, b:number = 0) => a + b;
```

#### 剩余参数

剩余参数与JavaScript中的语法类似，需要用`...`来表示剩余参数。

```typescript
// 剩余参数`rest`是一个由number组成的数组，在本函数中用reduce进行了累加求和。
const add2 = (a: number, ...rest: number[]) => rest.reduce((a, b) => a+ b, a);
```



### 重载overload

这个概念在很多传统编译语言中都存在，那在TypeScript中它的作用是什么呢？

例子：

```typescript
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

assigned(1, 2, 3);
```

如果上述代码是别人写的，你只负责调用这个函数；如果不看具体实现，只通过代码提示能搞清楚需要传几个参数吗？传不同的参数其返回值是一样的吗？

如此一来，你只能去看函数的具体实现，来决定如何传参。这增加了协作的成本也造成了类型的不安全。

比如上面的函数实际只接受1、2、4个参数，如果传入3个参数是不会报错的，这就是类型的不安全。

**为了解决上述问题，函数重载出现了。**

当我们用同样的函数名**声明**参数分别为1、2、4的情况时：

```typescript
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
assigned(1, 2, 3); // TS2575: No overload expects 3 arguments, but overloads do exist that expect either 2 or 4 arguments.
assigned(1, 2, 3, 4);
```

可以看到，只有传入3个参数的情况下报错了。

可以理解成重载是定义了函数的几种不同的形态，如果不满足上面重载定义的其中一种形态，就会报错！另外函数重载的入参类型和返回值类型需要和函数实现保持一致，否则也会报错！

```typescript
// 比如参数right的类型，在重载中声明为string，就会提示报错
function assigned(top: number, right: string, bottom: number, left: number): Position;
// 比如返回值的类型，在重载中声明为string，也会提示报错
function assigned(top: number, right: number, bottom: number, left: number): string;
// TS2394: This overload signature is not compatible with its implementation signature.
```

函数重载在多人协作项目或者开源库中使用非常频繁，因为一个函数可能会被大量的开发者调用，如果不使用函数重载，那么会存在一些隐患和麻烦。



### 扩展

全局状态管理库`Redux`中的[`compose`](https://github.com/reduxjs/redux/blob/26f216e066a2a679d3cae4fb1a5c4e5d15e9fac6/src/compose.ts#L16)就是运用大量函数重载的典型案例。

```typescript
export default function compose(): <R>(a: R) => R

export default function compose<F extends Function>(f: F): F

/* two functions */
export default function compose<A, R>(f1: (b: A) => R, f2: Func0<A>): Func0<R>
export default function compose<A, T1, R>(
  f1: (b: A) => R,
  f2: Func1<T1, A>
): Func1<T1, R>
export default function compose<A, T1, T2, R>(
  f1: (b: A) => R,
  f2: Func2<T1, T2, A>
): Func2<T1, T2, R>
export default function compose<A, T1, T2, T3, R>(
  f1: (b: A) => R,
  f2: Func3<T1, T2, T3, A>
): Func3<T1, T2, T3, R>

/* three functions */
export default function compose<A, B, R>(
  f1: (b: B) => R,
  f2: (a: A) => B,
  f3: Func0<A>
): Func0<R>
export default function compose<A, B, T1, R>(
  f1: (b: B) => R,
  f2: (a: A) => B,
  f3: Func1<T1, A>
): Func1<T1, R>
export default function compose<A, B, T1, T2, R>(
  f1: (b: B) => R,
  f2: (a: A) => B,
  f3: Func2<T1, T2, A>
): Func2<T1, T2, R>
export default function compose<A, B, T1, T2, T3, R>(
  f1: (b: B) => R,
  f2: (a: A) => B,
  f3: Func3<T1, T2, T3, A>
): Func3<T1, T2, T3, R>

// ...
```

