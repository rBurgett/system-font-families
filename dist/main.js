'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _map = require('babel-runtime/core-js/map');

var _map2 = _interopRequireDefault(_map);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _extends3 = require('babel-runtime/helpers/extends');

var _extends4 = _interopRequireDefault(_extends3);

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

var SystemFonts = function SystemFonts() {

    var fontFiles = getFontFiles();

    var tableToObj = function tableToObj(obj, file) {
        return {
            family: obj['1'],
            subFamily: obj['2'],
            file: file
        };
    };

    var extendedReducer = function extendedReducer(m, _ref) {
        var family = _ref.family;
        var subFamily = _ref.subFamily;
        var file = _ref.file;

        if (m.has(family)) {
            var origFont = m.get(family);
            return m.set(family, (0, _extends4.default)({}, origFont, {
                subFamilies: [].concat((0, _toConsumableArray3.default)(origFont.subFamilies), [subFamily]),
                files: (0, _extends4.default)({}, origFont.files, (0, _defineProperty3.default)({}, subFamily, file))
            }));
        } else {
            return m.set(family, {
                family: family,
                subFamilies: [subFamily],
                files: (0, _defineProperty3.default)({}, subFamily, file)
            });
        }
    };

    this.getFontsExtended = function () {
        var promiseList = [];
        fontFiles.forEach(function (file) {
            promiseList.push(new _promise2.default(function (resolve) {
                _ttfinfo2.default.get(file, function (err, fontMeta) {
                    if (!fontMeta) {
                        resolve(null);
                    } else {
                        resolve(tableToObj(fontMeta.tables.name, file));
                    }
                });
            }));
        });
        return new _promise2.default(function (resolve, reject) {
            _promise2.default.all(promiseList).then(function (res) {

                var names = res.filter(function (data) {
                    return data ? true : false;
                }).reduce(extendedReducer, new _map2.default());

                var namesArr = [].concat((0, _toConsumableArray3.default)(names.values())).sort(function (a, b) {
                    return a.family.localeCompare(b.family);
                });

                _fs2.default.writeFileSync('names.json', (0, _stringify2.default)(namesArr, null, '  '), 'utf8');

                resolve(namesArr);
            }, function (err) {
                return reject(err);
            });
        });
    };

    this.getFonts = function () {
        var promiseList = [];
        fontFiles.forEach(function (file) {
            promiseList.push(new _promise2.default(function (resolve) {
                _ttfinfo2.default.get(file, function (err, fontMeta) {
                    if (!fontMeta) {
                        resolve('');
                    } else {
                        resolve(fontMeta.tables.name['1']);
                    }
                });
            }));
        });
        return new _promise2.default(function (resolve, reject) {
            _promise2.default.all(promiseList).then(function (res) {

                var names = res.filter(function (data) {
                    return data ? true : false;
                }).reduce(function (obj, name) {
                    obj[name] = 1;
                    return obj;
                }, {});

                resolve((0, _keys2.default)(names).sort(function (a, b) {
                    return a.localeCompare(b);
                }));
            }, function (err) {
                return reject(err);
            });
        });
    };

    this.getFontsSync = function () {
        var names = fontFiles.reduce(function (arr, file) {
            var data = void 0;
            try {
                data = _ttfinfo2.default.getSync(file);
            } catch (e) {
                return arr;
            }
            return arr.concat([data]);
        }, []).map(function (fontMeta) {
            return fontMeta.tables.name['1'];
        }).reduce(function (obj, name) {
            obj[name] = 1;
            return obj;
        }, {});
        return (0, _keys2.default)(names).sort(function (a, b) {
            return a.localeCompare(b);
        });
    };
};

exports.default = SystemFonts;