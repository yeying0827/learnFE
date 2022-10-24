## TypeScript学习小结

某册子买了两年多了，到最近才开始学习TypeScript，拖延症的严重症状了。
学完之后整体感受是：TypeScript在JavaScript的基础上提供了一套类型系统，用以在编码时提供类型提示，并利用类型推断对代码进行检查以及给出错误提示，以规避一些可能潜在的执行JavaScript代码时会出现的错误。
对tsconfig.json进行配置，我们可以自定义关闭和开启的检查项以及TS的编译配置，比如是否对空值进行检查、编译的目标JS版本、源代码支持的ES版本等等。
基础知识分为以下几块：

1. TypeScript的类型系统
2. TypeScript内置的类型
3. TypeScript类型定制
   1. 对象结构的类型：interface和class
      1. 基础使用
      2. `?`用于定义可选属性，`readonly`用于定义只读属性
   2. 函数结构的类型：单独定义和作为对象类型的属性
      1. 基础使用
      2. 函数签名：用于更精准的类型推导
      3. 可调用类型
   3. 构造函数的类型
   4. 组合结构的类型
   5. 类型别名：type
4. 利用类型系统来缩小类型范围：类型守卫
   1. JS操作符：in、typeof、instanceof
   2. 字面量类型守卫（可用于可辨识联合类型）
   3. TS关键字`is`定制类型守卫
5. TypeScript对类型的操作
   1. 类型变量（相对于值变量）
      1. 泛型
      2. 泛型约束：使用关键字`extends`
   2. 操作符
      1. 使用TS关键字`in`的映射操作
      2. 使用TS关键字`extends`的条件判断：三目运算
      3. 使用TS关键字`typeof`获取类型（结构）
      4. 使用`[keyof T]`过滤never类型的属性
      5. 使用TS关键字`infer`用于标识待推导和使用的类型（用在函数的参数类型和返回值类型）
      6. `+`和`-`操作符
   3. 工具类型：使用关键字`type`定义，使用泛型和操作符创建的类似函数功能的类型，通过泛型接收输入的类型，经过一系列操作得到并输出新的类型

### 前置准备

#### 1. 学习环境搭建

#### 2. 感性认识

假设我们使用JavaScript定义一个变量a：

```javascript
const a = 1;
```

如果改为使用TypeScript来定义，可以有以下两种方式：

```typescript
// 1.和JavaScript一样定义
const a = 1; // 此时TypeScript会自动推导出a的类型是number

// 2.定义变量时显式地指定类型，变量中存储的是什么类型的值
const a: number = 1;
```

乍一看，似乎TS使用显式的方式指定类型的写法繁琐了一些，但是当我们用到复杂的类型，比如引用类型，好处就十分明显，首先在声明和赋值变量时，会提示我们引用类型内部是什么结构、内部的数据是什么类型，规避一些低级错误，在赋值有问题时会给出更精准的错误提示，这在开发大型项目和多人协作时十分有用；其次在使用变量时，也可以给出更多更精准的提示，比如一个对象可以包含哪些属性，属性的类型，避免一些错误的操作。



### 1. TypeScript的类型系统

TypeScript的类型，与其他语言的类型不同，指的是符合某种结构的数据分类。

假设我定义了一个类型A，结构如下：

```typescript
{
  name: string,
  age: number
}
```

如果此时我又定义了一个变量：

```typescript
const person: A = {
  name: 'lilei',
  age: 18
}
```

此时person中存储的值的类型就是类型A，它的结构也符合类型A的定义。



### 2. TypeScript内置的类型



### 3. TypeScript类型定制

#### 对象结构的类型：interface和class

* 基础使用
* `?`用于定义可选属性，`readonly`用于定义只读属性

#### 函数结构的类型：单独定义和作为对象类型的属性

* 基础使用
* 函数签名：用于更精准的类型推导
* 可调用类型

#### 构造函数的类型

#### 组合结构的类型

* `&`形成交叉类型
* `|`形成联合类型

#### 类型别名：type



### 4. 利用类型系统来缩小类型范围：类型守卫

#### JS操作符：in、typeof、instanceof

#### 字面量类型守卫（可用于可辨识联合类型）

#### TS关键字`is`定制类型守卫

假设我们要判断一个数据的类型，除了符合特性的结构以外，还需要满足一些额外的条件，就可以使用关键字`is`来定制我们的类型守卫，比如Student和Person的结构一样，但是Student的范围更小一些，比如说年龄范围在12至15岁之间，就可以编写如下代码来进行区分：

```typescript
interface Person9 {
    name: string,
    age?: number,
}

interface Student9 extends Person9 {}

function checkValidStudent(p: Person9): p is Student9 {
    return p.age !== undefined && p.age >= 12 && p.age <= 15;
}

const p1: Person9 = {
    name: 'lilei',
    age: 18
}

const p2: Person9 = {
    name: 'hanmeimei',
    age: 15
}

function checkPerson(p: Person9) {
    if (checkValidStudent(p)) {
        console.log(`${p.name} is a Student`);
    } else {
        console.log(Object.prototype.valueOf.call(p));
    }
}

checkPerson(p1);
checkPerson(p2);
```

上述代码运行的结果是：

```
{ name: 'lilei', age: 18 }
hanmeimei is a Student
```

在`if`的条件里，p提示的类型是Person9，在`if`判断内部，p提示的类型就变成Student9了。

在else判断里，p提示的类型是never，不懂为啥？也许是因为Person9和Student9的结构一样



### 5. TypeScript对类型的操作

#### 类型变量（相对于值变量）

* 泛型
* 泛型约束：使用关键字`extends`

#### 操作符

* 使用TS关键字`in`的映射操作
* 使用TS关键字`extends`的条件判断：三目运算
* 使用TS关键字`typeof`获取类型（结构）
* 使用`[keyof T]`过滤never类型的属性
* 使用TS关键字`infer`用于标识待推导和使用的类型（用在函数的参数类型和返回值类型）
* `+`和`-`操作符

#### 工具类型：结合泛型和操作符

使用关键字`type`定义，使用泛型和操作符创建的类似函数功能的类型，通过泛型接收输入的类型，经过一系列操作得到并输出新的类型