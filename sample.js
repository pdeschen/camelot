var Camelot = require('./camelot.js'), uuid = require('node-uuid');

var camelot = new Camelot( {
  'rotate' : '180',
  'flip' : 'v'
});
var focus = 10;
var brightness = -128;

camelot.on('frame', function (image) {
  console.log('frame received!');
  var name = uuid();
  require('fs').writeFile('/tmp/' + name + '.png', image, function (err) {
    if (err)
      throw err;
    console.log('saved!');
  });
  focus += 10;
  brightness += 10;
  camelot.update( {
    'title' : name,
    'controls' : {
      'focus' : focus,
      'brightness' : brightness
    }
  });
});

camelot.on('error', function (error) {
  console.log("error", error);
});

camelot.grab( {
  'title' : 'Camelot',
  'font' : 'Arial:24',
  'frequency' : 1,
  'controls' : {
    'focus' : 'auto'
  }
});
