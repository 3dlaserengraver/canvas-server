//const bodyParser = require('body-parser');
//const Usb = require('./usb.js');
//const async = require('async');
const testBitmaps = require('./testBitmaps.js');

//const usb = new Usb();

const Gcode = require('./gcode.js');
const gcode = new Gcode();

let gcodeArray = [];

console.log(gcode.startup());

console.log(gcode.moveToStart(100,50));//planar
//console.log(gcode.moveToStart(100,50,10));//cylindrical

gcodeArray = gcode.planar(testBitmaps[0], 10, 100);
//gcodeArray = gcode.cylindrical(gcode.testBitmap, 10, 100);

gcodeArray.unshift('M3S0') //turn laser on

gcodeArray.push('M5'); //turn laser off

//console.log(gcodeArray);
usb.sendSync(gcodeArray);
