/**
 * Created by Administrator on 2017/8/18.
 */
var mongo = require('./db')
//引入Markdown
var markdown = require('markdown').markdown;
//name：发表文章的用户名
//title：文章标题
//post：文章内容
function Post(name,title,post) {
    this.name = name;
    this.title = title;
    this.post = post;
}
module.exports = Post;
//保存文章列表
Post.prototype.save = function (callback) {
    var date = new Date();
    var time = {
        //原始的格式
        date:date,
        //当前时间的年份
        year:date.getFullYear(),
        // 当前时间 年份 + 月份
        month:date.getFullYear() + '-' + (date.getMonth() < 10 ? '0' + (date.getMonth() + 1)
            : (date.getMonth() + 1)),
        // 当前时间 年份 + 月份 + 天
        day:date.getFullYear() + '-' + (date.getMonth() < 10 ? '0' + (date.getMonth() + 1)
            : (date.getMonth() + 1)) + '-' + (date.getDate() < 10 ? '0' + date.getDate()
            : date.getDate()),
        //当前时间 年份 + 月份 + 天 + 小时 + 分钟 + 秒
        minute:date.getFullYear() + '-' + (date.getMonth() < 10 ? '0' + (date.getMonth() + 1)
            : (date.getMonth() + 1)) + '-' + (date.getDate() < 10 ? '0' + date.getDate() :
            date.getDate()) + ' ' + (date.getHours() < 10 ? '0' + date.getHours() :
            date.getHours()) + ':' + (date.getMinutes() < 10 ? '0' + date.getMinutes()
            :date.getMinutes()) + ':' + (date.getSeconds() < 10 ? '0' + date.getSeconds()
            : date.getSeconds())

    }
    //把需要写入的数据全部放在post对象上
    var post = {
        name:this.name,
        time:time,
        title:this.title,
        post:this.post,
        //增加一个留言字段
        comments:[]
    }
    //打开数据库
    mongo.open(function (err,db) {
        if(err){
            return callback(err);
        }
        db.collection('posts',function (err,collection) {
            if(err){
                mongo.close();
                return callback(err);
            }
            collection.insert(post,{safe:true},function (err, post) {
                mongo.close();
                if(err){
                    return callback(err);
                }
                callback(null);
            })
        })
    })
}
//读取文章列表
Post.getAll = function (name,callback) {
    mongo.open(function (err,db) {
        if(err){
            return callback(err);
        }
        db.collection('posts',function (err,collection) {
            if(err){
                mongo.close();
                return callback(err);
            }
            var query = {};
            if(name){
                query = {name:name}
            }
            //根据query对象查询文章
            collection.find(query).sort({time:-1}).toArray(function (err, docs) {
                mongo.close();
                if(err){
                    return callback(err);
                }
                //加入Markdown解析
                docs.forEach(function (doc) {
                    doc.post = markdown.toHTML(doc.post);
                })
                callback(null,docs)
            })
        })
    })
}
//查询一篇文章
Post.getOne = function (name,minute,title,callback) {
    //1.打开数据库
    mongo.open(function (err,db) {
        if(err){
            return callback(err);
        }
        //2.读取posts集合
        db.collection('posts',function (err,collection) {
            if(err){
                mongo.close();
                return callback(err);
            }
            collection.findOne({
                "name":name,
                "time.minute":minute,
                "title":title
            },function (err,doc) {
                mongo.close();
                if (err){return callback(err)}
                //将这个文章内容进行Markdown格式的解析
                doc.post = markdown.toHTML(doc.post);
                //让我们的留言也支持Markdown格式的解析
                doc.comments.forEach(function (comment) {
                    comment.content = markdown.toHTML(comment.content);
                })
                callback(null,doc);
            })
        })
    })
}
//编辑文章的方法
Post.edit = function (name,minute,title,callback) {
    mongo.open(function (err,db) {
        if(err){
            return callback(err);
        }
        db.collection('posts',function (err,collection) {
            if(err){
                mongo.close();
                return callback(err);
            }
            collection.findOne({
                "name":name,
                "time.minute":minute,
                "title":title
            },function (err,doc) {
                mongo.close();
                if(err){
                    return callback(err);
                }
                callback(null,doc);//返回的事原始的格式，Markdown格式的，没有解析
            })
        })
    })
}
//更新方法
Post.update = function (name,minute,title,post,callback) {
    mongo.open(function (err,db) {
        if(err){
            return callback(err);
        }
        db.collection('posts',function (err,collection) {
            if(err){
                mongo.close();
                return callback(err);
            }
            collection.update({
                "name":name,
                "time.minute":minute,
                "title":title
            },{
                $set:{post:post}
            },function (err) {
                mongo.close();
                if(err){
                    return callback(err);
                }
                callback(null);
            })
        })
    })
}
//删除一篇文章
Post.remove = function (name,minute,title,callback) {
    //打开数据库
    mongo.open(function (err,db) {
        if(err){
            return callback(err);
        }
        //读取posts集合
        db.collection('posts',function (err,collection) {
            if(err){
                mongo.close();
                return callback(err);
            }
            collection.remove({
                "name":name,
                "time.minute":minute,
                "title":title
            },{
                w:1
            },function (err) {
                mongo.close();
                if(err){
                    return callback(err);
                }
                callback(null);
            })
        })
    })
}