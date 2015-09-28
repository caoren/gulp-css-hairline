'use strict';
var gutil = require('gulp-util');
var through = require('through2');

var regBorder = /([\s\S]*?)\{[\s\S]*border-?(width|left|right|bottom|top)?-?(width)?\s*:\s*(.*);(?!.*\/\*hairline:skip\*\/)/i;
var regComment = /(?:\/\*[\s\S]*?\*\/)*/g;
var regWrap = /[\n\r]+/g;
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
            //过滤注释，防止注释中的样式
            content = content.replace(regComment,function(str){
                if(str != '/*hairline:skip*/'){
                    return ''
                }
                return str;
            });

            var contentArr = content.split('}');
            var tteam;
            var cls;
            var prop1;
            var prop2;
            var width;
            var addStr;
            var addText = [];
            contentArr.forEach(function(item,index){
                tteam = item.match(regBorder);
                if(tteam != null){
                    //.xxx , .yyy
                    cls = tteam[1].replace(regWrap,'').split(',');
                    //console.log(cls);
                    cls = cls.map(function(item,index){
                        return htmlCls + ' ' + item;
                    });
                    //undefined,width,top,bottom,left,right
                    prop1 = tteam[2];
                    prop2 = tteam[3];
                    width = tteam[4].match(regWidth);
                    width = width != null ? parseInt(width[1],10) : 0;
                    // 0px do nothing
                    if(width >= 1){
                        addStr = cls.join(',');
                        addStr += '{';
                        addStr += 'border';
                        if(prop2){
                            addStr += '-';
                            addStr += prop1;
                            addStr += '-';
                            addStr += prop2;
                        }
                        else if(prop1 && prop1 != 'width'){
                            addStr += '-';
                            addStr += prop1;
                        }

                        if(!prop2){
                            addStr += '-';
                            addStr += 'width';
                        }
                        addStr += ':';
                        addStr += width/2;
                        addStr += 'px;';
                        addStr += '}';
                        addText.push(addStr);
                    }
                }
            });
            content += addText.join('\n');

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
