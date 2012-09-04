var spawn = require('child_process').spawn, util = require('util'), uuid = require('node-uuid'), events =
  require('events'), fs = require('fs'), logger = require('winston');
var location = '/tmp/camelot/';
fs.mkdir(location, 0777);

var _options = {
  verbose: true,
  device : '/dev/video1',
  resolution : '1280x720',
  png : '1',
  greyscale : false,
  title : 'Camelot!',
  font : 'Arial:12',
  controls : {
    focus : 'auto',
    brightness : 0,
    contrast : 136,
    saturation : 150,
    hue : 0,
    gamma : 100,
    sharpness : 50
  }
};

var Camelot = function (options) {
  this.opts = mixin(options, _options);
  if (!this.opts.verbose) { 
    logger.remove(logger.transports.Console);
  }
  logger.info('init options: ' + JSON.stringify(this.opts));
  return this;
};

util.inherits(Camelot, events.EventEmitter);

Camelot.prototype.reset = function () {
  this.opts = _options;
  logger.info('reset options: ' + JSON.stringify(this.opts));
  return _options;
};

Camelot.prototype.grab =
  function (options, callback) {

    this.opts = mixin(options, this.opts);
    logger.info('with options: ' + JSON.stringify(this.opts));

    var grabber =
      function () {

        events.EventEmitter.call(this);
        var self = this;
        self.arguments = [];
        self.format = ".jpg";


        fs.exists(this.opts.device, function (exists) {

          var p =
            function () {

              for ( var option in this.opts) {
                switch (option) {
                  case 'device':
                    break;
                  case 'greyscale':
                    if (self.opts[option] === true) {
                      self.arguments.push("--" + option);
                      self.arguments.push(self.opts[option]);
                    }
                    break;
                  case 'png':
                    format = ".png";
                    self.arguments.push("--" + option);
                    self.arguments.push(self.opts[option]);
                  case 'controls':
                    for ( var control in self.opts[option]) {
                      switch (control) {
                        case 'brightness':
                          var brightness =
                            self.opts['controls']['brightness'] > 127 ? 127 : self.opts['controls']['brightness'];
                          brightness = brightness < -128 ? -128 : brightness;
                          self.arguments.push("--set");
                          self.arguments.push("Brightness=" + brightness + "");
                          continue;
                        case 'contrast':
                          var contrast =
                            self.opts['controls']['contrast'] > 255 ? 255 : self.opts['controls']['contrast'];
                          contrast = contrast < 60 ? 60 : contrast;
                          self.arguments.push("--set");
                          self.arguments.push("Contrast=" + contrast + "");
                          continue;
                        case 'saturation':
                          var saturation =
                            self.opts['controls']['saturation'] > 255 ? 255 : self.opts['controls']['saturation'];
                          saturation = saturation < 0 ? 0 : saturation;
                          self.arguments.push("--set");
                          self.arguments.push("Saturation=" + saturation + "");
                          continue;
                        case 'gamma':
                          var gamma = self.opts['controls']['gamma'] > 500 ? 500 : self.opts['controls']['gamma'];
                          gamma = gamma < 75 ? 75 : gamma;
                          self.arguments.push("--set");
                          self.arguments.push("Gamma=" + gamma + "");
                          continue;
                        case 'sharpness':
                          var sharpness =
                            self.opts['controls']['sharpness'] > 255 ? 255 : self.opts['controls']['sharpness'];
                          sharpness = sharpness < 0 ? 0 : sharpness;
                          self.arguments.push("--set");
                          self.arguments.push("Sharpness=" + sharpness + "");
                          continue;
                        case 'hue':
                          var hue = self.opts['controls']['hue'] > 127 ? 127 : self.opts['controls']['hue'];
                          hue = hue < -128 ? -128 : hue;
                          self.arguments.push("--set");
                          self.arguments.push("Hue=" + hue + "");
                          continue;
                        case 'focus':
                          if (self.opts['controls']['focus'] === 'auto') {
                            self.arguments.push("--set");
                            self.arguments.push("Focus, Auto=1");
                          } else {
                            var focus = self.opts['controls']['focus'] > 200 ? 200 : self.opts['controls']['focus'];
                            focus = focus < 0 ? 0 : focus;
                            self.arguments.push("--set");
                            self.arguments.push("Focus, Auto=0");
                            self.arguments.push("--set");
                            self.arguments.push("Focus (absolute)=" + focus + "");
                          }
                          continue;
                        default:
                          continue;
                      }
                    }
                    break;
                  default:
                    self.arguments.push("--" + option);
                    self.arguments.push(self.opts[option]);
                    break;
                }
              }

              var file = location + uuid() + format;

              self.arguments.push('--save', file);

              var fswebcam = spawn('fswebcam', self.arguments);
              /*
               * fswebcam.stderr.on('data', function (data) {
               * console.log('stdout: ' + data); });
               */

              fswebcam.on('exit', function (code) {

                fs.exists(file, function (exists) {
                  if (!exists) {
                    var err = new Error('Frame file unavailable.');
                    self.emit('error', err);
                    if (callback) {
                      callback.call(err);
                    }
                  } else {
                    fs.readFile(file, function (err, data) {

                      if (err) {
                        self.emit('error', err);
                        if (callback) {
                          callback.call(err);
                        }
                      } else {

                        self.emit('frame', data);
                        fs.unlink(file);
                        if (callback) {
                          callback(data);
                        }
                      }
                    });
                  }
                });
              });
            };

          if (!exists) {
            var message = 'device not found (' + self.opts.device + ').';
            logger.error(message);
            var err = new Error(message);
            self.emit('error.device', err);
            if (callback) {
              callback.call(err);
            }
            fs.watchFile(self.opts.device, function (curr, prev) {
              logger.info("device status changed.");
              p.apply(self);
            });
            return;
          }
          p.apply(self);
        });
      };

    if (this.opts.frequency) {
      setInterval(function (self) {
        grabber.apply(self);
      }, 1000 * this.opts.frequency, this);
    } else {
      grabber.apply(this);
    }
  };

Camelot.prototype.update = function (options) {
  this.opts = mixin(options, this.opts)
  logger.info('update options: ' + JSON.stringify(this.opts));
  return this.opts;
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

if (process.versions.node.split(".")[1] < 8 ){
  fs.exists = require('path').exists;
} 
module.exports = Camelot;
