/* global describe, it */

import 'should';
import getSystemFonts from '../src/main';

describe('getSystemFonts', function() {

    this.timeout(10000);

    it('should return a Promise', () => {
        getSystemFonts().should.be.a.Promise();
    });

    describe('the Promise', function() {

        it('should be fulfilled with an array of strings', (done) => {
            getSystemFonts().then(
                (res) => {
                    const isArray = Array.isArray(res);
                    if(isArray && res.length > 0) {
                        const containsStrings = res.reduce((bool, d) => {
                            if(typeof d !== 'string') return false;
                            return bool;
                        }, true);
                        if(containsStrings) {
                            done();
                        }
                    }
                },
                (err) => console.error(err)
            );
        });

    });

});
