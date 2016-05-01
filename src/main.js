import fs from 'fs';
import path from 'path';
import opentype from '../opentype/opentype.js';

const getPlatform = () => (process.platform === 'darwin') ? 'osx' : (/win/.test(process.platform) ? 'windows' : 'linux');

const recGetFile = (target) => {
    let stats;
    try {
        stats = fs.statSync(target);
    } catch(e) {
        // console.error(e);
        return [];
    }
    if(stats.isDirectory()) {
        let files;
        try {
            files = fs.readdirSync(target);
        } catch(e) {
            console.error(e);
        }
        return files
            .reduce((arr, f) => {
                return arr.concat(recGetFile(path.join(target, f)));
            }, []);
    } else {
        const ext = path.extname(target).toLowerCase();
        if(ext === ('.ttf' || '.otf')) {
            return [ target ];
        } else {
            return [];
        }
    }
};

const getFontFiles = () => {
    let directories;
    const platform = getPlatform();
    if(platform === 'osx') {
        const home = process.env.HOME;
        directories = [
            path.join(home, 'Library', 'Fonts'),
            path.join('/', 'Library', 'Fonts')
        ];
    } else if(platform === 'windows') {
        const winDir = process.env.windir || process.env.WINDIR;
        directories = [
            path.join(winDir, 'Fonts')
        ];
    } else {    // some flavor of Linux, most likely
        const home = process.env.HOME;
        directories = [
            path.join(home, '.fonts'),
            path.join(home, '.local', 'share', 'fonts'),
            path.join('/', 'usr', 'share', 'fonts'),
            path.join('/', 'usr', 'local', 'share', 'fonts')
        ];
    }
    return directories
        .reduce((arr, d) => {
            return arr.concat(recGetFile(d));
        }, []);
};

const getSystemFonts = {
    getFonts() {
        let promiseList = [];
        getFontFiles()
            .forEach((file) => {
                promiseList.push(new Promise((resolve) => {
                    opentype.load(file, (err, font) => {
                        if(!font) {
                            // reject(err);
                            resolve('');
                        } else {
                            const names = font.names.fontFamily;
                            const fontFamily = names.en ? names.en : names[Object.keys(names)[0]];
                            resolve(fontFamily);
                        }
                    });
                }));
            });
        return new Promise((resolve, reject) => {
            Promise.all(promiseList).then(
                (res) => {

                    let names;
                    if(typeof res[0] === 'string') {
                        names = res
                            .filter((data) => data ? true : false)
                            .reduce((obj, name) => {
                                obj[name] = 1;
                                return obj;
                            }, {});
                    } else {
                        names = res
                            .filter((data) => data ? true : false)
                            .map((data) => data.tables.name['1'])
                            .reduce((obj, name) => {
                                obj[name] = 1;
                                return obj;
                            }, {});
                    }

                    resolve(Object.keys(names));
                },
                (err) => reject(err)
            );
        });
    }
};

getSystemFonts.getFonts().then(
    (res) => {
        console.log(res.sort((a, b) => a.localeCompare(b)));
    },
    (err) => console.error(err)
);
