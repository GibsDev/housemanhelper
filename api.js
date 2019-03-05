const api = require('express').Router();
const cookieParser = require('cookie-parser');
const state = require('./state.js');

let idCounter = getRandomInt(0, 0xFFFFFF + 1);

/**
 * Uses the same algorithm as MongoDB to generate a Likely-UID:
 * 
 * We do not check for collisions for this implementation. While
 * it is incredibly unlikely (near impossible) that we will
 * get id collisions, it is still technically possible, but the
 * effects of a collision on a single post to the list is not
 * catastrophic. The whole point of using this type of id
 * generation was to prep for a potential migration to a MongoDB
 * database, where the collisions would be handled.
 * 
 * a 4-byte value representing the seconds since the Unix epoch,
 * a 5-byte random value, and
 * a 3-byte counter, starting with a random value.
 * 
 * @param {Date} time 
 */
function getNextID(time) {
    // Convert time to seconds since Unix 0
    time = Math.floor(time/1000);
    let id = Buffer.alloc(12);
    id.writeInt32BE(time);
    // 5 random bytes
    id.writeUInt8(getRandomInt(0, 0xFF + 1), 4);
    id.writeUInt8(getRandomInt(0, 0xFF + 1), 5);
    id.writeUInt8(getRandomInt(0, 0xFF + 1), 6);
    id.writeUInt8(getRandomInt(0, 0xFF + 1), 7);
    id.writeUInt8(getRandomInt(0, 0xFF + 1), 8);
    // Incremental counter that starts at a random value (when server starts)
    id.writeUIntBE(idCounter, 9, 3);
    // Increment and wrap counter
    idCounter++;
    if (idCounter > 0xFFFFFF) {
        idCounter = 0;
    }
    return id.toString('hex');
}

/**
 * Helper function to generate random numbers for getNextID
 * 
 * @param {Number} min inclusive min
 * @param {Number} max exclusive max
 * @returns A random int between two numbers
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

/**
 * Create the route for auth calls
 */
const auth = require('./authentication.js');
api.use('/auth', auth.router);
api.all('*', auth.middleware);

const fs = require('fs');

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
    let t = Date.now();
    let message = {
        message: m,
        time: t,
        _id: getNextID(t),
        seen: false
    }
    state.list.push(message);
    state.list.sort((a, b) => {return a.time - b.time});
    res.send(message._id);
    state.notifyListeners();
});

/**
 * Remove an item from the list with the given id
 */
api.delete('/list', (req, res) => {
    if (!req.body) return res.sendStatus(400);
    if (req.body._id == undefined) {
        res.send('No id provided');
        return;
    }
    for (let i = 0; i < state.list.length; i++) {
        if (req.body._id == state.list[i]._id) {
            state.list.splice(i, 1);
            break;
        }
    }
    res.send(req.body._id);
    state.notifyListeners();
});

/**
 * Update an item in the list
 */
api.patch('/list', (req, res) => {
    if (!req.body) return res.sendStatus(400);
    for (let i = 0; i < state.list.length; i++) {
        if (req.body._id == state.list[i]._id) {
            state.list[i] = req.body;
            res.send(state.list[i]._id);
            state.notifyListeners();
            return;
        }
    }
});

module.exports = api;