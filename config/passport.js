require("dotenv/config");
const passport = require("passport");
const Localstrategy = require("passport-local").Strategy;
const GoogleStrategy = require('passport-google-oauth20');
const passportJWT = require("passport-jwt");
const JWTStrategy   = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

const User = require("../models/userModel");
const {genPassword,validPassword} = require("../utils/passwordEncrypt");


//User signing in his/her account

passport.use('user-signin-local', new Localstrategy(
    {
        usernameField: 'email', 
        passwordField: 'password',
        passReqToCallback: true,
    },
    async (req, email, password, done) => {
        
        if((!(email || email.length!=0))
            ||!(password && password.length!=0)){
            return done(null, false, {status:400, message:"required field(s) missing"});
        }
        var v=false;
        try{
            if(email){
                var user = await User.findOne({email:email});
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

passport.use("user-google", new GoogleStrategy({
    clientID: process.env.GOOGLE_OAUTH_CLIENT_ID,
    clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    callbackURL: (process.env.ENVIORNMENT === "DEV")?'http://localhost:5000/auth/google/callback':"https://bll-webd-select.herokuapp.com/auth/google/callback",
    scope: [ 'profile', 'email' ],
},async (accessToken, refreshToken, profile, done)=>{
    try{
        let userdet = profile._json;
        let user = await User.findOne({email:userdet.email});
        if(user){
            return done(null, user);
        }else{
            req.newUser = true;
            let newUser = new User({
                name:userdet.name,
                email: userdet.email,
                verified: userdet.email_verified,
                profile: userdet.picture
            });
            newUser = await newUser.save();
            return done(null, newUser);
        }
    }catch(err){
        return done(null, false, {status:500, message:err.message});
    }
    }
))

passport.use("jwt", new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromExtractors([ExtractJWT.fromHeader('secret'), ExtractJWT.fromAuthHeaderAsBearerToken(), ExtractJWT.fromBodyField('secret')]),
    secretOrKey   : process.env.SECRET
},
async (jwtpayload, done)=>{
    let user = await User.findById(jwtpayload.id);
    if(user && Date.now()<Date.parse(jwtpayload.expire)){
        return done(null, user);
    }
    return (null, false);
}
))

module.exports = passport;

//TODO: add jwt strategy here and update checking user details in the middlewares