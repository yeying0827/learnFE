class Node {
	constructor(id) {
		this.id = id;
		this.neighbors = new Set();
	}

	connect(node) {
		if (node !== this) {
			this.neighbors.add( node );
			node.neighbors.add( this );
		}
	}
}

class RandomGraph {
	constructor(size) {
		this.nodes = new Set();

		for (let i = 0; i< size; ++ i) {
			this.nodes.add( new Node(i) );
		}

		const threshold = 1 / size;
		for (const x of this.nodes) {
			for (const y of this.nodes) {
				if (Math.random() < threshold) {
					x.connect( y );
				}
			}
		}
	}

	print() {
		for (const node of this.nodes) {
			const ids = [...node.neighbors].map(n => n.id).join(',');

			console.log( `${node.id}: ${ids}` );
		}
	}

	// 整张图是否连通
	isConnected() {
		const visitedNodes = new Set();

		function *traverse(nodes) {
			for (const node of nodes) {
				if (!visitedNodes.has(node)) {
					yield node;
					yield* traverse(node.neighbors);
				}
			}
		}
		// 取得集合中的第一个节点
		const firstNode = this.nodes[Symbol.iterator]().next().value;
		// 使用递归生成器迭代每个节点
		for (const node of traverse([firstNode])) {
			visitedNodes.add(node);
		}
		// function traverse(nodes) {
		// 	for (const node of nodes) {
		// 		if (!visitedNodes.has(node)) {
		// 			visitedNodes.add(node);
		// 			traverse(node.neighbors);
		// 		}
		// 	}
		// }

		return visitedNodes.size === this.nodes.size;
	}
}

const g = new RandomGraph(6);
g.print();
// 0: 1,2
// 1: 0,5
// 2: 0
// 3: 
// 4: 5
// 5: 1,4
console.log( g.isConnected() );

console.log( '实现输入输出1===========' )
function *generatorFn(initial) {
	// console.log( initial );
	console.log( yield 1 );
	console.log( yield 2 );
	return yield 3;
}
let genObj = generatorFn('foo');
console.log( genObj.next('bar') );
console.log( genObj.next('baz') );
console.log( genObj.next('qux') ); 
console.log( genObj.next() );
// { value: 1, done: false }
// baz
// { value: 2, done: false }
// qux
// { value: 3, done: false }
// { value: undefined, done: true }

console.log( '实现输入输出2===========' )
function *generatorFn2() {
	return yield 'foo';
}
let genObj2 = generatorFn2();
console.log( genObj2.next() );
console.log( genObj2.next('bar') );
console.log( genObj2.next('test') );
// { value: 'foo', done: false }
// { value: 'bar', done: true } // 相当于给done的时候的value赋值？
// { value: undefined, done: true }
for (const x of generatorFn2()) {
	console.log( x );
}
// foo

function* zeroes(n) {
	while(n--) {
		yield 0;
	}
}
console.log( Array.from(zeroes(8)) );

function *innerGeneratorFn() {
	yield 'foo';
	return 'bar';
}
function *outerGeneratorFn() {
	console.log('iter value: ', yield* innerGeneratorFn());
}
for(const x of outerGeneratorFn()) {
	console.log( 'value: ', x );
}
// value:  foo
// iter value:  bar
for(const x of innerGeneratorFn()) {
	console.log( x );
}
// foo

class Foo {
	constructor() {
		this.values = [1, 2, 3];
	}
	* [Symbol.iterator]() {
		yield* this.values;
	}
	// [Symbol.iterator]() {
	// 	let i = 0, len = this.values.length, o = this;
	// 	return {
	// 		next() {
	// 			return {
	// 				value: o.values[i++],
	// 				done: i > len
	// 			}
	// 		}
	// 	}
	// }
}
const f = new Foo();
for(const x of f) {
	console.log( x );
}
// 1
// 2
// 3