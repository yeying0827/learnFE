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
			console.log('clients bootstrapped!');
		});
};
export function mount(props) {
	return Promise
		.resolve()
		.then(() => {
			console.log('clients mounted!');
		});
};
export function unmount(props) {
	return Promise
		.resolve()
		.then(() => {
			console.log('clients unmounted!');
		});
};