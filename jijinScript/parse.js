var request = require("request");
var cheerio = require("cheerio");
var request = require("request");

function task() {
    // request("https://legulegu.com/stockdata/a-ttm-lyr?entryScene=zhida_05_001&jump_from=1_13_18_00", function (err, result) {
    //     // console.log("第三个请求回包原始数据：" + result.body);
    //     $ = cheerio.load(result.body)
    //     console.log($('.market-title-data-for-index').html())
    // });


    request("https://www.kancaibao.com/ep", function (err, result) {
        // console.log("第三个请求回包原始数据：" + result.body);
        $ = cheerio.load(result.body)
        // console.log($('.table').html())


        console.log($('#rategz_0').html())

        console.log($('#ratemv_0').html())

        console.log($('#gzclose_0').html())

        // console.log($('#ratemv').html())

        // console.log($('span[id="gzclose"]').html())
    });
}

task();