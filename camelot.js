var spawn = require('child_process').spawn, sys = require('sys'), uuid = require('node-uuid'), events =
  require('events');
var location = '/tmp/test/';

var Camelot = function (options) {
  // this.emitter = new events.EventEmitter();
  this.emitter = events.EventEmitter.call(this);
  this.opts = mixin(options, {
    'resolution' : '1280x720',
    'png' : '1',
    'greyscale' : false,
    'title' : 'Camelot!',
    'font' : 'Arial:12',
    'banner': false,
    'shadow' : false;
  });
  return this;
};

sys.inherits(Camelot, events.EventEmitter);

Camelot.prototype.grab = function (options, callback) {

  mixin(options, this.opts);

  arguments = [];
  var format = ".jpg";

  for ( var option in this.opts) {
    switch (option) {
      case 'greyscale':
        if (this.opts[option] === true) {
          arguments.push("--" + option);
          arguments.push(this.opts[option]);
        }
        break;
      case 'png':
        format = ".png";
      default:
        arguments.push("--" + option);
        arguments.push(this.opts[option]);
        break;
    }
  }
  // console.log(arguments);

  var iterator = function (arguments, emitter) {
    
    var args = arguments.slice();

    var file = location + uuid() + format;

    // console.log(file);
    console.log(args);
    args.push('--save', file);

    var fswebcam = spawn('fswebcam', args);

    fswebcam.stdout.on('data', function (data) {
    // console.log('stdout: ' + data);
      });

    fswebcam.stderr.on('data', function (data) {
    // console.log('stderr: ' + data);
      });

    fswebcam.on('exit', function (code) {

      require('fs').readFile(file, function (err, data) {

        if (err) {
          emitter.emit('error', err);
          callback.call(err);
        }

        console.log("emitting");
        emitter.emit('frame', data);
        if (callback) {
          callback(data);
        }
      }); /* emit image */
    });
  };

  if (this.opts.frequency) {
    setInterval(iterator, 1000 * this.opts.frequency, arguments, this.emitter);
  } else {
    iterator(arguments, this.emitter);
  }

};

var mixin = function (source, destination) {

  if (typeof (source) == "object") {
    for ( var prop in source) {
      if ((typeof (source[prop]) == "object") && (source[prop] instanceof Array)) {
        if (destination[prop] === undefined) {
          destination[prop] = [];
        }
        for ( var index = 0; index < source[prop].length; index += 1) {
          if (typeof (source[prop][index]) == "object") {
            if (destination[prop][index] === undefined) {
              destination[prop][index] = {};
            }
            destination[prop].push(mixin(source[prop][index], destination[prop][index]));
          } else {
            destination[prop].push(source[prop][index]);
          }
        }
      } else if (typeof (source[prop]) == "object") {
        if (destination[prop] === undefined) {
          destination[prop] = {};
        }
        mixin(source[prop], destination[prop]);
      } else {
        destination[prop] = source[prop];
      }
    }
  }

  return destination;
};

module.exports = Camelot;
