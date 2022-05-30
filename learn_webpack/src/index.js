import moment from "moment";
import {fool, log} from './fool';
import './index.css';
import './style.css';
import styles from './index.module.css';
import './main.less';
import {utils} from "utils";
import html from './file.html'
import {square, cube} from './utils/math'
import {forEach, /*includes*/} from 'lodash-es';

document.getElementById('file').innerHTML = html;

utils();

log(cube(3));

console.log("Running App version: ", VERSION); // 5fa3b9
console.log('PRODUCTION: ', PRODUCTION); // true
console.log('TWO: ', TWO); // 2
console.log('BROWSER_SUPPORTS_HTML5: ', BROWSER_SUPPORTS_HTML5); // true
console.log('CONSTANTS: ', CONSTANTS); // { APP_VERSION: "1.2.2" }
if(!BROWSER_SUPPORTS_HTML5) require("html5shiv");

const m = moment();
console.log(m);

forEach([1, 2], (item) => {
    console.log(item)
})

import(/* webpackChunkName: "includes" */"lodash-es/includes.js").then(includes => {
    console.log(includes);
    console.log(includes.default([1, 2, 3], 1))
});
