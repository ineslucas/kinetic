// Need to click the button after defining the camera!

//// ML5 Handpose /////
let handPose;
let hands = [];

let video;
let w = 640;
let h = 480;

let webcams = [];
let myCam;
let thresholdExceeded = false;

function preload() {
  handPose = ml5.handPose();
}

function setup() {
  pixelDensity(1);
  createCanvas(w, h);
  getVideoDevices();

  //start detection in mousePressed() once the canvas is resized based on the current camera selected
  console.log(
    "Press mouse on Canvas to resize Canvas based on connected webcam and start pose detection"
  );
}

// Press mouse to resize Canvas and start pose detection
function mousePressed() {
  if (webcams.length) {
//     resizeCanvas(myCam.width, myCam.height);

    // move this here
    handPose.detectStart(myCam, gotResults);

    // don't need this
    // bodyPose.detectStart(myCam, gotPoses);
  }
}

// This function was previously hiding in the draw() loop
// callback function for body segmentation
function gotResults(result) {
  hands = result;
}

function draw() {
  // mirror video device
  // translate(width, 0);
  // scale(-1, 1);

  // if any webcams are detected
  if (webcams.length) {
    myCam = webcams[0]; // Specify camera, check Console

    image(myCam, 0, 0, width, height);


    // Draw circle at index finger
    if (hands.length > 0) {
      let hand = hands[0];
      let index = hand.index_finger_tip;

      if (hand.confidence > 0.1) {
        fill(255, 0, 150);
        noStroke();
        circle(index.x, index.y, 40);
      }
    }
  }
}

/*------------------------------------*\
  Functions for Video Devices
\*------------------------------------*/

function getVideoDevices() {
  navigator.mediaDevices
    .enumerateDevices()
    .then((devices) => {
      return devices.filter((device) => device.kind === "videoinput");
    })
    .then((filtered) => getVideo(filtered))
    .catch((err) => {
      if (err.message.substring(0, 19) === "cam.getCapabilities")
        alert(
          "InputDeviceInfo.getCapabilities() is not supported in this browser. Try Chrome or MS Edge."
        );
      else console.warn(`${err.name}: ${err.message}`);
    });
}

function getVideo(cams) {
  for (let cam of cams) {
    let index = cams.indexOf(cam);
    let capabilities = cam.getCapabilities();
    let constraints = {
      audio: false,
      video: {
        deviceId: `${cam.deviceId}`,
//         width: `${capabilities.width.max}`,
//         height: `${capabilities.height.max}`,
      },
    };
    webcams[index] = createCapture(constraints, { flipped: true });
    webcams[index].hide();

    console.log(
      `Connected camera: webcams[${index}]\n${cam.label}\nMax width:\t${constraints.video.width}\nMax height:\t${constraints.video.height}\n`
    );
  }
}
