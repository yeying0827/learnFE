function buildUrl () {
	let qs = "?debug=true";

	with(location) {
		// let url = href + qs;
		var url = href + qs;
	}
	return url;
}

var color = 'blue';
function getColor() {
	let color = 'red';
	{
		let color = 'green';
		console.log( window.color );
	}
}
getColor();