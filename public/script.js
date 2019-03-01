let list = document.getElementById('list');
let menu = document.getElementById('menu');
let input = document.getElementById('input');
let submit = document.getElementById('submit');
let events = new EventSource('/events');

function httpget(url, callback) {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            if (callback) {
                callback(this.responseText);
            }
        }
    };
    xhttp.open("GET", url, true);
    xhttp.send();
}

function httppost(object, url, callback) {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            if (callback) {
                callback(this.responseText);
            }
        }
    };
    xhttp.open("POST", url, true);
    xhttp.setRequestHeader('Content-type', 'application/json');
    xhttp.send(JSON.stringify(object));
}

function httpdelete(object, url, callback) {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            if (callback) {
                callback(this.responseText);
            }
        }
    };
    xhttp.open("DELETE", url, true);
    xhttp.setRequestHeader('Content-type', 'application/json');
    xhttp.send(JSON.stringify(object));
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
httpget("/list", (data) => {
    housemanlist.value = JSON.parse(data);
});

let ITEMS;

httpget("/items", (data) => {
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
        list.innerHTML += `<div><button id=${housemanlist.value[i].id}>X</button><p>${housemanlist.value[i].message}</p></div>`;
        let div = list.lastChild;
        let button = div.firstChild;
    }
}

list.addEventListener('click', (click) => {
    console.log('list clicked');
    console.log(click.target);
    if (click.target.nodeName.toLowerCase() == 'button') {
        httpdelete(getMessageById(click.target.id), "/list", (res) => {
            let resjson = JSON.parse(res);
            console.log(`${resjson.id} has been deleted`);
        });
    }
});

function Message(message) {
    return {
        message: message,
        time: Date.now(),
        id: MD5(message + this.time)
    }
}

submit.addEventListener('click', () => {
    if (input.value.length > 0) {
        httppost(new Message(input.value), '/list', (res) => {
            input.value = "";
        });
    }
})

function log(str) {
    console.log(str);
}