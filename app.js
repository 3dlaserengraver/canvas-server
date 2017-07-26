const express = require('express');
const bodyParser = require('body-parser');
const Usb = require('./usb.js');
const Gcode = require('./gcode.js');
const testBitmaps = require('./testBitmaps.js');
const app = express();
const usb = new Usb();
const gcode = new Gcode();


usb.sendSync(gcode.startup()) // TODO: Remove for prod
  .then(() => {
    console.log('successfully configured usb');
  })
  .catch((error) => {
    console.log('failed to configure usb '+error);
  });

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
  let gcodeArray = gcode.planar(testBitmaps[0]);
  usb.sendSync(gcodeArray)
    .then(() => {
      res.send('Sent G-code');
    })
    .catch((error) => {
      res.status(500);
      res.send(error.message); // Frontend want response as a string
    });
});

app.post('/send', function (req, res) {
  if (typeof req.body.gcode !== 'string') {
    res.status(400);
    res.send('Invalid G-code');
    return;
  }
  usb.send(req.body.gcode)
    .then((data) => {
      res.send(data);
    })
    .catch((error) => {
      res.send(error.message); // Frontend wants the response as a string regardless of failure
    });
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
