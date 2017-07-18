const SerialPort = require('serialport');

module.exports = class Usb {
  constructor() {
    this.port = '/dev/ttyUSB0';
    this.options = {baudRate: 115200};
    this.serialPort = new SerialPort(this.port, this.options);
    this.serialPort.on('error', this.errorCallback.bind(this));
    this.serialPort.on('open', this.openCallback.bind(this));
    this.serialPort.on('readable', this.readCallback.bind(this));
  }

  openCallback(error) {
    if(error) {
      return console.log('Error1: ', error.message);
    }
    serialPort.flush();
  }

  errorCallback(error) {
    console.log('Error: ', error.message);
  }

  readCallback() {
    console.log('Read:', this.serialPort.read().toString());
  }

  send(string) {
    this.serialPort.write(string+'\r', 'ascii', function(error) {
      console.log('message written');
    });
  }
};
