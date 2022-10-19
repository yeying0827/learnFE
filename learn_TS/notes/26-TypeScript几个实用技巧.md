## TypeScript几个实用技巧

### 注释的妙用

可以通过`/** */`来注释TypeScript的类型，当我们在使用相关类型的时候就会有注释的提示，在多人协作开发的时候十分有用，在大多数情况下就不用花时间翻文档或者跳转去看代码。

例子：

```typescript
import React from "react";

interface IProps {
    /**
     * logo的地址
     */
    logo?: string,
    /*
    * logo的样式类
    * */
    className?: string,
    alt?: string
}

export const Logo: React.FC<IProps> = props => {
    const { className, alt, logo } = props;

    return (
        <img src={logo} className={className} alt={alt} />
    );
}
```

鼠标悬浮在logo变量时会提示：

```
IProps.logo?: string | undefined
logo的地址
```



### 巧用类型推导

TypeScript能根据一些简单的规则推断（检查）变量的类型。

例子：

```typescript
function add(a: number, b: number) {
  return a + b;
}
```

TypeScript可以通过参数与return的运算符推导出函数的返回值类型是`number`。

想获取函数自身的类型可以借助`typeof`：

```typescript
type AddFnType = typeof add;
```

有时函数的返回值类型比较复杂，此时借助类型推导和`ReturnType`就可以轻松获取返回值的类型：

```typescript
type AddReturnType = ReturnType<typeof add>; // number
```

这种操作在使用redux编码时非常适合，可以省略大量的重复代码



### 巧用元组

有时我们可能需要批量地获取参数，并且每个参数的类型还不一样，此时可以声明一个元组，比如：

```typescript
function query(...args: [string, number, boolean]) {
  const a: string = args[0];
  const b: number = args[1];
  const c: boolean = args[2];
}
```



### 巧用Omit

假设需要复用一个类型，但是又不需要此类型的全部属性，需要剔除某些属性，此时`Omit`就派上用场了。

例子：

```typescript
interface User {
  username: string,
  id: number,
  token: string,
  avatar: string,
  role: string
}
type UserWithoutToken = Omit<User, 'token'>;
```

在React中，当父组件通过props向下传递数据的时候，通常需要复用父组件的props类型，但又需要剔除一些无用的属性。



### 运用Record

`Record`是TypeScript的一个高级类型。

Record允许从Union类型（联合类型）中创建新类型，Union类型中的值用作新类型的属性。

例子：

假设要实现一个汽车品牌年龄表。

```typescript
type Car = 'Audi' | 'BMW' | 'MercedesBenz';

const cars = {
  Audi: { age: 119 },
  BMW: { age: 113 },
  MercedesBenz: { age: 133 }
};
```

上述写法没有问题，但是可能存在类型安全的问题，比如：

* 忘记写了一个汽车品牌，会报错吗？
* 属性名拼写错误了，会报错吗？
* 添加了一个非上述三个品牌的品牌进去，会报错吗？
* 更改了其中一个品牌的名字，会报错提醒吗？

此时就需要Record的帮助。

```typescript
type Car = 'Audi' | 'BMW' | 'MercedesBenz';
type CarList = Record<Car, { age: number }>;

const cars: CarList = {
    Audi: { age: 119 },
    BMW: { age: 113 },
    MercedesBenz: { age: 133 }
};
```

1. 当拼写错误：

   ```typescript
   const cars1: CarList = {
       Audi1: { age: 119 },
       BMW: { age: 113 },
       MercedesBenz: { age: 133 }
   };
   ```

   ```
   TS2322: Type '{ Audi1: { age: number; }; BMW: { age: number; }; MercedesBenz: { age: number; }; }' is not assignable to type 'CarList'.   Object literal may only specify known properties, but 'Audi1' does not exist in type 'CarList'. Did you mean to write 'Audi'?
   ```

2. 当少些一个品牌：

   ```typescript
   const cars2: CarList = {
       BMW: { age: 113 },
       MercedesBenz: { age: 133 }
   };
   ```

   ```
   TS2741: Property 'Audi' is missing in type '{ BMW: { age: number; }; MercedesBenz: { age: number; }; }' but required in type 'CarList'.
   ```

3. 当添加了一个非约定好的品牌进去：

   ```typescript
   const car3: CarList = {
       Audi: { age: 119 },
       BMW: { age: 113 },
       MercedesBenz: { age: 133 },
       Ferrari: { age: 111 }
   };
   ```

   ```
   TS2322: Type '{ Audi: { age: number; }; BMW: { age: number; }; MercedesBenz: { age: number; }; Ferrari: { age: number; }; }' is not assignable to type 'CarList'.   Object literal may only specify known properties, and 'Ferrari' does not exist in type 'CarList'.
   ```

实战中使用Record可以帮助规避很多错误。



### 巧用类型约束

在.tsx文件里，泛型可能会被当作jsx标签。

例子：

```tsx
const toArray = <T>(element: T) => [element]; // Expression statement is not assignment or call
```

加extends可破：

```tsx
const toArray = <T extends {}>(element: T) => [element]; // ok
```

