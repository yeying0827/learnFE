document.querySelector('#mouse').addEventListener('click', event => {
	console.log('mouse: click');
});
document.querySelector('#mouse').addEventListener('mousedown', event => {
	console.log('mouse: mousedown', event.button, event.detail);
	let keys = [];
	if(event.shiftKey) {
		keys.push("shift");
	}
	if(event.ctrlKey) {
		keys.push("ctrl");
	}
	if(event.altKey) {
		keys.push("alt");
	}
	if(event.metaKey) {
		keys.push("meta");
	}
	console.log(`Keys: ${keys.join(",")}`);
});
document.querySelector('#mouse').addEventListener('mouseup', event => {
	console.log('mouse: mouseup');
});
document.querySelector('#mouse').addEventListener('dblclick', event => {
	console.log('mouse: dblclick');
	alert('mouse: dblclick');
});
/*document.querySelector('#mouse').addEventListener('mouseover', event => {
	alert('mouse: mouseover');
	console.log('mouse: mouseover', event.relatedTarget);
});
document.querySelector('#mouse').addEventListener('mouseout', event => {
	console.log('mouse: mouseout', event.relatedTarget);
});*/
// mouse: mousedown
// mouse: mouseup
// mouse: click
// mouse: mousedown
// mouse: mouseup
// mouse: click
// mouse: dblclick

document.querySelector('#echoBtn').addEventListener('focusin', event => {
	console.log('echoBtn: foucusin');
});
document.querySelector('#echoBtn').addEventListener('focus', event => {
	console.log('echoBtn: foucus');
});
document.querySelector('#input').addEventListener('focusout', event => {
	console.log('input: foucusout');
});
document.querySelector('#input').addEventListener('blur', event => {
	console.log('input: blur');
});
document.querySelector('#input').addEventListener('keydown', event => {
	console.log('input: keydown', event.keyCode, event.charCode);
});
document.querySelector('#input').addEventListener('keyup', event => {
	console.log('input: keyup', event.keyCode, event.charCode);
});
document.querySelector('#input').addEventListener('keypress', event => {
	console.log('input: keypress', event.keyCode, event.charCode, String.fromCharCode(event.charCode));
	console.log(event.key, event.char);
	// console.log(event);
});
document.querySelector('#input').addEventListener('textInput', event => {
	console.log('input: textInput', event.data, event.inputMethod);
});
document.querySelector('#input').addEventListener('compositionstart', event => {
	console.log('input: compositionstart', event.data);
});
document.querySelector('#input').addEventListener('compositionupdate', event => {
	console.log('input: compositionupdate', event.data);
});
document.querySelector('#input').addEventListener('compositionend', event => {
	console.log('input: compositionend', event.data);
});
// input: blur
// input: foucusout
// echoBtn: foucus
// echoBtn: foucusin

document.querySelector('#container').addEventListener('click', event => {
	console.log(`Client coordinates: ${event.clientX}, ${event.clientY}`);
	console.log(`Page coordinates: ${event.pageX}, ${event.pageY}`);
	console.log(`Page coordinates: ${event.clientX + document.documentElement.scrollLeft}, ${event.clientY + document.documentElement.scrollTop}`);
	console.log(`Screen coordinates: ${event.screenX}, ${event.screenY}`);
});
document.addEventListener('mousewheel', event => {
	console.log(event.wheelDelta);
});