let button = document.getElementById('userpassbutton');
let username = document.getElementById('username');
let password = document.getElementById('password');
let password2 = document.getElementById('password2');

let warn1 = document.getElementById('warn1');
let warn2 = document.getElementById('warn2');
let warn3 = document.getElementById('warn3');

function signup(){
    warn1.style.display = 'none';
    warn2.style.display = 'none';
    warn3.style.display = 'none';
    if (username.value.length == 0
        || password.value.length == 0
        || password.value.length == 0) {
        console.log('Make sure all fields are filled out');
        warn1.style.display = 'table-row';
        return;
    }
    if (password.value != password2.value) {
        console.log('Make sure passwords match');
        warn2.style.display = 'table-row';
        return;
    }
    if (password.value.length < 6) {
        console.log('please use a longer password');
        warn3.style.display = 'table-row';
        return;
    }
    let u = username.value;
    let p = password.value;
    button.style.visibility = 'hidden';
    username.value = '';
    password.value = '';
    password2.value = '';
    http('POST', '/api/auth/signup', { username: u, password: p }, (res) => {
        if (res.status == 200) {
            window.location.href = '/login';
        }
        console.log(res.responseText);
        button.style.visibility = 'visible';
    });
}

function enterkey(e) {
    if (e.keyCode == 13) {
        signup();
    }
}

button.addEventListener('click', signup);
username.addEventListener('keydown', enterkey);
password1.addEventListener('keydown', enterkey);
password2.addEventListener('keydown', enterkey);