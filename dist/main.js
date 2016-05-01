'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _ttfinfo = require('ttfinfo');

var _ttfinfo2 = _interopRequireDefault(_ttfinfo);

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
        if (ext === '.ttf' || ext === '.otf') {
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

var getSystemFonts = function getSystemFonts() {
    var promiseList = [];
    getFontFiles().forEach(function (file) {
        promiseList.push(new Promise(function (resolve) {
            (0, _ttfinfo2.default)(file, function (err, fontMeta) {
                if (!fontMeta) {
                    resolve('');
                } else {
                    resolve(fontMeta.tables.name['1']);
                }
            });
        }));
    });
    return new Promise(function (resolve, reject) {
        Promise.all(promiseList).then(function (res) {

            var names = res.filter(function (data) {
                return data ? true : false;
            }).reduce(function (obj, name) {
                obj[name] = 1;
                return obj;
            }, {});

            resolve(Object.keys(names));
        }, function (err) {
            return reject(err);
        });
    });
};

exports.default = getSystemFonts;