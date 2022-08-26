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
			console.log('app2 bootstrapped!');
		});
};
export function mount(props) {
	const {
		mountParcel
	} = props;
	return Promise
		.resolve()
		.then(() => {
			console.log('app2 mounted!');
			import('./app1').then(app1 => {
				const domElement = document.getElementById('my-parcel');
				const parcel = mountParcel(app1.AddContactParcel, { domElement });
				// parcel被挂载，在mountPromise中完成挂载
				parcel.mountPromise.then(() => {
				  console.log('finished mounting contact parcel!');
				  // 重新渲染parcel，调用update生命周期方法
				  domElement.innerHTML = 'Contact Parcel';
				  parcel.update({ domElement });
				});
			});
		});
};
export function unmount(props) {
	return Promise
		.resolve()
		.then(() => {
			console.log('app2 unmounted!');
		});
};