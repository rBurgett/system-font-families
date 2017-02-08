/* global describe, it */

import 'should';
import SystemFonts from '../src/main';
import _ from 'lodash';

describe('SystemFonts', function() {

    it('should be a Function', () => {
        SystemFonts.should.be.a.Function();
    });

    describe('getFontsExtended method', function() {

        const systemFonts = new SystemFonts();

        this.timeout(10000);

        it('should return a Promise', () => {
            systemFonts.getFontsExtended().should.be.a.Promise();
        });

        describe('the Promise', function() {

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

    describe('getFontsExtendedSync method', function() {

        this.timeout(10000);

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

    describe('getFonts method', function() {

        const systemFonts = new SystemFonts();

        this.timeout(10000);

        it('should return a Promise', () => {
            systemFonts.getFonts().should.be.a.Promise();
        });

        describe('the Promise', function() {

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

    describe('getFontsSync method', function() {

        this.timeout(10000);

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

});