let button = document.getElementById('userpassbutton');
let username = document.getElementById('username');
let password = document.getElementById('password');
let password2 = document.getElementById('password2');

let warn1 = document.getElementById('warn1');
let warn2 = document.getElementById('warn2');
let warn3 = document.getElementById('warn3');

button.addEventListener('click', () => {
    warn1.style.display = 'none';
    warn2.style.display = 'none';
    warn3.style.display = 'none';
    if (username.value.length == 0
        || password.value.length == 0
        || password .value.length == 0) {
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
    button.style.visibility = 'hidden';
    username.value = '';
    password.value = '';
    password2.value = '';
    http('POST', '/api/auth/signup', {}, (res) => {
        if (res.status == 200) {
            window.location.href = '/login';
        }
        console.log(res.responseText);
        button.style.visibility = 'visible';
    });
});