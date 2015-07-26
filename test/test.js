var csshairline = require("../src/");
var vfs = require("vinyl-fs");

vfs.src('./ref/*.css')
    .pipe(csshairline())
    .pipe(vfs.dest("./dist/"));