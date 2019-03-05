const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();
const port = 8080;
// const https = require('https');

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

/*
const options = {
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.cert')
}
*/

/**
 * Start the server listening on the specified port
 */
app.listen(port, () => console.log(`Listeneing on port ${port}`));
/*
https.createServer(options, app).listen(port, function () {
        console.log(`Listeneing on port ${port}`)
    }
);
*/