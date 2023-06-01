import {track, trigger} from "./effect.js";
import {isObject} from "../shared/index.js";
import {reactive} from "./reactive.js";

export function ref(val) {
    if (isRef(val)) {
        return val;
    }
    return new RefImpl(val);
}

function isRef(val) {
    return !!(val && val.__isRef);
}

// ref就是利用面向对象的getter和setter进行track和trigger
class RefImpl {
    constructor(val) {
        this._val = convert(val);
        this.__isRef = true;
    }

    get value() {
        track(this, 'value');
        return this._val;
    }

    set value(val) {
        if (val !== this._val) {
            this._val = convert(val);
            trigger(this, 'value');
        }
    }
}

// ref也可以支持复杂数据结构
function convert(val) {
    return isObject(val) ? reactive(val) : val;
}
