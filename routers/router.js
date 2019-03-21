var formidable = require("formidable");
var db = require("../model/db.js");
var dbhandle = require("../model/dbhandle.js");
var md5 = require("../model/md5.js");
var jijinfile = require("../jijinScript/filehandle.js");
var moment = require("moment");
var MongoClient = require("mongodb").MongoClient,
    test = require("assert");
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
    console.log("doRecording start!");
    db.getAllCount("article", function (count) {
        var allCount = count.toString();
        var date = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
        //写入数据库
        db.insertOne(
            "article",
            {
                ID: parseInt(allCount) + 1,
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
    });
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
    //写入数据库
    db.updateMany(
        "article",
        { ID: parseInt(req.body.ID) },
        {
            ID: parseInt(req.body.ID),
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
    var aId = parseInt(req.query.ID);
    db.find("article", { ID: aId }, function (err, result) {
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
    var aId = parseInt(req.body.ID);
    db.find("article", { ID: aId }, function (err, result) {
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
    var ID = parseInt(req.body.ID);
    db.deleteMany("article", { ID: ID }, function (err, results) {
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
    var aId = parseInt(req.query.ID);
    db.find("article", { ID: aId }, function (err, result) {
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

//Comment!
exports.showComment = function (req, res) {
    res.render("comment");
};
//打开界面
exports.showJijin = function (req, res) {
    dbhandle.findData({}, function (result) {
        //console.log(result);
        //console.log(result.length);
        var keys = new Array();
        //先获取目录
        var keyIndex = 0;
        for (j = 0; j < result.length; j++) {
            // console.log(result[j]);
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
        console.log('渲染的数据：');
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
        jijinfile.addJijin(parseInt(code))
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

    var aId = parseInt(req.body.ID);
    db.find("article", { ID: aId }, function (err, result) {
        if (err) {
            console.log(err);
        }
        var visitNum = result[0].visitNum;
        var ID = result[0].ID;
        db.updateMany(
            "article",
            { ID: ID },
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
    var aId = parseInt(req.body.ID);
    db.find("article", { ID: aId }, function (err, result) {
        if (err) {
            console.log(err);
        }
        var visitNum = result[0].visitNum;
        var ID = result[0].ID;
        db.updateMany(
            "article",
            { ID: ID },
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
//addVisitorNum

//addThumbsUp!
exports.addThumbsUp = function (req, res) {

    var aId = parseInt(req.body.ID);
    db.find("article", { ID: aId }, function (err, result) {
        if (err) {
            console.log(err);
        }
        var thumbsUp = result[0].thumbsUp;
        var ID = result[0].ID;
        db.updateMany(
            "article",
            { ID: ID },
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
    var aId = parseInt(req.body.ID);
    db.find("article", { ID: aId }, function (err, result) {
        if (err) {
            console.log(err);
        }
        var thumbsUp = result[0].thumbsUp;
        var ID = result[0].ID;
        db.updateMany(
            "article",
            { ID: ID },
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
