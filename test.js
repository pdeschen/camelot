var assert = require('assert')
var Camelot = require('./camelot.js')

var camelot = new Camelot( {
  'verbose' : false,
  'rotate' : '180',
  'flip' : 'v'
});
assert.notEqual(camelot, undefined);
