## 接口interface

用于定义一个类型并描述其结构。

TypeScript的核心原则之一，是对值所具有的结构进行类型检查。这有时被称作“鸭式辨型法”或“结构性子类型化”。

在TypeScript中，接口的作用就是为这些类型命名和为你的代码或第三方代码定义契约。

### 接口的使用

假设有一个函数，接收一个`User`对象作为参数，然后返回这个`User`对象的`name`属性：

```typescript
const getUserName = (user) => user.name; // TS7006: Parameter 'user' implicitly has an 'any' type.
```

TS会提示报错。

此时，我们需要用一种类型描述这个`user`参数，但这个类型又不属于各种基本类型，所以需要使用`interface`来描述这个类型：

```typescript
interface User {
    name: string
    age: number
    gender: boolean
}
const getUserName = (user: User) => user.name;
```

这个接口`User`描述了参数`user`的结构，只要相应的属性存在并且类型兼容即可。

#### 可选属性

比如处理表单时，年龄`age`这个字段本身是可选的，如何用接口描述这种情况？

可以使用可选属性描述这种情况：

```typescript
interface User {
    name: string
    age?: number
    gender: boolean
}

// 当我们读取user.age时，可以看到代码提示：User.age?: number | undefined
const getUserAge = (user: User) => user.age;
```

`age`属性既可能是number类型也可能是undefined。

#### 只读属性

假如我们确定`user`的性别之后就不允许更改了，`interface`可以保证这一点吗？

利用`readonly`我们可以把一个属性变成只读属性，此后就无法对它进行修改：

```typescript
interface User {
    name: string
    age?: number
    readonly gender: boolean
}

// 修改只读属性，会出现报错警告
const modifyGender = (user: User) => user.gender = true; // TS2540: Cannot assign to 'gender' because it is a read-only property.
```

#### 函数类型

如果这个`user`含有一个函数怎么办？

```typescript
interface User {
    name: string
    age?: number
    readonly gender: boolean
}

let u: User = {
    name: 'Becky',
    gender: false
};
u.say = function (word: string) { // TS2339: Property 'say' does not exist on type 'User'.
    return 'hello world!';
}
```

一种方法是：直接在interface内部描述函数：

```typescript
interface User {
    name: string
    age?: number
    readonly gender: boolean
    say?: (words: string) => string
}

let u: User = {
    name: 'Becky',
    gender: false
};
u.say = function (word: string) {
    return 'hello world!';
}
```

另一种方法是：先用接口直接描述函数类型：

```typescript
interface Say {
    (words: string): string
}

// 在User内使用函数类型
interface User {
    name: string
    age?: number
    readonly gender: boolean
    say?: Say
}

let u: User = {
    name: 'Becky',
    gender: false
};
u.say = function (word: string) { // TS2339: Property 'say' does not exist on type 'User'.
    return 'hello world!';
}
```

#### 属性检查

假设有一段代码如下：

```typescript
interface Config {
    width?: number
}

function calculateAreas(config: Config): { areas: number } {
    let result = 100;

    if (config.width) {
        result = config.width * config.width;
    }

    return { areas: result };
}

let mySquare = calculateAreas({ widdth: 5 });
```

我们传入的参数为`widdth`，而不是`width`。

此时，TypeScript会认为这段代码可能存在问题。当对象字面量被赋值给变量或者作为参数传递时，会被特殊对待，要经过“额外属性检查”。如果一个对象字面量存在任何“目标类型”不包含的属性时，会提示一个警告错误。

```text
// TS2345: Argument of type '{ widdth: number; }' is not assignable to parameter of type 'Config'. Object literal may only specify known properties, but 'widdth' does not exist in type 'Config'.
```

官网提供的三种主流解决办法：

* 使用类型断言：

  ```typescript
  let mySquare = calculateAreas({ widdth: 5 } as Config);
  ```

* 添加字符串索引签名：

  ```typescript
  interface Config {
      width?: number
      [propName: string]: any
  }
  let mySquare = calculateAreas({ widdth: 5 });
  ```

  这样`Config`可以有任意数量的属性，并且除了`width`，其他的属性类型为any。

* 将字面量赋值给另外一个变量：

  ```typescript
  let options: any = { widdth: 5 };
  let mySquare = calculateAreas(options);
  ```

  本质是转化为any类型，除非万不得已的情况，不建议此种方法。

#### 可索引类型

假设`User`还包含一个属性，这个属性是`User`拥有的邮箱的集合，但是这个集合有多少成员不确定，应该如何描述？

比如小张的信息如下：

```json
{
  name: 'xiaozhang',
  age: 18,
  gender: false,
  say: Function,
  email: {
    netease: 'zzzz@126.com',
    qq: '1234@qq.com'
  }
}
```

而小明的信息：

```json
{
  name: 'xiaoming',
  age: 19,
  gender: true,
  say: Function,
  email: {
    netease: 'mmmm@163.com',
    qq: '5678@qq.com',
    sina: 'mmmm@sina.cn'
  }
}
```

可以看到，这两个人的信息，他们的`email`属性有共同之处，首先`key`都是string类型，其次value也是string类型，虽然数量不等。

此时可以使用可索引类型表示，可索引类型具有一个索引签名，它描述了对象索引的类型，还有相应的索引返回值类型。

```typescript
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
```



### 继承接口

假设需要创建一个新的`VIPUser`，其属性与普通`User`一致，只是多了一些额外的属性，此时怎么处理呢？

可以用继承的方式，继承`User`接口，比如：

```typescript
interface VIPUser extends User {
    broadcast: () => void
}
```

甚至可以继承多个接口：

```typescript
interface Member {
    level: number
}

interface VIPUser extends User, Member {
    broadcast: () => void
}
```

