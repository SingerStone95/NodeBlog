var request = require("request");
var cheerio = require("cheerio");
var request = require("request");
var email = require("./email.js");
var jijinfile = require("./filehandle.js")
var db = require("../model/dbhandle.js");
var Promise = require('promise');
var schedule = require('node-schedule');

function task() {
	var functions = new Array();
	var requestData = function (param, code) {
		return new Promise(function (resolve, reject) {
			var itemUrl = 'https://www.howbuy.com/fund/' + code + '/';
			request(itemUrl, function (err, result) {
				var json = { 'code': code, 'data': result.body };//这个data是个啥玩意？
				console.log("请求回包原始数据：" + JSON.stringify(json));
				resolve(json);
			});
		});
	}

	let jijinConfig = JSON.parse(jijinfile.readJijin().toString())
	let jijinArray = jijinConfig.jijinList;
	console.log(jijinArray);
	// 第一个请求 Post 
	for (var i = jijinArray.length - 1; i >= 0; i--) {
		functions[i] = requestData("", jijinArray[i]);//根据jijinArray[i]提供的code通过requestData函数得到所对应的json原始数据
	}
	Promise.all(functions)
		.then(function (res)//res 是 Promise.all 解析后的结果。具体来说，Promise.all(requestPromises) 返回一个新的 Promise，
		//这个 Promise 在所有传递给 Promise.all 的 Promise 都成功解析时被解析。一旦所有的 Promise 都解析完成，Promise.all 返回的 Promise 就会被解析，
		//并传递一个包含所有 Promise 解析结果的数组，这个数组就是 res。
		{
			var emailContent = '<html><body> <h1  align="center" style="color:rgb(255, 99, 71);"><strong>顺势而为,三思而行，谋定而动</strong></h1>' +
				'<h1 align="center" style="color:rgb(255, 99, 71);"><strong>真正的大师，永远怀着一颗 学徒的心</strong></h1>';
			for (var i = 0; i < res.length; i++) {
				var item = res[i];
				var code = item.code.toString();
				var time = '';
				var name = '';//基金名字和代码
				var EstablishmentTime = '';//成立时间
				var up = '';//涨跌幅
				var rank = '';//排名
				var threeMouth = '';//近3月涨跌幅
				var oneYear = '';//近一年涨跌幅
				var UnitNet = '';//单位净值
				var scale = '';//规模
				var FundManager = '';//基金经理
				// var ComprehensiveScore = '';//综合评分
				if (item.data == undefined) {
					continue;
				}
				$ = cheerio.load(item.data);
				time = $('.tips_icon_con').text();
				if (time == '' || time == undefined) {
					var date = new Date();
					var month = date.getMonth() + 1;
					var day = date.getDate();
					var hour = date.getHours();
					var minute = date.getMinutes();
					time = ' [' + month + '-' + day + ' ' + hour + ':' + minute + ']';
				}
				console.log(time);
				if (item.data != null && item.data != undefined) {
					$ = cheerio.load(item.data);
					//爬取基金名字
					name = $('.lt').find('h1').text().trim();

					//爬取涨跌幅
					up = $('.b-3').find('em').text().trim().split('%')[0] + '%';

					//爬取排名
					rank = $('.b-3').find('em').text().trim().split('%')[1];

					//爬取三月涨跌幅
					threeMouth = $('.clearfix .point .cGreen, .clearfix .point .cRed').eq(0).text().trim();

					//爬取一年涨跌幅
					oneYear = $('.clearfix .point .cGreen, .clearfix .point .cRed').eq(1).text().trim();

					//爬取scale（规模）
					const scaleMent = $('.gmfund_num li:contains("成立时间")').find('span');
					scale = scaleMent.length ? scaleMent.text() : undefined;
					console.log('规模:', scale);

					//爬取成立时间
					const establishmentTimeElement = $('.gmfund_num li:contains("成立时间")').find('span');
					// 使用contains 选择器查找包含“成立时间”的元素，并获取其中的文本内容
					EstablishmentTime = establishmentTimeElement.length ? establishmentTimeElement.text() : undefined;
					console.log('成立时间:', EstablishmentTime);

					//爬取单位净值
					UnitNet = $('.shouyi-b.b1 .cGreen').text().trim();
					console.log('单位净值:', UnitNet);

					//爬取基金经理
					FundManager = $('.manager_b_r .info .item_4 li:first-child a').text();
					console.log('基金经理:', FundManager);
				}
				//数据都拿到了,开始拼接邮件		
				console.log('\n解析到的html数据:\nname:' + name + '\nup:' + up + '\nrank:' + rank + '\nEstablishmentTime:' + EstablishmentTime +
					'\nUnitNet:' + UnitNet + '\nscale:' + scale + '\nFundManager:' + FundManager + '\nthreeMouth:' + threeMouth + '\noneYear:' + oneYear + '\n');
				console.log("保存数据...");
				//判断重复数据
				var dayTime = time.substring(2, 11).split(' ')[0];
				//保存到数据库
				saveDataIfNeed(dayTime, code, up, name, rank, threeMouth, oneYear);
				emailContent +=
					'<div style="background-color:rgba(0,255,0,0.1);">' + '<h3 style="color:MediumSeaGreen;">' + name + '</h3>' +
					'<a href="https://www.howbuy.com/fund/" ' + item.code + '">基金详情链接</a>' +
					'<h6>更新时间:' + time + '</h6>' + "<hr />" +
					'市盈率参考值：' + "<a href=\"https://legulegu.com/stockdata/a-ttm-lyr?entryScene=zhida_05_001&jump_from=1_13_18_00\">市盈率参考链接</a>" +
					"<hr />" + '股债比参考值：' + "<a href=\"https://www.kancaibao.com/ep\">股债比参考链接</a>" + "<hr />" +
					'<table border="1"><tr><td>字段名</td><td>数据</td></tr>' +
					'<tr><td>成立时间</td><td>' + EstablishmentTime + '</td></tr>' +
					'<tr><td>涨跌幅</td><td>' + up + '</td></tr>' +
					'<tr><td>排名</td><td>' + rank + '</td></tr>' +
					'<tr><td>近三月涨跌幅</td><td>' + threeMouth + '</td></tr>' +
					'<tr><td>近一年涨跌幅</td><td>' + oneYear + '</td></tr>' +
					'<tr><td>单位净值</td><td>' + UnitNet + '</td></tr>' +
					'<tr><td>规模</td><td>' + scale + '</td></tr>' +
					'<tr><td>基金经理</td><td>' + FundManager + '</td></tr></table><Br/></div>';
			}

			emailContent += '</body></html>';
			var addrs = new Array();
			//配置邮箱
			addrs[0] = '445191096@qq.com';
			console.log('发送的邮件信息:\n' + emailContent);
			email.sendEmail(addrs, emailContent);

		});

	function saveDataIfNeed(dayTime, code, up, name, rank, threeMouth, oneYear) {
		var saveData = { "name": name, 'code': code, 'ratio': up, 'time': dayTime, "rank": rank, "threeMouth": threeMouth, "oneYear": oneYear };
		console.log(saveData);
		db.findData({ 'time': dayTime, 'code': code }, function (findResult) {
			console.log(findResult);
			if (findResult.length > 0) {
				console.log("重复数据，直接更新");
				db.updateDate({ 'time': dayTime, 'code': code }, saveData, function (result) {
					console.log(result);
				});
			} else {
				console.log("无重复数据，第一次保存");
				db.saveData(saveData, function (result) {
					console.log(result);
				});
			}

		});
	}
}

var main = function () {//定时执行task()
	var rule = new schedule.RecurrenceRule();
	rule.hour = [15];
	rule.minute = 30;
	rule.dayOfWeek = [1, 2, 3, 4, 5];
	rule.second = 0;
	schedule.scheduleJob(rule, function () {
		task();
	});
	//task();
}
//main();
task();
