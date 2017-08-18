/**
 * Created by Administrator on 2017/8/17.
 */
//user.js 文件负责用户注册的新增操作以及用户信息的查询操作
var mongo = require('./db');
function User(user) {
    this.name = user.name;
    this.password = user.password;
    this.email = user.email;
}
module.exports = User
User.prototype.save = function (callback) {
    //收集数据
    var user = {
        name:this.name,
        password:this.password,
        email:this.email
    }
    mongo.open(function (err,db) {
        //判断数据库打开是否有错误，如果有错误的话，将错误的结果返回给回调函数
        if(err) {
            return callback(err)
        }
        db.collection('user',function (err,collection) {
            //如果在读取结合的时候有错，关闭数据库，并将错误结果返回给回调函数
            if(err){
                //关掉数据库
                mongo.close();
                //将错误结果返回给回调函数
                return callback(err);
            }
            //将数据插入到user集合中
            collection.insert(user,{safe:true},function (err, user) {
                //关闭数据库
                mongo.close();
                //如果错的话，返回错误结果
                if(err){
                    return callback(err);
                }
                //如果没有错的话，返回的是插入的那条数据的第一个字段--name用户名
                callback(null,user[0]);
            })
        })
    })
}
//获取注册用户信息的方法 name：你要查询的用户名
User.get = function (name,callback) {
    mongo.open(function (err,db) {
        if(err){
            return callback(err);
        }
        db.collection('user',function (err,collection) {
            if(err){
                mongo.close();
                return callback(err);
            }
            //查询name为指定名称的用户信息，返回用户信息
            collection.findOne({name:name},function (err,user) {
                mongo.close();
                if(err){
                    return callback(err);
                }
                return callback(null,user);
            })
        })
    })
}

