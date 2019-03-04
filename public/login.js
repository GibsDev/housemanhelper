let button = document.getElementById('userpassbutton');
let username = document.getElementById('username');
let password = document.getElementById('password');
let warn1 = document.getElementById('warn1');

button.addEventListener('click', () => {
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
});