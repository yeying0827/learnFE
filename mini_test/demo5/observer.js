let Subject = {
    _state: 0,
    _observers: [],
    add: function(observer) {
        this._observers.push(observer);
    },
    getState: function () {
        return this._state;
    },
    setState: function (value) {
        this._state = value;
        for (let i = 0; i < this._observers.length; i ++) {
            this._observers[i].signal(this);
        }
    }
};

let Observer = {
    signal: function (subject) {
        let currentValue = subject.getState();
        console.log(currentValue);
    }
};

Subject.add(Observer);
Subject.setState(10);
