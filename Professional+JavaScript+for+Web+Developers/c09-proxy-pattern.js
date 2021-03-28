/*
 * 代理应用
*/


/*跟踪属性访问*/
const user = {
	name: 'Jake'
};
const proxy = new Proxy(user, {
	get(target, property, receiver) {
		console.log( `Getting ${property}` );
		return Reflect.get(...arguments);
	},
	set(target, property, value, receiver) {
		console.log( `Setting ${property}=${value}` );
		return Reflect.set(...arguments);
	}
});
proxy.name; // Getting name
proxy.age = 27; // Setting age=27


/*隐藏属性*/
const hiddenProperties = ['foo', 'bar'];
const targetObj = {
	foo: 1,
	bar: 2,
	baz: 3
};
const proxy1 = new Proxy(targetObj, {
	get(target, property, receiver) {
		if(hiddenProperties.includes(property)) {
			return undefined;
		} else {
			return Reflect.get(...arguments);
		}
	},
	has(target, property) {
		if(hiddenProperties.includes(property)) {
			return false;
		} else {
			return Reflect.has(...arguments);
		}
	}
});
console.log( proxy1.foo );
console.log( proxy1.bar );
console.log( proxy1.baz );
// undefined
// undefined
// 3
console.log( 'foo' in proxy1 );
console.log( 'bar' in proxy1 );
console.log( 'baz' in proxy1 );
// false
// false
// true

/*对属性赋值做判断限制*/
const target2 = {
	onlyNumbersGoHere: 0
};
const proxy2 = new Proxy(target2, {
	set(target, property, value, receiver) {
		if(typeof value !== 'number') {
			return false;
		} else {
			return Reflect.set(...arguments);
		}
	}
});
proxy2.onlyNumbersGoHere = 1;
console.log( proxy2.onlyNumbersGoHere ); // 1
proxy2.onlyNumbersGoHere = 's';
console.log( proxy2.onlyNumbersGoHere ); // 1

/*函数与构造函数参数验证*/
function median(...nums) {
	return nums.sort()[Math.floor(nums.length / 2)];
}
const proxy3 = new Proxy(median, {
	apply(target, thisArg, argumentsList) {
		console.log( argumentsList );
		for(const arg of argumentsList) {
			if(typeof arg !== 'number') {
				throw 'Non-number argument provided';
			}
		}
		return Reflect.apply(...arguments);
	}
});
console.log( proxy3(4, 7, 1) ); // 4
// console.log( proxy3(4, '7', 1) ); // Non-number argument provided

class User {
	constructor(id) {
		this.id_ = id;
	}
}
const proxy4 = new Proxy(User, {
	construct(target, argumentsList, newTarget) {
		if(argumentsList[0] === undefined) {
			throw 'User cannot be initiated without id';
		} else {
			return Reflect.construct(...arguments);
		}
	}
});
new proxy4(1);
// new proxy4(); // User cannot be initiated without id


/*数据绑定与可观察对象*/
const userList = [];

function emit(newValue) {
	console.log( newValue );
}

const proxy5 = new Proxy(User, {
	construct(target, argumentsList, newTarget) {
		const newUser = Reflect.construct(...arguments);
		// userList.push(newUser);
		proxy6.push(newUser);
		return newUser;
	}
});

const proxy6 = new Proxy(userList, {
	set(target, property, value, receiver) {
		const result = Reflect.set(...arguments);
		if(result) {
			emit(Reflect.get(target, property, receiver));
		}
		return result;
	}
});

new proxy5(1);
new proxy5(2);
new proxy5(3);

console.log( userList ); // [ User { id_: 1 }, User { id_: 2 }, User { id_: 3 } ]








