/* global describe, it */

import 'should';
import SystemFonts from '../src/main';
import _ from 'lodash';
import path from 'path';

const customFontFolder = path.join('test', 'test-folder');

describe('SystemFonts', () => {

    it('should be a Function', () => {
        SystemFonts.should.be.a.Function();
    });

    describe('getFontsExtended method', () => {

        const systemFonts = new SystemFonts();

        it('should return a Promise', () => {
            systemFonts.getFontsExtended().should.be.a.Promise();
        });

        describe('the Promise', () => {

            it('should be fulfilled with an array of objects', done => {
                systemFonts.getFontsExtended().then(
                    res => {
                        const isArray = Array.isArray(res);
                        if (isArray && res.length > 0) {
                            const containsObjects = res.reduce((bool, d) => {
                                if (!_.isPlainObject(d)) return false;
                                return bool;
                            }, true);
                            if (containsObjects) {
                                done();
                            }
                        }
                    },
                    err => console.error(err)
                );
            });

        });

    });

    describe('getFontsExtendedSync method', () => {

        const systemFonts = new SystemFonts();

        it('should return an array of objects', () => {
            const fontList = systemFonts.getFontsExtendedSync();
            const isArray = Array.isArray(fontList);
            if (isArray && fontList.length > 0) {
                const containsObjects = fontList.reduce((bool, d) => {
                    if (!_.isPlainObject(d)) return false;
                    return bool;
                }, true);
                containsObjects.should.be.True();
            } else {
                throw new Error('Did not find font files!');
            }
        });

    });

    describe('getFonts method', () => {

        const systemFonts = new SystemFonts();

        it('should return a Promise', () => {
            systemFonts.getFonts().should.be.a.Promise();
        });

        describe('the Promise', () => {

            it('should be fulfilled with an array of strings', done => {
                systemFonts.getFonts().then(
                    res => {
                        const isArray = Array.isArray(res);
                        if (isArray && res.length > 0) {
                            const containsStrings = res.reduce((bool, d) => {
                                if (typeof d !== 'string') return false;
                                return bool;
                            }, true);
                            if (containsStrings) {
                                done();
                            }
                        }
                    },
                    err => console.error(err)
                );
            });

        });

    });

    describe('getFontsSync method', () => {

        const systemFonts = new SystemFonts();

        it('should return an array of strings', () => {
            const fontList = systemFonts.getFontsSync();
            const isArray = Array.isArray(fontList);
            let containsStrings;
            if (isArray && fontList.length > 0) {
                containsStrings = fontList.reduce((bool, d) => {
                    if (typeof d !== 'string') return false;
                    return bool;
                }, true);
            }
            containsStrings.should.be.True();
        });

    });

    describe('synchronous methods', () => {

        describe('if ignoreSystemFonts set to false', () => {
            it('system fonts should be included', () => {
                const systemFonts = new SystemFonts({
                    ignoreSystemFonts: false,
                    customDirs: [customFontFolder]
                }); {
                    const fontList = systemFonts.getFontsSync();
                    fontList.length.should.be.greaterThan(1);
                } {
                    const fontList = systemFonts.getFontsExtendedSync();
                    fontList.length.should.be.greaterThan(1);
                }
            });
        });

        describe('if ignoreSystemFonts set to true', () => {
            it('only fonts from custom fonts folders should be included', () => {
                const systemFonts = new SystemFonts({
                    ignoreSystemFonts: true,
                    customDirs: [customFontFolder]
                }); {
                    const fontList = systemFonts.getFontsSync();
                    fontList.length.should.equal(1);
                } {
                    const fontList = systemFonts.getFontsExtendedSync();
                    fontList.length.should.equal(1);
                }
            });
        });

    });

    describe('asynchronous methods', () => {

        describe('if ignoreSystemFonts set to false', () => {
            it('system fonts should be included', done => {
                const systemFonts = new SystemFonts({
                    ignoreSystemFonts: false,
                    customDirs: [customFontFolder]
                });
                Promise
                    .all([
                        systemFonts.getFonts(),
                        systemFonts.getFontsExtended()
                    ])
                    .then(([res0, res1]) => {
                        if (res0.length > 1 && res1.length > 1) {
                            done();
                        } else {
                            done(new Error(`Resolved with a quantities of ${res0.length} and ${res1.length}`));
                        }
                    })
                    .catch(err => done(err));
            });
        });

        describe('if ignoreSystemFonts set to true', () => {
            it('only fonts from custom fonts folders should be included', done => {
                const systemFonts = new SystemFonts({
                    ignoreSystemFonts: true,
                    customDirs: [customFontFolder]
                });
                Promise
                    .all([
                        systemFonts.getFonts(),
                        systemFonts.getFontsExtended()
                    ])
                    .then(([res0, res1]) => {
                        if (res0.length === 1 && res1.length === 1) {
                            done();
                        } else {
                            done(new Error(`Resolved with a quantities of ${res0.length} and ${res1.length}`));
                        }
                    })
                    .catch(err => done(err));
            });
        });

    });

    describe('getFontFilesSync method', () => {
        it('should return all TTF and OTF font files', () => {
            const systemFonts = new SystemFonts();
            const files = systemFonts.getFontFilesSync();
            files.length.should.be.greaterThan(0);
            files.should.be.an.Array();
            files.every(f => typeof f === 'string').should.be.True();
        });
    });

    describe('getAllFontFilesSync method', () => {
        it('should return all TTF, OTF, TTC, and DFONT files', () => {
            const systemFonts = new SystemFonts();
            const files = systemFonts.getAllFontFilesSync();
            files.length.should.be.greaterThan(0);
            files.should.be.an.Array();
            files.every(f => typeof f === 'string').should.be.True();
        });
    });

});