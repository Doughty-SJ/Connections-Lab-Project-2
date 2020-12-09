let socket = io('/host');

let agents;
let agentsPos;
let gameStateAgentBoxes = {};
let gameStateAgents = {};
let otherPlayerSprites = [];
let dataIsReady = false;
let updateStateReady = false;
let playerJoining = false;
let gamestate;
let q;


socket.on("hostConnected", function (data) {
    console.log("Host Connected");
    gamestate = data;
    dataIsReady = true;
});


// On new player organize gamestate data.
socket.on("clientConnection", function (obj) {
    gamestate = obj;

    console.log("Other socket.IDs on NewPlayer Event: " + gamestate.playerList);
});

//Player Joined update gamestate
socket.on("playerJoined", function (data) {
    console.log("Player has joined!");
    gamestate = data.gamestate;
    joiningPlayerID = data.joinID;

    playerJoining = true;
});

//update gamestate on data emit //60 times a second
socket.on("data", function (gameState) {
    //console.log("State Update");
    gamestate = gameState;
});

//remove sprites when players leave.
socket.on("playerLeft", function (id) {
    console.log(id + " has left.");
    if (otherPlayerSprites[id] != undefined) {
        otherPlayerSprites[id].remove();
        players.remove(otherPlayerSprites[id]);
    }

    socket.emit("data");
    dataIsReady = false;
});



function gameSprites() {


    //Create sprites for other players.
    for (let i = 0; i < gamestate.playerList.length; i++) {

        otherPlayerSprites[gamestate.playerList[i]] = createSprite(
            gamestate.players[gamestate.playerList[i]].x,
            gamestate.players[gamestate.playerList[i]].y,
            20,
            50
        );
        otherPlayerSprites[gamestate.playerList[i]].setDefaultCollider();
        otherPlayerSprites[gamestate.playerList[i]].mass = 0.75;

        players.add(otherPlayerSprites[gamestate.playerList[i]]);
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
    playerJoining = false;
}




function setup() {

    console.log("Setup");
    createCanvas(600, 400);

    environment = new Group();
    agents = new Group();
    agentBoxes = new Group();
    players = new Group();

    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
            createAgent(300 + (20 * i), 100 + (20 * j));
        }
    }

    // for (let i = 0; i < 5; i++) {
    //     for (let j = 0; j < 5; j++) {
    //         createAgent(300 + (20 * i), 100 + (20 * j),15,15, type = 'red');
    //     }
    // }

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            createAgent(100 + (20 * i), 300 + (20 * j),15,15, type = 'red');
        }
    }
    // for (let i = 0; i < 3; i++) {
    //     for (let j = 0; j < 3; j++) {
    //         createAgent(100 + (20 * i), 300 + (20 * j),15,15,);
    //     }
    // }
 

    // for (let i = 0; i < 5; i++) {

    //     createAgent(100 + (20 * i), 200, 15, 15, type = 'red');
    // }
    // for (let i = 0; i < 5; i++) {
    //     createAgent(100 + (20 * i), 220, 15, 15, type = 'red');
    // }
    // for (let i = 0; i < 5; i++) {
    //     createAgent(100 + (20 * i), 240, 15, 15, type = 'red');
    // }


    createAgent(30, 30, 30, 20, type = 'green');



    //update neighbor list for each sprite.
    for (let i = 0; i < allSprites.length; i++) {
        allSprites[i].neigbors = getNeighbors();
    }

    //Create immovable sprites to serve ad boundaries.
    staticEdgeBarriers(30);

    //Update Neighbor List
    for (let i = 0; i < agents.length; i++) {
        agents[i].neighbors = getNeighbors();
        agentBoxes[i].neighbors = getNeighbors();

    }

    //Host Ghost players
    player = createSprite(
        width / 2,
        height / 2,
        10,
        50
    );
    player.setDefaultCollider();
    player.maxSpeed = 5;
    player.mass = 3;
    players.add(player);


}


function draw() {
    background(255, 255, 255);
    let random = getRndInt(0, 180);

    // console.log("No Loop is On");
    // noLoop();

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



    //Collision Management for agents that does not include HitBox
    agents.collide(agents);
    players.displace(agents);
    players.collide(environment);
    agents.bounce(environment);


    //For each agent movement & behavior  **Add additional logic to test for type**
    for (let i = 0; i < agents.length; i++) {

        // like neighbors over totalneighbors
        let ratio = agents[i].likeNeighbors / agents[i].neighborCount

        //Set agentBox to same position as agent
        agentBoxes[i].position.x = agents[i].position.x;
        agentBoxes[i].position.y = agents[i].position.y;
        agents[i].neighborCount = agentBoxes[i].neighborCount;

        //Set alone rate 


        if (agents[i].neighborCount < 3) { agents[i].alone = true } else { agents[i].alone = false };


        //Action intervals for agents
        if (frameCount % 30 == 0) {
            if (agents[i].alone == true || ratio < 0.33) {    //Random Walk

                agents[i].setSpeed(2, getRndInt(0, 360 + (getRndInt(-10, 10))));
                agents[i].rotation = getRndInt(0, 360 + (getRndInt(-10, 10)));

            } else if (agents[i].alone == false) {
                agents[i].setSpeed(0.2, getRndInt(0, 360 + (getRndInt(-10, 10))));
            }
        }
    }

    //The Neighbor Problem: For generalized agents

    for (let i = 0; i < agentBoxes.length; i++) {
        for (let j = 0; j < agents.length; j++) {


            if (agentBoxes[i].overlap(agents[j]) &&
                agentBoxes[i].neighbors["agent" + j].isNeighbor == false) {


                agentBoxes[i].neighborCount++;


                agentBoxes[i].neighbors["agent" + j].isNeighbor = true;
                agents[i].neighbors = agentBoxes[i].neighbors;

                if (agents[i].type == agents[j].type) {
                    agents[i].likeNeighbors++;
                }

            }
            else if ((agentBoxes[i].overlap(agents[j]) == false) &&
                agentBoxes[i].neighbors["agent" + j].isNeighbor == true) {


                agentBoxes[i].neighborCount--;
                agentBoxes[i].neighbors["agent" + j].isNeighbor = false;

                agents[i].neighbors = agentBoxes[i].neighbors;

                if (agents[i].type == agents[j].type) {
                    agents[i].likeNeighbors--;
                }
            }




        };
    }
    // agents[4].shapeColor = "orange";
    // console.log(agents[4].likeNeighbors/agents[4].neighborCount);


    //All sprites bounce on the edge of the canvas.
    canvasBounce();

    //Draw all the sprites added to the sketch so far
    //Positions are updated automatically at every cycle
    drawSprites();

    //Emit Data for Agent and AgentBoxes
    for (let i = 0; i < agents.length; i++) {

        gameStateAgents["agent" + i] = {
            x: agents[i].position.x,
            y: agents[i].position.y
        }
    }

    for (let i = 0; i < agentBoxes.length; i++) {

        gameStateAgentBoxes["agentBox" + i] = {
            x: agentBoxes[i].position.x,
            y: agentBoxes[i].position.y
        }
    }

    socket.emit('agentsData', gameStateAgents);
    socket.emit('agentBoxesData', gameStateAgentBoxes);

}


//create agent
function createAgent(x, y, xWidth = 15, yWidth = 15, type = "blue") {

    //Create agent sprite
    let a = createSprite(x, y, xWidth, yWidth);
    a.setDefaultCollider();

    if (type == 'blue') {
        a.shapeColor = "blue";
    } else {
        a.shapeColor = 'red'
    }

    a.maxSpeed = 4;
    a.friction = 0.05;
    a.mass = 1;
    a.type = type;
    a.alone = true;
    a.likeNeighbors = 0;
    agents.add(a);

    //Create agent field of vision or Hitbox
    let b = createSprite(x, y, 3 * xWidth, 3 * yWidth);
    b.setCollider('rectangle');
    b.depth = 0;
    b.shapeColor = (255, 255, 255, 220);
    b.neighborCount = 0;

    //Initialize list of possible neighbors.

    b.neighbors = getNeighbors();
    a.neighbors = b.neighbors
    a.neighborCount = b.neighborCount;
    b.type = type + "Box";
    agentBoxes.add(b)


}


function getRndInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}


function getNeighbors() {
    let neighbors = {}
    for (let i = 0; i < agents.length; i++) {

        neighbors["agent" + i] = {
            type: agents[i].type,
            isNeighbor: false
        }
    }
    return neighbors;
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

    wallLeft.shapeColor = wallRight.shapeColor = wallTop.shapeColor = wallBottom.shapeColor = color(100, 85, 240);
}
