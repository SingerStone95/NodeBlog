var nodemailer = require('nodemailer');
var mailTransport = nodemailer.createTransport({
    host: 'smtp.qq.com',
    secureConnection: true, // 使用SSL方式（安全方式，防止被窃取信息）
    auth: {
        user: '1527627156@qq.com',
        pass: 'xxxxx'
    },
});
exports.sendEmail = function (arrayTo, content) {
    var addrString = '';
    for (var i = arrayTo.length - 1; i >= 0; i--) {
        addrString += arrayTo[i];
        if (i != 0) {
            addrString += ',';
        }
    }
    console.log(addrString);
    var options = {
        from: '"SingerStonE日报" <1527627156@qq.com>',
        to: '445191096@qq.com',
        subject: '一封来自SingerStone日报的邮件',
        html: content
    };
    console.log("msg");
    mailTransport.sendMail(options, function (err, msg) {
        console.log(msg);
        if (err) {
            console.log(err);
        }
        else {
            console.log("send email success!");
        }
    });
} 
