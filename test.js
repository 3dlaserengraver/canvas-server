const bodyParser = require('body-parser');
const Usb = require('./usb.js');
const testBitmaps = require('./testBitmaps.js');
const testGcodes = require('./testGcodes.js');

const usb = new Usb();

const Gcode = require('./gcode.js');
const gcode = new Gcode();

//let gcodeArray = gcode.startup();

//console.log(gcode.startup());


//console.log(gcode.moveToStart(100,50));//planar
//console.log(gcode.moveToStart(100,50,10));//cylindrical

//gcodeArray = gcode.planar(testBitmaps[1], 0, 100);
//gcodeArray = gcode.cylindrical(testBitmaps[1], 100, 100, 30);



// gcodeArray.unshift('M3S0') //turn laser on
gcodeArray = gcode.wall(testBitmaps[0], 10,0);
//gcodeArray.push.apply(gcodeArray, gcode.wall(testBitmaps[1], 10,0));


//Partial arc test:
// gcodeArray.push.apply(gcodeArray, testGcodes[0]);
// // gcodeArray.push('M5'); //turn laser off
// for(let i = 0; i<20;i++){
// gcodeArray.push.apply(gcodeArray,testGcodes[1]);
// gcodeArray.push('G0Z'+i);
// gcodeArray.push.apply(gcodeArray,testGcodes[1].reverse());
// i++;
// gcodeArray.push('G0Z'+i);
// }



console.log(gcodeArray);

usb.sendSync(gcodeArray)
  .then(() => {
  	console.log('All good :)');
  })
  .catch((error) => {
  	console.log('error '+error);
  });

