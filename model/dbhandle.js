var MongoClient = require('mongodb').MongoClient;
var DB_CONN_STR = 'mongodb://admin:cbh123456@localhost:27017/jijin';
var DB_LIST_STR='jijin';

 //插入
 var insertData = function(db,data,callback) {  
    //连接到表 site
    var collection = db.collection(DB_LIST_STR);
    //插入数据
    //var data = [{"name":"菜鸟教程","url":"www.runoob.com","nick":"cbh"},{"name":"菜鸟工具","url":"c.runoob.com"}];
    collection.insert(data, function(err, result) { 
    	if(err)
    	{
    		console.log('Error:'+ err);
    		return;
    	}     
    	callback(result);
    });
} 
//查询 data:查询条件
 var selectData = function(db,whereStr, callback) {  
  //连接到表  
  var collection = db.collection(DB_LIST_STR);
  //查询数据
  //var whereStr = {"nick":'cbh',"name":"菜鸟工具"};
  collection.find(whereStr).toArray(function(err, result) {
    if(err)
    {
      console.log('Error:'+ err);
      return;
    }     
    callback(result);
  });
}

exports.saveData=function(data,callback){
	MongoClient.connect(DB_CONN_STR, function(err, db) {
		if (!err) {
			console.log('connect db success');
			insertData(db,data,function(result){
				callback(result)
				db.close();
			});
		}
	});
}

exports.findData=function(whereStr,callback){
	MongoClient.connect(DB_CONN_STR, function(err, db) {
		if (!err) {
			console.log('connect db success');
			selectData(db,whereStr,function(result){
				callback(result)
				db.close();
			});
		}else{
      console.log(err);
    }
	});
}