const express = require('express');
const bodyParser = require('body-parser');
// const Usb = require('./usb.js');
const bitmapToGcode = require('./transform.js');
const app = express();
// const usb = new Usb();

app.use(express.static('public'));
app.use(bodyParser.json({limit: '5mb'}));

app.post('/upload', function (req, res) {
  if (typeof req.body.bitmap === 'undefined' ||
    typeof req.body.bitmap.length === 'undefined' ||
    req.body.bitmap.length !== 500) {
    res.status(400);
    res.send('Invalid bitmap');
    return;
  }
  bitmapToGcode(req.body.bitmap, 100);
  res.send('Hello World!');
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
