/*
* reflect metadata
* 需要安装依赖reflect-metadata
* `yarn add reflect-metadata`或`npm install reflect-metadata --save
* */
@Reflect.metadata('name', 'TestClass')
class TestClass {

    @Reflect.metadata('comment', '姓名')
    public name: string = 'TestClass name';

    @Reflect.metadata('hello', 'reflect-metadata')
    public helloMethod(message: string, num: number): string {
        return 'hello reflect-metadata';
    }
}

// 基本使用
console.log(Reflect.getMetadata('name', TestClass));
console.log(Reflect.getMetadata('hello', new TestClass(), 'helloMethod'));

// 内置元数据
const type1 = Reflect.getMetadata('design:type', new TestClass(), 'helloMethod');
console.log(type1); // undefined，[Function: Function]

const type2 = Reflect.getMetadata('design:type', new TestClass(), 'name');
console.log(type2); // undefined，[Function: String]

console.log(Reflect.getMetadata('design:paramtypes', new TestClass(), 'helloMethod')); // [ [Function: String], [Function: Number] ]
console.log(Reflect.getMetadata('design:paramtypes', new TestClass(), 'name')); // undefined

console.log(Reflect.getMetadata('design:returntype', new TestClass(), 'helloMethod')); // [Function: String]
console.log(Reflect.getMetadata('design:returntype', new TestClass(), 'name')); // undefined

// 小例子

// metadata_key
const METHOD_METADATA = 'method';
const PATH_METADATA = 'path';

// 装饰器工厂函数，接收路由的路径path返回一个装饰器
const Controller = (path: string): ClassDecorator => (target: any) => {
    Reflect.defineMetadata(PATH_METADATA, path, target);
}

// 装饰器工厂函数，首先接收一个参数表示方法，比如get/post，然后再接收一个路由路径，返回一个携带了上述两个信息的装饰器
const createMappingDecorator = (method: string) => (path: string): MethodDecorator => {
    return (target: any, key: string, descriptor: PropertyDescriptor) => {
        Reflect.defineMetadata(PATH_METADATA, path, descriptor.value!);
        Reflect.defineMetadata(METHOD_METADATA, method, descriptor.value!);
    }
}

const Get = createMappingDecorator('GET');
const Post = createMappingDecorator('POST');

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

/*
* 工具函数
* */

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
        // symbol.prototype.hasOwnProperty('constructor'); // 非构造器执行此操作会报错TypeError: Cannot read property 'hasOwnProperty' of undefined，普通方法没有prototype
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
    console.log(prototype);
    console.log(Object.getOwnPropertyNames(prototype));

    // 筛选出类中的方法，并排除构造方法
    const methodsNames = Object.getOwnPropertyNames(prototype)
        .filter(item => {
            return !isConstructor(prototype[item]) && isFunction(prototype[item])
        });

    console.log(methodsNames);

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

