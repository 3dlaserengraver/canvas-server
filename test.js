const bodyParser = require('body-parser');
const Usb = require('./usb.js');
const async = require('async');
const testBitmaps = require('./testBitmaps.js');

const usb = new Usb(5*60*1000);

const Gcode = require('./gcode.js');
const gcode = new Gcode();

let gcodeArray = [];

//console.log(gcode.startup());


//console.log(gcode.moveToStart(100,50));//planar
//console.log(gcode.moveToStart(100,50,10));//cylindrical

//gcodeArray = gcode.planar(testBitmaps[1], 0, 100);
gcodeArray = gcode.cylindrical(testBitmaps[1], 50, 50, 35);

gcodeArray.unshift('M3S0') //turn laser on

gcodeArray.push('M5'); //turn laser off

//console.log(gcodeArray);
usb.sendSync(gcodeArray)
  .then(() => {
  	console.log('All good :)');
  })
  .catch((error) => {
  	console.log('error '+error);
  });
