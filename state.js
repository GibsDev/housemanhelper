const EventEmitter = require('events');
const emitter = new EventEmitter();

let state = {
    events: emitter,
    list: [],
    getIndex(message) {
        for (let i = 0; i < this.list.length; i++) {
            if (message == this.list[i].message) {
                return i;
            }
        }
        return -1;
    },
    emit: function (event, args) {
        state.events.emit(event, args);
    },
    notifyListeners: function () {
        state.events.emit('update', 'list', state.list);
    }
};

module.exports = state;