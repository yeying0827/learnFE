## Reflect Metadata

Reflect Metadata属于ES7的一个提案，它的主要作用是在声明的时候「添加和读取元数据」。

用手动的方法在属性上添加元数据，不仅不优雅而且影响开发效率。

Reflect Metadata目前需要**引依赖包**才能使用：

```shell
yarn add reflect-metadata
```

并需要在`tsconfig.json`中配置`emitDecoratorMetadata`。（好像设置"emitDecoratorMetadata": false也不影响下面简单例子的运行？）

这样就可以用装饰器来获取、添加元数据了。

**一个简单的例子**：

```typescript
import 'reflect-metadata'; // 需要在入口文件顶部import

@Reflect.metadata('name', 'TestClass')
class TestClass {

    @Reflect.metadata('hello', 'reflect-metadata')
    public helloMethod(): string {
        return 'hello reflect-metadata';
    }
}

console.log(Reflect.getMetadata('name', TestClass)); // TestClass
console.log(Reflect.getMetadata('hello', new TestClass(), 'helloMethod')); // reflect-metadata
```

使用Reflect Metadata，我们可以：

* 通过装饰器来给类添加一些自定义的信息
* 可以通过反射将这些信息提取出来
* 也可以通过反射来添加自定义信息

> 反射：ES6+ 加入的Reflect就是用于反射操作的，它允许运行中的程序对自身进行检查，或者说“自审”，并能直接操作程序的内部属性和方法，反射的概念在Java/c#等众多语言中已经被广泛运用。



### 基础概念

先看一下Reflect Metadata的API：[Metadata Proposal](https://rbuckton.github.io/reflect-metadata/#introduction)，[github repo](https://github.com/rbuckton/reflect-metadata)

```typescript
// define metadata on an object or property
Reflect.defineMetadata(metadataKey, metadataValue, target);
Reflect.defineMetadata(metadataKey, metadataValue, target, propertyKey);

// check for presence of a metadata key on the prototype chain of an object or property
let result = Reflect.hasMetadata(metadataKey, target);
let result = Reflect.hasMetadata(metadataKey, target, propertyKey);

// check for presence of an own metadata key of an object or property
let result = Reflect.hasOwnMetadata(metadataKey, target);
let result = Reflect.hasOwnMetadata(metadataKey, target, propertyKey);

// get metadata value of a metadata key on the prototype chain of an object or property
let result = Reflect.getMetadata(metadataKey, target);
let result = Reflect.getMetadata(metadataKey, target, propertyKey);

// get metadata value of an own metadata key of an object or property
let result = Reflect.getOwnMetadata(metadataKey, target);
let result = Reflect.getOwnMetadata(metadataKey, target, propertyKey);

// get all metadata keys on the prototype chain of an object or property
let result = Reflect.getMetadataKeys(target);
let result = Reflect.getMetadataKeys(target, propertyKey);

// get all own metadata keys of an object or property
let result = Reflect.getOwnMetadataKeys(target);
let result = Reflect.getOwnMetadataKeys(target, propertyKey);

// delete metadata from an object or property
let result = Reflect.deleteMetadata(metadataKey, target);
let result = Reflect.deleteMetadata(metadataKey, target, propertyKey);

// apply metadata via a decorator to a constructor
@Reflect.metadata(metadataKey, metadataValue)
class C {
  // apply metadata via a decorator to a method (property)
  @Reflect.metadata(metadataKey, metadataValue)
  method() {
  }
}
```

根据命名可以得知它们大概的作用，这些API接收的参数一共就四种：

* metadataKey：元数据的key。元数据本质上内部实现是一个map对象，以键值对的形式储存元数据
* metadataValue：元数据的value
* target：一个对象，表示元数据将被添加到的对象
* property：对象的属性，元数据将被添加到的对象属性



### 常用方法

#### 设置/获取元数据

如何添加元数据？需要用到`metadata` API，利用装饰器给目标添加元数据：

```typescript
function metadata(metadataKey: any, metadataValue: any): {
  (target: Function): void;
  (target: Object, propertyKey: string | symbol): void;
};
```

如果不用装饰器，也可以用`defineMetadata`来添加元数据：

```typescript
// define metadata on an object or property
Reflect.defineMetadata(metadataKey, metadataValue, target);
Reflect.defineMetadata(metadataKey, metadataValue, target, propertyKey);
```

在开头的简单小例子中就是用了装饰器来添加元数据。

可以看到设置了元数据后，需要用`getMetadata`将元数据取出，但是为什么在取出方法`helloMethod`上的元数据时需要先把class实例化（即new操作）呢？

原因就是元数据被添加在实例方法上，因此必须实例化才能取出，要想不实例化，就必须加在静态方法上。

#### 内置元数据

元数据除了开发者自己设置，我们还可以获取一些TypeScript本身内置的一些元数据。

* 使用`design:type`作为key可以获取目标的类型，比如在上例中，可以获取`helloMethod`方法的类型：

```typescript
@Reflect.metadata('name', 'TestClass')
class TestClass {

    @Reflect.metadata('comment', '姓名')
    public name: string = 'TestClass name';

    @Reflect.metadata('hello', 'reflect-metadata')
    public helloMethod(): string {
        return 'hello reflect-metadata';
    }
}

console.log(Reflect.getMetadata('name', TestClass));
console.log(Reflect.getMetadata('hello', new TestClass(), 'helloMethod'));

const type1 = Reflect.getMetadata('design:type', new TestClass(), 'helloMethod');
console.log(type1); // [Function: Function]

const type2 = Reflect.getMetadata('design:type', new TestClass(), 'name');
console.log(type2); // [Function: String]
```

注：

1. "emitDecoratorMetadata"必须设置为true，否则type是undefined
2. 获取的目标必须有设置元数据，否则无法通过`design:type`这个key获取目标类型，只能得到undefined

* 使用`design:paramtypes`作为key可以获取目标参数的类型，比如获取`helloMethod`方法参数的类型：

```typescript
@Reflect.metadata('name', 'TestClass')
class TestClass {

    @Reflect.metadata('comment', '姓名')
    public name: string = 'TestClass name';

    @Reflect.metadata('hello', 'reflect-metadata')
    public helloMethod(message: string, num: number): string {
        return 'hello reflect-metadata';
    }
}

console.log(Reflect.getMetadata('design:paramtypes', new TestClass(), 'helloMethod')); // [ [Function: String], [Function: Number] ]
// 没有参数时为空数组 []
console.log(Reflect.getMetadata('design:paramtypes', new TestClass(), 'name')); // undefined
```

* 使用`design:returntype`作为key可以获取有关方法返回类型的信息

```typescript
@Reflect.metadata('name', 'TestClass')
class TestClass {

    @Reflect.metadata('comment', '姓名')
    public name: string = 'TestClass name';

    @Reflect.metadata('hello', 'reflect-metadata')
    public helloMethod(message: string, num: number): string {
        return 'hello reflect-metadata';
    }
}

console.log(Reflect.getMetadata('design:returntype', new TestClass(), 'helloMethod')); // [Function: String]
console.log(Reflect.getMetadata('design:returntype', new TestClass(), 'name')); // undefined
```



### 实践

在Node.js中有一些框架，比如Nestjs，会有分散式的装饰器路由，比如`@Get` 、`@Post`等，这些正是借助Reflect Metadata实现的。

假设一个博客系统的文章路由是如下代码：

```typescript
@Controller('/article')
class Home {

    @Get('/content')
    public detail() {
        return 'some detail content'
    }

    @Post('/comment')
    public comment(comment: string) {
        console.log(comment);
    }
}
```

可以如下一步步实现。

1. 实现一个生产装饰器的`Controller`工厂函数

   ```typescript
   const METHOD_METADATA = 'method';
   const PATH_METADATA = 'path';
   
   // 装饰器工厂函数，接收路由的路径path返回一个装饰器
   const Controller = (path: string): ClassDecorator => (target: any) => {
       Reflect.defineMetadata(PATH_METADATA, path, target);
   }
   ```

2. 实现`Get` `Post`等装饰器工厂函数

   ```typescript
   // 装饰器工厂函数，首先接收一个参数表示方法，比如get/post，然后再接收一个路由路径，返回一个携带了上述两个信息的装饰器
   const createMappingDecorator = (method: string) => (path: string): MethodDecorator => {
       return (target: any, key: string, descriptor: PropertyDescriptor) => {
           Reflect.defineMetadata(PATH_METADATA, path, descriptor.value!);
           Reflect.defineMetadata(METHOD_METADATA, method, descriptor.value!);
       }
   }
   
   const Get = createMappingDecorator('GET');
   const Post = createMappingDecorator('POST');
   ```

   `createMappingDecorator`是柯里化的，在计算机科学中，柯里化是把接收多个参数的函数变换成接收一个单一参数（最初函数的第一个参数）的函数，并且返回接收余下参数且返回结果的新函数的技术。

3. 以上已完成元数据的添加，最后一步就是读取元数据

   ```typescript
   // 确保symbol是一个函数，可以被构造调用，并且不是Object
   const isConstructor = (symbol: any): boolean => {
       // console.log('symbol', symbol);
       return notUndefined(symbol) &&
           symbol instanceof Function &&
           symbol.constructor &&
           symbol.constructor instanceof Function &&
           // notUndefined(new symbol) && // 非构造器调用此方法会报错 TypeError: symbol is not a constructor
           Object.getPrototypeOf(symbol) !== Object.prototype &&
           symbol.constructor !== Object &&
           // symbol.prototype.hasOwnProperty('constructor'); // 非构造器执行此操作会报错TypeError: Cannot read property 'hasOwnProperty' of undefined，普通方法没有prototype属性
           !!symbol.prototype; // 增加是否有prototype属性判断，class 的所有方法（包括静态方法和实例方法）都没有原型对象 prototype
   }
   
   const notUndefined = (item: any): boolean => {
       return item != undefined && item != 'undefined';
   }
   
   const isFunction = (value: any): value is Function => {
       return typeof value === 'function';
   }
   
   function mapRoute(instance: object) {
       const prototype = Object.getPrototypeOf(instance);
       console.log(prototype); // Home {}
       console.log(Object.getOwnPropertyNames(prototype)); // [ 'constructor', 'detail', 'comment' ]
   
       // 筛选出类中的方法，并排除构造方法（？）
       const methodsNames = Object.getOwnPropertyNames(prototype)
           .filter(item => {
               return !isConstructor(prototype[item]) && isFunction(prototype[item])
           });
     
       console.log(methodsNames); // [ 'detail', 'comment' ]
   
       return methodsNames.map(methodName => {
           const fn = prototype[methodName];
   
           // 取出定义的metadata_value
           const route = Reflect.getMetadata(PATH_METADATA, fn);
           const method = Reflect.getMetadata(METHOD_METADATA, fn);
   
           return {
               route,
               method,
               fn,
               methodName
           }
       });
   }
   
   console.log(Reflect.getMetadata(PATH_METADATA, Home)); // /article
   
   const info = mapRoute(new Home());
   
   console.log(info);
   // [ { route: '/content',
   //     method: 'GET',
   //     fn: [Function: detail],
   // methodName: 'detail' },
   // { route: '/comment',
   //     method: 'POST',
   //     fn: [Function: comment],
   //     methodName: 'comment' } ]
   ```



### 小结

实际上Reflect Metadata的作用就是附加元数据，这与Java中的注解非常相似。

Angular或者Nestjs这样的框架就是通过Decorator + Reflect.metadata的组合来模拟注解（Annotation）的功能