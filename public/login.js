let button = document.getElementById('userpassbutton');
let username = document.getElementById('username');
let password = document.getElementById('password');
let warn1 = document.getElementById('warn1');

function login() {
	warn1.style.display = 'none';
	button.style.visibility = 'hidden';
	let user = username.value;
	let pass = password.value;
	username.value = '';
	password.value = '';
	http('POST', '/api/auth/login', { username: user, password: pass }, (res) => {
		if (res.status == 200) {
			window.location.href = '/';
		} else {
			warn1.style.display = 'table-row';
		}
		console.log(res.responseText);
		button.style.visibility = 'visible';
	});
}

function enterkey(e) {
	if (e.keyCode == 13) {
		login();
	}
}

button.addEventListener('click', login);
username.addEventListener('keydown', enterkey);
password.addEventListener('keydown', enterkey);