'use strict';
//var gulp = require('gulp');
// NodeJS library
var fs     = require('fs');
var assert = require('assert');

// NPM library
var gutil = require('gulp-util');
var es    = require('event-stream');

// Local library
var hairline = require('../src/index');

describe('gulp-css-hairline', function () {

    // define here beforeEach(), afterEach()

    it('should not modify original options object', function () {
        var opts = {
            foo: 'bar'
        };

        hairline(opts);
        assert.equal(opts.htmlCls, undefined);
    });

    describe('in buffer mode', function () {
        it('should add css border', function (done) {
            // create the fake file
            var fakeFile = new gutil.File({
                contents: new Buffer('.sig-navbar{height:44px;border-bottom:1px #49c06c solid;z-index:20;}')
            });

            // Create a css-hairline plugin stream
            var stream = hairline();

            // write the fake file to it
            stream.write(fakeFile);

            // wait for the file to come back out
            stream.once('data', function (file) {
                // make sure it came out the same way it went in
                assert(file.isBuffer());
                // check the contents
                assert.equal(file.contents.toString('utf8'), '.sig-navbar{height:44px;border-bottom:1px #49c06c solid;z-index:20;}.hairline .sig-navbar{\n  border-bottom-width: 0.5px;\n}');
                done();
            });
        });
        it('should comment /*hairline:skip*/', function (done) {
            // create the fake file
            var fakeFile = new gutil.File({
                contents: new Buffer('.spm-cont{border-top:1px #e5e5e5 solid;/*hairline:skip*/}')
            });

            // Create a css-hairline plugin stream
            var stream = hairline();

            // write the fake file to it
            stream.write(fakeFile);

            // wait for the file to come back out
            stream.once('data', function (file) {
                // make sure it came out the same way it went in
                assert(file.isBuffer());
                // check the contents
                assert.equal(file.contents.toString('utf8'), '.spm-cont{border-top:1px #e5e5e5 solid;/*hairline:skip*/}');
                done();
            });
        });
        it('should delete comment not /*hairline:skip*/', function (done) {
            // create the fake file
            var fakeFile = new gutil.File({
                contents: new Buffer('.spm-cont{display:block;width:36px;background:url(data:image/png;base64,iVBORw0KAABvFBMVEX/////QED);/*base64:skip*/}')
            });

            // Create a css-hairline plugin stream
            var stream = hairline();

            // write the fake file to it
            stream.write(fakeFile);

            // wait for the file to come back out
            stream.once('data', function (file) {
                // make sure it came out the same way it went in
                assert(file.isBuffer());
                // check the contents
                assert.equal(file.contents.toString('utf8'), '.spm-cont{display:block;width:36px;background:url(data:image/png;base64,iVBORw0KAABvFBMVEX/////QED);}');
                done();
            });
        });
	});

});