'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _map = require('babel-runtime/core-js/map');

var _map2 = _interopRequireDefault(_map);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _set = require('babel-runtime/core-js/set');

var _set2 = _interopRequireDefault(_set);

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

var tableToObj = function tableToObj(obj, file) {
    return {
        family: obj['1'],
        subFamily: obj['2'],
        file: file
    };
};

var extendedReducer = function extendedReducer(m, _ref) {
    var family = _ref.family,
        subFamily = _ref.subFamily,
        file = _ref.file;

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

var SystemFonts = function SystemFonts() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var _options$ignoreSystem = options.ignoreSystemFonts,
        ignoreSystemFonts = _options$ignoreSystem === undefined ? false : _options$ignoreSystem,
        _options$customDirs = options.customDirs,
        customDirs = _options$customDirs === undefined ? [] : _options$customDirs;


    if (!Array.isArray(customDirs)) {
        throw new Error('customDirs must be an array of folder path strings');
    }

    var customDirSet = new _set2.default(customDirs);
    var customFontFiles = new _set2.default();

    var getFontFiles = function getFontFiles() {

        var directories = [];

        if (customDirs.length > 0) {
            directories = [].concat((0, _toConsumableArray3.default)(customDirs));
        }

        var platform = getPlatform();
        if (platform === 'osx') {
            var home = process.env.HOME;
            directories = [].concat((0, _toConsumableArray3.default)(directories), [_path2.default.join(home, 'Library', 'Fonts'), _path2.default.join('/', 'Library', 'Fonts')]);
        } else if (platform === 'windows') {
            var winDir = process.env.windir || process.env.WINDIR;
            directories = [].concat((0, _toConsumableArray3.default)(directories), [_path2.default.join(winDir, 'Fonts')]);
        } else {
            // some flavor of Linux, most likely
            var _home = process.env.HOME;
            directories = [].concat((0, _toConsumableArray3.default)(directories), [_path2.default.join(_home, '.fonts'), _path2.default.join(_home, '.local', 'share', 'fonts'), _path2.default.join('/', 'usr', 'share', 'fonts'), _path2.default.join('/', 'usr', 'local', 'share', 'fonts')]);
        }

        var filesArr = directories.reduce(function (arr, d) {
            var files = recGetFile(d);
            if (customDirSet.has(d)) {
                files.forEach(function (f) {
                    return customFontFiles.add(f);
                });
            }
            return arr.concat(files);
        }, []);

        return filesArr;
    };

    var fontFiles = getFontFiles();

    this.getFontsExtended = function () {
        var promiseList = [];

        var filteredFontFiles = !ignoreSystemFonts ? [].concat((0, _toConsumableArray3.default)(fontFiles)) : fontFiles.filter(function (f) {
            return customFontFiles.has(f);
        });

        filteredFontFiles.forEach(function (file) {
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

                resolve(namesArr);
            }, function (err) {
                return reject(err);
            });
        });
    };

    this.getFontsExtendedSync = function () {

        var filteredFontFiles = !ignoreSystemFonts ? [].concat((0, _toConsumableArray3.default)(fontFiles)) : fontFiles.filter(function (f) {
            return customFontFiles.has(f);
        });

        var names = filteredFontFiles.reduce(function (arr, file) {
            var data = void 0;
            try {
                data = _ttfinfo2.default.getSync(file);
            } catch (e) {
                return arr;
            }
            return arr.concat([tableToObj(data.tables.name, file)]);
        }, []).filter(function (data) {
            return data ? true : false;
        }).reduce(extendedReducer, new _map2.default());

        var namesArr = [].concat((0, _toConsumableArray3.default)(names.values())).sort(function (a, b) {
            return a.family.localeCompare(b.family);
        });

        return namesArr;
    };

    this.getFonts = function () {
        var promiseList = [];
        fontFiles.filter(function (f) {
            return !customFontFiles.has(f);
        }).forEach(function (file) {
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
        var names = fontFiles.filter(function (f) {
            return !customFontFiles.has(f);
        }).reduce(function (arr, file) {
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