const express = require('express');
const bodyParser = require('body-parser');
const app = express();
// HTTPS
const port = 443;

const fs = require('fs');
const crypto = require('crypto');

var jsonParser = bodyParser.json();

/**
 * Server side state object for list of requests
 */
let housemanlist = [];

const EventEmitter = require('events');
const events = new EventEmitter();

const auth = require('./authentication.js');
app.use('/auth', auth);

/**
 * Allows a client to subscribe to receive an updated list
 * when something changes.
 */
app.get('/events', (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });
    
    const updatefun = (event, data) => {
        // Write the event to the /events stream
        res.write(`event: ${String(event)}\ndata: ${JSON.stringify(data)}\n\n`);
    }
    
    events.addListener('update', updatefun);
    
    req.connection.on('close', () => {
        events.removeListener('update', updatefun);
        res.end();
    });
});

/**
 * Return a list of all things currently being requested in json
 * Technically this should on be called once from an ajax request
 * by the initial openning of the page. The housemanlist should
 * then be updated using the data from the /events stream.
 */
app.get('/list', (req, res) => {
    res.setHeader('Content-type', 'application/json');
    res.send(JSON.stringify(housemanlist));
    res.end();
});

/**
 * Return the list of all possible items as json
 * 
 * This will be used by the client to gather a list of all
 * items from the server. There should only be one server side
 * JSON file that contains all of the items that can be
 * requested. This request should simply respond by sending
 * that JSON file back to the requester.
 */
app.get('/items', (req, res) => {
    res.setHeader('Content-type', 'application/json');
    fs.readFile('items.json', (err, data) => {
        res.end(data);
    });
});

function messageIndex(message) {
    for (let i = 0; i < housemanlist.length; i++) {
        if (message == housemanlist[i].message) {
            return i;
        }
    }
    return -1;
}

/**
 * Used to post requests to the houseman list
 */
app.post('/list', jsonParser, (req, res) => {
    if (!req.body) return res.sendStatus(400);
    if (req.body.message == undefined) {
        res.send('Invalid message object');
        return;
    }
    let m = req.body.message;
    if (messageIndex(m) != -1) {
        res.send('Message already exists');
        return;
    }
    let t = Date.now();
    let md5sum = crypto.createHash('md5');
    md5sum.update(`${m}${t}`)
    let message = {
        message: m,
        time: t,
        id: md5sum.digest('base64'),
        seen: false
    }
    housemanlist.push(message);
    housemanlist.sort((a, b) => {return a.time - b.time});
    update();
    res.send(message.id);
});

app.delete('/list', jsonParser, (req, res) => {
    if (!req.body) return res.sendStatus(400);
    if (req.body.id == undefined) {
        res.send('No id provided');
        return;
    }
    for (let i = 0; i < housemanlist.length; i++) {
        if (req.body.id == housemanlist[i].id) {
            housemanlist.splice(i, 1);
            break;
        }
    }
    update();
    res.send(req.body.id);
});

app.patch('/list', jsonParser, (req, res) => {
    if (!req.body) return res.sendStatus(400);
    for (let i = 0; i < housemanlist.length; i++) {
        if (req.body.id == housemanlist[i].id) {
            housemanlist[i] = req.body;
            update();
            res.send(JSON.stringify(housemanlist[i].id));
            return;
        }
    }
});

/**
 * Serve client side html code from the client directory
 */
app.use(express.static('public'));

/**
 * Start the server listening on the specified port
 */
app.listen(port, () => console.log(`Listeneing on port ${port}`));

function update() {
    events.emit('update', 'housemanlist', housemanlist);
}