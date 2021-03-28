const target = {
	id: 'target'
};

const handler = {}; // 处理程序对象

// 创建空代理
// 除了作为一个抽象的目标对象，什么也不做
const proxy = new Proxy(target, handler);

// 在目标对象和代理对象上获取属性值
console.log( target.id ); // target
console.log( proxy.id ); // target

// 给目标对象的属性赋值
target.id = 'foo';
console.log( target.id ); // foo
console.log( proxy.id ); // foo

// 给代理对象的属性赋值
proxy.id = 'bar';
console.log( target.id ); // bar
console.log( proxy.id ); // bar

// hasOwnProperty()在两个地方都会应用到目标对象
console.log( target.hasOwnProperty('id') ); // true
console.log( proxy.hasOwnProperty('id') ); // true

// console.log( target instanceof Proxy ); // TypeError: Function has non-object prototype 'undefined' in instanceof check
// console.log( proxy instanceof Proxy ); // TypeError: Function has non-object prototype 'undefined' in instanceof check
console.log( Proxy.prototype ); // undefined

console.log( target === proxy ); // false

const p1 = Object.create( proxy );
console.log( p1.__proto__ === proxy ); // true

/*
 trap 捕获器
 基本操作的拦截器
*/
const target1 = {
	foo: 'bar'
};

const handler1 = {
	// 捕获器在处理程序对象中以方法名为键
	get() { // 对应属性的[[Get]]操作
		return 'handler override';
	}
};

const proxy1 = new Proxy(target1, handler1);
console.log( proxy1.foo );
console.log( proxy1['foo'] );
console.log( Object.create(proxy1)['foo'] );
// handler override
// handler override
// handler override
console.log( target1.foo );
console.log( target1['foo'] );
console.log( Object.create(target1)['foo'] );
// bar
// bar
// bar

/*
 捕获器参数和反射API
*/
const handler2 = {
	// 所有捕获器都可以基于自己的参数“重建”原始操作
	// 可通过调用全局Reflect对象上的同名方法（封装了原始行为）来重建
	get(trapTarget, property, receiver) {
		console.log( trapTarget === target1 );
		console.log( property );
		console.log( receiver === proxy2 );
		// return trapTarget[property];
	}
};
const proxy2 = new Proxy(target1, handler2);
proxy2.foo;
// true
// foo
// true

const handler3 = {
	// get() {
	// 	return Reflect.get( ...arguments );
	// }
	get: Reflect.get
};
const proxy3 = new Proxy(target1, handler3);
console.log( proxy3.foo ); // bar

const proxy4 = new Proxy(target1, Reflect);
console.log( proxy4.foo ); // bar

/*
 反射API准备好了样板代码，开发者可在此基础上修改捕获的方法
*/
const target2 = {
	foo: 'bar',
	baz: 'qux'
};
const handler5 = {
	get(trapTarget, property, receiver) {
		let decoration = '';
		if(property === 'foo') {
			decoration = '!!!';
		}
		return Reflect.get(...arguments) + decoration;
	}
};
const proxy5 = new Proxy(target2, handler5);
console.log( proxy5.foo );
console.log( proxy5.baz );
// bar!!!
// qux
console.log( target2.foo );
console.log( target2.baz );
// bar
// qux

/*
 捕获器不变式： 防止捕获器定义出现过于反常的行为
*/
const target3 = {};
Object.defineProperty(target3, 'foo', {
	value: 'bar',
	writable: false,
	configurable: false
});
const handler6 = {
	get() {
		return 'qux';
	}
};
const proxy6 = new Proxy(target3, handler6);
// console.log( proxy6.foo );
// TypeError: 'get' on proxy: property 'foo' is a read-only and non-configurable data property on the proxy target but the proxy did not return its actual value (expected 'bar' but got 'qux')

/*
 创建可撤销的代理
*/
target3.baz = 'qux';
const handler7 = {
	get() {
		return 'intercepted';
	}
};
const { proxy: proxy7, revoke } = Proxy.revocable(target3, handler7);
console.log( 'proxy7', proxy7.baz ); // proxy7 intercepted
console.log( target3.baz ); // qux
revoke();
// console.log( proxy7.baz ); // TypeError: Cannot perform 'get' on a proxy that has been revoked


/*
 Reflect API
*/
// 1.状态标记    意图执行的操作是否成功
const o = {};
try {
	Object.defineProperty( o, 'foo', 'bar' );
	console.log( 'success' );
} catch(e) {
	console.log( 'failure' );
}
// failure

/*if(Reflect.defineProperty( o, 'foo', 'bar')) {
	console.log( 'success' );
} else {
	console.log( 'failure' );
}*/
// TypeError: Property description must be an object: bar

Object.defineProperty( o, 'foo', {
	value: 'bar',
	writable: false,
	configurable: false
} );
if(Reflect.defineProperty( o, 'foo', { value: 'bar' })) {
	console.log( 'success' );
} else {
	console.log( 'failure' );
} // success

if(Reflect.defineProperty( o, 'foo', { value: 'bar11' })) {
	console.log( 'success' );
} else {
	console.log( 'failure' );
} // failure

console.log( Reflect.get( o, 'foo' ) ); // bar    相当于o.foo


function TestReflect() {}
const tr = Reflect.construct(TestReflect, []);
console.log( tr instanceof TestReflect ); // true


/*
 在一个目标对象之上构建多层拦截网
*/
const firstProxy = new Proxy(target, {
	get() {
		console.log( 'first proxy' );
		return Reflect.get( ...arguments );
	}
});
const secondProxy = new Proxy(firstProxy, {
	get() {
		console.log( 'second proxy' );
		return Reflect.get( ...arguments );
	}
});
console.log( secondProxy.id );
// second proxy
// first proxy
// bar


/*
 代理中存在的问题
 this的指向
*/
const target4 = {
	thisValEqualsProxy() {
		return this === proxy8;
	}
};
const proxy8 = new Proxy(target4, {});
console.log( target4.thisValEqualsProxy() ); // false
console.log( proxy8.thisValEqualsProxy() ); // true

// 目标对象依赖于对象标识的情况
const wm = new WeakMap();
class User {
	constructor(userId) {
		wm.set(this, userId);
	}
	set id(userId) {
		wm.set(this, userId);
	}
	get id() {
		return wm.get(this);
	}
}
const user = new User(123);
console.log( user.id ); // 123
const userInstanceProxy = new Proxy(user, Reflect);
console.log( userInstanceProxy.id ); // undefined

// 把代理User实例改为代理User类本身
const UserClassProxy = new Proxy(User, Reflect);
const proxyUser = new UserClassProxy(456);
console.log( proxyUser.id ); // 456


const target5 = {
	obj: {
		a: 'lily'
	}
};
const handler8 = {
	get(target, property, receiver) {
		console.log( 'get()', property );
		return Reflect.get(...arguments);
	},
	set(target, property, value, receiver) {
		console.log( 'set()' );
		return Reflect.set(...arguments);
	}
};
const proxy9 = new Proxy(target5, handler8);
proxy9.obj.a;
proxy9.obj.a = 'lucy';

const target6 = new Date();
const proxy10 = new Proxy( target6, Reflect );
console.log( proxy10 instanceof Date ); // true
target6.getDate();
// 无内部槽位[[NumberDate]]，也无法通过普通的get()和set()操作访问到
proxy10.getDate(); // TypeError: this is not a Date object. 


