const express = require('express');
const bodyParser = require('body-parser');
const Usb = require('./usb.js');
const Gcode = require('./gcode.js');
const app = express();
const usb = new Usb();
const gcode = new Gcode();

usb.send(gcode.config()); // TODO: Remove for prod

app.use(express.static('public'));
app.use(bodyParser.json({limit: '5mb'}));

app.post('/upload', function (req, res) {
  if (typeof req.body.bitmap === 'undefined' ||
    typeof req.body.bitmap.length === 'undefined' && req.body.bitmap.length > 0 ||
    typeof req.body.bitmap[0].length === 'undefined' && req.body.bitmap[0].length > 0) {
    res.status(400);
    res.send('Invalid bitmap');
    return;
  }
  let gcodeArray = gcode.planar(gcode.testBitmap);
  gcodeArray.forEach((gcodeString) => {
    usb.send(gcodeString);
  });
  res.send('Sent G-code');
});

app.post('/send', function (req, res) {
  if (typeof req.body.gcode !== 'string') {
    res.status(400);
    res.send('Invalid G-code');
    return;
  }
  usb.send(req.body.gcode);
  res.send(req.body.gcode);
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
