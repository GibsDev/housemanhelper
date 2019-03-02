const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 8080;

const fs = require('fs');

var jsonParser = bodyParser.json();

/**
 * Server side state object for list of requests
 */
let housemanlist = [];

const EventEmitter = require('events');
const events = new EventEmitter();

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

/**
 * Used to post requests to the houseman list
 */
app.post('/list', jsonParser, (req, res) => {
    if (!req.body) return res.sendStatus(400);
    for (let i = 0; i < housemanlist.length; i++) {
        if (req.body.message == housemanlist[i].message) {
            if (req.body.seen == housemanlist[i].seen) {
                res.send('Tried to send duplicate message');
                return;
            }
            housemanlist[i].seen = req.body.seen;
            update();
            res.send(JSON.stringify(housemanlist[i]));
            return;
        }
    }
    housemanlist.push(req.body);
    housemanlist.sort((a, b) => {return a.time - b.time});
    update();
    res.send(req.body);
});

app.delete('/list', jsonParser, (req, res) => {
    if (!req.body) return res.sendStatus(400);
    for (let i = 0; i < housemanlist.length; i++) {
        if (req.body.id == housemanlist[i].id) {
            housemanlist.splice(i, 1);
            break;
        }
    }
    update();
    res.send(req.body);
});

/**
 * Serve client side html code from the client directory
 */
app.use(express.static('public'));

/**
 * Start the server listening on the specified port
 */
app.listen(port, () => console.log(`Listeneing on port ${port}`));

/**
 * Used as a mechanism to set off an event for testing
 */
/*
setInterval(() => {
    update();
}, 1000);
*/
function update() {
    events.emit('update', 'housemanlist', housemanlist);
}