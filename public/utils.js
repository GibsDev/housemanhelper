export function http(method, url, object, callback) {
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