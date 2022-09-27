## 泛型generic的妙用

泛型是TypeScript中非常重要的一个概念，因为在实际开发中任何时候都离不开泛型的帮助。因为泛型给予开发者创造灵活、可重用代码的能力。

### 初识泛型

假设有一个函数，可接收一个number类型的参数并返回一个number类型的值。

```typescript
function returnItem(para: number): number {
    return para;
}
```

如果又有一个功能，需要接收一个string类型的参数，并返回一个string类型的值，逻辑是一样的，仅仅是类型发生了变化，那需要重新定义个函数吗？

```typescript
function returnItem(para: string): string {
    return para;
}
```

这明显是重复性的冗余代码，那应该如何避免上述情况呢？把类型改为any吗？

```typescript
function returnItem(para: any): any {
    return para;
}
```

此时的情况是，在编写的时候并不确定传入的参数到底是什么类型，只有在运行时传入参数后才能确定。

那么我们需要一个变量，它代表了入参的类型，然后再返回这个变量，代表返回值的类型，它是一种特殊的变量，只用于表示类型而不是值。

这个类型变量在TypeScript中就叫做「泛型」。

```typescript
function returnItem<T>(para: T): T {
    return para;
}
```

函数名后面声明的泛型变量`<T>`，它用于捕获开发者传入的参数的类型（如string），然后我们就可以使用T做参数类型和返回值类型了。



### 多个类型参数

定义泛型的时候，可以一次定义多个类型参数，比如可以同时定义泛型T和泛型U：

```typescript
function swap<T, U>(tuple: [T, U]): [U, T] {
    return [tuple[1], tuple[0]];
}

console.log(swap([7, 'seven'])); // [ 'seven', 7 ]
```



### 泛型变量

假设有这样的需求，函数接收一个数组，如何把数组的长度打印出来，最后返回这个数组，应该如何定义？

假如像下面这样写：

```typescript
function getArrayLength<T>(arg: T): T {
    console.log(arg.length);
    
    return arg;
}
```

会提示错误：

```text
TS2339: Property 'length' does not exist on type 'T'.
```

此时需要告诉编译器，类型T是有length属性的，不然在编译器眼里，T可以代表任何类型。

如果已经明确知道要传入的是一个数组了，可以这样声明：`Array<T>`。

传入的类型不管如何，起码数组是可以确定的，在这里泛型变量T被当作**类型的一部分**使用，而不是整个类型，增加了灵活性。

```typescript
function getArrayLength<T>(arg: Array<T>): Array<T> {
    console.log(arg.length);

    return arg;
}

// 或者这样简写
function getArrayLength<T>(arg: T[]) {
    console.log(arg.length);

    return arg;
}

getArrayLength([1, 2, 3, 4]); // 4
getArrayLength<number>([1, 2, 3, 4]); // 4
```



### 泛型接口

泛型也可用于接口声明，以前面的函数为例，如果将其转化为接口的形式：

```typescript
interface ReturnItemFn<T> {
    (para: T): T
}
```

当我们想传入一个number类型的值作为参数时，就可以这样声明函数：

```typescript
const returnItem: ReturnItemFn<number> = para => para;
```



### 泛型类

泛型还可以在类中使用，既可以作用于类本身，也可以作用于类的成员函数。

假设写一个`栈`数据结构：

```typescript
class Stack {
    private arr: number[] = [];

    public push(n: number) {
        this.arr.push(n);
    }

    public pop() {
        this.arr.pop();
    }
}
```

如果需要不同的类型的时候，还得靠泛型的帮助：

```typescript
class Stack<T> {
    private arr: T[] = [];

    public push(n: T) {
        this.arr.push(n);
    }

    public pop() {
        this.arr.pop();
    }
}
```

看上去与泛型接口差不多，都是使用`<>`包裹泛型类型，跟在名称后面



### 泛型约束

此时有一个问题，泛型看起来似乎可以是任何类型，但是如果知道我们传入的泛型属于哪一类，比如number或string其中之一，应该如何约束泛型呢？

我们可以用`<T extends xx>`的方式约束泛型，比如以下代码：

```typescript
type Params = string | number

class Queue<T extends Params> {
    
}

const q1 = new Queue<number>();
const q2 = new Queue<boolean>(); // TS2344: Type 'boolean' does not satisfy the constraint 'Params'.
```

#### 泛型约束与索引类型

假如有一个需求，要设计一个函数，接收两个参数，一个参数为对象，另一个参数为对象上的属性，通过这两个参数返回这个属性的值。假如使用以下代码：

```typescript
function getObjProperty(obj: object, key: string) {
    return obj[key];
}
```

会得到TypeScript的错误提示：

```text
TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.   No index signature with a parameter of type 'string' was found on type '{}'.
元素隐含有一个'any'类型，因为'string'类型的表达式不能被用于索引'{}'类型。   在类型'{}'上没有找到带有'string'类型参数的索引签名。
```

因为obj默认情况下是`{}`，`key`是无法在上面取到任何值的。但我们接收的对象是各种各样的，我们需要一个泛型来表示传入的对象类型，比如`T extends object`：

```typescript
function getObjProperty<T extends object>(obj: T, key: string) {
    return obj[key];
}
```

但此时仍不能解决问题，因为第二个参数`key`是不是存在于`obj`上是无法确定的，因此我们需要对`key`也进行约束，把它约束为只存在于`obj`属性的类型。这里可以借助后面的索引类型进行实现`<U extends keyof T>`，用索引类型`keyof T`把传入的对象的属性取出生成一个联合类型，这样泛型U就被约束在这个联合类型中，这样一来函数就被完整定义了：

```typescript
function getObjProperty<T extends object, U extends keyof T>(obj: T, key: U) {
    return obj[key];
}
```

假设传入以下对象：

```typescript
const person = {
    id: 1,
    name: 'lily'
}
```

当我们向getObjProperty传入第一个参数为person时，第二个参数`key`的类型被约束为一个联合类型`name | id`，只可能是这两者之一，因此能获得良好的类型提示：

```text
function getObjProperty<{
    id: number;
    name: string;
}, "id" | "name">(     
	obj: {id: number, name: string},     
	key: "id" | "name"): string | number
```

#### 使用多重类型进行泛型约束

注：本例需在非「--strictPropertyInitialization」或者「--strict」下测试

假设某个泛型需要被约束，它只被允许实现以下两个接口的类型：

```typescript
interface firstInterface {
    doSomething(): number
}

interface secondInterface {
    doAnother: () => number
}
```

假如在代码中像下面这样使用：

```typescript
class Demo<T extends firstInterface, secondInterface> {
    private genericProperty: T; // TS2564: Property 'genericProperty' has no initializer and is not definitely assigned in the constructor.

    useT() {
        this.genericProperty.doSomething();
        this.genericProperty.doAnother(); // TS2339: Property 'doAnother' does not exist on type 'T'
    }
}
```

只有`firstInterface`约束了泛型`T`，`secondInterface`没有生效，如果改成以下这样：

```typescript
class Demo<T extends firstInterface, T extends secondInterface> { // TS2300: Duplicate identifier 'T'.
	// ...
}
```

直接提示标识符重复。要么要如何使用多重类型泛型约束呢？

1. 可以将接口`firstInterface`与`secondInterface`作为超接口来解决问题：

   ```typescript
   interface childInterface extends firstInterface, secondInterface {}
   
   class Demo<T extends childInterface> {
       private genericProperty: T;
   
       useT() {
           this.genericProperty.doSomething();
           this.genericProperty.doAnother();
       }
   }
   ```

   这样就可以对泛型达到多类型约束的目的

2. 还可以利用交叉类型进行多类型约束：

   ```typescript
   class Demo<T extends firstInterface&secondInterface> {
       private genericProperty: T;
   
       useT() {
           this.genericProperty.doSomething();
           this.genericProperty.doAnother();
       }
   }



### 泛型与new

假设需要声明一个泛型拥有构造函数，如：

```typescript
function factory<T>(type: T): T {
    return new type(); // TS2351: This expression is not constructable.   Type 'unknown' has no construct signatures.
}
```

编译器提示这个表达式不能构造，因为我们没有声明这个泛型`T`是构造函数，此时就需要`new`的帮助了：

```typescript
function factory<T>(type: {new(): T}): T {
    return new type();
}

const factory = <T>(type: {new(): T}): T => {
    return new type();
}
```

```typescript
interface T1<T> {
    new(): T
}

function factory1<T>(type: T1<T>): T {
    return new type();
}
```

参数`type`的类型`{new(): T}`，表示此泛型T是可被构造的，被实例化后的类型是泛型T



### 小结

设计泛型的关键目的是在成员之间**提供有意义的约束**，这些成员可以是：

* 接口
* 类的实例成员
* 类的方法
* 函数参数
* 函数返回值

