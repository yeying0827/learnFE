/* Test if normal arrays can use .raw property 
	can't. --- they don't have .raw property
*/
function printRaw(strings) {
	console.log( 'Actual characters:' );
	for (const string of strings) {
		console.log( string );
	}

	console.log( 'Escaped characters:' );
	console.log( strings );
	for (const rawString of strings.raw) {
		console.log( rawString );
	}
}
printRaw`\u00A9${ 'and' }\n`;
// Actual characters:
// ©
// (换行符)
// Escaped characters:
// \u00A9
// \n

// for (const rawString of ['\u00A9', '\n']) {
// 	console.log( rawString );
// }

/* Test type Symbol
*/
let fooGlobalSymbol = Symbol.for( 'foo' );
let otherGlobalSymbol = Symbol.for( 'foo' );
console.log( fooGlobalSymbol === otherGlobalSymbol ); // true
console.log( Symbol.keyFor( fooGlobalSymbol ) ); // foo

// Symbol.asyncIterator  Symbol.iterator
class Foo {
	async *[Symbol.asyncIterator]() {}
}
let f = new Foo();
console.log( f[Symbol.asyncIterator]() ); // Node: Object [AsyncGenerator] {}  Browser: AsyncGenerator {<suspended>}
console.log( f[Symbol.asyncIterator]().next() ); // Promise { { value: undefined, done: true } }

class Emitter {
	constructor(max) {
		this.max = max;
		this.asyncIdx = 0;
		this.idx = 0;
	}
	async *[Symbol.asyncIterator]() {
		while(this.asyncIdx < this.max) {
			yield new Promise(resolve => resolve(this.asyncIdx ++));
		}
	}
	*[Symbol.iterator]() {
		while(this.idx < this.max) {
			yield this.idx ++;
		}
	}
}
async function asyncCount() {
	let emmitter = new Emitter(5);
	console.log( emmitter instanceof Emitter ); // true
	console.log( Emitter[Symbol.hasInstance](emmitter) ); // true

	for (const x of emmitter) {
		console.log( x );
	}
	for await (const x of emmitter) {
		console.log( x );
	}
}
asyncCount();
// 0
// 1
// 2
// 3
// 4

// 0
// 1
// 2
// 3
// 4

// Symbol.isConcatSpreadable
let inital = ['foo'];

let array = ['bar'];
console.log( array[Symbol.isConcatSpreadable] ); // undefined
console.log( inital.concat(array) ); // [ 'foo', 'bar' ]
array[Symbol.isConcatSpreadable] = false;
console.log( inital.concat(array) ); // [ 'foo', [ 'bar', [Symbol(Symbol.isConcatSpreadable)]: false ] ]
// array[Symbol.isConcatSpreadable] = true;
// console.log( inital.concat(array) );

let arrayLikeObject = { length: 1, 0: 'baz' };
console.log( arrayLikeObject[Symbol.isConcatSpreadable] ); // undefined
console.log( inital.concat(arrayLikeObject) ); // [ 'foo', { '0': 'baz', length: 1 } ]
arrayLikeObject[Symbol.isConcatSpreadable] = true;
console.log( inital.concat(arrayLikeObject) ); // [ 'foo', 'baz' ]

let otherObject = new Set().add('qux');
console.log( otherObject[Symbol.isConcatSpreadable] ); // undefined
console.log( inital.concat(otherObject) ); // [ 'foo', Set(1) { 'qux' } ]
otherObject[Symbol.isConcatSpreadable] = true;
console.log( inital.concat(otherObject) ); // [ 'foo' ]

// Symbol.match Symbol.replace Symbol.search Symbol.split
console.log( RegExp.prototype[Symbol.match] );
console.log( RegExp.prototype[Symbol.replace] );
console.log( RegExp.prototype[Symbol.search] );
// [Function: [Symbol.match]]
// [Function: [Symbol.replace]]
// [Function: [Symbol.search]]
console.log( 'foobar'.match( /bar/ ) ); // [ 'bar', index: 3, input: 'foobar', groups: undefined ]
console.log( 'bazfoobar'.split( /foo/ ) ); //  ["baz", "bar"]
class FooMatcher {
	static [Symbol.match](target) {
		console.log( target );
		return target.includes('foo');
	}
}
console.log( 'foobar'.match( FooMatcher ) ); // true
console.log( 'bazbar'.match( FooMatcher ) ); // false

// Symbol.species
class Baz extends Array {
	static get [Symbol.species]() {
		return Array;
	}
}
let baz = new Baz();
console.log( baz instanceof Baz ); // true
console.log( baz instanceof Array ); // true
baz = baz.concat('baz');
console.log( baz instanceof Baz ); // false
console.log( baz instanceof Array ); // true

// Symbol.toPrimitive Symbol.toStringTag
class Bar {
	constructor() {
		this[Symbol.toStringTag] = 'Bar';
	}
	[Symbol.toPrimitive](hint) {
		switch (hint) {
			case 'number': return 3;
			case 'string': return 'string bar';
			case 'default':
			default: return 'default bar';
		}
	}
}
let bar = new Bar();
console.log( 3 + bar ); // 3default bar
console.log( 3 - bar ); // 0
console.log( String(bar) ); // string bar
console.log( bar );
console.log( bar.toString() );
console.log( bar[Symbol.toStringTag] );

// Symbol.unscopables
let o = { foo: 'foo', bar: 'bar' };
with( o ) {
	console.log( foo ); // foo
	console.log( bar ); // bar
}
o[Symbol.unscopables] = {
	foo: true
};
with( o ) {
	console.log( bar ); // bar
	console.log( foo ); // ReferenceError: foo is not defined
}