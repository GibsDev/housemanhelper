const auth = require('express').router();

auth.get('/', (req, res) => {
    console.log(req.headers.cookie);
    // TODO validate username and password
    let token = '<asdf>';
    res.cookie('token', token, { httpOnly: true });
    res.sendFile('Hello from root of auth');
});

module.exports = auth;