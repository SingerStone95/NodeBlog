/**
 * 处理基金配置文件数据
 */
var fs = require("fs")
const configFileName =__dirname+"/jijinconfig.json"


exports.addJijin = function (code) {
    // 异步读取，新增基金
    if (code == undefined) {
        console.log('code error');
        return
    }
    var filePath = configFileName;
    fs.readFile(filePath, function (err, data) {
        if (err) {
            console.log('read file error!  ' + err)
            return
        }
        var codes = JSON.parse(data.toString()).jijinList;
        var isExsist = false
        for (var i = 0; i < codes.length; i++) {
            console.log(codes[i])
            if (codes[i] == code) {
                isExsist = true
                console.log('code is exsist')
                return
            }
        }
        if (!isExsist) {
            codes.push(code);
        }
        var config={};
        config.jijinList=codes;
        fs.writeFile(filePath, JSON.stringify(config), function (err) {
            if (err) {
                console.log('write error! ' + err)
                return
            }
            console.log('write success!')
        });


    });
}


exports.removeJijin = function (code) {
    // 异步读取
    if (code == undefined) {
        console.log('code error');
        return
    }
    var filePath =configFileName
    fs.readFile(filePath, function (err, data) {
        if (err) {
            console.log('read file error!  ' + err)
            return
        }
        var codes = JSON.parse(data.toString()).jijinList;
        //把数据读出来删除
        for (var i = 0; i < codes.length; i++) {
            if (code == codes[i]) {
                codes.splice(i, 1);
                console.log('remove success!')
            }
        }
        var config={};
        config.jijinList=codes;
        fs.writeFile(filePath, JSON.stringify(config), function (err) {
            if (err) {
                console.log('write error! ' + err)
                return
            }
            console.log('write success!')
        });
    });

}

exports.readJijin = function () {
    //把基金数据读出来
    var filePath =  configFileName
    var data = fs.readFileSync(filePath);
    return data
}