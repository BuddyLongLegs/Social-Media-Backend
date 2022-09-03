const express = require('express');
const router = express.Router();

const {
    searchUser,
    getUser,
    getUserPosts,
    getUserFollower,
    getUserFollowing,
    updateSelfUser,
    followUser,
    unfollowUser,
    passwordChange,
    passwordChangeRequest,
    verifyEmail,
    verifyEmailRequest,
    userSelfProfile,
    userSelfPasswordChange
} = require('../controllers/userController');

const {getUserFeedPosts} = require('../controllers/postController');

const {ensureLoggedIn, completedProfileWithLogin, loginAndImage} = require('../controllers/middlewares');

const passport = require("passport");
const jwt = require('jsonwebtoken');

function normalLogin(req, res, next){
    passport.authenticate('user-signin-local', (err, user, info)=>{
        if(!user){
            return res.status(info.status||404).json({error: info.message});
        }
        req.login(user, {session: false}, (err)=>{
            if(err){
                return res.status(500).json({error: err.message});
            }
            var exp = new Date(Date.now());
            exp.setMonth(exp.getMonth()+1);
            req.jwt = jwt.sign( {id: user._id, expire: exp.toString()}, process.env.SECRET);
        });
        next();
    })(req, res, next);
}

function normalSignup(req, res, next){
    passport.authenticate('user-signup-local', (err, user, info)=>{
        if(!user){
            return res.status(info.status||404).json({error: info.message});
        }
        req.login(user, {session: false}, (err)=>{
            if(err){
                return res.status(500).json({error: err.message});
            }
            var exp = new Date(Date.now());
            exp.setMonth(exp.getMonth()+1);
            req.jwt = jwt.sign( {id: user._id, expire: exp.toString()}, process.env.SECRET);
        });
        next();
    })(req, res, next);
}

function googleLogin(req, res, next){
    passport.authenticate('user-google', (err, user, info)=>{
        if(!user){
            return res.status(401).send("`<script defer>window.close()</script>");
        }
        req.login(user, {session: false}, (err)=>{
            if(err){
                return res.status(500).json({error: err.message});
            }
            var exp = new Date(Date.now());
            exp.setMonth(exp.getMonth()+1);
            req.jwt = jwt.sign( {id: user._id, expire: exp.toString()}, process.env.SECRET);
        });
        next();
    })(req, res, next);
}

router.post('/login', normalLogin, (req, res)=>{
    return res.status(200).json({
        message: "Logged in successfully",
        data: {
            username: req.user.username,
            name: req.user.name,
            profile: req.user.profile,
        },
        secret: req.jwt
    })
});

router.post('/signup', normalSignup, (req, res)=>{
    return res.status(201).json({
        message: "Account Created Successfully",
        data:{
            username: req.user.username,
            name: req.user.name,
        },
        secret: req.jwt
    })
});

router.get('/login/google', passport.authenticate('user-google'));

router.get('/auth/google/callback', googleLogin, (req, res)=>{
    return res.send(`<script defer>localStorage.setItem("secret", "${req.jwt}"); window.close()</script>`)
});


router.get('/search', searchUser);
router.post('/changepassword/request', passwordChangeRequest);
router.patch('/changepassword', passwordChange);

router.get('/verifyemail/request', ensureLoggedIn, verifyEmailRequest);
router.patch('/verifyemail', ensureLoggedIn, verifyEmail);
router.patch('/update', loginAndImage, updateSelfUser);
router.get('/profile', completedProfileWithLogin, userSelfProfile);
router.patch('/changepassword/self', completedProfileWithLogin, userSelfPasswordChange);
router.get('/feed', completedProfileWithLogin, getUserFeedPosts);

router.post('/:username/follow', completedProfileWithLogin, followUser);
router.delete('/:username/follow', completedProfileWithLogin, unfollowUser);
router.get('/:username/posts', getUserPosts);
router.get('/:username/followers', getUserFollower);
router.get('/:username/followings', getUserFollowing);
router.get('/:username', getUser);

module.exports = router;