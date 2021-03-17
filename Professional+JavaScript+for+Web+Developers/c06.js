const a = ["foo", "bar", "baz", "qux"];

const aKeys = a.keys(),
aValues = a.values(),
aEntries = a.entries();
console.log( a.values === a[Symbol.iterator] ); // true

console.log( Array.from(aKeys) ); // [ 0, 1, 2, 3 ]
console.log( Array.from(aValues) ); // [ 'foo', 'bar', 'baz', 'qux' ]
console.log( Array.from(aEntries) ); // [ [ 0, 'foo' ], [ 1, 'bar' ], [ 2, 'baz' ], [ 3, 'qux' ] ]

for(const [idx, element] of a.entries()) {
	console.log( idx, element );
}
// 0 foo
// 1 bar
// 2 baz
// 3 qux
for(const e of a) {
	console.log( e );
}

// Array 
// copyWithin
let ints,
	reset = () => ints = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
reset();

ints.copyWithin( 5 );
console.log( ints );
// [
//   0, 1, 2, 3, 4,
//   0, 1, 2, 3, 4
// ]
reset();

ints.copyWithin( 0, 5 );
console.log( ints );
// [
//   5, 6, 7, 8, 9,
//   5, 6, 7, 8, 9
// ]
reset();

ints.copyWithin( 4, 0, 3 );
console.log( ints );
// [
//   0, 1, 2, 3, 0,
//   1, 2, 7, 8, 9
// ]
reset();

ints.copyWithin( 2, 0, 6 );
console.log( ints );
// [
//   0, 1, 0, 1, 2,
//   3, 4, 5, 8, 9
// ]
reset();

ints.copyWithin( -4, -7, -5 );
console.log( ints );
// [
//   0, 1, 2, 3, 4,
//   5, 3, 4, 8, 9
// ]
reset();

// Array 
// empty
let a2 = [1, 2, undefined];
a2.length = 4;
a2[4] = null;
a2.forEach(item => console.log(item));
// 1
// 2
// undefined
// null
for(let i =0 ;i<a2.length;i++){
    console.log(a2[i]);
}
// 1
// 2
// undefined
// undefined
// null

function typedArrayConcat(typedArrayConstructor, ...typedArray) {
	const numElements = typedArray.reduce((x,y) => (x.length || x) + y.length);

	const resultArray = new typedArrayConstructor(numElements);

	let currentOffset = 0;
	typedArray.forEach(x => {
		resultArray.set(x, currentOffset);
		currentOffset += x.length;
	});

	return resultArray;
}
const concatArray = typedArrayConcat(Int32Array,
								Int8Array.of(1, 2, 3),
								Int16Array.of(4, 5, 6),
								Float32Array.of(7, 8, 9));
console.log( concatArray );
// Int32Array(9) [
//   1, 2, 3, 4, 5,
//   6, 7, 8, 9
// ]
console.log( concatArray instanceof Int32Array ); // true