class A {
	say() {
		console.log('say: hello!');
	}
}

class B extends A {
	constructor() {
		super();
	}
}

console.log('A的prototype属性：');
console.log(A.prototype);
console.log('B的原型：');
console.log(B.__proto__); // const B = Object.create(A);
console.log('B的prototype属性：');
console.log(B.prototype);

const b = new B();
console.log('实例b的原型：');
console.log(b.__proto__); // A {constructor: ƒ} 即B.prototype
console.log('实例b的原型的原型：');
console.log(b.__proto__.__proto__); // {constructor: ƒ, say: ƒ} 即A.prototype，B自身的属性`__proto__`指向了A

// 直接使用Object.create
const o1 = {
    name: 'o1',
    age: 18,
    walk() {
        console.log('walking...')
    }
};
const o2 = Object.create(o1);
console.log('对象o2的原型：');
console.log(o2.__proto__); // {name: 'o1', age: 18}
console.log(o2.walk()); // walking...
console.log('对象o1是否存在于o2的原型链上：');
console.log(o1.isPrototypeOf(o2)); // true

// new操作
const b2 = new B();
console.log('B的prototype属性：');
console.log(B.prototype); // A {constructor: ƒ}
console.log('实例b2的原型：');
console.log(b2.__proto__); // A {constructor: ƒ} 即B.prototype
console.log('B的prototype属性是否存在于实例b2的原型链上：');
console.log(B.prototype.isPrototypeOf(b2)); // true

// extends关键字
console.log('A是否存在于class B的原型链上：');
console.log(A.isPrototypeOf(B)); // true            A是否在class B的原型链上 extends相当于执行过const B = Object.create(A);这个操作
console.log('A是否存在于实例b的原型链上：');
console.log(A.isPrototypeOf(b)); // false           A是否在实例b的原型链上
console.log('A的prototype属性是否存在于实例b的原型链上：');
console.log(A.prototype.isPrototypeOf(b)); // true  A的prototype属性是否在实例b的原型链上

// 直接修改prototype属性
function C() {
    this.name = 'c';
    this.operation = print;
    function print() { return 'printing...'};
    function a() {};
}
function D() {}
D.prototype = new C();
const d = new D();
console.log('实例d的原型的原型是否是C的prototype属性所指向的对象：');
console.log(d.__proto__.__proto__ === C.prototype); // true
console.log('C的prototype属性是否存在于实例d的原型链上：');
console.log(C.prototype.isPrototypeOf(d)); // true
console.log('D的prototype属性是否存在于实例d的原型链上：');
console.log(D.prototype.isPrototypeOf(d)); // true

// 盗用父类函数
function E() {
    C.call(this);
    this.do = function () { return 'do homework'; }
}
const e = new E();
console.log('E的prototype属性是否存在于实例e的原型链上：');
console.log(E.prototype.isPrototypeOf(e)); // true
console.log('C的prototype属性是否存在于实例e的原型链上：');
console.log(C.prototype.isPrototypeOf(e)); // false
console.log(e); // E {name: 'c', operation: ƒ, do: ƒ}
console.log(e.do()); // do homework
console.log(e.operation()); // do homework

// 组合继承
E.prototype = new C(); // 
const e2 = new E();
console.log('E的prototype属性是否存在于实例e2的原型链上：');
console.log(E.prototype.isPrototypeOf(e2)); // true
console.log('C的prototype属性是否存在于实例e2的原型链上：');
console.log(C.prototype.isPrototypeOf(e2)); // true

// 寄生式组合继承
function inheritatePrototype(subT, superT) {
  let proto = Object.create(superT.prototype);
  proto.constructor = subT;
  subT.prototype = proto;
}

function F() {
    this.do = function () { return 'do housework'; }
}
C.prototype.write = function () {
	return 'write something...';
}

inheritatePrototype(F, C);
const f = new F();
console.log('F的prototype属性是否存在于实例f的原型链上：');
console.log(F.prototype.isPrototypeOf(f)); // true
console.log('C的prototype属性是否存在于实例f的原型链上：');
console.log(C.prototype.isPrototypeOf(f)); // true
console.log(f.do());
console.log(f.write());
console.log(f.operation()); // error

// 寄生式继承
function createAnother(original) {
  let clone = Object.create(original);
  clone.intro = function(name) {
  	return 'my name is: ' + name;
  };
  return clone;
}

const original = {
	show() {
		return 'showed!'
	}
};
const k = createAnother(original);
console.log(k.show());
console.log(k.intro('k'));