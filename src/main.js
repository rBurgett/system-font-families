import fs from 'fs';
import path from 'path';
import ttfInfo from 'ttfinfo';

const getPlatform = () => (process.platform === 'darwin') ? 'osx' : (/win/.test(process.platform) ? 'windows' : 'linux');

const recGetFile = (target) => {
    let stats;
    try {
        stats = fs.statSync(target);
    } catch (e) {
        // console.error(e);
        return [];
    }
    if (stats.isDirectory()) {
        let files;
        try {
            files = fs.readdirSync(target);
        } catch (e) {
            console.error(e);
        }
        return files
            .reduce((arr, f) => {
                return arr.concat(recGetFile(path.join(target, f)));
            }, []);
    } else {
        const ext = path.extname(target).toLowerCase();
        if (ext === '.ttf' || ext === '.otf') {
            return [target];
        } else {
            return [];
        }
    }
};

const tableToObj = (obj, file) => {
    return {
        family: obj['1'],
        subFamily: obj['2'],
        file: file
    };
};

const extendedReducer = (m, { family, subFamily, file }) => {
    if (m.has(family)) {
        const origFont = m.get(family);
        return m.set(family, {
            ...origFont,
            subFamilies: [
                ...origFont.subFamilies,
                subFamily
            ],
            files: {
                ...origFont.files,
                [subFamily]: file
            }
        });
    } else {
        return m.set(family, {
            family,
            subFamilies: [subFamily],
            files: {
                [subFamily]: file
            }
        });
    }
};

const SystemFonts = function(options = {}) {

    const { ignoreSystemFonts = false, customDirs = [] } = options;

    if (!Array.isArray(customDirs)) {
        throw new Error('customDirs must be an array of folder path strings');
    }

    const customDirSet = new Set(customDirs);
    const customFontFiles = new Set();

    const getFontFiles = () => {

        let directories = [];

        if (customDirs.length > 0) {
            directories = [...customDirs];
        }

        const platform = getPlatform();
        if (platform === 'osx') {
            const home = process.env.HOME;
            directories = [
                ...directories,
                path.join(home, 'Library', 'Fonts'),
                path.join('/', 'Library', 'Fonts')
            ];
        } else if (platform === 'windows') {
            const winDir = process.env.windir || process.env.WINDIR;
            directories = [
                ...directories,
                path.join(winDir, 'Fonts')
            ];
        } else { // some flavor of Linux, most likely
            const home = process.env.HOME;
            directories = [
                ...directories,
                path.join(home, '.fonts'),
                path.join(home, '.local', 'share', 'fonts'),
                path.join('/', 'usr', 'share', 'fonts'),
                path.join('/', 'usr', 'local', 'share', 'fonts')
            ];
        }

        const filesArr = directories
            .reduce((arr, d) => {
                const files = recGetFile(d);
                if (customDirSet.has(d)) {
                    files.forEach(f => customFontFiles.add(f));
                }
                return arr.concat(files);
            }, []);

        return filesArr;
    };

    const fontFiles = getFontFiles();

    this.getFontsExtended = () => {
        const promiseList = [];

        const filteredFontFiles = !ignoreSystemFonts ? [...fontFiles] : fontFiles
            .filter(f => customFontFiles.has(f));

        filteredFontFiles
            .forEach(file => {
                promiseList.push(new Promise((resolve) => {
                    ttfInfo.get(file, (err, fontMeta) => {
                        if (!fontMeta) {
                            resolve(null);
                        } else {
                            resolve(tableToObj(fontMeta.tables.name, file));
                        }
                    });
                }));
            });
        return new Promise((resolve, reject) => {
            Promise.all(promiseList).then(
                (res) => {

                    const names = res
                        .filter(data => data ? true : false)
                        .reduce(extendedReducer, new Map());

                    const namesArr = [...names.values()]
                        .sort((a, b) => a.family.localeCompare(b.family));

                    resolve(namesArr);
                },
                (err) => reject(err)
            );
        });
    };

    this.getFontsExtendedSync = () => {

        const filteredFontFiles = !ignoreSystemFonts ? [...fontFiles] : fontFiles
            .filter(f => customFontFiles.has(f));

        const names = filteredFontFiles
            .reduce((arr, file) => {
                let data;
                try {
                    data = ttfInfo.getSync(file);
                } catch (e) {
                    return arr;
                }
                return arr.concat([tableToObj(data.tables.name, file)]);
            }, [])
            .filter(data => data ? true : false)
            .reduce(extendedReducer, new Map());

        const namesArr = [...names.values()]
            .sort((a, b) => a.family.localeCompare(b.family));

        return namesArr;
    };

    this.getFonts = () => {
        const promiseList = [];
        fontFiles
            .filter(f => !customFontFiles.has(f))
            .forEach((file) => {
                promiseList.push(new Promise((resolve) => {
                    ttfInfo.get(file, (err, fontMeta) => {
                        if (!fontMeta) {
                            resolve('');
                        } else {
                            resolve(fontMeta.tables.name['1']);
                        }
                    });
                }));
            });
        return new Promise((resolve, reject) => {
            Promise.all(promiseList).then(
                (res) => {

                    const names = res
                        .filter((data) => data ? true : false)
                        .reduce((obj, name) => {
                            obj[name] = 1;
                            return obj;
                        }, {});

                    resolve(Object.keys(names).sort((a, b) => a.localeCompare(b)));
                },
                (err) => reject(err)
            );
        });
    };

    this.getFontsSync = () => {
        const names = fontFiles
            .filter(f => !customFontFiles.has(f))
            .reduce((arr, file) => {
                let data;
                try {
                    data = ttfInfo.getSync(file);
                } catch (e) {
                    return arr;
                }
                return arr.concat([data]);
            }, [])
            .map((fontMeta) => fontMeta.tables.name['1'])
            .reduce((obj, name) => {
                obj[name] = 1;
                return obj;
            }, {});
        return Object.keys(names).sort((a, b) => a.localeCompare(b));
    };

};

export default SystemFonts;