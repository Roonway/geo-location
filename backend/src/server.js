const express = require('express');
const socketIO =  require('socket.io');
const http = require('http');
const NodeGeocoder = require('node-geocoder');

const options = {
    provider: 'google',
    apiKey: 'YOUR_KEY',
    formatter: null
}

const app = express(); 

const server = http.createServer(app);
const io = socketIO(server);

io.on('connection', socket =>{
    console.log(`[SERVER] A new connection established with the client, socket: ${socket.id}`);
    socket.on('geocoding.address', async data => {
        const geocoder = NodeGeocoder(options);

        var [response] = await geocoder.geocode(data.address);
        response.id = data.id;

        io.emit('geocoding.address', response);
    });
    socket.on('disconnect', () => {
        console.log(`[SERVER] A connection was closed by the client, socket: ${socket.id}`)
    });
});

server.listen(3333);