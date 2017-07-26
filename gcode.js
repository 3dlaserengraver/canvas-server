
//const test = require('./test.js');

module.exports = class Gcode {
  constructor() {
    this.stepsToMm = {
      x: 0.01,
      y: 0.01,
      z: 1000/91.5 //calibration based on the 150 steps/mm setting in grbl
    };
    this.G0feedRate = 600;
    this.G1feedRate = 400;
    this.xAbsCenter = 194; //mm
    this.yAbsCenter = 175; //mm
    this.laserFocalDistance = 100;
    this.maxMoveAngle = 114; //~ 10 degrees
    this.stepsPerRot = 100;
    this.halfASteps = this.stepsPerRot/2;
    this.stepsToDeg = 360/this.stepsPerRot;
    this.bitMapSize = 500; //*** assumes square arrays
    this.roundTo = 3;
    this.aOffset = -8;
  }

  startup() { // TODO: Remove for prod
    let gcodeArray =  [ '$H',
                        'M5',
                        "G10L2P1X200Y300A"+(this.aOffset+359.912),
                        'G54',
                        'G0X20Y20F'+this.G0feedRate+'S0',
                        'A0'
                      ];  //needed to to ensure the homing bar for the rotation does hit the side after homing
    return gcodeArray;
  }

  gcode(power, bmX, bmY, bmZ, size, radius) {

    if(typeof(radius) === 'undefined'){ //planar mode
      let resize = (size/stepsToMm.x)/bitmap.length;//* assumes we are getting a square array
      let x = bmX * this.stepsToMm.x.toFixed(this.roundTo);
      let y = bmY * this.stepsToMm.y.toFixed(this.roundTo);
      let z = bmZ * this.stepsToMm.z.toFixed(this.roundTo);
      if(power === 0)
        return "G"+0+"X"+x+"Y"+y+"Z"+z+"F"+this.G0feedRate+"S0";
      else
        return "G"+1+"F"+this.G1feedRate+0+"X"+x+"Y"+y+"Z"+z+"S"+Math.round(power*1000/255);

    }
    else{ //cylindar mode
      let resizeA = (size/this.stepsToDeg)/bitMapSize;
      let resizeZ = (size/stepsToMm.z)/bitMapSize;//*** assumes we are getting a square array
      radius = radius + this.laserFocalDistance;
      let a = (bmX * resizeA * this.stepsToDeg).toFixed(this.roundTo);;
      let x = (radius * Math.cos(a*Math.PI/180)).toFixed(this.roundTo);
      let y = (radius * Math.sin(a*Math.PI/180)).toFixed(this.roundTo);
      let z = (bmY * resizeZ * this.stepsToMm.z).toFixed(this.roundTo);
      a = (a+180).toFixed(this.roundTo);

      if(power === 0)
        return "G"+3+"X"+x+"Y"+y+"Z"+z+"R"+radius+"A"+a+"F"+this.G0feedRate+"S0";
      else
        return "G"+1+"F"+this.G1feedRate+0+"X"+x+"Y"+y+"Z"+z+"A"+a+"S"+Math.round(power*1000/255);
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

  moveToStart(height, size, diameter){
    let gcodeArray = [];
    if(typeof(diameter) === 'undefined'){ //planar
      let x = this.xAbsCenter - size/2;
      let y = this.yAbsCenter - size/2;
      let z = height;
      gcodeArray.push("G"+0+"X"+x+"Y"+y+"Z"+z+"F"+this.G0feedRate+"S0");
    }
    else{ //cylindrical
      let x = this.xAbsCenter +diameter/2 + this.laserFocalDistance;
      let y = 0;
      gcodeArray.push("G"+0+"X"+x+"Y"+y+"F"+this.G0feedRate+"S0");
      y = this.yAbsCenter;
      let a = 180;
      gcodeArray.push("G"+0+"Y"+y+"A"+a+"F"+this.G0feedRate+"S0")
    }
    return gcodeArray;
  }

  planar(bitmap, height=0, size) {
    this.bitMapSize = bitmap.length;
    let bmZ = height + this.laserFocalDistance;
    let gcodeArray = [];
    
    for(let bmY=0; bmY<bitmap.length; bmY++) {
      let power = 0;
      for(let bmX=0; bmX<bitmap[bmY].length+1; bmX++) {
        if (bitmap[bmY][bmX] !== power) {
          if (bitmap[bmY][bmX]===undefined && power===0) break;
          gcodeArray.push(this.gcode(power, bmX, this.invertCoordinate(bitmap.length, bmY), bmZ, size));
          power = bitmap[bmY][bmX];
        }
      }
      // power = undefined;
      // bmY++;
      // if (typeof bitmap[bmY] === 'undefined') break;
      // for(let bmX=bitmap[bmY].length; bmX>=0; bmX--) {
      //   if (bitmap[bmY][bmX] !== power) {
      //     if (bitmap[bmY][bmX]===undefined && power===0) break;
      //     gcodeArray.push('back');
      //     gcodeArray.push(this.gcode(power, bmX, this.invertCoordinate(bitmap.length, bmY), bmZ));
      //     power = bitmap[bmY][bmX];
      //   }
      // }
      // power = 0;
    }
    return gcodeArray;
  }

cylindrical(bitmap, height, size, diameter) {
  this.bitMapSize = bitmap.length;
  let gcodeArray = [];
  let radius = diameter/2;
  let moveAngle = this.maxMoveAngle;
  let bmZ = height;
  
  for(let bmY=0; bmY<bitmap.length; bmY++){
    let power = 0;
    for(let bmX = 0; bmX<bitmap[bmY].length+1; bmX++){
      if(bitmap[bmY][bmX] !== power || (moveAngle < this.maxMoveAngle && power > 0)){
        if(bitmap[bmY][bmX]===undefined && power===0) break;
        gcodeArray.push(this.gcode(power, bmX, bmY, bmZ, size, radius));
        power = bitmap[bmY][bmX];
        moveAngle = 0;
      }
    }
    moveAngle++;
    // bmY++;

    // for(let bmX = bitmap[bmY]; bmX<bitmap[bmY].length+1; bmX--){
    //   if(bitmap[bmY][bmX] !== power || moveAngle < this.maxMoveAngle){
    //     if(bitmap[bmX][bmY]===undefined && power===0) break;
    //     gcodeArray.push(this.gcode(power, bmX, bmY, bmZ, radius));
    //     power = bitmap[bmY][bmX];
    //     moveAngle = 0;
    //   }
    //   moveAngle++;
    // }
  }
  return gcodeArray;
}
};
