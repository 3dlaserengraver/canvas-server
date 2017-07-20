module.exports = class Gcode {
  constructor() {
    this.stepsToMm = {
      x: 0.01,
      y: 0.01,
      z: 1.0
    };
    this.laserFocalDistance = 100;
    this.testBitmap = [
      [0, 0, 1, 1, 0, 0, 1, 1],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [2, 3, 4, 0, 0, 0, 3, 3],
      [3, 3, 0, 0, 0, 0, 0, 4],
      [5, 5, 0, 0, 0, 0, 0, 0]
    ];
  }

  config() { // TODO: Remove for prod
    return ['$X', 'F5', '$102=150'];
  }

  gcode(power, bmX, bmY, bmZ) {
    let x = bmX * this.stepsToMm.x;
    let y = bmY * this.stepsToMm.y;
    let z = bmZ * this.stepsToMm.z;
    return "G"+(power===0 ? 0 : 1)+"X"+x+"Y"+y+"Z"+z+"S"+power;
  }

  lineStart(row, start) {
    for(let x=0; x<row.length; x++) {
      if (row[x] !== 0) return x;
    }
    return undefined;
  }

  planar(bitmap, height) {
    let bmZ = height + this.laserFocalDistance;
    let gcodeArray = [];

    for(let bmY=0; bmY<bitmap.length; bmY++) {
      let power = 0;
      for(let bmX=0; bmX<bitmap[bmY].length+1; bmX++) {
        if (bitmap[bmY][bmX] !== power) {
          if (bitmap[bmY][bmX]===undefined && power===0) break;
          gcodeArray.push(this.gcode(power, bmX, (bitmap.length - 1 - bmY), bmZ));
          power = bitmap[bmY][bmX];
        }
      }
    }
    return gcodeArray;
  }

  cylindrical(bitmap, height, diameter) {

  }
};
