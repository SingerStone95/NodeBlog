process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
var request = require("request");
const https = require('https');
var schedule = require('node-schedule');
var Promise = require('promise');
const url_detail = "https://news-at.zhihu.com/api/4/news/"
const url = "https://news-at.zhihu.com/api/4/news/latest"
const url_article = "https://106.12.193.145:443/doRecording/"
function task() {
    request(url, function (err, result) {
        var data = JSON.parse(result.body);
        var list = data.stories;
        for (var i = 0; i < list.length; i++) {
            var id = list[i].id;
            console.log(id);
            request(url_detail + id.toString(), function (err, result) {
                //console.log(result.body)
                var body = JSON.parse(result.body);

                var requestData = {
                    "topic": body.title,
                    "publisher": "知乎日报",
                    "classify": "writeAvr",
                    "visitNum":0,
                    "content": body.body
                };

                console.log(requestData);

                request({
                    url: url_article,
                    method: "POST",
                    json: true,
                    body: requestData,
                    //proxy: 'http://127.0.0.1:8080',
                    headers: {
                        "content-type": "application/json",
                        // "agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36",
                        // "cookie":"_zap=ca57b0c4-d0b5-4555-8de4-e210edf256ab; _xsrf=KY5lnE0ZvcKCTrRqg4ItuVUdtgMHtUES; d_c0=\"ALDhYm1Ckg6PTpNE_z-jBUPVah5MMmSMAp4=|1543113476\"; z_c0=\"2|1:0|10:1543113601|4:z_c0|92:Mi4xSGNGNkFnQUFBQUFBc09GaWJVS1NEaVlBQUFCZ0FsVk5nVm5uWEFBLUppbWZVSkN3Rzh5ZmFadHV4U1dxUTd5RnJn|15f7c8c9679ac52aef818d4de57ad4750b0eb5b5452e8f7d771b4f775481613b\"; q_c1=5cc03655db904694b3836e50d9297c9a|1550654851000|1543113507000; tgw_l7_route=66cb16bc7f45da64562a077714739c11",
                        // "upgrade-insecure-requests":"1",
                        // "accept-encoding":"gzip, deflate, br"
                    },

                }, function (error, response, body) {
                    console.log(response);
                });
            });
        }


    });
}
function main() {
    var rule = new schedule.RecurrenceRule();
    rule.hour = [12];
    rule.minute = 0;
    rule.dayOfWeek = [1, 2, 3, 4, 5, 6, 7];
    rule.second = 0;
    schedule.scheduleJob(rule, function () {
        task();
    });
}
//task();
//task();
main();