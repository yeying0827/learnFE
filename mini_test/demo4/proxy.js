let a = {
	name: '番茄炒蛋'
}

const map = new Map([
	['番茄炒蛋', '🍅 + 🥚']
]);
let aProxy = new Proxy(a, {
	get: function (a, key) {
		const value = Reflect.get(a, key);
		return map.get(value);
	}
});
console.log(aProxy.name);
