'use strict';

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _opentype = require('../opentype/opentype.js');

var _opentype2 = _interopRequireDefault(_opentype);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var getPlatform = function getPlatform() {
    return process.platform === 'darwin' ? 'osx' : /win/.test(process.platform) ? 'windows' : 'linux';
};

var recGetFile = function recGetFile(target) {
    var stats = void 0;
    try {
        stats = _fs2.default.statSync(target);
    } catch (e) {
        // console.error(e);
        return [];
    }
    if (stats.isDirectory()) {
        var files = void 0;
        try {
            files = _fs2.default.readdirSync(target);
        } catch (e) {
            console.error(e);
        }
        return files.reduce(function (arr, f) {
            return arr.concat(recGetFile(_path2.default.join(target, f)));
        }, []);
    } else {
        var ext = _path2.default.extname(target).toLowerCase();
        if (ext === ('.ttf' || '.otf')) {
            return [target];
        } else {
            return [];
        }
    }
};

var getFontFiles = function getFontFiles() {
    var directories = void 0;
    var platform = getPlatform();
    if (platform === 'osx') {
        var home = process.env.HOME;
        directories = [_path2.default.join(home, 'Library', 'Fonts'), _path2.default.join('/', 'Library', 'Fonts')];
    } else if (platform === 'windows') {
        var winDir = process.env.windir || process.env.WINDIR;
        directories = [_path2.default.join(winDir, 'Fonts')];
    } else {
        // some flavor of Linux, most likely
        var _home = process.env.HOME;
        directories = [_path2.default.join(_home, '.fonts'), _path2.default.join(_home, '.local', 'share', 'fonts'), _path2.default.join('/', 'usr', 'share', 'fonts'), _path2.default.join('/', 'usr', 'local', 'share', 'fonts')];
    }
    return directories.reduce(function (arr, d) {
        return arr.concat(recGetFile(d));
    }, []);
};

var getSystemFonts = {
    getFonts: function getFonts() {
        var promiseList = [];
        getFontFiles().forEach(function (file) {
            promiseList.push(new Promise(function (resolve) {
                _opentype2.default.load(file, function (err, font) {
                    if (!font) {
                        // reject(err);
                        resolve('');
                    } else {
                        var names = font.names.fontFamily;
                        var fontFamily = names.en ? names.en : names[Object.keys(names)[0]];
                        resolve(fontFamily);
                    }
                });
            }));
        });
        return new Promise(function (resolve, reject) {
            Promise.all(promiseList).then(function (res) {

                var names = void 0;
                if (typeof res[0] === 'string') {
                    names = res.filter(function (data) {
                        return data ? true : false;
                    }).reduce(function (obj, name) {
                        obj[name] = 1;
                        return obj;
                    }, {});
                } else {
                    names = res.filter(function (data) {
                        return data ? true : false;
                    }).map(function (data) {
                        return data.tables.name['1'];
                    }).reduce(function (obj, name) {
                        obj[name] = 1;
                        return obj;
                    }, {});
                }

                resolve(Object.keys(names));
            }, function (err) {
                return reject(err);
            });
        });
    }
};

getSystemFonts.getFonts().then(function (res) {
    console.log(res.sort(function (a, b) {
        return a.localeCompare(b);
    }));
}, function (err) {
    return console.error(err);
});