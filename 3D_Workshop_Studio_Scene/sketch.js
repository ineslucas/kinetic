// DEMO 3D STUDIO by Inês Lucas
// Interactive Kinetic Sculpture Workshop with Danny Rosin

// Visualize transformations in 3D space: https://p5js.org/tutorials/coordinates-and-transformations/

let desk;
let angle = 0;
let chair;

// Chair animation
let chairAngle = 0; // Tracks the target angle
let chairRotated = false; // Toggle state
let currentChairAngle = 0; // Smooth animation angle

// Video Art
let video;
let numCylinders = 16;
let cylinderWidth = 5;
let slices = [];

// Colors to choose from:
let redPink;
let pinkMagenta;
let lightPink;
let weedsGreen;
let mutedOrange;
let petroleumBlue;
let wineRed;

function preload() {
  // OBJ files don’t include materials by default, we need to manually apply color, shading, or textures.
  desk = loadModel('desk.obj', true);
  chair = loadModel('chair.stl', true);
  woodTexture = loadImage('wood-texture.jpg');
  curvesTexture = loadImage('curves.png');
  cimentTexture = loadImage('ciment.jpg');
  checkerboardTexture = loadImage('checkerboard.jpg');
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);

  // COLORS
  redPink = color(115, 0, 58);
  pinkMagenta = color(176, 82, 111);
  lightPink = color(248, 202, 217);
  weedsGreen = color(133,161,149);
  mutedOrange = color(225,112,73);
  petroleumBlue = color(15,102,144);
  wineRed = color(122,19,53);

  // DEBUG
  // debugMode(GRID);

  // CAMERA
  cam = createCamera(); // Create a p5.Camera object.
  cam.setPosition(-700, -350, 900); // Top-center.
  cam.lookAt(0, -200, 0); // Point camera at coord.

  // ortho(-width / 2, width / 2, -height / 2, height / 2, 0, 2000); // Left, Right, Bottom, Top, Near, Far

  // perspective(PI / 3, width / height, 1, 2000); // FOV, Aspect Ratio, Near, Far

  // ----------------------------------------

  // VIDEO
  video = createCapture(VIDEO);
  video.size(numCylinders, 240); // Resize video to match cylinder slices
  video.hide();

  for (let i = 0; i < numCylinders; i++) {
    slices[i] = createGraphics(1, 240);
    // Blank graphics buffer for slices:
    // A narrow 1-pixel-wide texture per cylinder
  }

  // ----------------------------------------
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  background(lightPink);

  // LIGHTS
  ambientLight(color('white')); // RGB values OR (color('white'))
  directionalLight (80, 80, 80, -100, -1, 0);
    // How much of R, G, B channels will be allowed in.
    // (origin at x, y, z)
  debugLightPositions();

  // Call every frame to adjust camera based on mouse/touch
  orbitControl();

  displayWalls();
  displayDesk();
  displayLamp();
  displayChair();
  displayArt();
  displayVideoOnArt();
}


function displayWalls(){
  // FLOOR
  noStroke();
  fill(pinkMagenta);
  specularMaterial(100); // Reflects light!
  box(1250, 10, 800); // [width], [height], [depth]

  // CEILING
  push();
  fill(230);
  translate(0, -600, -50);
  rotateX(HALF_PI);
  specularMaterial(255); // Reflects light!
  plane(width + 300, height);
  pop();

  // BACK WALL
  push();
  fill(weedsGreen);
  translate(0, -300, -400);
  specularMaterial(100); // Reflects light!
  plane(width + 300, 600);
  pop();
}

function displayLamp(){
  // BULB
  spotLight(
    color(500, 0, 500),
    -300, -600, -10, // Position (bulbPos)
    0, 1, 0, // Direction (pointing up)
    PI / 3, // Angle
    100 // Concentration
  );

  // LAMP HARDWARE
  push();
  let lampPos = createVector(-300, 140, 0);
  translate(lampPos.x, lampPos.y, lampPos.z); // move all 3 base geometries

    push();
    translate(0, -150, 0);
    fill(petroleumBlue);
    cylinder(50, 20); // Base of Lamp

    translate(0, -115, 0)
    cylinder(5, 250); // Body of Lamp

    fill(180);
    rotateX(PI/2);
    translate(0, 0, 130);
    ambientMaterial(255, 120, 50);
    torus(40, 20); // Top lamp
    pop();

  pop();
}

function displayDesk(){
  push();
  translate(0, -90, 0); // Moves object in space
  scale(2);
  rotateX(PI); // Flip upside down (180º)
  rotateY(PI/2);
  shininess(255);
  textureWrap(REPEAT);
  texture(woodTexture); // Texture from image, not material.
  model(desk);
  pop();
}

function displayChair(){
  push();
  translate(-250, -105, -200);
  rotateX(PI/2);

  currentChairAngle = lerp(currentChairAngle, chairAngle, 0.1);
    // Lerp calculates a # between two # at an increment.
  rotateZ(currentChairAngle);

  // Debugging chair texture with checkerboard pattern:
      // If the checkerboard pattern looks distorted, the UV mapping is off in the .obj file.
      // textureWrap(CLAMP);
      // textureMode(NORMAL); // Uses normalized UVs (0-1)
      // textureWrap(REPEAT);
      // checkerboardTexture.resize(1024, 1024);
      // texture(checkerboardTexture);

  texture(curvesTexture);
  model(chair);
  pop();
}

function keyPressed(){ // CHAIR MOTION
  if (key === 'C' || key === 'c') {
    let newAngle = chairRotated ? 0 : PI / 4; // Toggle between 0 and PI/4
    chairRotated = !chairRotated; // Flip state
    chairAngle = newAngle;
  }
}

function displayArt(){
  for (let i = 0; i < numCylinders; i++){
    push();
    translate(i*20, -300, -390); // Original positioning

    // Continuous animation of Y position
    translate(0, sin(frameCount * 0.08 + i) * 10, 0);

    // Animate the height of each cylinder dynamically
    let h = 200 + sin(frameCount * 0.08 + i) * 50;
      // Base height 200, oscillating ±50

    cylinder(6, h);
    pop();
  }
}

function displayVideoOnArt(){
  // Update textures for each cylinder & adding color opacity filter
  for (let i = 0; i < numCylinders; i++) {
    slices[i].clear(); // So that it stays transparent
    slices[i].image(video, -i, 0, numCylinders, 240); // Extract the i-th slice
    slices[i].fill(42, 98, 39, 150); // Color + transparency
    slices[i].noStroke();
    slices[i].rect(0, 0, 1, 240); // Cover the slice with color

  }

  // Render cylinders with the corresponding video slice
  for (let i = 0; i < numCylinders; i++) {
    push();
    translate( // Original position
      -300 + i * 2.5 * cylinderWidth - (cylinderWidth * numCylinders) / 2,
          // 2.5 => spacing between cylinders
      -350,
      -390
    );

    // Animating Y position of cylinders
    translate(0, cos(frameCount * 0.2 + i) * 10, 0);

    // Apply texture
    texture(slices[i]);
    cylinder(10, 200); // Adjust height and width
    pop();
  }
}

function debugLightPositions(){
  // Debug light at source
  push();
  emissiveMaterial(255, 50, 50); // Glows red
  translate(0, 50, 0); // Move to light origin point
  sphere(10); // Small sphere to represent a light source
  pop();
}


// NOTES

// Ray's tip:
// Make your object white and play with light.
// Red light (255, 0, 0) on a blue object (0, 0, 255) -> Object will be black because values don't have an intersection.
