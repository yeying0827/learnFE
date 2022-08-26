import { registerApplication, start, mountRootParcel } from "single-spa";
import { parcelConfig as normalParcel, parcelProps as normalParcelProps } from './parcels/normalParcel';

registerApplication({
  name: "@single-spa/welcome",
  app: () =>
    System.import(
      "https://unpkg.com/single-spa-welcome/dist/single-spa-welcome.js"
    ),
  activeWhen: ["/"],
});

// registerApplication({
//   name: "@yy/navbar",
//   app: () => System.import("@yy/navbar"),
//   activeWhen: ["/"]
// });

registerApplication({
  name: '@yy/app1',
  app: () => import("./apps/app1.js"),
  activeWhen: ["/app1"],
  customProps: {
    prop1: 'foo'
  }
});

registerApplication({
  name: '@yy/app2',
  app: () => import("./apps/app2.js"),
  activeWhen: ["/app2"]
});

const parcel = mountRootParcel(normalParcel, normalParcelProps);
// parcel被挂载，在mountPromise中完成挂载
parcel.mountPromise.then(() => {
  console.log('finished mounting parcel!');
  // 如果我们想重新渲染parcel，可以调用update生命周期方法，其返回值是一个promise
  normalParcelProps.customProp1 = 'bar';
  return parcel.update(normalParcelProps);
})
.then(() => {
  // 在此处调用unmount生命周期方法来卸载parcel，返回promise
  return parcel.unmount();
});

start({
  urlRerouteOnly: true,
});
