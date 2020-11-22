const express = require('express');
const bodyParser = require("body-parser");
const FlightData = require('./Controllers/FlightController')
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, { cors: { origin: '*' } });
const data = require('./Logic/FlightsData')
const port = 5000;
const timer = 0.5;

io.on('connection', (socket) => {
    console.log('client connected');
    setInterval(() => {
        socket.emit('update', data);
    }, timer);
})

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    res.header('Access-Control-Allow-Methods', '*');
    next();
});

app.use(bodyParser.json());
app.use('/', FlightData)
http.listen(port, function () {
    console.log('Server is running..');
});

