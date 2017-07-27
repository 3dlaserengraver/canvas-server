
//const test = require('./test.js');

module.exports = class Gcode {
  constructor() {
    this.stepsToMm = {
      x: (1/78.828),//*(200/203),
      y: (1/78.624),//*(200/203.5),
      z: (1000/91.5) //calibration based on the 150 steps/mm setting in grbl
    };
    this.G0feedRate = 1000;
    this.G1feedRate = 1000;
    this.xAbsCenter = 192; //mm
    this.yAbsCenter = 175; //mm
    this.laserFocalDistance = 50;
    this.laserTipOffset = 40;
    this.maxMoveAngle = 114.633; //~ 10 degrees
    this.stepsPerRot = 4126.8;
    this.halfASteps = this.stepsPerRot/2;
    this.stepsToDeg = 360/this.stepsPerRot;
    this.bitMapSize = 500; //*** assumes square arrays
    this.roundTo = 3;
    this.aOffset = -14; //-8

  }

  startup() { // TODO: Remove for prod
    let gcodeArray =  [ '$X',
                        'M5',
                        '$100=78.828',
                        '$101=78.624',
                        '$103=12',
                        //"G10L2P1X200Y300A"+(this.aOffset+359.912),
                        //'G54',
                        //'G0X20Y20F'+this.G0feedRate+'S0',
                        //'A0'
                      ];  //needed to to ensure the homing bar for the rotation does hit the side after homing
    return gcodeArray;
  }

  gcode(power, bmX, bmY, bmZ, size, radius) {

    if(typeof(radius) === 'undefined'){ //planar mode
      let resize = (size/this.stepsToMm.x)/this.bitMapSize;//* assumes we are getting a square array
      let x = bmX * resize * this.stepsToMm.x;
      let y = bmY * resize * this.stepsToMm.y;
      let z = bmZ * this.stepsToMm.z;
      if(power === 0)
        return "G"+0+"X"+x.toFixed(this.roundTo)+"Y"+y.toFixed(this.roundTo)+"Z"+z.toFixed(this.roundTo)+"F"+this.G0feedRate+"S0";
      else
        return "G"+1+"F"+this.G1feedRate+0+"X"+x.toFixed(this.roundTo)+"Y"+y.toFixed(this.roundTo)+"Z"+z.toFixed(this.roundTo)+"S"+Math.round(power*1000/255);

    }
    else{ //cylindar mode forcing it to do 360 degrees
      let resizeA = this.stepsPerRot/this.bitMapSize; //(size/this.stepsToDeg)/this.bitMapSize;
      let resizeZ = (size/this.stepsToMm.z)/this.bitMapSize;//*** assumes we are getting a square array
      radius = radius + this.laserFocalDistance + this.laserTipOffset;
      let a = (bmX * resizeA * this.stepsToDeg);
      let x = (radius * Math.cos(a*Math.PI/180));
      let y = (radius * Math.sin(a*Math.PI/180));
      let z = (bmY * resizeZ * this.stepsToMm.z);
      a = (a+180);

      // let i = -x;
      // let j = -y;

      if(power === 0){
        //return "G"+3+"X"+x.toFixed(this.roundTo)+"Y"+y.toFixed(this.roundTo)+"Z"+z.toFixed(this.roundTo)+"I"+i+"J"+j+"A"+a.toFixed(this.roundTo)+"F"+this.G0feedRate+"S0";
        return "G"+0+"X"+x.toFixed(this.roundTo)+"Y"+y.toFixed(this.roundTo)+"Z"+z.toFixed(this.roundTo)+"A"+a.toFixed(this.roundTo)+"F"+this.G0feedRate+"S0";
      }
      else
        return "G"+1+"F"+this.G1feedRate+0+"X"+x.toFixed(this.roundTo)+"Y"+y.toFixed(this.roundTo)+"Z"+z.toFixed(this.roundTo)+"A"+a.toFixed(this.roundTo)+"S"+Math.round(power*1000/255);
    }
  }

  lineStart(row, start) {
    for(let x=0; x<row.length; x++) {
      if (row[x] !== 0) return x;
    }
    return undefined;
  }

  invertCoordinate(max, coordinate) {
    return (max - 1 - coordinate);
  }


  planar(bitmap, size, height) {
    this.bitMapSize = bitmap.length;
    let bmZ = 0;
    let gcodeArray = [];
    //set coordinate system to bottom left of engraving
    gcodeArray.push("G10L2P1X"+(this.xAbsCenter-size/2)+"Y"+(this.yAbsCenter-size/2)+"Z0A"+this.aOffset);
    gcodeArray.push("G54");
    gcodeArray.push('M3S0');

    for(let bmY=0; bmY<bitmap.length; bmY++) {
      let power = 0;
      for(let bmX=0; bmX<bitmap[bmY].length+1; bmX++) {
        if (bitmap[bmY][bmX] !== power) {
          if (typeof bitmap[bmY][bmX]==='undefined' && power===0) break;
          gcodeArray.push(this.gcode(power, bmX, this.invertCoordinate(bitmap.length, bmY), bmZ, size));
          power = bitmap[bmY][bmX];
        }
      }
    }
    gcodeArray.push('M5');
    gcodeArray.push("G10L2P1X0Y0Z0A"+this.aOffset);
    gcodeArray.push("G0X20Y20F"+G0feedRate+"S0");


    return gcodeArray;
  }

cylindrical(bitmap, size, height, diameter) {
  this.bitMapSize = bitmap.length;
  let gcodeArray = [];
  let radius = diameter/2;
  let moveAngle = this.maxMoveAngle;
  let bmZ = height;

  //Move to start location
  let x = this.xAbsCenter + radius + this.laserFocalDistance+this.laserTipOffset;
  let y = 0;
  gcodeArray.push("G"+0+"X"+x+"Y"+y+"F"+this.G0feedRate+"S0");
  y = this.yAbsCenter;
  let a = 180+this.aOffset; //***might be -?
  gcodeArray.push("G"+0+"Y"+y+"A"+a+"F"+this.G0feedRate+"S0");
  //gcodeArray.push("G91.1")
  gcodeArray.push("G10L2P1X"+this.xAbsCenter+"Y"+this.yAbsCenter+"Z0A"+this.aOffset);
  gcodeArray.push("G54");
  gcodeArray.push('M3S0');
  let bmX = 0;

  for(let bmY=0; bmY<bitmap.length; bmY++){
    let power = 0;
    for(bmX = 0; bmX<bitmap[bmY].length+1; bmX++){
      if(bitmap[bmY][bmX] !== power || (moveAngle < this.maxMoveAngle)){ //&& power > 0)){
        if(typeof bitmap[bmY][bmX]==='undefined' && power===0) break;
        gcodeArray.push(this.gcode(power, bmX*(1+bmY), bmY, bmZ, size, radius));
        power = bitmap[bmY][bmX];
        moveAngle = 0;
      }
    }
    moveAngle++;
  }
  //turn laser off and set coordinate system to center
  gcodeArray.push('M5');
  gcodeArray.push("G10L2P1X0Y0Z0A"+this.aOffset);

  return gcodeArray;
}
};
