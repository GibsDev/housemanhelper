const router = require('express').Router();

let username = 'curtis';
let password = 'toast';

let accessToken = 'thisistheonlyvalidtoken';

router.post('/login', (req, res) => {
    if (!(req.body.username == username
        && req.body.password == password)) {
            res.status(400).send('Invalid username and password');
            return;
    }
    res.cookie('token', accessToken, { httpOnly: true });
    res.send('Successfully authenticated user: ' + req.body.username);
});

router.post('/signup', (req, res) => {
    // TODO
    res.send('Login!');
});

function authenticate (req, res, next) {
    if (req.path != '/signup' && req.path != '/login') {
        if (!req.cookies) return;
        if (req.cookies.token != accessToken) {
            res.redirect('/login');
            return;
        }
    }
    next();
}

module.exports = {
    router: router,
    middleware: authenticate
};