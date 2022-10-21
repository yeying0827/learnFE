## 高级类型：infer关键字

`infer`是工具类型和底层库中非常常用的关键字，表示在extends条件语句中待获取的类型变量。

假设有一个面试题，要设计一个`ReturnType`用于获取函数的返回类型，要如何设计？

```typescript
interface User9 {
    name: string,
    age: number,
    birthday?: string
}
type Foo1 = () => User9;

// type NewReturnType<T> = ???
type foo1 = NewReturnType<Foo1>; // User9
```



### 条件类型与infer

一个简单的例子：

```typescript
type ParamType1<T> = T extends (arg: infer P) => any ? P : T;
```

这段代码的意思是：如果`T`能赋值给`(arg: infer P) => any`，即T是一个函数类型且接收一个参数并返回任意类型的值（？），则结果是函数第一个参数的类型`P`，否则结果是类型`T`，`infer P`指代函数参数的类型变量。

回到开头的面试题，由于传入的函数的返回值类型是未知的，所以需要用`infer P`指代返回值类型，可以如下设计：

```typescript
type NewReturnType<T> = T extends (...args: any[]) => infer P ? P : any;
```

TypeScript还内置了一个获取构造函数参数类型的工具类型：

`ConstructorParameters<T>`——提取构造函数中的参数类型，使用如下：

```typescript
class TestClass1 {
    constructor(public name: string, public age: number) {}
}

type R5 = ConstructorParameters<typeof TestClass1> // [string, number]
```

我们可以自己实现：

```typescript
type ConstructorParameters1<T extends new (...args: any[]) => any> = T extends new (...args: infer P) => any ? P : never;
// type ConstructorParameters1<T> = T extends new (...args: infer P) => any ? P : never; 此处也可不给泛型T做约束
```

说明：

1. `new (...args: any [])`指构造函数，因为构造函数是可以被实例化的，这是给泛型`T`做的约束
2. `infer P`指代构造函数的参数类型，如果类型`T`是一个构造函数，那么返回构造函数的参数类型`P`，否则什么也不返回，即`never`类型。



### infer的应用

1. tuple转union，如：`[string,  number]` -> `string | number`

   ```typescript
   type ElementOf<T> = T extends Array<infer E> ? E : never;
   type TTuple = [string, number];
   type TUnion = ElementOf<TTuple>; // string | number
   
   type Res = TTuple[number]; // string | number，元组按下标取出所有的元素形成联合类型
   ```

   

2. union转intersection，如：`string | number` -> `string & number`

   ```typescript
   type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;
   
   type Result = UnionToIntersection<string | number>;
   ```

   此处的操作可以这样理解：

   1. `U extends any ? (k: U) => void : never`形成了分布式有条件类型，操作后得到一个联合类型：`((k: string) => void) | ((k: number) => void)`
   1. 步骤1得到的联合类型继续形成分布式有条件类型，因为满足可以赋值给`(k: infer I) => void`，最后得到类型I既是string又是number，因为不存在这样的数据，所以Result为`never`。
   
   ```typescript
   type Result2 = UnionToIntersection<{ id:number, name: string } | { name: string, age: number }>; // {id: number, name: string} & {name: string, age: number}
   
   const result2: Result2 = {
       id: 1,
       name: 'haha',
       age: 18
   }
   ```



### 小结

简单而言，infer关键字就是声明一个类型变量，配合条件推断出类型。