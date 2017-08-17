module.exports = function (app) {
    //首页的路由
    app.get('/',function (req,res) {
        res.render('index',{title:'首页'})
    })
    //注册页面
    app.get('/reg',function (req,res) {
        res.render('reg',{title:'注册'})
    })
    //注册行为
    app.post('/reg',function (req,res) {

    })
    //登录页面
    app.get('/login',function (req,res) {
        res.render('login',{title:'登录'})
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