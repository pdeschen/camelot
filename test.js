var Camelot = require('./camelot.js');

var camelot = new Camelot( {
  'rotate' : '180',
  'banner' : {'position': 'top', 'color': '#00000000', 'line': '#ffffffff'},
  'text-color' : '#ffffffff',
  
  'flip' : 'v'
    });

camelot.on('frame', function (image) {
  console.log('frame received!');
});

camelot.grab( {
      'title' : 'Camelot',
  'font' : 'Arial:24',
  'frequency' : 1,    
}, function (frame) {
  console.log('frame callback');
});