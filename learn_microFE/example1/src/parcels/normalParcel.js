import singleSpa from 'single-spa';

// 一个parcel的实现
export const parcelConfig = {
	// 初始化
	bootstrap() {
		return Promise.resolve();
	},
	// 使用某个框架来创建和初始化dom
	mount() {
		return Promise.resolve();
	},
	// 使用某个框架卸载dom，做其他的清理工作
	unmount() {
		return Promise.resolve().then(() => {
			console.log('normal parcel unmounted!');
		});
	},
	update(customProps) {
		console.log(customProps);
		return Promise.resolve();
	}
};

// 挂载parcel
const domElement = document.getElementById('place-in-dom-to-mount-parcel');
export const parcelProps = { domElement, customProp1: 'foo' };