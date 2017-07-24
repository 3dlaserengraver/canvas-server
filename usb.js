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
    var rxString = this.serialPort.read().toString();
    console.log("Read Callback: "+ rxString);

    rxString = rxString.replace(/\n/,'').replace(/\r/, ''); 

    if(((rxString === 'ok') || (rxString ==='o')) && (gcodeArrayGlobal.length>0)){ //the 'o' is because of a glitch that sometimes sends the 'g' and 'o' seperately
      usb.send(gcodeArrayGlobal.shift());
    }
    else{
      let selector = /error:([0-9]+)/
      let error = rxString.match(selector);
      // switch(error){
      //    14 : //GRBL buffer full, try again
      //     usb.send(gcodeArrayGlobal[i]);
      //     i++;
      //     break;
          //TODO handle more errors...
      //}

    }
  }

  send(string) {
    this.serialPort.write(string+'\r', 'ascii', function(error) {
      console.log('message written:');
      console.log(string);
    }); 
  }

};
