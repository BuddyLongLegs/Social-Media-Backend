const {uploadImage, uploadMedia} = require('../config/cdn')
const passport = require('passport');

function ensureLoggedIn(req, res, next){
    passport.authenticate('jwt', (err, user, info)=>{
        if(!user){
            return res.status(401).json({message: "Please Login to use this"});
        }
        req.login(user, {session: false}, (err)=>{
            if(err){
                return res.status(500).json({message: err.message})
            }
            next();
        })
    })(res, req, next)
}

function completedProfileWithLogin(req, res, next){
    passport.authenticate('jwt', (err, user, info)=>{
        if(!user){
            return res.status(401).json({message: "Please Login to use this"});
        }
        req.login(user, {session: false}, (err)=>{
            if(err){
                return res.status(500).json({message: err.message})
            }
            if(!user.verified){
                return res.status(403).json({message: "Please Verify your email"});
            }
            if(!user.username){
                return res.status(403).json({message: "Missing required account detail: Username"})
            }
            next();
        })
    })(res, req, next)
}

function loginAndImage(req, res, next){
    ensureLoggedIn(req, res, uploadImage(req, res, next));
}

function completeAndMedia(req, res, next){
    completedProfileWithLogin(req, res, uploadMedia(req, res, next));
}



module.exports = {
    ensureLoggedIn: ensureLoggedIn,
    completedProfileWithLogin: completedProfileWithLogin,
    loginAndImage: loginAndImage,
    completeAndMedia: completeAndMedia    
}