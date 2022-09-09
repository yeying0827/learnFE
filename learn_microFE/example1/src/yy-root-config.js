import { registerApplication, start, mountRootParcel } from "single-spa";
import {
  constructRoutes,
  constructApplications,
  constructLayoutEngine
} from 'single-spa-layout';
import { parcelConfig as normalParcel, parcelProps as normalParcelProps } from './parcels/normalParcel';

registerApplication({
  name: "@single-spa/welcome",
  app: () =>
    System.import(
      "https://unpkg.com/single-spa-welcome/dist/single-spa-welcome.js"
    ),
  activeWhen: [(location) => location.pathname === "/"],
});

// registerApplication({
//   name: "@yy/navbar",
//   app: () => System.import("@yy/navbar"),
//   activeWhen: ["/"]
// });

registerApplication({
  name: '@yy/app1',
  app: require("./apps/app1.js"),
  activeWhen: ["/app1"],
  customProps: {
    prop1: 'foo'
  }
});

registerApplication({
  name: '@yy/app2',
  app: () => System.import('@yy/setting'), //import("./apps/app2.js"),
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


const data = {
  props: {
    authToken: '1234567',
  },
  loaders: {
    topNav: `<nav class="placeholder">导航加载中...</nav>`,
    footer: `<nav class="placeholder">底部加载中...</nav>`
  }
};
const routes = constructRoutes(document.querySelector('#single-spa-layout'), data);
/*
const routes = constructRoutes({
  mode: 'history',
  base: '/',
  containerEl: '#container',
  disableWarnings: false,
  // redirects,
  routes: [
    {
      type: "nav",
      attrs: [ { "name": "class", "value": "topNav" } ],
      routes: [
        {
          type: "application",
          name: "@yy/example",
          props: { authToken: '12345678' }
        }
      ]
    },
    {
      type: "div",
      attrs: [ { "name": "class", "value": "main-content" } ],
      routes: [
        {
          type: "route",
          path: "settings",
          routes: [
            {
              type: "application",
              name: "@yy/setting"
            }
          ]
        },
        {
          type: "route",
          path: "clients",
          routes: [
            {
              type: "div",
              "routes": [
                {
                  "type": "#text",
                  "value": "Clients Page1"
                }
              ]
            }
          ]
        },
      ]
    },
    {
      type: "footer",
      routes: [
        {
          type: "application",
          name: "@yy/footer",
          props: { name: "Footer" },
          loader: `<nav class="placeholder">Footer加载中...</nav>`
        }
      ]
    }
  ]
});
*/
const applications = constructApplications({
  routes,
  loadApp({ name }) {
    return System.import(name);
  }
});
const layoutEngine = constructLayoutEngine({ routes, applications });
applications.forEach(registerApplication);

start({
  urlRerouteOnly: true,
});
