// Works!

#include <Arduino.h>

#include <Wire.h>
#include <Adafruit_PWMServoDriver.h>

// Setup for two PCA9685 boards
Adafruit_PWMServoDriver pwm1 = Adafruit_PWMServoDriver(0x40, Wire);
Adafruit_PWMServoDriver pwm2 = Adafruit_PWMServoDriver(0x41, Wire);

// you can also call it with a different address and I2C interface
//Adafruit_PWMServoDriver pwm = Adafruit_PWMServoDriver(0x40, Wire);

// Depending on your servo make, the pulse width min and max may vary, you
// want these to be as small/large as possible without hitting the hard stop
// for max range. You'll have to tweak them as necessary to match the servos you
// have!

// Calibrated pulse length counts (ticks)
#define SERVOMIN  180 // This is the 'minimum' pulse length count (out of 4096)
#define SERVOMAX  440 // This is the 'maximum' pulse length count (out of 4096)

// Calibrated pulse lengths in microseconds
#define USMIN  900 // This is the rounded 'minimum' microsecond length based on the minimum pulse of updated 180
#define USMAX  2100 // This is the rounded 'maximum' microsecond length based on the maximum pulse of updated 440
#define SERVO_FREQ 50 // Analog servos run at ~50 Hz updates

// our servo # counter
// uint8_t servonum = 0; // NOT BEING USED!

unsigned long lastAliveTime = 0;

// === Manual Servo Selection ===
// Add servo numbers you want to move in these arrays (0-15)
uint8_t board1_servos[] = {0}; // Example → change/add/remove as desired
// , 1, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14, 15
  //0, 1,
  //  2, 7, 13
uint8_t board2_servos[] = {}; // Example → change/add/remove as desired
// rm 13
  //0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15

// Size of each list (automatically calculated)
const uint8_t board1_servo_count = sizeof(board1_servos) / sizeof(board1_servos[0]);
const uint8_t board2_servo_count = sizeof(board2_servos) / sizeof(board2_servos[0]);

void setup() {
  Serial.begin(9600);
  while (!Serial) {
    ; // Wait for Serial to connect (needed for native USB boards)
  }
  Serial.println("Starting 32 servo sweep...");

  /*
   * In theory the internal oscillator (clock) is 25MHz but it really isn't
   * that precise. You can 'calibrate' this by tweaking this number until
   * you get the PWM update frequency you're expecting!
   * The int.osc. for the PCA9685 chip is a range between about 23-27MHz and
   * is used for calculating things like writeMicroseconds()
   * Analog servos run at ~50 Hz updates, It is importaint to use an
   * oscilloscope in setting the int.osc frequency for the I2C PCA9685 chip.
   * 1) Attach the oscilloscope to one of the PWM signal pins and ground on
   *    the I2C PCA9685 chip you are setting the value for.
   * 2) Adjust setOscillatorFrequency() until the PWM update frequency is the
   *    expected value (50Hz for most ESCs)
   * Setting the value here is specific to each individual I2C PCA9685 chip and
   * affects the calculations for the PWM update frequency.
   * Failure to correctly set the int.osc value will cause unexpected PWM results
   */

  // Initialize both boards
  pwm1.begin();
  pwm1.setOscillatorFrequency(27000000);
  pwm1.setPWMFreq(SERVO_FREQ);

  pwm2.begin();
  pwm2.setOscillatorFrequency(27000000);
  pwm2.setPWMFreq(SERVO_FREQ);

  delay(10);
}

// You can use this function if you'd like to set the pulse length in seconds
// e.g. setServoPulse(0, 0.001) is a ~1 millisecond pulse width. It's not precise!
// void setServoPulse(uint8_t n, double pulse) {
//   double pulselength;

//   pulselength = 1000000;   // 1,000,000 us per second
//   pulselength /= SERVO_FREQ;   // Analog servos run at ~60 Hz updates
//   Serial.print(pulselength); Serial.println(" us per period");
//   pulselength /= 4096;  // 12 bits of resolution
//   Serial.print(pulselength); Serial.println(" us per bit");
//   pulse *= 1000000;  // convert input seconds to us
//   pulse /= pulselength;
//   Serial.println(pulse);
//   pwm.setPWM(n, 0, pulse);
// }



void loop() {
  // Drive each servo one at a time using setPWM()
  // Check if 1 second passed
  if (millis() - lastAliveTime >= 1000) {
    Serial.println("I'm alive");
    lastAliveTime = millis();
  }

    // Sweep up
  for (uint16_t pulselen = SERVOMIN; pulselen <= SERVOMAX; pulselen++) {
    Serial.print("Sweeping up - Pulse: ");
    Serial.println(pulselen);

    // Board 1 selected servos
    for (uint8_t i = 0; i < board1_servo_count; i++) {
      pwm1.setPWM(board1_servos[i], 0, pulselen);
    }

    // Board 2 selected servos
    for (uint8_t i = 0; i < board2_servo_count; i++) {
      pwm2.setPWM(board2_servos[i], 0, pulselen);
    }

    delay(5);
  }

  delay(500); // hold at max

  // Sweep down
  for (uint16_t pulselen = SERVOMAX; pulselen >= SERVOMIN; pulselen--) {
    Serial.print("Sweeping down - Pulse: ");
    Serial.println(pulselen);

    // Board 1 selected servos
    for (uint8_t i = 0; i < board1_servo_count; i++) {
      pwm1.setPWM(board1_servos[i], 0, pulselen);
    }

    // Board 2 selected servos
    for (uint8_t i = 0; i < board2_servo_count; i++) {
      pwm2.setPWM(board2_servos[i], 0, pulselen);
    }

    delay(5);
  }

  delay(500); // hold at min
}
