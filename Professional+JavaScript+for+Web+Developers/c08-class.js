/* class定义不能被提升
console.log(A); 
// node - ReferenceError: Cannot access 'A' before initialization
// chrome - ReferenceError: A is not defined

class A {}
*/

/* 作用域限制不一样
{
	function FunctionDeclaration() {}
	class ClassDelaration {}
}
console.log( FunctionDeclaration ); // [Function: FunctionDeclaration]
console.log( ClassDelaration ); // ReferenceError: ClassDelaration is not defined
*/

/* 类表达式赋值给变量后，类表达式的名称无法在类表达式作用域外部访问
let Person = class PersonName {
	identify() {
		console.log( Person.name, PersonName.name );
	}
}
let p = new Person();
p.identify(); // PersonName PersonName
console.log( p ); // PersonName {}
console.log( Person.name ); // PersonName
console.log( PersonName ); // ReferenceError: PersonName is not defined
*/


class Person {
	set name(newName) { // name_会添加到实例上，name是在原型对象上
		this.name_ = newName;
	}
	get name() {
		return this.name_;
	}
	static locate() {
		console.log( 'class', this );
	}
	static className() {
		console.log( 'Person' );
	}
}
let p1 = new Person();
// p1.constructor(); // TypeError: Class constructor Person cannot be invoked without 'new'

let p2 = new p1.constructor();
console.log( p2 ); // Person {}
console.log( p2 instanceof Person ); // true
console.log( Person ); // [class Person]
console.log( typeof Person ); // function

let p3 = new Person.constructor();
console.log( p3.constructor === Person ); // false
console.log( p3 instanceof Person ); // false
console.log( p3 instanceof Person.constructor ); // true

console.log( p1.constructor === Person.constructor ); // false
console.log( p1.constructor ); // [class Person]
console.log( Person.constructor ); // [Function: Function]
console.log( p1.constructor === Person.prototype.constructor ); // true

Person.locate(); // class [class Person]

let p = new class Foo {
	constructor(x) {
		console.log( x );
	}
}('bar');
console.log( p );
// bar
// Foo {}

function Job() {}

class Engineer extends Job {}

let e = new Engineer();
console.log( e instanceof Engineer ); // true
console.log( e instanceof Job ); // true

class Vehicle {
	constructor(licensePlate) {
		this.licensePlate = licensePlate;
		if(new.target === Vehicle) { // "伪抽象基类（不能直接实例化）"
			throw new Error('Vehicle cannot be directly instantiated');
		}
		if(!this.foo) { // 子类必须定义某个方法
			throw new Error('Inheriting class must define foo()');
		}
	}
	identifyPrototype(id) {
		console.log( id, this );
	}
	static identifyClass(id) {
		console.log( id, this );
	}
}
class Bus extends Vehicle {
	// constructor() {} // ReferenceError: Must call super constructor in derived class before accessing 'this' or returning from derived constructor
	// 定义的constructor函数体内必须得调用super() 或者 返回一个对象; 如果要访问this，必须先调用super();
	// constructor() { return {};}
	/*constructor() {
		// this.name = "test"; // ReferenceError: Must call super constructor in derived class before accessing 'this' or returning from derived constructor
		super();
		console.log( this instanceof Vehicle );
	}*/

	static identifyClass(id) {
		console.log( id, 'overwrite', this );
	}

	foo() {}
}
// let v = new Vehicle(); // Error: Vehicle cannot be directly instantiated
let b = new Bus('1337H4X'); // Error: Inheriting class must define foo()
		// new Bus(); // true

b.identifyPrototype('bus'); // bus Bus { licensePlate: '1337H4X' } // bus Bus {}
// v.identifyPrototype('vehicle'); // vehicle Vehicle {}

Bus.identifyClass('bus'); // bus overwrite [class Bus extends Vehicle]
Vehicle.identifyClass('vehicle'); // vehicle [class Vehicle]


// 类混入
let FooMixin = (Superclass) => class extends Superclass {
	foo() {
		console.log( 'foo' );
	}
};
let BarMixin = (Superclass) => class extends Superclass {
	bar() {
		console.log( 'bar' );
	}
};
let BazMixin = (Superclass) => class extends Superclass {
	baz() {
		console.log( 'baz' );
	}
};

function mix(BaseClass, ...Minxins) {
	return Minxins.reduce((accumulator, current) => current(accumulator), BaseClass);
}

class Bus1 extends mix(Vehicle, BazMixin, BarMixin, FooMixin){};
let bb1 = new Bus1();
bb1.foo(); // foo
bb1.bar(); // bar
bb1.baz(); // baz

class TestSuper {
	foo() {
		console.log( 'instance super.foo' );
	}
	static foo() {
		console.log( 'super.foo' );
	}
}
class TestSub extends TestSuper{
	foo() {
		super.foo();
		console.log( 'instance sub.foo' );
	}
	static foo() {
		super.foo();
		console.log( 'sub.foo' );
	}
}
let sub = new TestSub();
sub.foo(); 
// instance super.foo
// instance sub.foo
TestSub.foo();
// super.foo
// sub.foo