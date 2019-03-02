let list = document.getElementById('list');
let menu = document.getElementById('menu');
let input = document.getElementById('input');
let submit = document.getElementById('submit');
let events = new EventSource('/events');

function http(method, url, object, callback) {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            if (callback) {
                callback(this.responseText);
            }
        }
    };
    xhttp.open(method, url, true);
    let meth = method.toLowerCase();
    if (meth == 'delete' || meth == 'post' || meth == 'patch') {
        xhttp.setRequestHeader('Content-type', 'application/json');
        xhttp.send(JSON.stringify(object));
    } else {
        xhttp.send();
    }
}

let housemanlist = {
    _value: [],
    set value(val) {
        this._value = val;
        housemanUpdated();
    },
    get value() {
        return this._value;
    }
};

events.addEventListener('housemanlist', (event) => {
    // Calls the setter for value
    housemanlist.value = JSON.parse(event.data);
});

/**
 * Get the initial state of the houseman list
 */
http('GET', '/list', null, (data) => {
    housemanlist.value = JSON.parse(data);
});

let ITEMS;

http('GET', '/items', null, (data) => {
    ITEMS = JSON.parse(data);
});

function getMessageById(id) {
    for (let i = 0; i < housemanlist.value.length; i++) {
        if (housemanlist.value[i].id == id) {
            return housemanlist.value[i];
        }
    }
}

function housemanUpdated() {
    if (housemanlist.value.length == 0) {
        list.innerHTML = '<div><p>The houseman list is empty</b></div>';
        return;
    }
    list.innerHTML = '';
    for (let i = 0; i < housemanlist.value.length; i++) {
        let message = housemanlist.value[i];
        let check = (message.seen) ? '&#x2714️' : '';
        let time = new Date(message.time).toLocaleTimeString();
        let ttime = time.substring(0, time.length - 6);
        ttime += time.substring(time.length - 3);
        list.innerHTML += `<div id=${message.id}><button>X</button><p>${message.message}</p>${check} <b>${ttime}</b></div>`;
        let div = list.lastChild;
        let button = div.firstChild;
    }
}

list.addEventListener('click', (click) => {
    if (click.target.nodeName.toLowerCase() == 'button') {
        http('DELETE', '/list', getMessageById(click.target.parentNode.id), (res) => {
            console.log('DELETE: ' + res);
        });
    } else if (click.target.nodeName.toLowerCase() == 'p') {
        let message = getMessageById(click.target.parentNode.id);
        if (message == undefined) return;
        message.seen = !message.seen;
        http('PATCH', '/list', message, (res) => {
            console.log('PATCH: ' + res);
        });
    }
});

submit.addEventListener('click', () => {
    if (input.value.length > 0) {
        http('POST', '/list', { message: input.value }, (res) => {
            console.log('POST: ' + res);
            input.value = '';
        });
    }
})
