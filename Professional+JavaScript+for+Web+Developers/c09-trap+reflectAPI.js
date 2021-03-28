const myTarget = {
	*[Symbol.iterator]() {
		yield *[1,2,3];
	},
	t1: 't1'
};
const proxy = new Proxy(myTarget, {
	get(target, property, receiver) {
		console.log( 'get()' );
		return Reflect.get( ...arguments );
	}
});
proxy.foo; // get()
proxy[Symbol.iterator]; // get()
for (const item of myTarget) {
	console.log( item );
}
// 1
// 2
// 3
proxy['foo']; // get()
Object.create(proxy)['foo']; // get()
Reflect.get(proxy, 'foo'); // get()

/*function Test() {}
Test.prototype[Symbol.iterator] = function* () {
	yield *[1,2,3];
};
for (const item of new Test()) {
	console.log( item );
}*/
// 1
// 2
// 3

Object.defineProperty(myTarget, 'foo', {
	value: 'foo',
	writable: false,
	configurable: false
});
Object.defineProperty(myTarget, 'bar', {
	set: value => {
		console.log( 'set bar' );
		return value;
	},
	configurable: false
});
Object.defineProperty(myTarget, 'baz', {
	set: value => {
		this.baz_ = value;
	},
	get: () => {
		return this.baz_;
	}
});
const proxy1 = new Proxy(myTarget, {
	get(target, property, receiver) {
		// console.log(property, receiver === proxy1);
		return 'foo1';
	},
	set(target, property, value, receiver) {
		console.log( 'set()' );
		return Reflect.set(...arguments);
	},
	has(target, property) {
		console.log( 'has()' );
		return Reflect.has(...arguments);
	},
	defineProperty(target, property, descriptor) {
		console.log( 'defineProperty()' );
		return Reflect.defineProperty(...arguments);
	},
	ownKeys(target) {
		console.log( 'ownKeys()' );
		return Reflect.ownKeys(...arguments);
	}
});
// proxy1.foo; // TypeError: 'get' on proxy: property 'foo' is a read-only and non-configurable data property on the proxy target but the proxy did not return its actual value (expected 'foo' but got 'foo1')
// proxy1.bar; // TypeError: 'get' on proxy: property 'bar' is a non-configurable accessor property on the proxy target and does not have a getter function, but the trap did not return 'undefined' (got 'foo1')

proxy1.bar = 'bar';
// set()
// set bar
Reflect.set(proxy1, 'bar', 'bar1');
// set()
// set bar
proxy1.baz = 'bazzz'; // set()
console.log( proxy1.baz ); // foo1

'foo' in proxy1; // has()
// for(const key in proxy1) { console.log( key ); }
with(proxy1) {
	(baz);
}
// has()
Reflect.has(proxy1, 'baz'); // has()
'foo' in Object.create(proxy1); // has()

let obj = Object.create(proxy1);
console.log( obj ); // Object [foo1] {}
// console.log( obj.bar ); // TypeError: 'get' on proxy: property 'bar' is a non-configurable accessor property on the proxy target and does not have a getter function, but the trap did not return 'undefined' (got 'foo1')

//console.log( obj.baz );
//// defineProperty
// Object.defineProperty( proxy1, 'foo', { value: 'bar1' } ); // TypeError: 'defineProperty' on proxy: trap returned falsish for property 'foo'

Object.defineProperty( proxy1, 'foo1', { value: 'bar1' } );
// defineProperty()

/*Object.defineProperty( proxy1, 'bar', { value: 'bar1' } );*/
// defineProperty()
// TypeError: 'defineProperty' on proxy: trap returned falsish for property 'bar'

Object.defineProperty( proxy1, 't1', { value: 't2', configurable: false } );
// defineProperty()

/*Object.defineProperty( proxy1, 'baz', {
	value: 1,
	configurable: true
});*/
// defineProperty()
// TypeError: 'defineProperty' on proxy: trap returned falsish for property 'baz'

Object.defineProperty( myTarget, 't2', { 
	set: value => {
		this.baz_ = value;
	},
	get: () => {
		return this.baz_;
	},
	configurable: true
} );
Object.defineProperty( proxy1, 't2', {
	value: 1,
	configurable: true
});
console.log( Object.getOwnPropertyDescriptor( myTarget, 't2' ) );
// { value: 1, writable: false, enumerable: false, configurable: true }

console.log( Reflect.ownKeys( myTarget ) );
// [ 't1', 'foo', 'bar', 'baz', 'foo1', 't2', Symbol(Symbol.iterator) ]
console.log( Reflect.ownKeys( proxy1 ) );
// ownKeys()
// [ 't1', 'foo', 'bar', 'baz', 'foo1', 't2', Symbol(Symbol.iterator) ]
console.log( Object.keys( proxy1 ) );
// ownKeys()
// [ 't1' ]
console.log( Object.getOwnPropertyNames( proxy1 ) );
// ownKeys()
// [ 't1', 'foo', 'bar', 'baz', 'foo1', 't2' ]
console.log( Object.getOwnPropertySymbols( proxy1 ) );
// ownKeys()
// [ Symbol(Symbol.iterator) ]

const targetFunc = function() {};
const proxy2 = new Proxy(targetFunc, {
	construct(target, argumentsList, newTarget) {
		console.log( 'construct()' );
		return Reflect.construct(...arguments);
	}
})
new proxy2; // construct()