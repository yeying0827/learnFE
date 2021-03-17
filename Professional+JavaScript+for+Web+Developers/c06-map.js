// Map
console.log( "========= Map =============" );
const m1 = new Map([
		["key1", "value1"],
		["key2", "value2"],
		["key3", "value3"]
	]);
console.log( m1 ); // Map(3) { 'key1' => 'value1', 'key2' => 'value2', 'key3' => 'value3' }
console.log( m1.size ); // 3

const m2 = new Map({
	[Symbol.iterator]: function *() {
		yield ["key1", "value1"];
		yield ["key2", "value2"];
		yield ["key3", "value3"];
	}
});
console.log( m2 ); // Map(3) { 'key1' => 'value1', 'key2' => 'value2', 'key3' => 'value3' }
console.log( m2.size ); // 3

const m = new Map();
console.log( m.has("firstName") ); // false
console.log( m.get("firstName") ); // undefined
console.log( m.size ); // 0

m.set( "firstName", "Matt" )
 .set( "lastName", "Frisble" );
console.log( m.has("firstName") ); // true
console.log( m.get("firstName") ); // Matt
console.log( m.size ); // 2

m.delete( "firstName" );
console.log( m.has("firstName") ); // false
console.log( m.get("firstName") ); // undefined
console.log( m.size ); // 1

m.clear();
console.log( m.has("firstName") ); // false
console.log( m.has("lastName") ); // false
console.log( m.size ); // 0

console.log( 'order=========' );
console.log( m.entries === m[Symbol.iterator] ); // true
for (let pair of m1.entries()) {
	console.log( pair );
}
// [ 'key1', 'value1' ]
// [ 'key2', 'value2' ]
// [ 'key3', 'value3' ]

for (let pair of m1) {
	console.log( pair );
}
// [ 'key1', 'value1' ]
// [ 'key2', 'value2' ]
// [ 'key3', 'value3' ]
console.log( ...m1 ); // [ 'key1', 'value1' ] [ 'key2', 'value2' ] [ 'key3', 'value3' ]
m1.forEach((value, key) => console.log( `${key}->${value}` ));
// key1->value1
// key2->value2
// key3->value3

console.log( 'WeakMap=========' );
const wm = new WeakMap();
class User {
	constructor(id) {
		this.idProperty = Symbol('id');
		this.setId(id);
		console.log( 'constructor' )
	}
	setId(id) {
		this.setPrivateProperty(this.idProperty, id);
	}
	setPrivateProperty(property, value) {
		const privateMembers = wm.get(this) || {};
		privateMembers[property] = value;
		if(!wm.get(this)) wm.set(this, privateMembers);
	}
	getId() {
		return this.getPrivateProperty(this.idProperty);
	}
	getPrivateProperty(property) {
		return wm.get(this)[property];
	}
}
const user = new User(123);
console.log( user.getId() ); // 123
user.setId(456);
console.log( user.getId() ); // 456
console.log( wm.get(user)[user.idProperty] ); // 456

const PackedUser = (()=> {
	const wm = new WeakMap();
	class PackedUser {
		constructor(id) {
			this.idProperty = Symbol('id');
			this.setId(id);
		}
		setId(id) {
			this.setPrivateProperty(this.idProperty, id);
		}
		setPrivateProperty(property, value) {
			const privateMembers = wm.get(this) || {};
			privateMembers[property] = value;
			if(!wm.get(this)) wm.set(this, privateMembers);
		}
		getId() {
			return this.getPrivateProperty(this.idProperty);
		}
		getPrivateProperty(property) {
			return wm.get(this)[property];
		}
	}
	return PackedUser;
})();
const packedUser = new PackedUser(123);
console.log( packedUser.getId() ); // 123
