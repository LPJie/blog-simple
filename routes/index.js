//加密
var crypto = require('crypto');
//User对象的操作
var User = require('../models/user');
module.exports = function (app) {
    //首页的路由
    app.get('/',function (req,res) {
        res.render('index',{
            title:'首页',
            user:req.session.user,//注册成功的用户信息
            success:req.flash('success').toString(),//成功的提示信息
            error:req.flash('error').toString()//失败的提示信息
        })
    })
    //注册页面
    app.get('/reg',function (req,res) {
        res.render('reg',{
            title:'注册',
            user:req.session.user,//注册成功的用户信息
            success:req.flash('success').toString(),//成功的提示信息
            error:req.flash('error').toString()//失败的提示信息
        })
    })
    //注册行为
    app.post('/reg',function (req,res) {
        //收集一下post请求发过来的注册用户的用户名、密码、邮箱
        var name = req.body.name;
        var password = req.body.password;
        var password_re = req.body['password-repeat'];
        var email = req.body.email;
        //1.检查密码是否一致
        if(password != password_re){
            //给出错误提示
            req.flash('error','两次密码不一致')
            //返回到注册页面去
            return res.redirect('/reg');
        }
        //2.对密码进行加密
        var md5 = crypto.createHash('md5');
        var password = md5.update(req.body.password).digest('hex');
        //3.实例化User类，赋值
        var newUser = new User({
            name:name,
            password:password,
            email:email
        })
        //检查用户名在数据中是否已经存在，如果已经存在，则提示错误
        User.get(newUser.name,function (err,user) {
            if (err){
                req.flash('error',err);
                return res.redirect('/reg');
            }
            //用户名重复了
            if (user){
                req.flash('error','用户名不能重复');
                return res.redirect('/reg');
            }
            //保存到数据库中去
            newUser.save(function (err,user) {
                if(err){
                    req.flash('error',err);
                    return res.redirect('/reg');
                }
                //将用户的信息存放到session中去
                req.session.user = newUser;
                req.flash('success','注册成功');
                return res.redirect('/');
            })
        })
    });
    //登录页面
    app.get('/login',function (req,res) {
        res.render('login',{
            title:'登录',
            user:req.session.user,//注册成功的用户信息
            success:req.flash('success').toString(),//成功的提示信息
            error:req.flash('error').toString()//失败的提示信息
        })
    })
    //登录行为
    app.post('/login',function (req,res) {

    })
    //发表页面
    app.get('/post',function (req,res) {
        res.render('post',{title:'发布文章'})
    })
    //发布行为
    app.post('/post',function (req,res) {

    })
    //退出页面
    app.get('/logout',function (req,res) {

    })
}