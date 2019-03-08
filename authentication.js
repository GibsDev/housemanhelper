const router = require('express').Router();
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const jsonfile = require('jsonfile');

const PRIVATE_KEY = 'wwmNZPkPw9zUNVpY3kbc22c5YQCmYwkNRLpJGAcyQ7jpKXyXFtkL9hTxy75WLN2u';

/**
 * Contains all of the username password pairs
 */
let users = jsonfile.readFileSync('users.json');

/**
 * Contains all of the current access tokens for users
 */
let accessTokens = {};

/**
 * Used for obtaining a jwt access token that is stored in
 * a httponly cookie
 */
router.post('/login', (req, res) => {
	if (!isValidUserObject(req.body)) {
		res.status(400).send('Invalid login request');
		return;
	}
	if (!users[req.body.username] || users[req.body.username].password != passwordHash(req.body.password)) {
			res.status(400).send('Invalid username or password');
			return;
	}
	jwt.sign({ username: req.body.username }, PRIVATE_KEY, (err, token) => {
		if (err) {
			res.status(400).send('Unable to generate access token');
			return;
		}
		accessTokens[req.body.username] = token;
		res.cookie('token', token, { httpOnly: true });
		res.send('Successfully authenticated user: ' + req.body.username);
	});
});

/**
 * Used for creating an account
 */
router.post('/signup', (req, res) => {
	if (isValidUserObject(req.body)) {
		// Add user entry into users dictionary
		users[req.body.username] = {
			password: passwordHash(req.body.password)
		};
		jsonfile.writeFileSync('users.json', users);
		res.send('Account created: ' + req.body.username);
		return;
	}
	res.status(400).send('Unable to create account');
});

/**
 * Generates a hash of the given password for storage
 * 
 * @param {*} password 
 */
function passwordHash(password) {
	return crypto.createHash('sha256').update(password).digest('base64');
}

/**
 * Helper function to verify incoming user objects are usable
 * 
 * @param {*} user 
 */
function isValidUserObject(user) {
	return user.username != undefined
	&& user.password != undefined
	&& user.username != null
	&& user.password != null
	&& typeof(user.username) === 'string'
	&& typeof(user.password) === 'string'
	&& user.username.length > 0
	&& user.password.length > 0;
}

/**
 * Middleware function that checks all requests to the api
 * have valid jwt tokens
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function authenticate (req, res, next) {
	if (req.path == '/signup' || req.path == '/login') {
		next();
		return;
	} else {
		if (req.cookies && req.cookies.token) {
			let decoded = jwt.verify(req.cookies.token, PRIVATE_KEY);
			if (accessTokens[decoded.username] != undefined) {
				next();
				return;
			}
		}
	}
	res.status(401).send('/login');
	return;
}

module.exports = {
	router: router,
	middleware: authenticate
};