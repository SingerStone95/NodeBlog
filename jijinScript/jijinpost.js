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


//控制小数点后位数
//value输入的值
//bit 控制的点数点位数
//eg：value=1.234 bit=2 ，输出1.23
function trans_fix_bit(value, bit) {
	value = Math.round(Number(value) * Math.pow(10, bit)) / Math.pow(10, bit);
	return value;

}

function task() {
	var functions = new Array();
	var requestData = function (url, code) {
		return new Promise(function (resolve, reject) {
			request({
				url: url,
				method: "POST",
				json: true,
				headers: {
					"content-type": "application/json"
				},

			}, function (error, response, body) {
				if (!error && response.statusCode == 200) {
					console.log("request success!");
				} else {
					console.log("request failed!");
				}
				//第二个请求
				var itemUrl = 'http://www.howbuy.com/fund/' + code + '/';
				console.log('第一个请求回包原始数据：' + itemUrl + '\n' + body + '\n');
				request(itemUrl, function (err, result) {
					var json = { 'code': code, 'data': body, 'data2': result.body };
					console.log("第二个请求回包原始数据：" + JSON.stringify(json));
					resolve(json);
				});
			});
		});
	}
	let jijinConfig = JSON.parse(jijinfile.readJijin().toString())
	let jijinArray = jijinConfig.jijinList;
	console.log(jijinArray);
	// 第一个请求
	for (var i = jijinArray.length - 1; i >= 0; i--) {
		var itemUrl = 'http://www.howbuy.com/fund/ajax/gmfund/valuation/valuationnav.htm?jjdm=' + jijinArray[i];
		functions[i] = requestData(itemUrl, jijinArray[i]);
	}

	function getHtmlFromValue(value) {
		var values = value.split(' ');
		if (parseFloat(values[0]) >= 0) {//盈利
			return '<h2 style="font-family:times;color:white">' + '净值变化：' + values[0] + '    比率：' + values[1] + '</h2>';
		} else {//亏损
			return '<h2 style="font-family:times;color:white">' + '净值变化：' + values[0] + '    比率：' + values[1] + '</h2>';
		}

	}
	Promise.all(functions)
		.then(function (res) {
			var emailContent = '<html><body> <h1  align="center" style="color:rgb(255, 99, 71);"><strong>顺势而为,三思而行，谋定而动</strong></h1>';
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
				var emailContentitem = '<div style="background-color:rgba(255, 99, 71, 0.5);">'
				emailContentitem += '<h3 style="color:MediumSeaGreen;">' + name + '</h3>' +
					getHtmlFromValue(ratio) +
					'<h5>单位净值:' + value + '</h5>' +
					'<h5>排名:' + rank + '      近三月:' + threeMouth + '      近一年:' + oneYear + '</h5>' +
					'<a href="http://www.howbuy.com/fund/' + item.code + '">基金详情链接</a>' +
					'<h6>更新时间:' + time + '</h6>';
				emailContentitem += "</div><Br/>";
				emailContent += emailContentitem;
				console.log("保存数据...");
				//判断重复数据
				var dayTime = time.substring(2, 11).split(' ')[0];
				//保存到数据库
				saveDataIfNeed(dayTime, code, ratio, name);

			}
			request("https://legulegu.com/stockdata/a-ttm-lyr?entryScene=zhida_05_001&jump_from=1_13_18_00", function (err, result) {
				$ = cheerio.load(result.body)
				var mttcontent = $('.market-title-data-for-index').html()
				console.log("第三个请求回包原始数据：" + mttcontent)
				emailContent += "<hr />"
				emailContent += '市盈率参考值：'
				emailContent += "<a href=\"https://legulegu.com/stockdata/a-ttm-lyr?entryScene=zhida_05_001&jump_from=1_13_18_00\">市盈率参考链接</a>"
				emailContent += mttcontent
				request("https://www.kancaibao.com/ep", function (err, result) {
					// console.log("第四个个请求回包原始数据：" + result.body);
					$ = cheerio.load(result.body)
					console.log("第四个个请求回包原始数据：" + $('h4').html());
					emailContent += "<hr />"
					emailContent += '股债比参考值：'
					emailContent += "<a href=\"https://www.kancaibao.com/ep\">股债比参考链接</a>"
					var rate_gz = $('#rategz_0').html()
					var rate_mv = $('#ratemv_0').html()
					var gzclose = $('#gzclose_0').html()
					emailContent += '<h4 style="color:SlateBlue;">股债比: <strong>' + rate_gz + '</strong></h4>\n'
					emailContent += '<h6>股权收益率: ' + rate_mv + '</h5>\n'
					emailContent += '<h6>国债收益率: ' + gzclose + '</h5>\n'
					emailContent += "<hr />"

					emailContent += "\n<table>\n"
					emailContent += $('.table').html()
					emailContent += "\n</table>\n"

					emailContent += "<hr />"
					emailContent += "</body></html>"
					//发邮件
					console.log('发送的邮件信息:\n' + emailContent);
					var addrs = new Array();
					//配置邮箱
					addrs[0] = '<445191096@qq.com>';
					// addrs[1] = '<2941992802@qq.com>';
					// addrs[3] = '<183330050@qq.com>';
					// addrs[4] = '<345051833@qq.com>';
					email.sendEmail(addrs, emailContent);
				});
			});








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
