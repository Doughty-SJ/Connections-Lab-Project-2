//declare variables
let gamestate;
let player;
let otherPlayerSprites = [];
let playerPos;
let updateStateReady = false;
let dataIsReady = false;
var WALL_THICKNESS = 30;


//open and connect socket
let socket = io();

//Listen for confirmation of connection
socket.on('connect', function () {
  console.log("Connected");
  console.log("This Client's playerID: " + socket.id);
  socket.emit('newPlayer');
  socket.emit('playerJoined');
});

// On new player organize gamestate data.
socket.on('newPlayer', function (obj) {

  gamestate = obj;


  //data is loaded
  dataIsReady = true;

  console.log("Other socket.IDs on NewPlayer Event: " + gamestate.playerList);
})

//Player Joined
socket.on("playerJoined", function (id) {

  console.log("ID: " + id + " has joined!")

});

//update gamestate. 
socket.on('data', function (gameState) {

  console.log("State Update");
  gamestate = gameState;



});




//remove sprites when players leave.
socket.on('playerLeft', function (id) {

  console.log(id + " has left.")
  if (otherPlayerSprites[id] != undefined) {

    otherPlayerSprites[id].remove();
  }

  socket.emit("data");
  dataIsReady = false;

})


function gameSprites() {
  //create player sprite
  player = createSprite(gamestate.players[socket.id].x, gamestate.players[socket.id].y, 10, 60);
  player.setDefaultCollider();
  player.maxSpeed = 5;

  //Create sprites for other players.
  for (let i = 0; i < gamestate.playerList.length; i++) {
    if (gamestate.playerList[i] != socket.id) {
      otherPlayerSprites[gamestate.playerList[i]] = createSprite(gamestate.players[gamestate.playerList[i]].x, gamestate.players[gamestate.playerList[i]].y, 20, 50);
    }
  }
  dataIsReady = false;
  updateStateReady = true;
}

function updateState() {
  for (i = 0; i < gamestate.playerList.length; i++) {

    if (otherPlayerSprites[gamestate.playerList[i]] != undefined) {
      otherPlayerSprites[gamestate.playerList[i]].position.x = gamestate.players[gamestate.playerList[i]].x;
      otherPlayerSprites[gamestate.playerList[i]].position.y = gamestate.players[gamestate.playerList[i]].y;
    }
  }

}



function setup() {

  console.log("Setup");
  createCanvas(windowWidth, 400);

  //Create Static Barriers
  wallTop = createSprite(width / 2, -WALL_THICKNESS / 2, width + WALL_THICKNESS * 2, WALL_THICKNESS);
  wallTop.immovable = true;

  wallBottom = createSprite(width / 2, height + WALL_THICKNESS / 2, width + WALL_THICKNESS * 2, WALL_THICKNESS);
  wallBottom.immovable = true;

  wallLeft = createSprite(-WALL_THICKNESS / 2, height / 2, WALL_THICKNESS, height);
  wallLeft.immovable = true;

  wallRight = createSprite(width + WALL_THICKNESS / 2, height / 2, WALL_THICKNESS, height);
  wallRight.immovable = true;

}

function draw() {
  background(255, 255, 255);
  

  if (dataIsReady) {
    gameSprites();
  }
  if (updateStateReady) {
    updateState();
  }


  //Send player Sprite position object when key is pressed
  if (keyIsPressed === true) {
    socket.emit('playerData', playerPos);
  }

  //Movement Keycode W = 87 , A = 65 , S = 83, D = 68
  if (keyDown("A")) {
    player.rotation -= 4;
  }
  if (keyDown("D")) {
    player.rotation += 4;
  }
  if (keyDown("W")) {
    player.addSpeed(0.2, player.rotation);
  } else {
    player.setSpeed(0.0);
  }

  //Position and ID data for Client-player
  playerPos = { x: player.position.x, y: player.position.y, ID: socket.id };

  //all sprites bounce at the screen edges
  for (var i = 0; i < allSprites.length; i++) {
    var s = allSprites[i];
    if (s.position.x < 0) {
      s.position.x = 1;
      s.velocity.x = abs(s.velocity.x);
    }

    if (s.position.x > width) {
      s.position.x = width - 1;
      s.velocity.x = -abs(s.velocity.x);
    }

    if (s.position.y < 0) {
      s.position.y = 1;
      s.velocity.y = abs(s.velocity.y);
    }

    if (s.position.y > height) {
      s.position.y = height - 1;
      s.velocity.y = -abs(s.velocity.y);
    }
  }

  //draw all the sprites added to the sketch so far
  //the positions will be updated automatically at every cycle
  drawSprites();
}








