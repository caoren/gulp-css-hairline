'use strict';
var gutil = require('gulp-util');
var through = require('through2');

var regBorder = /([\s\S]*?)\{[\s\S]*border-?(width|left|right|bottom|top)?\s*:\s*(.*);(?!.*\/\*hairline:skip\*\/)/i;
var regSpace = /\s/g;
var regWidth = /(\d+)px/i;

function gulpCssHairline(option){
    option = option || {};
    var htmlCls = option.htmlCls || 'hairline';
    htmlCls = '.' + htmlCls;
    var stream = through.obj(function(file,enc,cb){
        var self = this;
        //如果文件为空，不做任何处理，直接转入下一个操作
        if(file.isNull()){
            self.push(file);
            return cd();
        }
        if(file.isBuffer()){
            var content  = file.contents.toString();
            var contentArr = content.split('}');
            var tteam;
            var cls;
            var prop;
            var width;
            var addStr;
            var addText = [];
            contentArr.forEach(function(item,index){
                tteam = item.match(regBorder);
                if(tteam != null){
                    //.xxx , .yyy
                    cls = tteam[1].replace(regSpace,'').split(',');
                    cls.map(function(item,index){
                        return htmlCls + ' ' + item;
                    });
                    //undefined,width,top,bottom,left,right
                    prop = tteam[2];
                    width = tteam[3].match(regWidth);
                    width = width != null ? width[1] : 0;
                    // 0px do nothing
                    if(width != 0){
                        addStr = cls.join(',');
                        addStr += '{';
                        addStr += 'border';
                        if(prop && prop != 'width'){
                            addStr += '-';
                            addStr += prop;
                        }
                        addStr += '-';
                        addStr += 'width';
                        addStr += ':';
                        addStr += width/2;
                        addStr += 'px;';
                        addStr += '}';
                        addText.push(addStr);
                    }
                }
            });
            content += addText.join('');
            file.contents = new Buffer(content);
            self.push(file);
            return cb();
        }
        //插件不支持直接操作Stream，抛出异常Q
        if(file.isStream()){
            self.emit('error', new gutil.PluginError('gulp-css-hairline', 'Stream not supported!'));
        }
    });
    return stream;
}

module.exports = gulpCssHairline;
