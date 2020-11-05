//declare variables
let playerID;
let gamestate;
let player;
let playerList = [];
let otherPlayerSprites = [];
let playerPos;
let test;
var WALL_THICKNESS = 30;

//open and connect socket
let socket = io();

//Listen for confirmation of connection
socket.on('connect', function () {
  console.log("Connected");
  playerID = socket.id;
  socket.emit('newPlayer');
});

//Get gamestate data
socket.on('state', function (obj) {
  //console.log(obj);
  gamestate = obj;
  playerList = obj.playerList;
})

//test = createSprite(200,200,50,50);
//socket.broadcast.emit("test", test);

function setup() {

  console.log("setup");

  frameRate(45);
  createCanvas(800, 400);


  

  

  //Remove client from playerList
  const index = playerList.indexOf(socket.id);
  if (index > -1) {
    playerList.splice(index, 1);
  }

  //Create sprites for other players -- maybe this needs to be done on every newplayer.
  for (let i = 0; i < playerList.length; i++) {

    console.log(gamestate.players[playerList[i]]);
    otherPlayerSprites[playerList[i]] = createSprite(gamestate.players[playerList[i]].x, gamestate.players[playerList[i]].y, 20, 50);
  }

  //Set Client as active player and create sprite
  player = gamestate.players[playerID];
  player = createSprite(player.x, player.y, 20, 50);
  player.setDefaultCollider();
  player.maxSpeed = 5;

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

//testing emit on sprites
test = createSprite(200, 200, 50, 50);
socket.broadcast.emit("test", test);


  //Send player Sprite position object when key is pressed
  if (keyIsPressed === true) {
    socket.emit('data', playerPos);
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
  playerPos = { x: player.position.x, y: player.position.y, ID: playerID };



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








