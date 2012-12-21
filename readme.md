Camelot [![build status](https://secure.travis-ci.org/pdeschen/camelot.png)](http://travis-ci.org/pdeschen/camelot)
=======

A [node](http://nodejs.org) wrapper for
[fswebcam](https://github.com/fsphil/fswebcam) controller providing
configurable async frame grabbing. Grab frames, receive frame events!

How it works
------------

Once grabbing starts (`grab()`), frames are periodically grabbed off the
web cam (`/dev/videoX`) depending on the provided frequency option.
Within Camelot, once a frame is grabbed, an event is emitted ( `on
(‘frame’, …)` ) containing the binary frame. Also, instead of relying
on event emission, a callback can also be passed to the `grab()`
function, which will apply the callback upon frame grabbing. As per
convensional wisdom, an error event will also be emitted upon Error (
`on (‘error’, …)` ).

Examples
--------

    var Camelot = require('camelot');

    var camelot = new Camelot( {
      'rotate' : '180',
      'flip' : 'v'
    });

    camelot.on('frame', function (image) {
      console.log('frame received!');
    });

    camelot.on('error', function (err) {
      console.log(err);
    });

    camelot.grab( {
      'title' : 'Camelot',
      'font' : 'Arial:24',
      'frequency' : 1    
    });

Features
--------

-   Infinit frame grabbing based on frequency (in sec).
-   Banner
-   Png/Jpeg
-   Rotation
-   Resolution

### Supported Capture Options (default values)

        focus : 'auto',
        brightness : 0,
        contrast : 136,
        saturation : 150,
        hue : 0,
        gamma : 100,
        sharpness : 50

ChangeLog
---------

### 0.0.4

* v0.8 migration 
    * event emitting
    * sys v. util
    * path v. fs
* travis continuous integration

### 0.0.3

* Initial public release

Installation
------------

### Requirements

This module assumes you have a working binary of
[fswebcam](https://github.com/fsphil/fswebcam) along with font
management library and associated font path definition (e.g.
`GDFONTPATH`). This module has been solely tested on Ubuntu with a
[Rocketfish 8MP USB HD
RF-HDWEB](http://www.rocketfishproducts.com/products/computers/RF-HDWEB.html)
webcam but should work with any webcam supported by the v4l library.

### Known supported webcams

* Rocketfish 8MP USB HDRF-HDWEB
* Lenovo x220 built-in

### Git Clone

    $ git clone git://github.com/pdeschen/camelot.git

### Install from npm

    $ sudo npm install camelot [-g]

Todos
-----

-   Instead of relying on fswebcam binary, implement node native module
    using v4l.
-   Since a webcam is a limited resource, a worker pool (of size 1) 
    should be used to queue grabbing jobs.

License
-------

(MIT license)

Copyright © 2011-2012 Pascal Deschenes
[pdeschen@gmail.com](mailto:pdeschen@gmail.com)

Permission is hereby granted, free of charge, to any person obtaining a
copy of this software and associated documentation files (the
“Software”), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS
OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
