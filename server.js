const express = require('express');
const bodyParser = require('body-parser');
const app = express();
// HTTPS
const port = 443;

/**
 * Parse all JSON into the req.body object
 */
var jsonParser = bodyParser.json();
app.all('*', jsonParser);

/**
 * Create the route for auth calls
 */
const auth = require('./authentication.js');
app.use('/auth', auth);

/**
 * Create the route for api calls
 */
const housemanapi = require('./api.js');
app.use('/api', housemanapi);

/**
 * Serve static files from the client directory
 */
app.use(express.static('public'));

/**
 * Start the server listening on the specified port
 */
app.listen(port, () => console.log(`Listeneing on port ${port}`));
