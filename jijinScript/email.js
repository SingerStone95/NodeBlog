var nodemailer = require('nodemailer');
var mailTransport = nodemailer.createTransport({
    host: 'smtp.qq.com',
    secureConnection: true, // 使用SSL方式（安全方式，防止被窃取信息）
    auth: {
        user: '2751607512@qq.com',
        pass: 'qkrzcxcwvbrnddef'
    },
});
exports.sendEmail = function (arrayTo, content) {
    // var addrString = '"pjc" <2751607512@qq.com>';
    // for (var i = arrayTo.length - 1; i >= 0; i--) {
    //     addrString += arrayTo[i];
    //     if (i != 0) {
    //         addrString += ',';
    //     }
    // }
    console.log("发送给:arrayTo");
    var options = {
        from: '"pjc" <2751607512@qq.com>',
        to: arrayTo,
        subject: '一封来自GoJeonPa的邮件',
        html: content 
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
