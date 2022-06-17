const foo = require('./foo');

export const bar = (name) => {
    console.log('===================bar======================');
    foo(name);
    console.log('===================end======================');
}

export const bar1 = () => {
    console.log('===================bar1==================');
}

export default {
    bar
}
