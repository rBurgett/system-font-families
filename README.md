# system-font-families
Node lib for getting system font families (all TTF and OTF) using pure JavaScript.

### Installation
```
$ npm install system-font-families
```
### Modern Usage
```
import getSystemFonts from 'system-font-families';

getSystemFonts().then(
  (res) => {
    // res is an array of font family strings
    // do something with the response
  },
  (err) => // handle the error
);
```
### Older Usage
```
var getSystemFonts = require('system-font-families').default;

getSystemFonts().then(
  function(res) {
    // do something with the response
  },
  function(err) {
    // handle the error
  }
);
```
### Notice
This library will not throw an error if it finds a bad or incomplete font. It is designed to skip over any fonts which it has trouble reading.

### npm Scripts
Run the tests:
```
$ npm test
```
Re-compile the source code:
```
$ npm run build
```
Watch the `src` directory and automatically recompile on changes:
```
$ npm run watch
```
### Contributions
Contributions are welcome! If you have any issues and/or contributions you would like to make, feel free to file an issue and/or issue a pull reuqest.

### License
Apache License Version 2.0

Copyright (c) 2016 by Ryan Burgett.
