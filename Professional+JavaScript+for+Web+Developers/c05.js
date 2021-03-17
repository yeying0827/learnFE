let text = "mom and dad and baby";
let pattern = /mom( and dad( and baby)?)?/gi;

let matches = pattern.exec(text);
console.log( matches );
console.log( matches.index ); // 0
console.log( matches.input ); // mom and dad and baby
console.log( matches[0] ); // mom and dad and baby
console.log( matches[1] ); //  and dad and baby
console.log( matches[2] ); //  and baby
console.log( pattern.lastIndex ); // 20

let text2 = "mom";
// pattern.lastIndex = 0;
let matches2 = pattern.exec(text2);
console.log( matches2 ); // null
console.log( pattern.lastIndex ); // 0

let text3 = "mom and dad";
let matches3 = pattern.exec(text3);
console.log( matches3.input ); // mom and dad
console.log( pattern.lastIndex ); // 11


/// String replace
function htmlEscape (text) {
	return text.replace(/[<>"&]/g, function(match, pos, originalText) {
		switch(match) {
			case "<": return "&lt;";
			case ">": return "&gt;";
			case "&": return "&amp;";
			case "\"": return "&quot;";
		}
	});
}
console.log( htmlEscape("<p class=\"greeting\">Hello world!</p>") );
// &lt;p class=&quot;greeting&quot;&gt;Hello world!&lt;/p&gt;

// Global
// URL encode function
let uri = "http:// www.wrox.com/illegal value.js#start";
console.log( encodeURI(uri) ); // http://%20www.wrox.com/illegal%20value.js#start
console.log( encodeURIComponent(uri) ); // http%3A%2F%2F%20www.wrox.com%2Fillegal%20value.js%23start
console.log( decodeURI(encodeURIComponent(uri)) ); // http%3A%2F%2F www.wrox.com%2Fillegal value.js%23start
console.log( decodeURIComponent(encodeURIComponent(uri)) ); // http:// www.wrox.com/illegal value.js#start

// Math random
function selectFrom( minValue, maxValue ) {
	const choice = maxValue - minValue + 1;
	return Math.floor( Math.random() * choice + minValue );
}
selectFrom(2, 10);