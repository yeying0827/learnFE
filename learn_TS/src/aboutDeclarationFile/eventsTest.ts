import { EventEmitter } from "xiaomuzhu-events";

const ee = new EventEmitter();

ee.on('message', (text: string) => {
    console.log(text);
});

const id = Symbol('id');

ee.on(id, () => {
    console.log('hello typed eventemitter');
});

ee.emit('message', 'winter is coming');
