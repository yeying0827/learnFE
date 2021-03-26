let o = {
	b: 'test B'
};
// Object.defineProperty(o, "name", {
// 	value: 0,
// 	get: function() {
// 		return 1;
// 	},
// 	set: function(val) {
// 		this.name = val;
// 	},
// 	writable: true
// });
// console.log( Object.getOwnPropertyDescriptor(o, "name") );
// TypeError: Invalid property descriptor. Cannot both specify accessors and a value or writable attribute

Object.defineProperty(o, "name", {
	get: function() {
		return this.b;
	},
	set: function(val) {
		this.name = val;
	}
});
console.log( Object.getOwnPropertyDescriptor(o, "name") );
// {
//   get: [Function: get],
//   set: [Function: set],
//   enumerable: false,
//   configurable: false
// }
console.log( Object.getOwnPropertyDescriptor(o, "name").value ); // undefined
console.log( Object.getOwnPropertyDescriptor(o, "b") );
// {
//   value: 'test B',
//   writable: true,
//   enumerable: true,
//   configurable: true
// }
console.log( Object.getOwnPropertyDescriptors(o) );
// {
//   b: {
//     value: 'test B',
//     writable: true,
//     enumerable: true,
//     configurable: true
//   },
//   name: {
//     get: [Function: get],
//     set: [Function: set],
//     enumerable: false,
//     configurable: false
//   }
// }

let dest, src, result;
// 1.目标对象只有同名的set，混入源对象的同名get
// 会先执行源对象的get获取值，把值传递给目标对象的set并执行。
// 无法通过目标对象获取值（目标对象无get）
dest = {
	set a(val) {
		console.log( `Invoked dest setter with param ${val}` );
	}
};
src = {
	get a() {
		console.log( 'Invoked src getter' );return 1;
	}
};
Object.assign( dest, src );
console.log( dest );
// Invoked src getter
// Invoked dest setter with param undefined
// { a: [Setter] }

// 2.目标对象只有同名的get，混入源对象的同名set会报错
// Object.assign( src, dest );
// TypeError: Cannot set property a of #<Object> which has only a getter

// 3.目标对象有get和set，混入的源对象只有同名set
// 会先执行源对象的get获取值(undefined)，执行目标对象的set
src = {
	get a() {
		console.log( 'Invoked src getter' );
		return 1;
	},
	set a(val) {
		console.log( `Invoked src setter with param ${val}` );
	}
};
Object.assign( src, dest ); // Invoked src setter with param undefined
console.log( 'src', src ); // src { a: [Getter/Setter] }
console.log( 'src.a', src.a );
// Invoked src getter
// src.a 1

// 4.目标和源都只有get
dest = {
	get a() {
		console.log( 'dest' );
	}
};
src = {
	get a() {
		console.log( 'src' );
	}
};
// Object.assign( dest, src ); // TypeError: Cannot set property a of #<Object> which has only a getter

// 通过setter观察覆盖的过程
dest = {
	set id(x) {
		console.log( x );
	}
};
Object.assign(dest, { id: 1 }, { id: 2 }, { id: 3 });
// 1
// 2
// 3

dest = {};
src = {
	a: 'foo',
	get b() {
		throw new Error();
	},
	c: 'bar'
};
try{ 
	Object.assign( dest, src );
} catch(e) {}
console.log( dest ); // { a: 'foo' }

let nameKey="name";
// let o2 = {
//     [nameKey]: "lily",
//     [ageKey]: 12
// }; 
// ReferenceError: ageKey is not defined
let o2;
try{
	o2 = {
	    [nameKey]: "lily",
	    [ageKey]: 12
	};
} catch(e) {} 
console.log( o2 ); // undefined
o2 = {
	[nameKey]: "lily",
};
console.log( o2 ); // { name: 'lily' }

let person = {
	name: 'aa',
	age: 27
};
let { name, age } = person;
console.log( name, age ); // aa 27
let { name: nameValue, age: ageValue } = person;
console.log( nameValue, ageValue ); // aa 27
/*
let { job } = person;
// 相当于
// let job;
// job = person.job;
console.log( job ); // undefined
*/
let { job = 'OA' } = person;
// 相当于
// let job;
// job = person.job || 'OA';
console.log( job ) ;

let gender;
// { gender } = person; // SyntaxError: Unexpected token '='
({ gender } = person);
console.log( gender ); // undefined

let personName, personAge, personBar;
try {
	({name: personName, foo: {bar: personBar}, age: personAge} = person);
} catch(e) {}
console.log( personName, personBar, personAge ); // aa undefined undefined

function printPerson(foo, {name, age}, bar) {
	console.log( arguments );
	console.log( name, age );
}
function printPerson2(foo, {name: personName, age: personAge}, bar) {
	console.log( arguments );
	console.log( personName, personAge );
}
printPerson( "1st", person, '2nd' );
// [Arguments] { '0': '1st', '1': { name: 'aa', age: 27 }, '2': '2nd' }
// aa 27
printPerson2( "1st", person, '2nd' );
// [Arguments] { '0': '1st', '1': { name: 'aa', age: 27 }, '2': '2nd' }
// aa 27

function Foo() {}
Foo.prototype = {};
let f = new Foo();
console.log( f.contructor === Foo ); // false
console.log( f instanceof Foo ); // true

function Person(name, age, job) {
	this.name = name;
	this.age = age;
	this.job = job;
	this.sayName = new Function("console.log(this.name)");
}
let p1 = new Person("kk", 12, "farmer");
p1.sayName(); // kk


function Student() {}
Student.prototype = {
	name: 'class1',
	friends: [1, 2, 3]
};
let s1 = new Student();
let s2 = new Student();
s1.friends = [2, 3, 4];
console.log( s1.friends === s2.friends ); // false
console.log( s1.friends, s2.friends ); // [ 2, 3, 4 ] [ 1, 2, 3 ]

let k1 = Symbol('k1'), k2 = Symbol('k2');
let o1 = {
	1: 1,
	first: 'first',
	[k1]: 'k1',
	second: 'second',
	0: 0
};
o1[k2] = 'k2';
o1[3] = 3;
o1.third = 'third';
console.log( Object.getOwnPropertyNames( o1 ) );
// [ '0', '1', '3', 'first', 'second', 'third' ]
console.log( Object.getOwnPropertySymbols( o1 ) );
// [ Symbol(k1), Symbol(k2) ]
Object.assign( o1, { 2: 2 } );
console.log( Object.getOwnPropertyNames( o1 ) );
// [ '0', '1', '2', '3', 'first', 'second', 'third' ]