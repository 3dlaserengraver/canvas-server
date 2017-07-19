const express = require('express');
const bodyParser = require('body-parser');
const Usb = require('./usb.js');
const app = express();
const usb = new Usb();

app.use(express.static('public'));
app.use(bodyParser.text());

app.post('/upload', function (req, res) {
  usb.send('G0 Z15');
  res.send('Hello World!');
});

app.post('/send', function (req, res) {
  usb.send(req.body);
  res.send(req.body);
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
