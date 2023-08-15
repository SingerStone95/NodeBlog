var MongoClient = require('mongodb').MongoClient;
require('./setting.js');
const  DB_LIST_STR = 'jijin';

//插入
var insertData = function (db, dbo,data, callback) {
	var collection = dbo.collection(DB_LIST_STR);
	collection.insert(data, function (err, result) {
		if (err) {
			console.log('Error:' + err);
			return;
		}
		callback(result);
	});
}
//查询 data:查询条件
var selectData = function (db,dbo, whereStr, callback) {
	//连接到表  
	var collection = dbo.collection(global.DB_NAME);
	//查询数据
	//var whereStr = {"nick":'cbh',"name":"菜鸟工具"};
	collection.find(whereStr).toArray(function (err, result) {
		if (err) {
			console.log('Error:' + err);
			return;
		}
		callback(result);
	});
}


exports.saveData = function (data, callback) {
	MongoClient.connect(global.DB_URL, function (err, db) {
		var dbo = db.db(global.DB_NAME);
		if (!err) {
			console.log('connect db success');
			insertData(db,dbo, data, function (result) {
				callback(result)
				db.close();
			});
		}
	});
}

exports.findData = function (whereStr, callback) {
	MongoClient.connect(global.DB_URL, function (err, db) {
		var dbo = db.db(global.DB_NAME);
		if (!err) {
			console.log('connect db success');
			selectData(db, dbo,whereStr, function (result) {
				callback(result)
				db.close();
			});
		} else {
			console.log(err);
		}
	});
}

exports.updateDate = function (whereStr, resultStr, callback) {
	MongoClient.connect(global.DB_URL, function (err, db) {
		var dbo = db.db(global.DB_NAME);
		if (!err) {
			console.log('connect db success');
			var collection = dbo.collection(DB_LIST_STR);
			collection.update(whereStr, resultStr, function (error, result) {
				if (error) {
					console.log('Error:' + error);
				} else {
					callback(result);
				}
				db.close();
			});
		}
	});
}

exports.deleteData = function (whereStr, callback) {
	MongoClient.connect(global.DB_URL, function (err, db) {
		var dbo = db.db(global.DB_NAME);
		if (!err) {
			console.log('connect db success');
			var collection = dbo.collection(DB_LIST_STR);
			collection.remove(whereStr, { safe: true }, function (error, result) {
				if (error) {
					console.log('Error:' + error);
				} else {
					callback(result);
				}
				db.close();
			});
		}
	});
}