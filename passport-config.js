//jshint esversion:8
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

function intialize(passport, getUserByEmail, getUserById){
    const authenticateUser = async (email, password, done) =>{
        const user = getUserByEmail(email);
        if(user == null){
            console.log("No user with that email");
            return done(null, false, {message: 'No user with that email'});
        }
        try {
            if(await bcrypt.compare(password,user.password)){
                return done(null, user);
            }else{
                console.log("Password Incorrect");
                return done(null, false, {message: 'Password Incorrect'});
            }
        } catch (e) {
            return done(e);
        }

    };
    passport.use(new LocalStrategy({usernameField: 'email'}, authenticateUser));
    passport.serializeUser((user,done)=>done(null,user.id));
    passport.deserializeUser((id,done)=>{
        return done(null, getUserById(id));
    });
}

module.exports = intialize;     
