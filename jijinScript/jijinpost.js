var request = require("request");
var cheerio = require("cheerio");
var request = require("request");
var email = require("./email.js");
var jijinfile = require("./filehandle.js")
var db = require("../model/dbhandle.js");
var Promise = require('promise');
var schedule = require('node-schedule');
var url = 'http://www.howbuy.com/fund/ajax/gmfund/valuation/valuationnav.htm?jjdm=519690'
//  var jijinArray = new Array();
//  jijinArray[0] = '161631';
//  jijinArray[1] = '161725';

function task() {
	var functions = new Array();
	var requestData = function (url, code) {
		return new Promise(function (resolve, reject) {
			request({
				url: url,
				method: "POST",
				json: true,
				//proxy: 'http://127.0.0.1:8080',
				headers: {
					"content-type": "application/json"
				},

			}, function (error, response, body) {
				if (!error && response.statusCode == 200) {
					console.log("request success!");
				} else {
					console.log("request failed!");
				}
				var itemUrl = 'http://www.howbuy.com/fund/' + code + '/';
				console.log(itemUrl + '\n' + body + '\n');
				request(itemUrl, function (err, result) {
					var json = { 'code': code, 'data': body, 'data2': result.body };
					//console.log(json);
					resolve(json);
				});
			});
		});
	}
	let jijinConfig = JSON.parse(jijinfile.readJijin().toString())
	let jijinArray = jijinConfig.jijinList;
	console.log(jijinArray);
	for (var i = jijinArray.length - 1; i >= 0; i--) {
		var itemUrl = 'http://www.howbuy.com/fund/ajax/gmfund/valuation/valuationnav.htm?jjdm=' + jijinArray[i];
		functions[i] = requestData(itemUrl, jijinArray[i]);
	}

	function getHtmlFromValue(value) {
		var values = value.split(' ');
		if (parseFloat(values[0]) >= 0) {//盈利
			return '<h2 style="font-family:times;color:red">' + '净值变化：' + values[0] + '    比率：' + values[1] + '</h2>';
		} else {//亏损
			return '<h2 style="font-family:times;color:green">' + '净值变化：' + values[0] + '    比率：' + values[1] + '</h2>';
		}

	}
	Promise.all(functions)
		.then(function (res) {
			var emailContent = '<h1 style="font-family:times;color:blue">赚钱不易,且买且珍惜</h1><Br/><Br/><Br/>';
			for (var i = 0; i < res.length; i++) {
				var item = res[i];
				var code = item.code;
				//console.log(item.data2);
				//console.log(item.data);
				var value = '';
				var ratio = '';
				var time = '';
				var imageUrl = '';
				var name = '';
				var up = '';
				var rank = '';
				var threeMouth = '';
				var oneYear = '';
				if (item.data != null) {
					$ = cheerio.load(item.data);
					value = $('.con_value').text();
					ratio = $('.con_ratio_red').text();
					if (!ratio) {
						ratio = $('.con_ratio_green').text();
					}
					time = $('.tips_icon_con').text();
					var imgdata = $('#valuationTime').attr('value');
					console.log(imgdata);
					imageUrl = 'https://static.howbuy.com/images/fund/valuation/' + code + '_' + imgdata + '.png';
				}
				if (time == '' || time == undefined) {
					var date = new Date();
					var month = date.getMonth() + 1;
					var day = date.getDate();
					var hour = date.getHours();
					var minute = date.getMinutes();
					time = ' [' + month + '-' + day + ' ' + hour + ':' + minute + ']';
					
				}
				console.log(time);
				if (item.data2 != null && item.data2 != undefined) {
					$ = cheerio.load(item.data2);
					name = $('.lt').find('h1').text().trim();
					up = $('.b-3').find('em').text().trim().split('%')[0] + '%';
					if (ratio == '' || ratio == undefined) {
						ratio = '0.00 ' + up;
					}
					rank = $('.b-3').find('em').text().trim().split('%')[1];
					threeMouth = $('.clearfix .point .cRed').text().trim().split("%")[0] + '%';
					if (threeMouth == '%' || threeMouth == undefined || threeMouth == 'undefined%') {
						threeMouth = $('.clearfix .point .cGreen').text().trim().split("%")[0] + '%';
					}
					oneYear = $('.clearfix .point .cRed').text().trim().split("%")[1] + '%';
					if (oneYear == '%' || oneYear == undefined || oneYear == 'undefined%') {
						oneYear = $('.clearfix .point .cGreen').text().trim().split("%")[1] + '%';
					}
				}
				console.log('\n解析到的html数据:\nname:' + name + '\nup:' + up + '\nrank:' + rank + '\nthreeMouth:' + threeMouth + '\noneYear:' + oneYear + '\nratio:' + ratio + '\n');
				//数据都拿到了,开始拼接邮件
				var emailContentitem = '<h3 style="background-color:yellow">' + name + '</h3>' +
					'<img src="' + imageUrl + '"/>' +
					getHtmlFromValue(ratio) +
					'<h5>单位净值:' + value + '</h5>' +
					'<h5>排名:' + rank + '      近三月:' + threeMouth + '      近一年:' + oneYear + '</h5>' +
					'<a href="http://www.howbuy.com/fund/' + item.code + '">基金详情链接</a>' +
					'<h6>更新时间:' + time + '</h6><Br/>';
				emailContent += emailContentitem;
				console.log("保存数据...");
				//判断重复数据
				var dayTime = time.substring(2, 11).split(' ')[0];
				saveDataIfNeed(dayTime, code, ratio, name);

			}
			console.log('发送的邮件信息:\n' + emailContent);
			var addrs = new Array();
			//配置邮箱
			addrs[0] = '<445191096@qq.com>';
			email.sendEmail(addrs, emailContent);

		});

	function saveDataIfNeed(dayTime, code, ratio, name) {
		var saveData = { "name": name, 'code': code, 'ratio': ratio, 'time': dayTime };
		console.log(saveData);
		db.findData({ 'time': dayTime, 'code': code }, function (findResult) {
			console.log(findResult);
			if (findResult.length > 0) {
				console.log("重复数据，直接更新");
				db.updateDate({ 'time': dayTime, 'code': code }, saveData, function (result) {
					//console.log(result);
				});
			} else {
				console.log("无重复数据，第一次保存");
				db.saveData(saveData, function (result) {
					//console.log(result);
				});
			}

		});
	}
}

var main = function () {
	var rule = new schedule.RecurrenceRule();
	rule.hour = [10, 15];
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