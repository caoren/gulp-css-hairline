'use strict';
var gutil = require('gulp-util');
var through = require('through2');

var regBorderGroup = /([\s\S]*?)\{[\s\S]*border-?(width|left|right|bottom|top)?-?(width)?\s*:\s*(.*);(?!.*\/\*hairline:skip\*\/)/i;
var regBorderArr = /border-?(width|left|right|bottom|top)?-?(width)?\s*:\s*(.*);(?!.*\/\*hairline:skip\*\/)/gi;
var regBorder = /border-?(width|left|right|bottom|top)?-?(width)?\s*:\s*(.*)/i;
var regComment = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg;///(?:\/\*[\s\S]*?\*\/)*/g;
var regWrap = /[\n\r]+/g;
var regWidth = /(\d+)px/i;
var regWidthRp = /(\d+)(px)?/gi;
var HAIRCOMMENT = '/*hairline:skip*/';


function gulpCssHairline(option){
    option = option || {};
    var htmlCls = option.htmlCls || 'hairline';
    htmlCls = '.' + htmlCls;
    var stream = through.obj(function(file,enc,cb){
        var self = this;
        //file null ,next
        if(file.isNull()){
            self.push(file);
            return cd();
        }
        if(file.isBuffer()){
            var content  = file.contents.toString();
            //过滤注释，防止注释中的样式
            content = content.replace(regComment,function(str){
                if(str != HAIRCOMMENT){
                    return ''
                }
                return str;
            });
            //less处理的css会把注释换行导致正则匹配有问题，此处去除这个多余的换行
            var contentComment = content.split(HAIRCOMMENT);
            var replaceAfter = [];
            contentComment.forEach(function(item,index){
                if(index < contentComment.length - 1){
                    replaceAfter.push(item.replace(/[\n\s]+$/g,""));
                }
                else{
                    replaceAfter.push(item);
                }
            });
            content = replaceAfter.join(HAIRCOMMENT);


            var contentArr = content.split('}');
            var tteam;
            var subtteam;
            var stteam;
            var cls;
            var prop1;
            var prop2;
            var width;
            var addStr;
            var addText = [];
            contentArr.forEach(function(item,index){
                tteam = item.match(regBorderGroup);
                //先获取包含border的每组样式
                if(tteam != null){
                    //.xxx , .yyy
                    cls = tteam[1].replace(regWrap,'').split(',');
                    cls = cls.map(function(item,index){
                        return htmlCls + ' ' + item;
                    });

                    addStr = cls.join(',');
                    addStr += '{';
                    addStr += '\n';
                    //在每组样式中获取有多少个border
                    subtteam = tteam[0].match(regBorderArr);
                    subtteam.forEach(function(item,index){
                        stteam = item.match(regBorder);
                        //undefined,width,top,bottom,left,right
                        prop1 = stteam[1];
                        prop2 = stteam[2];
                        width = stteam[3].match(regWidth);
                        width = width != null ? parseInt(width[1],10) : 0;
                        if(prop1 && prop1 == 'width'){
                            width = stteam[3].match(regWidthRp);
                        }
                        if(width != null && width != 0){
                            addStr += '  border';
                            if(prop1){
                                addStr += '-';
                                addStr += prop1;
                            }
                            if(!prop1 || prop1 != 'width'){
                                addStr += '-';
                                addStr += 'width';
                            }
                            addStr += ': ';
                            if(Array.isArray(width)){
                                width.forEach(function(item,index){
                                    addStr += parseInt(item,10)/2;
                                    addStr += 'px ';
                                });
                            }
                            else if(typeof width == 'number'){
                                addStr += width/2;
                                addStr += 'px';
                            }
                            addStr += ';\n';
                        }
                    });
                    addStr += '}';
                    addText.push(addStr);
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
