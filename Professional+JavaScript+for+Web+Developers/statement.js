let num = 0;

outermost: 
for (let i = 0; i < 10; i ++) {
	for (let j = 0; j < 10; j ++) {
		if( i == 5 && j == 5 ) {
			break outermost;
		}
		num ++;
	}
}
console.log( num ); // 55

num = 0;
outermost1: 
for (let i = 0; i < 10; i ++) {
	for (let j = 0; j < 10; j ++) {
		if( i == 5 && j == 5 ) {
			continue outermost1;
		}
		num ++;
	}
}
console.log( num ); // 95

let a = {
	name: "lily",
	age: 12,
	class: 'a',
	b: 2
};
with(a) {
	let b = "2";
	console.log(b + age); // 212
}

num = 25;
switch(true) {
	case num < 0:
		console.log( 'less than 0.' );
		break;
	case num >= 0 && num <= 10:
		console.log( 'between 0 and 10.' );
		break;
	case num > 10 && num <=20:
		console.log( 'between 10 and 20.' );
		break;
	default:
		console.log( 'Moren than 20.' );
}
// Moren than 20.

function add(a, a) {
	console.log( a + a );
	console.log( arguments );
}
add( num, 2 ); // 4