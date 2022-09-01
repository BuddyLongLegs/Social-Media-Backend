require("dotenv/config");
const passport = require("passport");
const Localstrategy = require("passport-local").Strategy;
const CookieStrategy = require("passport-cookie").Strategy;
const passportJWT = require("passport-jwt");
const JWTStrategy   = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

const User = require("../models/userModel");
const {genPassword,validPassword} = require("../utils/passwordEncrypt");
const getTokenDetails = require("./googleoauth");


//User signing in his/her account

passport.use('user-signin-local', new Localstrategy(
    {
        usernameField: 'email', 
        passwordField: 'password',
        passReqToCallback: true,
    },
    async (req, email, password, done) => {
        
        //allowing usage of email as well as username for login, email has higher priority

        if((!(req.body.username && req.body.username.length!=0) && !(email || email.length!=0))
            ||!(password && password.length!=0)){
            return done(null, false, {status:400, message:"required field(s) missing"});
        }
        var user, v=false;
        try{
            if(email){
                user = await User.findOne({email:email});
            }else{
                user = await User.findOne({username: req.body.username});
            }
            if(!user){
                return done(null, false, {status:404, message:"User not found"});
            }
            v = validPassword(password, user.hash, user.salt);
        }
        catch(err){
            return done(null, false, {status:500, message:err.message});
        }
        if(v){
            return done(null, user);
        }
        return done(null, false, {status:403, message:"Wrong Password"});
    }
));


//User signing up for first time
passport.use('user-signup-local', new Localstrategy(
    {
        usernameField: 'email', 
        passwordField: 'password',
        passReqToCallback: true,
    },
    async (req, email, password, done)=>{
        // required fields for local signup: email, username, name, password
        // optional ->bio, profile?

        let name = req.body.name;
        let username = req.body.username;
        if( !(email && require('./constants').EMAIL_PATTERN.test(email))
        ||!(username && require('./constants').USERNAME_PATTERN.test(username))
        ||!(name && name.length>3 && name.length<33)
        ||!(password && password.length>7 && password.length < 33))
        {
            return done(null, false, {status:400, message:"required field(s) missing/invalid"});
        }

        try{
            var user = await User.findOne({$or:[{username: req.body.username}, {email:email}]});
            if(user){
                return done(null, false, {status:409, message:"User already exists"});
            }

            let pashash = genPassword(password);
            let newUser = new User({
                username:username,
                name:name,
                email:email,
                hash:pashash.hash,
                salt:pashash.salt
            })
            if(req.body.bio)newUser.bio = req.body.bio;
            newUser = await newUser.save()
            return done(null, newUser);
        }catch(err){
            return done(null, false, {status:500, message:err.message});
        }
    }
));


//Google signin as well as sign up in one
passport.use("user-google", new CookieStrategy(
    {
        cookieName: 'g_csrf_token',
        passReqToCallback: true,
        
    },
    async (req, token, done)=>{
        let userdet = await getTokenDetails(req.body, token);
        if(!userdet){
            return done(null, false, {status:403, message:"Authentication Failed"});
        }
        try{
            let user = await User.findOne({email:userdet.email});
            if(user){
                return done(null, user);
            }else{
                req.newUser = true;
                let newUser = new User(userdet);
                newUser = await newUser.save();
                return done(null, newUser);
            }
        }catch(err){
            return done(null, false, {status:500, message:err.message});
        }
    }
));

passport.use("jwt", new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromExtractors([ExtractJWT.fromHeader('secret'), ExtractJWT.fromAuthHeaderAsBearerToken(), ExtractJWT.fromBodyField('secret')]),
    secretOrKey   : process.env.SECRET
},
async (jwtpayload, done)=>{
    let user = await User.findById(jwtpayload.id);
    if(user){
        return done(null, user);
    }
    return (null, false);
}
))

module.exports = passport;

//TODO: add jwt strategy here and update checking user details in the middlewares