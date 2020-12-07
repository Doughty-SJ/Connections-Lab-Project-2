//declare variables
let gamestate;
let player;
let otherPlayerSprites = [];
let playerPos;
let hostConnected = false;
let updateStateReady = false;
let dataIsReady = false;
let playerJoining = false;
let joiningPlayerID;
var WALL_THICKNESS = 30;

//open and connect socket
let socket = io("/clients");

//Listen for confirmation of connection
socket.on("connect", function () {
  console.log("Connected");
  console.log("This Client's playerID: " + socket.id);
  socket.emit("newPlayer");
  socket.emit("playerJoined");
});

// On new player organize gamestate data.
socket.on("newPlayer", function (obj) {
  gamestate = obj;

  //data is loaded
  dataIsReady = true;
  console.log("Other socket.IDs on NewPlayer Event: " + gamestate.playerList);
});

//Player Joined
socket.on("playerJoined", function (data) {
  console.log("Player has joined!");
  gamestate = data.gamestate;
  joiningPlayerID = data.joinID;
  playerJoining = true;
});

//Host Connected
socket.on("hostConnected", function () {
  hostConnected = true;
  console.log("The Host is Connected.")
})

//update gamestate
socket.on("data", function (gameState) {

  gamestate = gameState;
});

//remove sprites when players leave.
socket.on("playerLeft", function (id) {
  console.log(id + " has left.");
  if (otherPlayerSprites[id] != undefined) {
    otherPlayerSprites[id].remove();
  }
  socket.emit("data");
  dataIsReady = false;
});




function gameSprites() {
  //create player sprite
  player = createSprite(
    gamestate.players[socket.id].x,
    gamestate.players[socket.id].y,
    10,
    50
  );
  player.setDefaultCollider();
  player.maxSpeed = 1.5;
  player.mass = 3;
  players.add(player)
  player.shapeColor = "red";

  //Create sprites for other players.
  for (let i = 0; i < gamestate.playerList.length; i++) {
    if (gamestate.playerList[i] != socket.id) {
      otherPlayerSprites[gamestate.playerList[i]] = createSprite(
        gamestate.players[gamestate.playerList[i]].x,
        gamestate.players[gamestate.playerList[i]].y,
        20,
        50
      );
      otherPlayerSprites[gamestate.playerList[i]].setDefaultCollider();
      otherPlayerSprites[gamestate.playerList[i]].mass = 0.75;
      otherPlayerSprites[gamestate.playerList[i]].shapeColor = "blue";

      players.add(otherPlayerSprites[gamestate.playerList[i]]);
    }
  }
  //Create sprites for agents.
  for (let i = 0; i < gamestate.agentsList.length; i++) {

    let q = createSprite(
      gamestate.agents[gamestate.agentsList[i]].x,
      gamestate.agents[gamestate.agentsList[i]].y,
      15,
      15);
    q.setDefaultCollider();
    q.shapeColor = "white";
    q.maxSpeed = 4;
    q.friction = 0.05;
    q.mass = 1;
    q.alone = true;
    agents.add(q);

  }
  dataIsReady = false;
  updateStateReady = true;
}

function updateState() {
  for (i = 0; i < gamestate.playerList.length; i++) {
    if (otherPlayerSprites[gamestate.playerList[i]] != undefined) {
      otherPlayerSprites[gamestate.playerList[i]].position.x =
        gamestate.players[gamestate.playerList[i]].x;
      otherPlayerSprites[gamestate.playerList[i]].position.y =
        gamestate.players[gamestate.playerList[i]].y;
      otherPlayerSprites[gamestate.playerList[i]].rotation =
        gamestate.players[gamestate.playerList[i]].r;
    }
    for (let i = 0; i < agents.length; i++) {
      if (agents[i] != undefined) {
        agents[i].position.x = gamestate.agents[gamestate.agentsList[i]].x;
        agents[i].position.y = gamestate.agents[gamestate.agentsList[i]].y;
      }
    }
  }
}

function newPlayerSprite() {
  //new joiner sprite.
  console.log(joiningPlayerID);
  otherPlayerSprites[joiningPlayerID] = createSprite(
    gamestate.players[joiningPlayerID].x,
    gamestate.players[joiningPlayerID].y,
    20,
    50
  );
  players.add(otherPlayerSprites[joiningPlayerID]);
  otherPlayerSprites[joiningPlayerID].shapeColor = "blue";
  playerJoining = false;
}

function setup() {
  console.log("Setup");
  createCanvas(600, 400);

  agents = new Group();
  environment = new Group();
  players = new Group();

  //Create Static Barriers
  staticEdgeBarriers(30);


}

function draw() {
  background(80, 240, 80);

  if (dataIsReady) {
    gameSprites();
  }
  if (updateStateReady) {
    updateState();
  }
  if (playerJoining) {
    console.log("Creating sprite for new joiner.");
    newPlayerSprite();
  }

  players.collide(environment);
  agents.collide(environment);
  players.collide(players);



  if (updateStateReady) {
    //Send player Sprite position object when key is pressed
    if (keyIsPressed === true) {
      socket.emit("playerData", playerPos);
    }

    //Movement Keycode W = 87 , A = 65 , S = 83, D = 68
    if (keyDown("A")) {
      player.rotation -= 4;
    }
    else if (keyDown("D")) {
      player.rotation += 4;
    }
    if (keyDown("W")) {
      player.addSpeed(0.2, player.rotation);

    } else if (keyDown('S')) {
      player.addSpeed(-0.2, player.rotation);
    } else {
      player.setSpeed(0.0);
    }

    //Position and ID data for Client-player
    playerPos = {
      x: player.position.x,
      y: player.position.y,
      ID: socket.id,
      r: player.rotation
    };
  };

  //all sprites bounce at the screen edges
  canvasBounce();

  //draw all the sprites added to the sketch so far
  //the positions will be updated automatically at every cycle
  drawSprites();
}

function canvasBounce() {
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
}

function staticEdgeBarriers(WALL_THICKNESS) {
  //Create Static Barriers
  wallTop = createSprite(width / 2, -WALL_THICKNESS / 2, width + WALL_THICKNESS * 2, WALL_THICKNESS);
  wallTop.immovable = true;
  wallTop.type = "environment"
  environment.add(wallTop);

  wallBottom = createSprite(width / 2, height + WALL_THICKNESS / 2, width + WALL_THICKNESS * 2, WALL_THICKNESS);
  wallBottom.immovable = true;
  wallBottom.type = "environment"
  environment.add(wallBottom);

  wallLeft = createSprite(-WALL_THICKNESS / 2, height / 2, WALL_THICKNESS, height);
  wallLeft.immovable = true;
  wallLeft.type = "environment"
  environment.add(wallLeft);

  wallRight = createSprite(width + WALL_THICKNESS / 2, height / 2, WALL_THICKNESS, height);
  wallRight.immovable = true;
  wallRight.type = "environment";
  environment.add(wallRight);

  wallLeft.shapeColor = wallRight.shapeColor = wallTop.shapeColor = wallBottom.shapeColor = "black";
}
