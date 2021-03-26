class Counter {
	constructor(limit) {
		this.limit = limit;
	}

	[Symbol.iterator]() {
		let count = 1,
			o = this;

		return {
			next() {
				if( count <= o.limit) {
					return {
						done: false,
						value: count++
					};
				} else {
					return {
						done: true
					};
				}
			},
			return() {
				console.log( 'Exiting early' );
				return {
					done: true
				};
			}
		}
	}
}

let counter1 = new Counter(5);
for (let i of counter1) {
	if(i > 2) {
		break;
	}
	console.log( i );
}
// 1
// 2
// Exiting early
let counter3 = new Counter(5);
let [a, b] = counter3;
console.log( a );
console.log( b );
// Exiting early
// 1
// 2

console.log( "//======= 数组的迭代器不能关闭" );
let a1 = [1, 2, 3, 4, 5];
let iter = a1[Symbol.iterator]();
for (let i of iter) {
	console.log( i );
	if(i > 2) {
		break;
	}
}
for (let i of iter) {
	console.log( i );
}
// 1
// 2
// 3
// 4
// 5

console.log( "//======= 生成器" );
function *generatorFn() {
	return 'foo';
}
let generatorObject = generatorFn();
console.log( generatorObject );
console.log( generatorObject.next() );
// Object [Generator] {}         generatorFn {<suspended>}
// { value: 'foo', done: true }  {value: "foo", done: true}
function *generatorFn2() {
	console.log( 'foobar' );
}
generatorObject = generatorFn2();
generatorObject.next(); // foobar
generatorObject.next();

function* generatorFn3() {
	yield 'foo';
	yield 'bar';
	return 'baz';
}
let g3 = generatorFn3();
console.log( g3.next() );
console.log( g3.next() );
console.log( g3.next() );
// { value: 'foo', done: false }
// { value: 'bar', done: false }
// { value: 'baz', done: true }
g3 = generatorFn3();
for(const x of g3) {
	console.log( x );
}
// foo
// bar
g3 = generatorFn2();
for(const x of g3) {
	console.log( x );
}
// foobar