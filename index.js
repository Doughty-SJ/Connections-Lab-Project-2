//Initialize the express 'app' object
let express = require('express');
let app = express();
app.use('/', express.static('public'));

//Initialize the actual HTTP server
let http = require('http');
let server = http.createServer(app);
let port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log("Server listening at port: " + port);
});



//Random Integer Generator credit - https://www.w3schools.com/js/js_random.asp
function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}


//Game State Object
const gameState = {
    playerList: [],
    players: {}
}

//Initialize socket.io
let io = require('socket.io').listen(server);

//Listen for individual clients/users to connect
io.sockets.on('connection', function (socket) {
    console.log("We have a new client: " + socket.id);

    //Listen for a message named 'data' from this client
    socket.on('data', function (data) {

        //Data can be numbers, strings, objects
        //console.log("Received: 'data' " + data.x +":"+data.y+data.ID);
        gameState.players[data.ID].x = data.x;
        gameState.players[data.ID].y = data.y;
        

        //Send the data to all clients, including this one
        //Set the name of the message to be 'data'
        io.sockets.emit('data', data);

        //Send the data to all other clients, not including this one
        // socket.broadcast.emit('data', data);

        //Send the data to just this client
        // socket.emit('data', data);
    });

    socket.on('newPlayer', () => {
        gameState.players[socket.id] = { x: getRndInteger(50, 750), y: getRndInteger(50, 350) }
        gameState.playerList.push(socket.id);
       
        console.log(gameState);
    })


    //Listen for this client to disconnect
    socket.on('disconnect', function () {
        console.log("A client has disconnected: " + socket.id);
        delete gameState.players[socket.id]

        //Remove from playerList
        const index = gameState.playerList.indexOf(socket.id);
        if (index > -1) {
            gameState.playerList.splice(index, 1);
        }


    });
});



setInterval(function () {
    io.sockets.emit('state', gameState);
    //console.log(gameState.players);
}, 1000 / 10);