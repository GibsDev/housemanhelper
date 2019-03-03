let list = document.getElementById('list');
let menu = document.getElementById('menu');
let input = document.getElementById('input');
let submit = document.getElementById('submit');
let refresh = document.getElementById('refresh');
let events = new EventSource('/api/sse');

function http(method, url, object, callback) {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (callback) {
                callback(xhttp);
            }
        }
    };
    xhttp.open(method, url, true);
    if (object) {
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

events.addEventListener('list', (event) => {
    // Calls the setter for value
    housemanlist.value = JSON.parse(event.data);
});

let ITEMS;

/**
 * Try to login
 */
http('POST', '/api/auth/login', {username: 'curtis', password: 'toast'}, (res) => {
    console.log(res.responseText);
    if (res.status != 200) {
        return;
    }
    /**
     * Get the initial state of the houseman list
     */
    http('GET', '/api/list', null, (data) => {
        housemanlist.value = JSON.parse(data.responseText);
    });

    http('GET', '/api/items', null, (data) => {
        ITEMS = JSON.parse(data.responseText);
    });
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
        http('DELETE', '/api/list', getMessageById(click.target.parentNode.id), (res) => {
            console.log('DELETE: ' + res.responseText);
        });
    } else if (click.target.nodeName.toLowerCase() == 'p') {
        let message = getMessageById(click.target.parentNode.id);
        if (message == undefined) return;
        message.seen = !message.seen;
        http('PATCH', '/api/list', message, (res) => {
            console.log('PATCH: ' + res.responseText);
        });
    }
});

submit.addEventListener('click', () => {
    if (input.value.length > 0) {
        http('POST', '/api/list', { message: input.value }, (res) => {
            console.log('POST: ' + res.responseText);
            input.value = '';
        });
    }
})

refresh.addEventListener('click', () => {
    http('GET', '/api/list', null, (data) => {
        housemanlist.value = JSON.parse(data.responseText);
    });
});