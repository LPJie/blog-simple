/**
 * Created by Administrator on 2017/8/17.
 */

var setting = require('../setting');//数据库的配置参数
var DB = require('mongodb').Db;
var Server = require('mongodb').Server;
module.exports = new DB(setting.db,new Server(setting.host,setting.port),{safe:true})