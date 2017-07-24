const bodyParser = require('body-parser');
const Usb = require('./usb.js');
const async = require('async');

global.usb = new Usb();

const Gcode = require('./gcode.js');
const gcode = new Gcode();

global.gcodeArrayGlobal = []; //must be global so the callback has access to it

gcodeArrayGlobal = gcode.planar(gcode.testBitmap, 10);

gcodeArrayGlobal.unshift('M3 S0'); //turn laser mode on at power 0
gcodeArrayGlobal.unshift('$X'); //turn laser mode on at power 0
gcodeArrayGlobal.push('M5'); //turn laser off

usb.send(gcodeArrayGlobal.shift());


