/**
 * Created by Administrator on 2017/8/18.
 */
var mongo = require('./db')
//引入Markdown
var markdown = require('markdown').markdown;
//name：发表文章的用户名
//title：文章标题
//post：文章内容
function Post(name,title,tags,post) {
    this.name = name;
    this.title = title;
    this.tags = tags;
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
        tags:this.tags,
        post:this.post,
        //增加一个留言字段
        comments:[],
        pv:0
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
Post.getTen = function (name,page,callback) {
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
           collection.count(query,function (err,total) {
               collection.find(query,{
                   skip:(page - 1) * 10,
                   limit:10
               }).sort({time:-1}).toArray(function (err, docs) {
                   mongo.close();
                   if(err){
                       return callback(err);
                   }
                   //加入Markdown解析
                   docs.forEach(function (doc) {
                       doc.post = markdown.toHTML(doc.post);
                   })
                   callback(null,docs,total)
               })
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
            //根据用户名、发表日期及文章名进行查询
            collection.findOne({
                "name":name,
                "time.minute":minute,
                "title":title
            },function (err,doc) {
                if (err){
                    mongo.close();
                    return callback(err)
                }
                if(doc){
                    //每访问1次，pv值增加1
                    collection.update({
                        "name":name,
                        "time.minute":minute,
                        "title":title
                    },{
                        $inc:{"pv":1}
                    },function (err) {
                        mongo.close();
                        if(err){
                            return callback(err);
                        }
                    });
                    //将这个文章内容进行Markdown格式的解析
                    doc.post = markdown.toHTML(doc.post);
                    //让我们的留言也支持Markdown格式的解析
                    doc.comments.forEach(function (comment) {
                        comment.content = markdown.toHTML(comment.content);
                    })
                    callback(null,doc);
                }
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
//存档信息
Post.getArchive = function (callback) {
    mongo.open(function (err,db) {
        if(err){
            return callback(err);
        }
        db.collection('posts',function (err,collection) {
            if(err){
                mongo.close();
                return callback(err);
            }
            collection.find({},{
                "name":1,
                "time":1,
                "title":1
            }).sort({
                time:-1
            }).toArray(function (err, docs) {
                mongo.close();
                if(err){
                    return callback(err);
                }
                callback(null,docs);
            })
        })
    })
}
// 返回所有的标签
Post.getTags = function (callback) {
    mongo.open(function (err,db) {
        if(err){
            return callback(err);
        }
        db.collection('posts',function (err,collection) {
            if(err){
                mongo.close();
                return callback(err);
            }
            collection.distinct('tags',function (err,tags) {
                mongo.close();
                if(err){
                    return callback(err);
                }
                callback(null,tags)
            })
        })
    })
}
//返回一个标签对应的所有文章
Post.getTag = function (tag,callback) {
    mongo.open(function (err,db) {
        if(err){
            return callback(err)
        }
        db.collection('posts',function (err,collection) {
            if(err){
                mongo.close();
                return callback(err);
            }
            //查询所有tags 数组内包含 tag 的文档
            //并返回只含有 name 、time、title 组成的数组
            collection.find({
                "tags":tag
            },{
                "name":1,
                "time":1,
                "title":1
            }).sort({
                time:-1
            }).toArray(function (err, docs) {
                mongo.close();
                if(err){
                    return callback(err);
                }
                callback(null,docs)
            })
        })
    })
}
//通过搜索关键字查询文章信息
Post.search = function (keyword,callback) {
    mongo.open(function (err,db) {
        if(err){
            return callback(err);
        }
        db.collection('posts',function (err,collection) {
            if(err){
                mongo.close();
                return callback(err);
            }
            var reg = new RegExp(keyword,'i');
            collection.find({
                "title":reg
            },{
                "name":1,
                "time":1,
                "title":1
            }).sort({
                time:-1
            }).toArray(function (err, docs) {
                mongo.close();
                if(err){
                    return callback(err);
                }
                callback(null,docs);
            })
        })
    })
}