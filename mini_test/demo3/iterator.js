let array = [1, 2, 3, 4, 5];
// console.log('for循环');
// for (let i = 0; i < array.length; i ++) {
// 	console.log(array[i]);
// }

// console.log('手动遍历');
// console.log(array[0]);
// console.log(array[1]);
// console.log(array[2]);
// console.log(array[3]);
// console.log(array[4]);

// console.log('while循环');
// let count = 0;
// while(count < array.length) {
// 	console.log(array[count ++]);
// }






/// 迭代器实现
// [Symbol.iterator]()
class Counter {
	constructor(limit) {
		this.limit = limit;
	}

	[Symbol.iterator]() {
		let count = 1,
		 o = this;
		return { // 迭代器
			next() {
				if (count <= o.limit) {
					return {
						done: false,
						value: count ++
					}
				} else {
					return {
						done: true
					}
				}
			},
			return() {
				console.log('Exiting ...');
				return {
					done: true
				}
			}
		}
	}
}

let counter1 = new Counter(5); // 可迭代对象
// for(let i of counter1) {
// 	if (i > 2) {
// 		break;
// 	}
// 	console.log(i);
// }
// 相当于
// const iterator = counter1[Symbol.iterator]();
// let result = {done:  false};
// while(!result.done) {
// 	result = iterator.next();
// 	if (result.value > 2) {
// 		result = iterator.return();
// 		break;
// 	}
// 	console.log(result.value);
// }


// 内置可迭代对象的默认迭代器接口
class buildInIteratable {
	// ...
	[Symbol.iterator]() {
		return {
			next() {
				// ...
			},
			return() {
				// ...
			},
			[Symbol.iterator]() {
				return this;
			}
		}
	}
}

// Generator
function *generator() {
	console.log('step 1');
	yield 'foo';
	console.log('step 2');
	yield 'bar';
	console.log('step 3');
	return 'baz';
	// console.log('step 4');
}
// let g1 = generator(); // 生成一个迭代器
// console.log(g1.next());
// console.log(g1.next());
// console.log(g1.next());
// // console.log(g1.next());

g1 = generator();
for(const x of g1) {
	console.log(x);
}


