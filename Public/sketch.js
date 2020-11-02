//open and connect socket
let socket = io();


//Listen for confirmation fo connection
socket.on('connect', function(){
  console.log("Connected");
});



var WALL_THICKNESS = 30;


function setup() {
  createCanvas(800, 400);
  player = createSprite(width/2, height/2, 20, 50);
  player.setDefaultCollider();
  player.maxSpeed = 5;

  wallTop = createSprite(width/2, -WALL_THICKNESS/2, width+WALL_THICKNESS*2, WALL_THICKNESS);
  wallTop.immovable = true;

  wallBottom = createSprite(width/2, height+WALL_THICKNESS/2, width+WALL_THICKNESS*2, WALL_THICKNESS);
  wallBottom.immovable = true;

  wallLeft = createSprite(-WALL_THICKNESS/2, height/2, WALL_THICKNESS, height);
  wallLeft.immovable = true;

  wallRight = createSprite(width+WALL_THICKNESS/2, height/2, WALL_THICKNESS, height);
  wallRight.immovable = true;

  //Listen for sprite "data" from the server
  socket.on('data', function(obj) {
    console.log(obj);
    player;
  });

}

function draw() {
  background(255, 255, 255);




//Movement Keycode W = 87 , A = 65 , S = 83, D = 68
  if(keyDown("A")){
    player.rotation -= 4;
    
  }
  if(keyDown("D")){
    player.rotation += 4;
  }
  if(keyDown("W")){
    player.addSpeed(0.2, player.rotation);
  }else{
    player.setSpeed(0.0);
  }


    //all sprites bounce at the screen edges
    for(var i=0; i<allSprites.length; i++) {
      var s = allSprites[i];
      if(s.position.x<0) {
        s.position.x = 1;
        s.velocity.x = abs(s.velocity.x);
      }
  
      if(s.position.x>width) {
        s.position.x = width-1;
        s.velocity.x = -abs(s.velocity.x);
      }
  
      if(s.position.y<0) {
        s.position.y = 1;
        s.velocity.y = abs(s.velocity.y);
      }
  
      if(s.position.y>height) {
        s.position.y = height-1;
        s.velocity.y = -abs(s.velocity.y);
      }
    }

  //draw all the sprites added to the sketch so far
  //the positions will be updated automatically at every cycle
  drawSprites();
}


  //Send Sprite position object
  socket.emit('data', player);




