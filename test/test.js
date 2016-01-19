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
                contents: new Buffer('.fm-li .fm-horn{display:block;width:36px;background:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAkCAMAAADW3miqAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAABvFBMVEX/////QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED////9bXgGAAAAknRSTlMAACG7zRxM5UoDg/pIFHUuJLx+p1L2bWDs41ChSQuB/ZQKIyI7sa4dpELnkLr4ZTDqYebh19jZ0IcbD0f+7e8WBAGjSzaV6Anzf/LwGekMQfX8OJ9jeFOiFSfOvhHkTU/rvTxOEybPpT30nVzxhESNkpfcwWQCm1Yf+78rLA0qKSg+Gop8mbL5c1UYfTI03R7A04VrH8sAAAABYktHRACIBR1IAAAAB3RJTUUH3wgbEREdte8ZiwAAAcFJREFUOMvN0+tbEkEUB2COmrilmFCZYGGkgFRYosEqYqgBsl4qrWjNyi5qQebdLMvK7jfr9xc7w+6q8Azrt57Oh50zu+/Oc3b2jMXyfwYVRFl5xaGCGwJUaQWqzJF0GDiCap7W2GrF6GgdYHdo6BiOnxCh+pNocJILjXxy6rQbTXvojOesx+Mpa24BvD4iv4aIWgM4t4vOX4AWgSB/5t8tvO0iLhmoHaGOzs7L4YhMBuqKOHnaHe3x6cga65Uk6Upcf78P/TQARHh+lZWlr5RI7t8XjqT6FAZZ7ksrQzoaHilGRKPXrt9gwxjGS6BKPtyEl11voU+Ibmsoo6QzRHegmiGaQDPRXWWyBLqnj/fZvgcemKIpPDRb6REfHispVtOT6LQQuTRkQ0u+F2ZM0OzTKKubniEo3HEXK1jK5vCc5XIuJxv/LlOInDQHvOD5PBaMH4zFClVVw0vLKwaSV9d4OueOvdTRxLreT3j1eq9wFhsJBI1+evN2k8e7bAixLN+Cas28n8z3b1GPf/ACW+yDuvkk+XEdn+KiI2UHHJ81tIYvX8Xnjr6lWWl59P3HTyqB6NfvA08wi+0/f7cF6B/GDugtfk8DPBhhAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDE1LTA4LTI3VDE3OjE3OjI5KzA4OjAwwLOU7gAAACV0RVh0ZGF0ZTptb2RpZnkAMjAxNS0wOC0yN1QxNzoxNzoyOSswODowMLHuLFIAAAAZdEVYdFNvZnR3YXJlAEFkb2JlIEltYWdlUmVhZHlxyWU8AAAAAElFTkSuQmCC) center center no-repeat;background-size:18px} /*base64:skip*/');
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
                assert.equal(file.contents.toString('utf8'), '.fm-li .fm-horn{display:block;width:36px;background:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAkCAMAAADW3miqAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAABvFBMVEX/////QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED/QED////9bXgGAAAAknRSTlMAACG7zRxM5UoDg/pIFHUuJLx+p1L2bWDs41ChSQuB/ZQKIyI7sa4dpELnkLr4ZTDqYebh19jZ0IcbD0f+7e8WBAGjSzaV6Anzf/LwGekMQfX8OJ9jeFOiFSfOvhHkTU/rvTxOEybPpT30nVzxhESNkpfcwWQCm1Yf+78rLA0qKSg+Gop8mbL5c1UYfTI03R7A04VrH8sAAAABYktHRACIBR1IAAAAB3RJTUUH3wgbEREdte8ZiwAAAcFJREFUOMvN0+tbEkEUB2COmrilmFCZYGGkgFRYosEqYqgBsl4qrWjNyi5qQebdLMvK7jfr9xc7w+6q8Azrt57Oh50zu+/Oc3b2jMXyfwYVRFl5xaGCGwJUaQWqzJF0GDiCap7W2GrF6GgdYHdo6BiOnxCh+pNocJILjXxy6rQbTXvojOesx+Mpa24BvD4iv4aIWgM4t4vOX4AWgSB/5t8tvO0iLhmoHaGOzs7L4YhMBuqKOHnaHe3x6cga65Uk6Upcf78P/TQARHh+lZWlr5RI7t8XjqT6FAZZ7ksrQzoaHilGRKPXrt9gwxjGS6BKPtyEl11voU+Ibmsoo6QzRHegmiGaQDPRXWWyBLqnj/fZvgcemKIpPDRb6REfHispVtOT6LQQuTRkQ0u+F2ZM0OzTKKubniEo3HEXK1jK5vCc5XIuJxv/LlOInDQHvOD5PBaMH4zFClVVw0vLKwaSV9d4OueOvdTRxLreT3j1eq9wFhsJBI1+evN2k8e7bAixLN+Cas28n8z3b1GPf/ACW+yDuvkk+XEdn+KiI2UHHJ81tIYvX8Xnjr6lWWl59P3HTyqB6NfvA08wi+0/f7cF6B/GDugtfk8DPBhhAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDE1LTA4LTI3VDE3OjE3OjI5KzA4OjAwwLOU7gAAACV0RVh0ZGF0ZTptb2RpZnkAMjAxNS0wOC0yN1QxNzoxNzoyOSswODowMLHuLFIAAAAZdEVYdFNvZnR3YXJlAEFkb2JlIEltYWdlUmVhZHlxyWU8AAAAAElFTkSuQmCC) center center no-repeat;background-size:18px}');
                done();
            });
        });
	});

});