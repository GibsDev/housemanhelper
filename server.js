const express = require('express');
const https = require('https');
const fs = require('fs');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();
// HTTPS
const port = 443;

/**
 * Parse all JSON into the req.body object
 */
var jsonParser = bodyParser.json();
app.use(cookieParser(), jsonParser);

/**
 * Create the route for api calls
 */
const housemanapi = require('./api.js');
app.use('/api', housemanapi);

/**
 * Serve static files from the client directory
 */
app.use(express.static('public', { extensions:['html'] }));

const options = {
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.cert')
}

/**
 * Start the server listening on the specified port
 */
https.createServer(options, app).listen(port, function () {
        console.log(`Listeneing on port ${port}`)
    }
);