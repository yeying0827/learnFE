/*
* 装饰器
* */
// 类装饰器
function addAge(constructor: Function) {
    constructor.prototype.age = 18;
}

// 属性/方法装饰器
function method(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    console.log(target);
    console.log('prop', propertyKey);
    console.log('desc', JSON.stringify(descriptor));
    descriptor.writable = false;
}

@addAge
class Monkey {
    age!: number

    @method
    say() {
        return 'say method';
    }

    @method
    static run() {
        return 'static run method';
    }
}

let money: Monkey = new Monkey();
console.log(money.age);
money.age = 0;

// money.say = function () { // TypeError: Cannot assign to read only property 'say' of object '#<Monkey>'
//     return 'new-say method';
// }

console.log(money.say());

function NewMonkey() {}
Object.defineProperty(NewMonkey.prototype, 'say',{
    value: function() {
        console.log('hello');
    },
    enumerable: false,
    configurable: true,
    writable: true
});

// 参数装饰器
function logParameter(target: object, propertyKey: string, index: number) {
    console.log(target, propertyKey, index);
}

class Lion {
    roar(@logParameter message: string, @logParameter name: string): string {
        return `${message} ${name}`;
    }
}

const lion = new Lion();
lion.roar('wuwuwuwuwuwu', 'xinba');
// Lion {} 'roar' 1
// Lion {} 'roar' 0

// function testParamDecorator(@logParameter a: string, b: string) { // TS1206: Decorators are not valid here.
//
//     const testInner = function (@logParameter c: string, @logParameter d: string) { // TS1206: Decorators are not valid here.
//
//     }
//
// }

// 装饰器工厂
@log
class Cup {

    @log
    public name: string;

    constructor(name: string) {
        this.name = name;
    }

    @log
    public greet(@log message: string): string {
        return `${this.name} say: ${message}`;
    }
}

function logClass(target: typeof Cup) {
    console.log(target);
}

function logProperty(target: any, propertyKey: string) {
    console.log(propertyKey);
}

function logMethod(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    console.log(propertyKey);
}

function logParam(target: object, propertyKey: string, index: number) {
    console.log(index);
}

function log(...args: any []) {
    switch (args.length) {
        case 1:
            return logClass.apply(this, args);
        case 2:
            return logProperty.apply(this, args);
        case 3:
            if (typeof args[2] === 'number') return logParam.apply(this, args);
            return logMethod.apply(this, args);
        default:
            throw new Error('Decorators are not valid here!');
    }
}

//装饰器顺序
function f() {
    console.log('f() evaluated.')

    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        console.log('f() called.');
    }
}

function g() {
    console.log('g() evaluated.')

    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        console.log('g() called.');
    }
}

class C {
    @f()
    @g()
    method() {}
}

// f() evaluated.
// g() evaluated.
// g() called.
// f() called.
