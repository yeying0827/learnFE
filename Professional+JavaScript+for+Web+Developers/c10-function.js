/*
 c10 函数
*/
/**/
// "use strict";
/* 实例化函数对象的方式 */
// 函数声明
function sum1 (num1, num2) {
	return num1 + num2;
}
console.log(sum1(1,2)); // 3
// 函数表达式
let sum2 = function (num1, num2) {
	return num1 + num2;
};
console.log(sum2(1,2)); // 3
// 箭头函数
let sum3 = (num1, num2) => {
	return num1 + num2;
};
console.log(sum3(1,2)); // 3
// 使用Function构造函数
let sum4 = new Function("num1", "num2", "num3", "return num1 + num2 + num3");
console.log(sum4(1, 2, 5)); // 8

let multiply = (a, b) => a * b;
console.log(multiply(3, 2)); // 6
console.log(multiply.prototype); // undefined
console.log(multiply.name); // multiply
// new multiply(3, 2); // TypeError: multiply is not a constructor

// 赋值函数表达式给变量后，获取变量的name属性
// 如果是匿名函数，输出变量名
// 如果是具名函数，输出函数名
console.log(sum2.name); // sum2
let sum22 = function sum23(num1, num2) {
	return num1 + num2;
};
/*let sum24 = sum22;
console.log('24', sum24.name); // sum23
sum24 = sum2;
sum2 = null;console.log(sum24);
console.log('24', sum24.name); // sum2*/
console.log(sum22.name); // sum23
// sum23(2, 3); // ReferenceError: sum23 is not defined

console.log(sum4.name); // anonymous
console.log((() => {}).name); // ''
console.log((new Function()).name); // anonymous



/* 关于参数 */
function sayHi(name, message) {
	console.log( arguments );
	console.log("Hello " + name + ", " + message);
}
sayHi('lily', 'welcome');
// Arguments(2) ["lily", "welcome", callee: ƒ, Symbol(Symbol.iterator): ƒ]
	// 	0: "lily"
	// 	1: "welcome"
	// 	callee: ƒ sayHi(name, message)
	// 	length: 2
	// 	Symbol(Symbol.iterator): ƒ values()
	// 	__proto__: Object
// Hello lily, welcome

function doAdd (num1, num2) {
	arguments[1] = 10;
	console.log( num2, arguments[0] + num2 );
}
doAdd(2, 3); // 10 12
doAdd(2); // undefined NaN
function doAdd2 (num1, num2) {
	num2 = 10;
	console.log( arguments[1] );
	// arguments = { "0": 1, "1": 2, length: 2 };
}
doAdd2(2, 3); // 10

// 没有重载，定义两个同名函数只会覆盖
function addSomeNumber(num) {
	return num + 100;
}
function addSomeNumber(num, num1) {
	return num + 200;
}
let result = addSomeNumber(100);
console.log(result); // 300

let romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI'];
let ordinary = 0;
function getNumerals() {
	return romanNumerals[ordinary++];
}
function makeKing(name = 'Henry', numerals = getNumerals()) {
	return `King ${name} ${numerals}`;
}
console.log(makeKing()); // King Henry I
console.log(makeKing('Louis', 'XVI')); // King Louis XVI
console.log(makeKing()); // King Henry II

function makeKing2(name = 'Henry', numerals = name) {
	return `King ${name} ${numerals}`;
}
console.log(makeKing2()); // King Henry Henry

// （调用时）扩展参数
let values = [1, 2, 3, 4];
function getSum() {
	// console.log( 'arguments.length', arguments.length );
	let sum = 0;
	for(let i = 0; i < arguments.length; ++ i) {
		sum += arguments[i];
	}
	return sum;
}
console.log(getSum.apply(null, values)); // 10
console.log(getSum(...values)); // 10
console.log(getSum(-1, ...values)); // 9

function getProduct(a, b, c = 1) {
	return a * b *c;
}
let getSum2 = (a, b, c = 0) => {
	return a + b + c;
}
console.log(getProduct(...[1, 2])); // 2
console.log(getProduct(...[1, 2, 3])); // 6
console.log(getProduct(...[1, 2, 3, 4])); // 6

console.log(getSum2(...[0 ,1])); // 1
console.log(getSum2(...[0 ,1, 2])); // 3
console.log(getSum2(...[0 ,1, 2, 3])); // 3

// (定义时）收集参数
function getSum3 (...values) {
	return values.reduce((x, y) => x + y, 0);
}
console.log( getSum3(1, 2, 3) ); // 6

function ignoreFirst(firstValue, ...values) {
	// console.log(arguments.length);
	console.log(values);
}
ignoreFirst(); // []
ignoreFirst(1); // []
ignoreFirst(1, 2); // [ 2 ]
ignoreFirst(1, 2, 3); // [ 2, 3 ]

let getSum4 = (...values) => values.reduce((x, y) => x + y, 0);
console.log( getSum4(1, 2, 3) ); // 6


/* 函数作为引用值 */
function callSomeFunction(someFunc, someArg) {
	return someFunc(someArg);
}
function add10(num) {
	return num + 10;
}
let result1 = callSomeFunction(add10, 10);
console.log(result1); // 20

function createComparisonFunction(propertyName) {
	return function (obj1, obj2) {
		let value1 = obj1[propertyName];
		let value2 = obj2[propertyName];
		if(value1 < value2) return -1;
		else if(value1 > value2) return 1;
		else return 0;
	}
}
let data = [
	{name: "Zachary", age: 28},
	{name: "Nicholas", age: 29}
];
data.sort(createComparisonFunction("name"));
console.log(data[0].name); // Nicholas
data.sort(createComparisonFunction("age"));
console.log(data[0].name); // Zachary


// 函数内部的特殊对象
function factorial(num) {
	if(num <= 1) return 1;
	else {
		return num * arguments.callee(num - 1);
	}
}
let trueFactorial = factorial;
factorial = function () {
	return 0;
}
console.log(trueFactorial(5)); // 120
console.log(factorial(5)); // 0
/*
在浏览器中运行
window.color = 'red';
let o = {
	color: 'blue'
};
let sayColor = () => console.log(this.color);
sayColor(); // red
o.sayColor = sayColor;
o.sayColor(); // red
*/

function outer() {
	inner();
}
function inner() {
	// "use strict";
	// TypeError: 'caller', 'callee', and 'arguments' properties may not be accessed on strict mode functions or the arguments objects for calls to them
	console.log(inner.caller);
	console.log(arguments.callee.caller);
	console.log(arguments.caller); // undefined
}
outer();
// [Function: outer]
// [Function: outer]

function King() {
	if(!new.target) {
		throw  'King must be instantiated using "new"';
	}
	console.log('King instantiated using "new"');
}
new King(); // King instantiated using "new"
// King(); // throw  'King must be instantiated using "new"';

function sum5(num1, num2) {
	return num1 + num2;
}
function callSum1(num1, num2) {
	return sum5.apply(this, arguments);
}
function callSum2(num1, num2) {
	return sum5.apply(this, [num1, num2]);
}
function callSum(num1, num2) {
	// return sum5.call(this, num1, num2);
	return sum5.call(this, ...arguments);
}
console.log(callSum1(10, 10)); // 20
console.log(callSum2(10, 10)); // 20
console.log(callSum(10, 10)); // 20
/*
在浏览器中运行
window.color = 'red';
let o = {
	color: 'blue'
};
function sayColor() {
 console.log(this.color);
}
sayColor(); // red
sayColor.call(this); // red
sayColor.call(window); // red
sayColor.call(o); // blue
*/

let factorial2 = (function f(num) {
	if(num <= 1) return 1;
	else return num * f(num - 1);
});
console.log(factorial2(2)); // 2
let anotherFactorial = factorial2;
factorial2 = null;
console.log(anotherFactorial(3)); // 6
let obj = {
	num: 3,
	factorial: (function f(num) {
		if(num <= 1) return 1;
		else return num * f(num-1);
		// else return num * this.factorial(num-1); 两个写法都可以
	})
};
console.log(obj.factorial(3)); // 6

/*
* 在浏览器中运行
let divs = document.querySelectorAll('div');
let i;
for(i = 0; i < divs.length; ++ i) {
	divs[i].addEventListener('click', function () {
		console.log(i);
	});
}
* */

let testObj = {
	*[Symbol.iterator]() {
		yield 1;
		yield 2;
		yield 3;
	}
}
function testAdd(num1, num2) {
	console.log(arguments);
	return num1 + num2;
}
testAdd.apply(this, testObj);
