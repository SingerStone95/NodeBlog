var multer = require('nodemailer');
var mailTransport = multer.createTransport({
    host: 'smtp.qq.com',
    secureConnection: true, // 使用SSL方式（安全方式，防止被窃取信息）
    auth: {
        user: '1527627156@qq.com',
        pass: 'cwvocdhnuhyjdgjegbh'
    },
});
exports.sendEmail = function (arrayTo, content) {
    var addrString = "";
    for (var i = arrayTo.length - 1; i >= 0; i--) {
        addrString += arrayTo[i];
        if (i != 0) {
            addrString += ',';
        }
    }
    console.log("发送给：addrString");
    var options = {
        from: '"chenbinhao" <1527627156@qq.com>',
        to: addrString,
        subject: '一封来自SingerStone的邮件',
        html: '<html><body style="background-color:red;">' + content + '</body></html>'
    };

    mailTransport.sendMail(options, function (err, msg) {
        if (err) {
            console.log(err);
        }
        else {
            console.log("send email success!");

        }
    });
} 
