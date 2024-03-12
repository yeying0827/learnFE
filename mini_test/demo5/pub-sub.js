class EventEmitter {
    constructor() {
        // 维护消息队列
        this.events = {
            // 'a': handlers[],
            // 'b': handlers[]
        };
    }
    on(type, listener) {
        if (this.events[type]) {
            this.events[type].push(listener);
        } else {
            this.events[type] = [listener];
        }
    }
    emit(type, ...args) {
        if (this.events[type]) {
            this.events[type].forEach(fn => fn.call(this, ...args));
        }
    }
    once(type, listener) {
        const _ = this;
        function cb(...args) {
            listener.call(this, ...args);
            _.off(this, cb);
        }
        _.on(this, cb);
    }
    off(type, listener) {
        if (this.events[type]) {
            const index = this.events[type].indexOf(listener);
            this.events[type].splice(index, 1);
        }
    }
}

const emitter = new EventEmitter();

const publisher = {
    state: 0,
    init: function () {
        this.setState(1);
    },
    setState: function (value) {
        emitter.emit('BChange', value);
    },
    active: function () {
        this.setState(2);
    }
}

const sub1 = {
    update: function(state) {
        console.log(`sub1 listened: ${state}`);
    },
    init: function () {
        emitter.on('BChange', this.update);
    }
};
const sub2 = {
    modified: function(state) {
        console.log(`sub2 listened: ${state}`);
    },
    init: function () {
        emitter.on('BChange', this.modified);
    }
};
sub1.init();
console.log(emitter.events);
sub2.init();
console.log(emitter.events);
publisher.init();
publisher.active();
