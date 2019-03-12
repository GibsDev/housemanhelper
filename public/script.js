import { http } from '/utils.js';

let list = document.getElementById('list');
let menu = document.getElementById('menu');
let input = document.getElementById('input');
let submit = document.getElementById('submit');
let refresh = document.getElementById('refresh');
let events = new EventSource('/api/sse');

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
 * Get the initial state of the houseman list
 */
http('GET', '/api/list', null, (res) => {
	console.log(res.status);
	if (res.status == 401) {
		window.location.href = '/login';
		return;
	}
	housemanlist.value = JSON.parse(res.responseText);
});

http('GET', '/api/items', null, (res) => {
	if (res.status == 401) {
		window.location.href = '/login';
		return;
	}
	ITEMS = JSON.parse(res.responseText);
});


function getMessageById(id) {
	for (let i = 0; i < housemanlist.value.length; i++) {
		if (housemanlist.value[i]._id == id) {
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
		list.innerHTML += `<div id=${message._id}><button>X</button><p>${message.message}</p>${check} <b>${ttime}</b></div>`;
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