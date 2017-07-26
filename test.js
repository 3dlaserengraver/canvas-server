//const bodyParser = require('body-parser');
//const Usb = require('./usb.js');
//const async = require('async');

//const usb = new Usb();

const Gcode = require('./gcode.js');
const gcode = new Gcode();

let gcodeArray = []; 

console.log(gcode.startupScript());

console.log(gcode.moveToStart(100,50));//planar
//console.log(gcode.moveToStart(100,50,10));//cylindrical

gcodeArray = gcode.planar(gcode.testBitmap, 10, 50);
//gcodeArray = gcode.cylindrical(gcode.testBitmap, 10, 10);

gcodeArray.unshift('M3S0') //turn laser on

gcodeArray.push('M5'); //turn laser off

console.log(gcodeArray);
//usb.send(gcodeArray);
