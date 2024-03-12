
function compare(value1, value2) {
	if(value1 < value2) {
		return -1;
	} else if (value1 > value2) {
		return 1;
	} else {
		return 0;
	}
	// [[Scope]]
}
// let result = compare(5, 10);

setTimeout(() => console.log(2), 1000);






// 访问函数的“私有”变量
let result;

function foo() {
	let person = {
		name: '小王',
	}

	result = person;
}

function bar() {
	console.log(result);
}

// 实现对象属性私有化
let doctor = {
	name: 'Dr. Lee',
	age: 30,
};
console.log(doctor.name);
console.log(doctor.age);

function getDoctor() {
	let name = 'Dr. Lee';
	let age = 30;

	return {
		get age() {
			return '隐私数据';
		},
		get name() {
			return name;
		}
	}
}
const doctor2 = getDoctor();
console.log(doctor2.name);
console.log(doctor2.age);

// 函数之间通信
function baz() {
	result.name = '小张';
}

foo();
bar();
baz();
bar();