export function bootstrap(props) {
	const {
		name,
		singleSpa,
		mountParcel,
		prop1
	} = props;
	return Promise
		.resolve()
		.then(() => {
			console.log('settings bootstrapped!');
		});
};
export function mount(props) {
	return Promise
		.resolve()
		.then(() => {
			console.log('settings mounted!');
		});
};
export function unmount(props) {
	return Promise
		.resolve()
		.then(() => {
			console.log('settings unmounted!');
		});
};