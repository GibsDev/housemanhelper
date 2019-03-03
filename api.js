const api = require('express').Router();
const cookieParser = require('cookie-parser');
const state = require('./state.js');

/**
 * Create the route for auth calls
 */
const auth = require('./authentication.js');
api.use('/auth', auth.router);
api.all('*', auth.middleware);

const fs = require('fs');
const crypto = require('crypto');

/**
 * Allows a client to subscribe to receive server side events
 */
api.get('/sse', (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });
    
    function postData(event, data) {
        // Write the event to the /sse stream
        res.write(`event: ${String(event)}\ndata: ${JSON.stringify(data)}\n\n`);
    }
    
    state.events.addListener('update', postData);
    
    req.connection.on('close', () => {
        state.events.removeListener('update', postData);
        res.end();
    });
});

/**
 * Return a list of all things currently stored in the state
 */
api.get('/list', (req, res) => {
    res.setHeader('Content-type', 'application/json');
    res.send(JSON.stringify(state.list));
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
api.get('/items', (req, res) => {
    res.setHeader('Content-type', 'application/json');
    fs.readFile('items.json', (err, data) => {
        res.end(data);
    });
});

/**
 * Post objects to the list
 */
api.post('/list', (req, res) => {
    if (!req.body) return res.sendStatus(400);
    if (!req.body.message) {
        res.send('Invalid message object');
        return;
    }
    let m = req.body.message;
    if (state.getIndex(m) != -1) {
        res.send('Message already exists');
        return;
    }
    // TODO change the id creation?
    let t = Date.now();
    let md5sum = crypto.createHash('md5');
    md5sum.update(`${m}${t}`)
    let message = {
        message: m,
        time: t,
        id: md5sum.digest('base64'),
        seen: false
    }
    state.list.push(message);
    state.list.sort((a, b) => {return a.time - b.time});
    res.send(message.id);
    state.notifyListeners();
});

/**
 * Remove an item from the list with the given id
 */
api.delete('/list', (req, res) => {
    if (!req.body) return res.sendStatus(400);
    if (req.body.id == undefined) {
        res.send('No id provided');
        return;
    }
    for (let i = 0; i < state.list.length; i++) {
        if (req.body.id == state.list[i].id) {
            state.list.splice(i, 1);
            break;
        }
    }
    res.send(req.body.id);
    state.notifyListeners();
});

/**
 * Update an item in the list
 */
api.patch('/list', (req, res) => {
    if (!req.body) return res.sendStatus(400);
    for (let i = 0; i < state.list.length; i++) {
        if (req.body.id == state.list[i].id) {
            state.list[i] = req.body;
            res.send(state.list[i].id);
            state.notifyListeners();
            return;
        }
    }
});

module.exports = api;