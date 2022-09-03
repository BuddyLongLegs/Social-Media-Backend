const User = require('../models/userModel');
const notify = require('../utils/notify');
const {genPassword} = require('../utils/passwordEncrypt');


//search user by username or name
async function searchUser(req, res){
    // necessary fields required: q (query)
    // optional field: page -> defaults to page number 1, perpage -> defaults to 20
    // can be present in url only (as Get request)
    var query = req.query.q; 
    var page = req.query.page ? Math.max(1, Number(req.query.page)) : 1;
    var perpage = Number(req.query.perpage) || 20;
    if(!query){
        return res.status(400).json({error: "Required Fields Missing"});
    }
    let dbQuery = {
        $text:{
            $search: query,
            $caseSensitive: false
        }
    };
    let options ={
        projection:{score: {$meta:"textScore"}},
        sort:{score: {$meta:"textScore"}},
        page: page,
        limit: perpage,
        select: "username name profile"
    }
    var users = await User.paginate(dbQuery, options);
    return res.status(200).json(users);
}

async function getUser(req, res){
    // for a url with username in the end
    var username = req.params.username;
    if(!username)return res.status(400).json({error: "Required Fields Missing"});

    let user = await User.findOne({username:username}).select("username name postNum followerNum followingNum bio profile");

    if(!user)return res.status(404).json({error: "User not found"});
    
    return res.status(200).json(user);
}

async function getUserPosts(req, res){
    // optional field: page -> defaults to page number 1, perpage -> defaults to 20,
    // sort time -> latest, oldest (defaults to latest)
    var username = req.params.username;
    var page = req.query.page ? Math.max(1, Number(req.query.page)) : 1;
    var perpage = Number(req.query.perpage) || 20;
    var sort = req.query.sort || "latest";
    if(!username)return res.status(400).json({error: "Required Fields Missing"});
    
    let query = {username: username};
    let options = {
        select: "username postNum post",
        populate: {
            path: "post",
            select: "code updatedAt createdBy images likecount commentCount",
            sort: {"updatedAt": sort=="oldest"?1:-1}
        },
        page:page,
        limit: perpage
    }
    var user = await User.paginate(query, options);
    if(!user)return res.status(404).json({error: "User not found"});
    return res.status(200).json(user);
}

async function getUserFollower(req, res){
    // optional field: page -> defaults to page number 1, perpage -> defaults to 50
    var username = req.params.username;
    var page = req.query.page ? Math.max(1, Number(req.query.page)) : 1;
    var perpage = Number(req.query.perpage) || 50;
    if(!username)return res.status(400).json({error: "Required Fields Missing"});

    let query = {username: username};
    let options = {
        select: "username followerNum follower",
        populate: {
            path:{
                path: "follower.user",
                select: "username name profile"
            }
        },
        sort: {"follower.followedAt": -1}
    }
    var user = await User.paginate(query, options);
    if(!user)return res.status(404).json({error: "User not found"});
    return res.status(200).json(user);
}

async function getUserFollowing(req, res){
    // optional field: page -> defaults to page number 1, perpage -> defaults to 50
    var username = req.params.username;
    var page = req.query.page ? Math.max(1, Number(req.query.page)) : 1;
    var perpage = Number(req.query.perpage) || 50;
    if(!username)return res.status(400).json({message: "Required Fields Missing"});

    let query = {username: username};
    let options = {
        select: "username followingNum following",
        populate: {
            path:{
                path: "following.user",
                select: "username name profile"
            }
        },
        sort: {"following.followedAt": -1}
    }
    var user = await User.paginate(query, options);
    if(!user)return res.status(404).json({message: "User not found"});
    return res.status(200).json(user);
}

async function updateSelfUser(req, res){
    // post request 
    // chagable things: username, name, email(unverify), bio, profile
    var user = req.user;
    if(req.body.username!== undefined){
        if(require('../config/constants').USERNAME_PATTERN.test(req.body.username) && req.body.username != user.username){
            user.username = req.body.username;
        }
    }
    if(req.body.name!== undefined && req.body.name.length > 3 && req.body.name.length<33 &&req.body.name !==user.name){
        user.name = req.body.name;
    }
    if(req.body.email!== undefined && require('../config/constants').EMAIL_PATTERN.test(req.body.email) && req.body.email !== user.email){
        user.email = req.body.email;
        user.verified = false;
    }
    if(req.file !== undefined && req.file.location !== ""){
        user.profile = req.file.location;
    }
    if(req.body.bio!== undefined && req.body.bio.length < 257){
        user.bio = req.body.bio;
    }

    try{
        var done = await user.save();
        if(done){
            return res.status(200).json({message:"Ok"});
        }
        return res.status(500).json({error: "unknown error"});
    }catch(err){
        return res.status(500).json({error: err});
    }
}

async function followUser(req, res){
    var user = req.user;
    var fuser = await User.findOne({username: req.params.username});
    if(!fuser || fuser._id==user._id){
        return res.status(400).json({error: "invalid username"});
    }
    var alfol = false;
    for(let i=0; i<user.followingNum; i++){
        if(user.following[i].user == fuser._id){
            alfol = true;
            break;
        }
    }
    if(alfol){
        return res.status(400).json({error: "Already followed"});
    }
    user.followingNum++;
    user.following.push({user: fuser._id, followedAt: Date.now()});
    fuser.followerNum++;
    fuser.follower.push({user: user._id, followedAt: Date.now()});
    try{
        await user.save();
        await fuser.save();
        return res.status(200).json({
            message: "followed successfully",
            data:{
                followedUser:{
                    username: fuser.username,
                    name: fuser.name,
                    postNum: fuser.postNum,
                    followerNum: fuser.followerNum,
                    followingNum: fuser.followingNum,
                    profile: fuser.profile
                },
                self:{
                    username: user.username,
                    name: user.name,
                    postNum: user.postNum,
                    followerNum: user.followerNum,
                    followingNum: user.followingNum,
                    profile: user.profile
                }
            }
        })
    }catch(err){
        return res.status(500).json({error: err});
    }
}

async function unfollowUser(req, res){
    var user = req.user;
    var fuser = await User.findOne({username: req.params.username});
    if(!fuser || fuser._id==user._id){
        return res.status(400).json({error: "invalid username"});
    }
    var alfol = false;
    for(let i=0; i<user.followingNum; i++){
        if(user.following[i].user == fuser._id){
            alfol = true;
            break;
        }
    }
    if(!alfol){
        return res.status(400).json({error: "User not followed"});
    }
    user.followingNum--;
    user.following = user.following.filter((val, ind, ar)=>{
        return val.user != fuser._id;
    })
    fuser.followerNum--;
    fuser.following = fuser.following.filter((val, ind, ar)=>{
        return val.user != user._id;
    })
    try{
        await user.save();
        await fuser.save();
        return res.status(200).json({
            message: "unfollowed successfully",
            data:{
                unfollowedUser:{
                    username: fuser.username,
                    name: fuser.name,
                    postNum: fuser.postNum,
                    followerNum: fuser.followerNum,
                    followingNum: fuser.followingNum,
                    profile: fuser.profile
                },
                self:{
                    username: user.username,
                    name: user.name,
                    postNum: user.postNum,
                    followerNum: user.followerNum,
                    followingNum: user.followingNum,
                    profile: user.profile
                }
            }
        })
    }catch(err){
        return res.status(500).json({error: err});
    }
}
 
async function passwordChange(req, res){
    let uemail = req.body.email,
        code = req.body.code;
    if(uemail===undefined || code ===undefined){
        return res.status(400).json({error:"required field(s) missing"})
    }
    var user = await User.findOne({email: uemail});
    if(!user){
        return res.status(404).status({error: "User not found"});
    }
    if( !user.passwordrequest||
        !user.passwordrequest.createdAt||
        ((Date.now()-user.passwordrequest.createdAt)/1000 > (5*60))){

        return res.status(400).status({error: "No Active Password Change Request"});
    }
    if(code !== user.passwordrequest.code){
        return res.status(409).json({error: "Incorrect Code"});
    }
    let newpas = genPassword(req.body.password);
    user.hash = newpas.hash;
    user.salt = newpas.salt;
    try{
        await user.save();
        return res.status(201).json({message: "Password changed successfully"});
    }catch(err){
        return res.status(500).json({error: err});
    }
}
 
async function passwordChangeRequest(req, res){
    let uemail = req.body.email;
    if(uemail===undefined){
        return res.status(400).json({error: "required field(s) missing"});
    }
    var user = await User.findOne({email: uemail});
    if(!user){
        return res.status(404).status({error: "User not found"});
    }
    user.passwordrequest.createdAt = Date.now();
    user.passwordrequest.code = (Math.floor(100000 + Math.random() * 900000)).toString();
    try{
        await user.save();
        notify(user.email,
            "Password Change OTP",
            `Use this OTP for changing your password: ${user.passwordrequest.code}.\nIt expires in 5 mins`);
        return res.status(201).json({message: "OTP sent successfully"});
    }catch(err){
        return res.status(500).json({error: err});
    }
}
 
async function verifyEmail(req, res){
    let user = req.user,
        code = req.body.code;
    if(code ===undefined){
        return res.status(400).json({error:"required field(s) missing"})
    }
    if( !user.verifyEmailRequest||
        !user.verifyEmailRequest.createdAt||
        ((Date.now()-user.verifyEmailRequest.createdAt)/1000 > (10*60))){

        return res.status(400).status({error: "No Active Email Verification Request"});
    }
    if(code !== user.verifyEmailRequest.code){
        return res.status(409).json({error: "Incorrect Code"});
    }
    user.verified = true;
    try{
        await user.save();
        return res.status(201).json({message: "User Email Verified"});
    }catch(err){
        return res.status(500).json({error: err});
    }
}
 
async function verifyEmailRequest(req, res){
    let user = req.user;
    user.verifyEmailRequest.createdAt = Date.now();
    user.verifyEmailRequest.code = (Math.floor(100000 + Math.random() * 900000)).toString();
    try{
        await user.save();
        notify(user.email,
            "Email Verification OTP",
            `Use this OTP for verifying your email ID: ${user.verifyEmailRequest.code}.\nIt expires in 10 mins`);
        return res.status(201).json({message: "OTP sent Successfully"});
    }catch(err){
        return res.status(500).json({error: err});
    }
}
 
async function userSelfProfile(req, res){
    return res.status(200).json({message: "working"});
}
 
async function userSelfPasswordChange(req, res){
    return res.status(200).json({message: "working"});
}
 

module.exports = {
    searchUser: searchUser,
    getUser: getUser,
    getUserPosts: getUserPosts,
    getUserFollower: getUserFollower,
    getUserFollowing: getUserFollowing,
    updateSelfUser: updateSelfUser,
    followUser: followUser,
    unfollowUser: unfollowUser,
    passwordChange: passwordChange,
    passwordChangeRequest: passwordChangeRequest,
    verifyEmail: verifyEmail,
    verifyEmailRequest: verifyEmailRequest,
    userSelfProfile: userSelfProfile,
    userSelfPasswordChange: userSelfPasswordChange
}