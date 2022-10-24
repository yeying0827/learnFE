"use strict";
exports.__esModule = true;
var xiaomuzhu_events_1 = require("xiaomuzhu-events");
var ee = new xiaomuzhu_events_1.EventEmitter();
ee.on('message', function (text) {
    console.log(text);
});
var id = Symbol('id');
ee.on(id, function () {
    console.log('hello typed eventemitter');
});
ee.emit('message', 'winter is coming');
