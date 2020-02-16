//jshint esversion:8
const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const passport = require('passport');
const initializePassport = require('./passport-config');
const flash = require('express-flash');
const session = require('express-session');
const methodOveride = require('method-override');

let users=[];
let isuserPresent=[];
let userCount=0;

initializePassport(
    passport, 
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
);

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname + '/public'));
app.use(flash());
require('dotenv').config();
app.use(session({
    secret:"cookie_secret",//process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOveride('_method'));

app.get("/",checkNotAuthenticated,function(req,res){
    res.render("index",{
        islogin:true
    });
});

app.get("/signup",checkNotAuthenticated,function(req,res){
    res.render("index",{
        islogin:false
    });
});

app.post("/",passport.authenticate('local',{
    successRedirect:'/user',
    failureRedirect:'/',
    failureFlash:true
}));

app.post("/signup",async function(req,res){
    let email=req.body.email;
    if(isuserPresent.indexOf(email) != -1){
        res.send("<h2>User already present</h2>");
        return;
    }
    const hashedPassword = await bcrypt.hash(req.body.password,3);
    let user={
        id:++userCount,
        name:req.body.username,
        email:email,
        password:hashedPassword,
    };
    user.posts=[];
    let intropost={
        title:"Intro",
        content:"Hi, I am "+ user.name + "!"
    };
    console.log(user);
    user.posts.push(intropost);
    users.push(user);
    isuserPresent.push(email);
    res.redirect("/user");
});

app.delete('/logout',(req,res)=>{
    req.logOut();
    res.redirect('/');
});

app.get("/user",checkAuthenticated,function(req,res){
    res.render("user",{
        user:req.user
    });
});
  
app.post("/user",checkAuthenticated,function(req,res){
    let title=req.body.postTitle;
    let content=req.body.postContent;
    let posts=req.user.posts;
    let post={};
    post.title=title;
    post.content=content;
    posts.push(post);
    res.redirect("/user/");
});

function checkAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/'); 
}

function checkNotAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return res.redirect('/user');
    }
    next();
}

app.listen(3000, function () {
    console.log("Server started on port 3000");
 });
