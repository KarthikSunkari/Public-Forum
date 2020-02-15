//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const _ = require('lodash');
const expressValidator = require('express-validator');
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(expressValidator());
app.use(express.static("public"));

let users=[];
let isuserPresent=[];
let userCount=0;

app.get("/",function(req,res){
    res.render("index",{
        islogin:true
    });
});

app.get("/signup",function(req,res){
    res.render("index",{
        islogin:false
    });
});

app.post("/",function(req,res){
	let email=req.body.email;
    let password=req.body.password;
    users.forEach(user => {
        if(email===user.email){
            if(password===user.password){
                console.log("Login Successful");
                let s=_.kebabCase(email);
                res.redirect('/user/'+s);
            }
        }
    });
    res.send("<h2>Login Unsuccessful!</h2>");
});

app.post("/signup",function(req,res){

    req.checkBody('username', 'Username field cannot be empty.').notEmpty();
    req.checkBody('email', 'The email you entered is invalid, please try again.').isEmail();
    req.checkBody('password', 'Password must be atleast 4 characters long.').len(4, 100);
    req.checkBody('confirmPassword', 'Passwords do not match, please try again.').equals(req.body.password);

    let errors = req.validationErrors();
    if(errors){
        console.log(errors);
        res.render("index",{
            errors:errors,
            islogin:false
        });
    }
    let err=[];
    let error={};
    error.msg="User with the given email already exists!";
    let email=req.body.email;
    err.push(error);
    if(isuserPresent.indexOf(_.kebabCase(email)) !== -1)
    res.render("index",{errors:err,islogin:false});
    let user = {};
    user.id=++userCount;
    user.name=req.body.username;
    user.email=email;
    user.password=req.body.password;
    user.posts=[];
    let intropost={};
    intropost.title="Intro";
    intropost.content="Hi I am "+ user.name;
    user.posts.push(intropost);
    users.push(user);
    let kebabCaseEmail=_.kebabCase(email);
    isuserPresent.push(kebabCaseEmail);
    res.redirect("/user/"+kebabCaseEmail);
});

app.get("/user/:userEmail",function(req,res){
    let userEmail=req.params.userEmail;
    console.log(userEmail);
    let i=isuserPresent.indexOf(userEmail);
    if(i==-1)
    res.send("<h3>No such user!</h3>");
    let user=users[i];
    let kebabCaseEmail=_.kebabCase(userEmail);
    res.render("user",{
        email:kebabCaseEmail,
        user:user
    });
});
  
app.post("/user/:userEmail",function(req,res){
    let userEmail=req.params.userEmail;
    let title=req.body.postTitle;
    let content=req.body.postContent;
    let i=isuserPresent.indexOf(userEmail);
    let posts=users[i].posts;
    let post={};
    post.title=title;
    post.content=content;
    posts.push(post);
    res.redirect("/user/"+userEmail);
});

app.listen(3000, function () {
    console.log("Server started on port 3000");
 });