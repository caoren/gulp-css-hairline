# gulp-css-hairline

> Dispose with the CSS border pixels, refer to [CSS retina hairline](http://dieulot.net/css-retina-hairline)

[![Build Status](https://travis-ci.org/caoren/gulp-css-hairline.png)](https://travis-ci.org/caoren/gulp-css-hairline)

## Install

```
$ npm install --save-dev gulp-css-hairline
```

## Usage

```js
var gulp = require('gulp');
var hairline = require('gulp-css-hairline');

gulp.task('default', function () {
    return gulp.src('assets/input.css')
        .pipe(hairline())
        .pipe(gulp.dest('dist/'));
});
```
## Options

#### options.htmlCls
Type: `String`

Default value: `hairline`

Note: html's className.

## Ignore a specific style

You can ignore a style with a comment `/*hairline:skip*/`.
```css
.ignored{
  border:1px #000 solid; /*hairline:skip*/
}
```

## License
Copyright (c) 2015 [Cao Ren](https://github.com/caoren) under the MIT License.
