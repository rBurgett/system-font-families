import fs from 'fs';
import path from 'path';
import opentype from '../opentype/opentype.js';

const getPlatform = () => (process.platform === 'darwin') ? 'osx' : (/win/.test(process.platform) ? 'windows' : 'linux');
const getFontLocations = () => {
    const platform = getPlatform();
    if(platform === 'osx') {

        const home = process.env.HOME;
        return [
            path.join(home, 'Library', 'Fonts'),
            path.join('/', 'Library', 'Fonts')
        ];

    } else if(platform === 'windows') {

    } else if(platform === 'linux') {
        return [];
    }
};

const getSystemFonts = {
    getFonts() {
        let promiseList = [];
        getFontLocations()
            .reduce((arr, directory) => {
                let files;
                try {
                    files = fs.readdirSync(directory);
                } catch(e) {
                    console.error(e);
                }
                const fontFamilies = files
                    .filter((file) => {
                        const ext = path.extname(file).toLowerCase();
                        return ext === ('.ttf' || '.otf' || '.woff');
                    })
                    .map((file) => path.join(directory, file));
                return arr.concat(fontFamilies);
            }, [])
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
