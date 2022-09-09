export function bootstrap(props) {
	const {
		name,
		singleSpa,
		mountParcel,
		prop1
	} = props;
	console.log(name, singleSpa, mountParcel, prop1);
	return Promise
		.resolve()
		.then(() => {
			console.log('app1 bootstrapped!');
		});
};
export function mount(props) {
	return Promise
		.resolve()
		.then(() => {
			const ele = document.createElement('section');
			ele.id = 'yy/app1';
			ele.innerText = 'App1 mounted';
			document.body.append(ele);
		});
};
export function unmount(props) {
	return Promise
		.resolve()
		.then(() => {
			console.log('app1 unmounted!');
		});
};

export const AddContactParcel = {
	// 初始化
	bootstrap() {
		return Promise.resolve('contact parcel bootstrapped!');
	},
	// 使用某个框架来创建和初始化dom
	mount(props) {
		console.log('contact parcel props', props);
		return Promise.resolve('contact parcel mounted!');
	},
	// 使用某个框架卸载dom，做其他的清理工作
	unmount() {
		return Promise.resolve().then(() => {
			console.log('contact parcel unmounted!');
		});
	},
	update(customProps) {
		console.log(customProps);
		return Promise.resolve();
	}
};
