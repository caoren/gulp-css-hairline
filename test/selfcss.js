var hairline = require("../src/");
var vfs = require("vinyl-fs");

vfs.src('./ref/*.css')
    .pipe(hairline())
    .pipe(vfs.dest("./dist/"));