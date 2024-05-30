const path = require('path')
const db = require("../model/db.js");
const { ObjectId } = require('mongodb');
const dbhandle = require("../model/dbhandle.js");
const md5 = require("../model/md5.js");
const jijinfile = require("../jijinScript/filehandle.js");
const moment = require("moment");
const execSync = require("child_process").execSync;
const archiver = require('archiver');
const fs = require('fs');
const crypto = require('crypto');
//首页
exports.showIndex = function (req, res) {
    res.render("index");
};
//编写页面
exports.showRecording = function (req, res) {
    if (req.session.login != "1") {
        res.send("<a href=" + "/login" + ">点击前往登录页面</a>");
    } else {
        res.render("recording");
    }
};

exports.doRecording = function (req, res) {
    // if (req.session.login != "1") {
    //     res.send("<a href=" + "/login" + ">点击前往登录页面</a>");
    //     return;
    // }
    var date = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    //写入数据库
    db.insertOne(
        "article",
        {
            topic: req.body.topic,
            publisher: req.body.publisher,
            classify: req.body.classify,
            content: req.body.content,
            date: date,
            thumbsUp: 0,
            visitNum: 0
        },
        function (err, result) {
            if (err) {
                res.send("-1");
                return;
            }
            res.send("1");
        }
    );
};
exports.doWrite = function (req, res) {
    var fields = {};
    fields.topic = req.body.title;
    fields.classif = req.body.class;
    fields.content = req.body.content;
    fields.publisher = req.body.publisher;
    db.getAllCount("article", function (count) {
        var allCount = count.toString();
        var date = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
        //写入数据库
        db.insertOne(
            "article",
            {
                ID: parseInt(allCount) + 1,
                topic: fields.topic,
                publisher: fields.publisher,
                classify: fields.classify,
                content: fields.content,
                date: date,
                thumbsUp: 0,
                visitNum: 0
            },
            function (err, result) {
                if (err) {
                    res.send({ result: -1 });
                    return;
                }
                res.send({ result: 0 });
            }
        );
    });

};
//修改文章
exports.updateArticle = function (req, res) {
    if (req.session.login != "1") {
        res.send("<a href=" + "/login" + ">点击前往登录页面</a>");
        return;
    }

    var date = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    var dbId = ObjectId(req.body.ID);
    //写入数据库
    db.updateMany(
        "article",
        { _id: dbId },
        {
            _id: dbId,
            topic: req.body.topic,
            publisher: req.body.publisher,
            classify: req.body.classify,
            content: req.body.content,
            date: date,
            thumbsUp: parseInt(req.body.thumbsUp),
            visitNum: parseInt(req.body.visitNum)
        },
        function (err, result) {
            if (err) {
                console.log(err);
                res.send("-1");
                return;
            }
            res.send("1");
        }
    );

};

//取得文章
exports.getArticle = function (req, res) {
    var page = req.query.page;
    db.find(
        "article",
        {},
        { pageamount: 10, page: page, sort: { date: -1 } },
        function (err, result) {
            var obj = { allResult: result };
            res.json(obj);
        }
    );
};

//取得总页数
exports.getAllAmount = function (req, res) {
    db.getAllCount("article", function (count) {
        res.send(count.toString());
    });
};

//文章页面
exports.showArticle = function (req, res) {
    if (req.query.ID == undefined) {
        res.send("错误");
        return;
    }
    var dbId = ObjectId(req.query.ID);
    db.find("article", { _id: dbId }, function (err, result) {
        if (err) {
            console.log(err);
        }
        res.render("article", {
            allResult: result[0]
        });
    });
};

//文章页面Post
exports.doShowArticle = function (req, res) {
    if (req.body.ID == undefined) {
        res.send("错误");
        return;
    }
    var dbId = ObjectId(req.body.ID);
    db.find("article", { _id: dbId }, function (err, result) {
        if (err) {
            console.log(err);
        }
        res.send({
            allResult: result[0]
        });
    });
};

//删除文章
exports.delArticle = function (req, res) {
    if (req.session.login != "1") {
        res.send("<a href=" + "/login" + ">点击前往登录页面</a>");
        return;
    }

    var dbId = ObjectId(req.body.ID);
    db.deleteMany("article", { _id: dbId }, function (err, results) {
        if (err) {
            console.log("删除文章错误:" + err);
            return;
        }
        res.send("1");
    });

};

//打开修改界面
exports.showModify = function (req, res) {
    if (req.session.login != "1") {
        res.send("<a href=" + "/login" + ">点击前往登录页面</a>");
        return;
    }
    if (req.query.ID == undefined) {
        res.send("错误");
        return;
    }
    var aId = req.query.ID;
    var dbId = ObjectId(aId);
    db.find("article", { _id: dbId }, function (err, result) {
        if (err) {
            console.log(err);
        }
        res.render("modify", {
            allResult: result[0]
        });
    });
};
//注册页面
exports.showRegister = function (req, res) {
    res.render("register");
};
//执行注册
exports.doRegister = function (req, res) {
    var username = req.body.username;
    var password = req.body.password;
    var md5PassWord = md5(md5(password).substr(4, 7) + md5(password));
    console.log("go to there!")
    db.insertOne(
        "user",
        {
            username: username,
            password: md5PassWord
        },
        function (err, result) {
            if (err) {
                res.send("-3"); //服务器错误
                return;
            }
            req.session.login = "1";
            res.send("1"); //注册成功，写入SESSION
        }
    );
};

//登陆页面
exports.showLogin = function (req, res) {
    if (req.session.login == "1") {
        res.render("manage");
    } else {
        req.session.login = "-1";
        res.render("login");
    }
};
//退出登录
exports.unLogin = function (req, res) {
    req.session.login = "-1";
    res.render("login");
};
//执行登陆
exports.doLogin = function (req, res) {
    //得到用户填写的东西



    var username = req.body.username;
    var password = req.body.password;
    password = md5(md5(password).substr(4, 7) + md5(password));

    //检索数据库，按登录名检索数据库，查看密码是否匹配
    db.find("user", { username: username }, function (err, result) {
        if (err) {
            res.send("-3"); //服务器错误
            return;
        }
        if (result.length == 0) {
            res.send("-1"); //-2没有这个人
            return;
        }
        var dbpassword = result[0].password;
        //要对用户这次输入的密码，进行相同的加密操作。然后与
        //数据库中的密码进行比对
        if (password == dbpassword) {
            req.session.login = "1";
            res.send("1"); //登陆成功
            return;
        } else {
            res.send("-2"); //密码不匹配
        }
    });

    return;
};

exports.showReactNative = function (req, res) {
    res.render("ReactNative");
};

exports.getReactNative = function (req, res, next) {
    db.find(
        "article",
        { classify: "ReactNative" },
        { pageamount: 10, sort: { date: -1 } },
        function (err, result) {
            if (err) {
                console.log(err);
            }
            var obj = { allResult: result };
            res.json(obj);
        }
    );
};

//NodeJS!
exports.showNodeJS = function (req, res) {
    res.render("NodeJS");
};

exports.getNodeJS = function (req, res, next) {
    db.find(
        "article",
        { classify: "NodeJS" },
        { pageamount: 10, sort: { date: -1 } },
        function (err, result) {
            if (err) {
                console.log(err);
            }
            var obj = { allResult: result };
            res.json(obj);
        }
    );
};
//NodeJS

//Android!
exports.showAndroid = function (req, res) {
    res.render("Android");
};

exports.getAndroid = function (req, res) {
    db.find(
        "article",
        { classify: "Android" },
        { pageamount: 10, sort: { date: -1 } },
        function (err, result) {
            if (err) {
                console.log(err);
            }
            var obj = { allResult: result };
            res.json(obj);
        }
    );
};
//Android

//writeAvr!
exports.showwriteAvr = function (req, res) {
    res.render("writeAvr");
};

exports.getwriteAvr = function (req, res, next) {
    db.find(
        "article",
        { classify: "writeAvr" },
        { pageamount: 10, sort: { date: -1 } },
        function (err, result) {
            if (err) {
                console.log(err);
            }
            var obj = { allResult: result };
            res.json(obj);
        }
    );
};
//writeAvr

//About!
exports.showAbout = function (req, res) {
    res.render("about");
};
//About

exports.showToolBox = function (req, res) {
    res.render("toolbox");
};

//Comment!
exports.showComment = function (req, res) {
    res.render("comment");
};
//打开界面
exports.showJijin = function (req, res) {
    dbhandle.findData({}, function (result) {
        console.log(result);
        console.log(result.length);
        var keys = new Array();
        //先获取目录
        var keyIndex = 0;
        for (j = 0; j < result.length; j++) {
            console.log(result[j]);
            var item = result[j];
            var canAdd = true;
            for (i = 0; i < keys.length; i++) {
                var key = keys[i];
                if (key == item.code) {
                    canAdd = false;
                    break;
                }
            }
            if (canAdd == true) {
                keys[keyIndex] = item.code;
                keyIndex++;
            }
        }
        var allResult = [];
        //构造JSON
        for (i = 0; i < keys.length; i++) {
            var itemArray = [];
            var key = keys[i];
            for (j = 0; j < result.length; j++) {
                var item = result[j];
                if (item.code == key) {
                    itemArray.push(item);
                }
            }
            allResult[i] = itemArray;
        }
        console.log('渲染的数据：\n');
        console.log(allResult);
        res.render("jijin", {
            allResult: JSON.stringify(allResult)
        });
    });
};
exports.deleteJijin = function (req, res) {
    console.log(req.query.code + "  " + req.query.password)
    // if (req.body.code == undefined) {
    //     res.send({ result: 1 });
    //     return;
    // }
    if (req.query.code == undefined || req.query.password != 'cbh123456') {
        res.send({ result: 1 });
        return;
    }
    jijinfile.removeJijin(req.query.code);
    dbhandle.deleteData({ "code": parseInt(req.query.code) }, function (result) {
        var r = JSON.parse(JSON.stringify(result));
        console.log(result);
        if (r.ok == 1) {
            res.send({ result: 0 });
        } else {
            res.send({ result: 1 });
        }
    });

}
exports.addJijin = function (req, res) {
    var code = req.body.code
    var password = req.body.password
    if (password == 'cbh123456') {
        jijinfile.addJijin(code)
        res.send({ result: 0 });
    } else {
        res.send({ result: 1 });
    }
}
exports.doComment = function (req, res) {


    var name = req.body.name;
    var email = req.body.email;
    var content = req.body.content;
    db.getAllCount("article", function (count) {
        var allCount = count.toString();
        var date = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
        db.insertOne(
            "comment",
            {
                ID: parseInt(allCount) + 1,
                name: name,
                email: email,
                content: content,
                date: date
            },
            function (err, result) {
                if (err) {
                    console.log("留言错误" + err);
                    return;
                }
                res.send("1");
            }
        );
    });
};
//取得评论
exports.getComment = function (req, res) {
    var page = req.query.page;
    db.find(
        "comment",
        {},
        { pageamount: 10, page: page, sort: { date: -1 } },
        function (err, result) {
            var obj = { allResult: result };
            res.json(obj);
        }
    );
};

//取得评论总页数
exports.getAllCountComment = function (req, res) {
    db.getAllCount("comment", function (count) {
        res.send(count.toString());
    });
};
//Comment

//blog-manage!
exports.getManage = function (req, res) {
    if (req.session.login != "1") {
        res.send("请登陆！");
    } else {
        res.render("manage");
    }
};
//blog-manage

//addVisitorNum!
exports.addVisitorNum = function (req, res) {

    var aId = req.body.ID;
    var dbId = ObjectId(aId);
    db.find("article", { _id: dbId }, function (err, result) {
        if (err) {
            console.log(err);
            return;
        }
        var visitNum = result[0].visitNum;
        var ID = result[0].ID;
        db.updateMany(
            "article",
            { _id: dbId },
            { $set: { visitNum: visitNum + 1 } },
            function (err, results) {
                if (err) {
                    console.log("游览数据错误:" + err);
                    return;
                }
                res.send("1");
            }
        );
    });
};

exports.doVisitorNum = function (req, res) {
    if (req.body.ID == undefined) {
        res.send({ result: 1 });
        return;
    }
    var aId = req.body.ID;
    var dbId = ObjectId(aId);
    db.find("article", { _id: dbId }, function (err, result) {
        if (err) {
            console.log(err);
        }
        var visitNum = result[0].visitNum;
        visitNum++;
        var ID = result[0].ID;
        db.updateMany(
            "article",
            { _id: dbId },
            { $set: { visitNum: visitNum } },
            function (err, results) {
                if (err) {
                    console.log("游览数据错误:" + err);
                    return;
                }
                res.send("1");
            }
        );
    });

};
//addVisitorNum

//addThumbsUp!
exports.addThumbsUp = function (req, res) {

    var aId = req.body.ID;
    var dbId = ObjectId(aId);
    db.find("article", { _id: dbId }, function (err, result) {
        if (err) {
            console.log(err);
        }
        var thumbsUp = result[0].thumbsUp;
        db.updateMany(
            "article",
            { _id: dbId },
            { $set: { thumbsUp: thumbsUp + 1 } },
            function (err, results) {
                if (err) {
                    console.log("点赞数据错误:" + err);
                    return;
                }
                res.send("1");
            }
        );
    });
};


//addThumbsUp!点赞接口
exports.doThumbsUp = function (req, res) {
    if (req.body.ID == undefined) {
        res.send({ result: 1 });
        return;
    }
    var aId = req.body.ID;
    var dbId = ObjectId(aId);
    db.find("article", { _id: dbId }, function (err, result) {
        if (err) {
            console.log(err);
        }
        var thumbsUp = result[0].thumbsUp;
        var ID = result[0].ID;
        db.updateMany(
            "article",
            { _id: dbId },
            { $set: { thumbsUp: thumbsUp + 1 } },
            function (err, results) {
                if (err) {
                    console.log("点赞数据错误:" + err);
                    return;
                }
                res.send({ result: 0 });
            }
        );
    });

};

function generateRandomString(length) {
    return crypto.randomBytes(Math.ceil(length / 2)).toString('hex');
}
exports.uploadFile = function (req, res) {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }
    let filename = Buffer.from(req.files.sampleFile.name, "latin1").toString("utf8");
    if (filename == undefined) {
        res.status(500).send('filename is nil');
        return;
    }
    let uploadPath = path.join(__dirname, '../cdn/' + filename);
    console.log(uploadPath);
    // Use the mv() method to place the file somewhere on your server
    req.files.sampleFile.mv(uploadPath, function (err) {
        if (err) {
            console.log(err);
            return res.status(500).send(err);
        }
        res.send('{result:0}');
    });
}


exports.convert = function (ws, req) {
    ws.on('message', function (msg) {
        console.log(`receive message ${msg}`);
        let response = JSON.parse(msg);
        let file_list = response.data;
        let script_dir = path.join(__dirname, '../tools_script/chinese-pdf-ocr/demo_gui/');
        let cdn_folder = path.join(__dirname, '../cdn/');
        ws.send('{"state":"start"}');
        var out_put_file_list = [];
        for (const filename of file_list) {
            let convert_file = path.join(__dirname, '../cdn/' + filename);
            let out_file = `${filename}`.replace(/\.pdf$/, ".txt");
            let converted_file = path.join(__dirname, '../cdn/' + out_file);
            var ret_msg = { state: 'process', filename: filename, process: 0 };
            ws.send(JSON.stringify(ret_msg));
            try {
                let command = `cd ${cdn_folder} && python3 ${script_dir}main.py --file ${convert_file} --out_file ${out_file}`;
                console.log(command);
                execSync(command, { stdio: 'inherit' });
                ret_msg.process = 1;
                out_put_file_list.push(`${converted_file}`);
            } catch (error) {
                console.error(`执行错误: ${error}`);
                ret_msg.process = -1;
                ret_msg.error = `${error}`;
            }
            console.log(JSON.stringify(ret_msg));
            ws.send(JSON.stringify(ret_msg));
        }
        var out_zip_file_name = generateRandomString(16) + '.zip';
        const output = fs.createWriteStream(`${cdn_folder}${out_zip_file_name}`);
        const archive = archiver('zip', {
            zlib: { level: 9 }
        });
        archive.on('warning', function (err) {
            if (err.code === 'ENOENT') {
                console.warn(err);
            } else {
                console.warn(err);
            }
        });
        archive.on('error', function (err) {
            console.warn(err);
        });
        archive.on('warning', function (err) {
            console.warn(err);
        });
        archive.on('finish', function () {
            console.log('ZIP 归档已完成。');
        });
        archive.pipe(output);
        out_put_file_list.forEach(function (filePath) {
            const fileName = path.basename(filePath);
            archive.file(filePath, { name: fileName });
        });
        archive.finalize();
        out_put_file_list.forEach((filePath) => {
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error(`删除文件失败: ${filePath}, 错误: ${err}`);
                } else {
                    console.log(`文件已删除: ${filePath}`);
                }
            });
        });
        var end_msg = { "state": "end", "download_url": `${out_zip_file_name}` };
        ws.send(JSON.stringify(end_msg));
        ws.close();
    })

    // close 事件表示客户端断开连接时执行的回调函数
    ws.on('close', function (e) {
        console.log('close connection')
    })
}