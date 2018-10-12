/**
 * 处理基金配置文件数据
 */
var fs = require("fs")
const configFileName = "./jijinconfig.json"
var configDir = ''

exports.addJijin = function (code) {
    // 异步读取
    if (code == undefined) {
        console.log('code error');
        return
    }
    var filePath = configDir + configFileName
    fs.readFile(filePath, function (err, data) {
        if (err) {
            console.log('read file error!  ' + err)
            return
        }
        var codes = JSON.parse(data.toString());
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
        fs.writeFile(filePath, JSON.stringify(codes), function (err) {
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
    var filePath = configDir + configFileName
    fs.readFile(filePath, function (err, data) {
        if (err) {
            console.log('read file error!  ' + err)
            return
        }
        var codes = JSON.parse(data.toString());
        //把数据读出来删除
        for (var i = 0; i < codes.length; i++) {
            if (code == codes[i]) {
                codes.splice(i, 1);
                console.log('remove success!')
            }
        }
        fs.writeFile(filePath, JSON.stringify(codes), function (err) {
            if (err) {
                console.log('write error! ' + err)
                return
            }
            console.log('write success!')
        });
    });

}

exports.readJijin = function () {
    var filePath = configDir + configFileName
    var data = fs.readFileSync(filePath);
    return data
}