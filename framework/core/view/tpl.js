
//html模板模块

//解析组合tpl文件到一个
/* *
 * 参数 @action = []
 * action[0].id = 要插入的位置id 例如<!--T--view--T-->中的view
 * action[0].file = 文件名 ./view/login/main.tpl 只需要 /login/main 即可
 *
 *
 *
 * */

var file = load.tool('file');
var json = load.tool('json');
var config =  load.config();
var cpath =  load.config('!path');


//tpl模块出插入的位置  如果有正则字符要转义
var wrapLeft = '<!'
    , wrapRight = '!>'
    , theTplCache = {}; //tpl文件的缓存



exports.ready = function(stuff,curname,callback){
    //console.log(theTplCache);
    if(theTplCache[curname] && !config.compiled){ /*有缓存则读取缓存*/
        //console.log('tpl缓存');
        callback(theTplCache[curname]);
        return ;
    }
    //console.log(stuff.tpl);
    var tplAry = {}
        , filecontent = [];
    for(var k in stuff.tpl){
        var one = stuff.tpl[k];
        //console.log(one)
        for(var x in one){
            tplAry[x]=x; //
            filecontent.push(read.resource('tpl/'+one[x]+'.tpl'));
            break; //仅第一个属性
        }
    }

    //添加js和css文件的引用
    addReferenceFile(stuff,tplAry);
    //组合tpl
    merger(curname,tplAry,filecontent,callback);

};


//扩展js和css文件的引用
function addReferenceFile(stuff,tplAry){
    //添加js和css引用
    tplAry['src_style'] = '';
    tplAry['src_script'] = '';
    var one = '';
    //css
    for(var css in stuff.csslib){
        one = stuff.csslib[css];
        if(one.indexOf('http')!==0){ //判断是否为外部css库
            one = '/csslib/'+one+'.css';  //本地
        }
        tplAry['src_style'] += '<link rel="stylesheet" type="text/css" href="'+one+'" />';
    }
    tplAry['src_style'] = '<link rel="stylesheet" type="text/css" href="'+stuff.cssname+'" />';
    //js
    for(var js in stuff.jslib){
        one = stuff.jslib[js];
        if(one.indexOf('http')!==0){ //判断是否为外部js库
            one = '/jslib/'+one+'.js'; //本地
        }
        tplAry['src_script'] += '<script type="text/javascript" src="'+one+'"></script>';
    }
    tplAry['src_script'] += '<script type="text/javascript" src="'+stuff.jsname+'" ></script>';
}



//正则替换合并
function merger(name,tplAry,data,callback){
    var content = ''
        , n = 0
        , leg = data.length;
    for(var k in tplAry){
        var one = n<leg?data[n]:tplAry[k]; //src_style,src_script
        if(n==0){ /*html根节点*/
            content += one;
        }else{
            var Tstr = wrapLeft+k+wrapRight
                , rex = new RegExp(Tstr);
            content = content.replace(rex,one+Tstr);
        }
        n++;
    }
    if(config.compress){ /* 压缩文件 */
        content = compress(content);
    }
    //console.log(content);
    /* 缓存模板内容 */
    theTplCache[name] = content;
    //console.log('tpl文件'+content);
    callback(content);
}


//压缩tpl
function compress(tpl){
    return tpl.replace(/\n/g, "") //压缩换行
        .replace(/\s+/g, " ") //压缩空格
        .replace(/\s*<\s*/g, "<") //去掉< >// 括号两旁的空格
        .replace(/\s*>\s*/g, ">") //去掉< >// 括号两旁的空格
        .replace(/<\!--(\n|.)*?-->/g, ""); //去掉<!---   --->注释;
}


