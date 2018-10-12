//清除不再关注的基金
var db= require("../model/dbhandle.js");
var jijinArray=new Array();
jijinArray[0]='519690';
jijinArray[1]='519180';
jijinArray[2]='000478';

for (var i = jijinArray.length - 1; i >= 0; i--) {
var deleteWhere={'code':jijinArray[i]};
db.deleteData(deleteWhere,function(result){
console.log("result:"+result)
});
}