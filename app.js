﻿var express = require("express");
var app = express();
var router = require("./routers/router.js");
var path = require('path');
var bodyParser = require('body-parser');
var ejs = require('ejs');
var https = require('https');
var http = require('http');
var fs = require('fs');
var session = require('express-session');
//同步读取密钥和签名证书
var options = {
    key: fs.readFileSync('./cert/server.key'),
    cert: fs.readFileSync('./cert/server.crt')
}
var httpsServer = https.createServer(options, app);
var httpServer = http.createServer(app);
//使用session
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("./public"));
app.use('/cdn', express.static('./cdn'));

//模板引擎
app.set("view engine", "ejs");

//首页
app.get("/", router.showIndex);
//编写页面
app.get("/recording", router.showRecording);
//执行保存
app.post("/doRecording", router.doRecording);
app.post("/doWrite", router.doWrite);
//取得文章
app.post("/getArticle", router.getArticle);
//取得总页数
app.post("/getAllAmount", router.getAllAmount);
//文章页面
app.get("/article", router.showArticle);
app.post("/getDetail", router.doShowArticle)
//删除文章
app.post("/delArticle", router.delArticle);

//注册页面
app.get("/register", router.showRegister);
app.post("/doRegister",router.doRegister);

//登陆页面
app.get("/login", router.showLogin);
app.post("/doLogin", router.doLogin);
app.get("/unlogin", router.unLogin)
//分类文章
//javascript!
app.get("/ReactNative", router.showReactNative);
app.post("/getReactNative", router.getReactNative);
//javascript

//NodeJS!
app.get("/NodeJS", router.showNodeJS);
app.post("/getNodeJS", router.getNodeJS);
//NodeJS

//Android!
app.get("/Android", router.showAndroid);
app.post("/getAndroid", router.getAndroid);
//Android

//Android!
app.get("/writeAvr", router.showwriteAvr);
app.post("/getwriteAvr", router.getwriteAvr);
//Android


//About!
app.get("/About", router.showAbout);
//About

//Comment!
app.get("/Comment", router.showComment);
app.post("/doComment", router.doComment);
app.post("/getComment", router.getComment);
app.post("/getAllCountComment", router.getAllCountComment);
//Comment

//后台页面
app.get("/manage", router.getManage);

app.get("/modify", router.showModify);
app.post("/update", router.updateArticle);

app.get("/jijin", router.showJijin);
app.get("/doDeleteJijin", router.deleteJijin);
app.post("/doAddJijin",router.addJijin)
//VisitorNum(游览数)
app.post("/addVisitorNum", router.addVisitorNum);
app.post("/doVisitorNum", router.doVisitorNum);

//addThumbsUp(点赞数)
app.post("/addThumbsUp", router.addThumbsUp);
app.post("/doThumbsUp", router.doThumbsUp);

console.log("Server running ...");





//app.listen(3000);

//https监听3000端口
httpsServer.listen(3000);
//http监听3001端口
//httpServer.listen(80);
