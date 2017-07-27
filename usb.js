const SerialPort = require('serialport');

module.exports = class Usb {
  constructor() {
    this.port = '/dev/ttyUSB0';
    this.resolves = [];
    this.rejects = [];
    this.options = {baudRate: 115200};
    this.serialPort = new SerialPort(this.port, this.options);
    this.serialPort.on('error', this.errorCallback.bind(this));
    this.serialPort.on('open', this.openCallback.bind(this));
    this.serialPort.on('readable', this.readCallback.bind(this));
  }

  openCallback(error) {
    if (error) {
      return console.log('Error1: ', error.message);
    }
    this.flush();
  }

  flush() {
    this.serialPort.flush();
  }

  errorCallback(error) {
    console.log('Error: ', error.message);
  }

  readCallback() {
    var data = this.serialPort.read().toString();
    if (data.match(/^error:7\s*$/m) !== null) { // System reset
      console.log('should reset');
      this.resetPromises();
      if (typeof this.onReset !== 'undefined') this.onReset();
      return;
    }
    if (this.resolves.length!==0 && this.rejects.length!==0) {
      if (data.match(/^(o|ok)\s*$/m) !== null) { // Successful command
        console.log('resolving with data: '+data.trim());
        let resolve = this.resolves[0];
        this.shiftPromises();
        resolve(data);
      } else if (data.match(/^error:(\d+)\s*$/m) !== null) { // General error
        console.log('rejecting with data: '+data.trim());
        let reject = this.rejects[0];
        this.shiftPromises();
        reject(Error(data));
      } else { // Ignore
        console.log('invalid: '+data);
        return;
      }
    }
  }

  shiftPromises() {
    this.resolves.shift();
    this.rejects.shift();
  }

  resetPromises() {
    this.resolves = [];
    this.rejects = [];
  }

  handlePromise(resolve, reject) {
    this.resolves.push(resolve);
    this.rejects.push(reject);
  }

  send(data) {
    if (typeof data !== 'string') return Promise.reject(Error('data must be a string'));
    console.log('sending: '+data);
    this.serialPort.write(data+'\r', 'ascii', function(error) {
      if (error) return Promise.reject(Error('Error writing data: '+data));
    });
    return new Promise(this.handlePromise.bind(this));
  }

  sendSync(data) {
    if (!Array.isArray(data)) return Promise.reject(Error('data must be an array'));
    return this.send(data[0])
      .then(() => {
        data.shift();
        return data.length===0 ? Promise.resolve() : this.sendSync(data);
      });
  }
};
