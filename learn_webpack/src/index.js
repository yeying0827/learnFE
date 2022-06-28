import moment from "moment";
import {fool, log} from './fool';
import './index.css';
import './style.css';
// import styles from './index.module.css'; // module css 会影响应用更新时HMR执行的回调调用
import './main.less';
import './test.scss';
import {utils} from "utils";
import html from './file.html'
import {square, cube} from './utils/math'
import {forEach, /*includes*/} from 'lodash-es';
import testMd from './test.md';

document.getElementById('file').innerHTML = html;

console.log(testMd);

utils();

log(cube(3));

console.log("Running App version: ", VERSION); // 5fa3b9
console.log('PRODUCTION: ', PRODUCTION); // true
console.log('TWO: ', TWO); // 2
console.log('BROWSER_SUPPORTS_HTML5: ', BROWSER_SUPPORTS_HTML5); // true
console.log('CONSTANTS: ', CONSTANTS); // { APP_VERSION: "1.2.2" }
console.log('process.env.NODE_ENV: ', process.env.NODE_ENV);
// if(!BROWSER_SUPPORTS_HTML5) require("html5shiv");

const m = moment();
console.log(m, m.year(), 4);

forEach([1, 2], (item) => {
    console.log(item)
})

if (module.hot) {
    console.log("+++++++++++++++++++++++++++++");
    // module.hot.accept("utils", () => {
    //     console.log("Accepting the updated utils module");
    //     console.log("++==================================++");
    //     utils();
    // })
    // module.hot.accept((error) => { // 处理自身的更新异常
    //     // 这里是异常回调，当更新异常时调用
    //     console.log("Accepting the updated self", error);
    //     console.log("++=============self================++");
    // })

    module.hot.decline("utils");
}

import(/* webpackChunkName: "includes" */"lodash-es/includes.js").then(includes => {
    console.log(includes);
    console.log(includes.default([1, 2, 3], 1))
});
