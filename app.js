const express = require('express');
const Usb = require('./usb.js');
const app = express();
const usb = new Usb();

app.use(express.static('public'));

app.post('/upload', function (req, res) {
  usb.send('G0 Z15');
  res.send('Hello World!');
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
