var spawn = require('child_process').spawn, sys = require('sys'), uuid = require('node-uuid'), events =
  require('events'), fs = require('fs');
var location = '/tmp/test/';

var Camelot = function (options) {
  this.emitter = events.EventEmitter.call(this);
  this.opts = mixin(options, {
    'resolution' : '1280x720',
    'png' : '1',
    'greyscale' : false,
    'title' : 'Camelot!',
    'font' : 'Arial:12',
    'controls' : {
      'focus' : 'auto',
      'brightness' : 0
    }
  });
  return this;
};

sys.inherits(Camelot, events.EventEmitter);

Camelot.prototype.reset = function () {
  this.opts = {
    'resolution' : '1280x720',
    'png' : '1',
    'greyscale' : false,
    'title' : 'Camelot!',
    'font' : 'Arial:12'
  };
  return this.opts;
};

Camelot.prototype.grab = function (options, callback) {

  mixin(options, this.opts);

  var iterator = function (self) {

    var emitter = self.emitter;
    var opts = self.opts;

    var arguments = [];
    var format = ".jpg";
    console.log('opts', opts);

    for ( var option in opts) {
      switch (option) {
        case 'greyscale':
          if (opts[option] === true) {
            arguments.push("--" + option);
            arguments.push(opts[option]);
          }
          break;
        case 'png':
          format = ".png";
          arguments.push("--" + option);
          arguments.push(opts[option]);
        case 'controls':
          for ( var control in opts[option]) {
            switch (control) {
              case 'brightness':
                var brightness = opts['controls']['brightness'] > 127 ? 127 : opts['controls']['brightness'];
                brightness = brightness < -128 ? -128 : brightness;
                arguments.push("--set");
                arguments.push("Brightness=" + brightness + "");
                continue;
              case 'contrast':
                var contrast = opts['controls']['contrast'] > 255 ? 255 : opts['controls']['contrast'];
                contrast = contrast < 60 ? 60 : contrast;
                arguments.push("--set");
                arguments.push("Contrast=" + contrast + "");
                continue;
              case 'focus':
                if (opts['controls']['focus'] === 'auto') {
                  arguments.push("--set");
                  arguments.push("Focus, Auto=1");
                } else {
                  var focus = opts['controls']['focus'] > 200 ? 200 : opts['controls']['focus'];
                  focus = focus < 0 ? 0 : focus;
                  arguments.push("--set");
                  arguments.push("Focus, Auto=0");
                  arguments.push("--set");
                  arguments.push("Focus (absolute)=" + focus + "");
                }
                continue;
              default:
                continue;
            }
          }
          break;
        default:
          arguments.push("--" + option);
          arguments.push(opts[option]);
          break;
      }
    }

    var file = location + uuid() + format;

    arguments.push('--save', file);

    console.log('with', arguments);

    var fswebcam = spawn('fswebcam', arguments);

    fswebcam.stderr.on('data', function (data) {
      console.log('stdout: ' + data);
    });

    fswebcam.on('exit', function (code) {

      fs.readFile(file, function (err, data) {

        if (err) {
          emitter.emit('error', err);
          if (callback) {
            callback.call(err);
          }
        } else {

          emitter.emit('frame', data);
          fs.unlink(file);
          if (callback) {
            callback(data);
          }
        }
      });
    });
  };

  if (this.opts.frequency) {
    setInterval(iterator, 1000 * this.opts.frequency, this);
  } else {
    iterator(arguments, this.emitter);
  }
};

Camelot.prototype.update = function (options) {
  return mixin(options, this.opts);
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
