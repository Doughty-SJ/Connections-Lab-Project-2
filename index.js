//Initialize the express 'app' object
let express = require('express');
let app = express();
app.use('/', express.static('Public'));

//Initialize the actual HTTP server
let http = require('http');
let server = http.createServer(app);
let port = process.env.PORT || 5000;
server.listen(port, () => {
    console.log("Server listening at port: " + port);
});

let hostConnect;
hostConnect = false;

//Random Integer Generator credit - https://www.w3schools.com/js/js_random.asp
function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

//Game State Object
const gameState = {
    playerList: [],
    players: {},
    agentsList : [],
    agents: {},
    agentBoxes: {}
}


//Initialize socket.io
let io = require('socket.io').listen(server);
let host = io.of('/host');
let clients = io.of('/clients')

//Listen for host connection and update data.
host.on("connection", function (socket) {
    console.log("Host Connected");
    hostConnected = true;
    clients.emit("hostConnected", gameState);
    socket.emit('hostConnected', gameState);
    socket.on('agentsData', function (agentsData) {
        gameState.agents = agentsData;
        gameState.agentsList = Object.keys(agentsData);
        
    });

    host.on('agentBoxesData', function (agentBoxesData) {
        gameState.agentBoxes = agentBoxesData;
        //console.log(gameState.agents);
    });
});


//Listen for individual clients/users to connect
clients.on('connection', function (socket) {
    console.log("/////");
    console.log("We have a new client: " + socket.id);
    host.emit("clientConnection", gameState);
    gameState.players[socket.id] = {
        x: getRndInteger(50, 550),
        y: getRndInteger(50, 350)
    }

    gameState.playerList.push(socket.id);

    // A new Player joining let all other players know. 
    socket.on("playerJoined", () => {
        let joinData = {

            "gamestate": gameState,
            "joinID": socket.id
        }
        socket.broadcast.emit("playerJoined", joinData);
        host.emit("playerJoined", joinData);
        console.log("/////////")
        console.log(gameState);
    })

    //Listen for a message named 'data' from this client
    socket.on('playerData', function (data) {
        
        gameState.players[data.ID].x = data.x;
        gameState.players[data.ID].y = data.y;
        gameState.players[data.ID].r = data.r;

        clients.emit('data', gameState);
        host.emit('data',gameState);

    });

    socket.on('newPlayer', () => {
        socket.emit("newPlayer", gameState);
    })

    //Listen for this client to disconnect
    socket.on('disconnect', function () {
        console.log("//////////");
        console.log("A client has disconnected: " + socket.id);
        delete gameState.players[socket.id]

        //Remove from playerList
        const index = gameState.playerList.indexOf(socket.id);
        if (index > -1) {
            gameState.playerList.splice(index, 1);
        }

        clients.emit("playerLeft", socket.id);
        clients.emit('data', gameState);
        host.emit("data", gameState)
        host.emit("playerLeft", socket.id);
        console.log(gameState);
    });


});

if(hostConnected = true){
setInterval(function () {
    clients.emit('data', gameState);
    host.emit("data", gameState);
    //console.log(gameState.players);
}, 1000 / 45);
}



