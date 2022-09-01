const User = require('../models/userModel');


//search user by username or name
async function searchUser(req, res){
    // necessary fields required: q (query)
    // optional field: page -> defaults to page number 1, perpage -> defaults to 20
    // can be present in url only (as Get request)
    var query = req.query.q; 
    var page = req.query.page ? Math.max(1, Number(req.query.page)) : 1;
    var perpage = Number(req.query.perpage) || 20;
    if(!query){
        return res.status(400).json({message: "Required Fields Missing"});
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
    if(!username)return res.status(400).json({message: "Required Fields Missing"});

    let user = await User.findOne({username:username}).select("username name postNum followerNum followingNum bio profile");

    if(!user)return res.status(404).json({message: "User not found"});
    
    return res.status(200).json(user);
}

async function getUserPosts(req, res){
    // optional field: page -> defaults to page number 1, perpage -> defaults to 20,
    // sort time -> latest, oldest (defaults to latest)
    var username = req.params.username;
    var page = req.query.page ? Math.max(1, Number(req.query.page)) : 1;
    var perpage = Number(req.query.perpage) || 20;
    var sort = req.query.sort || "latest";
    if(!username)return res.status(400).json({message: "Required Fields Missing"});
    
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
    if(!user)return res.status(404).json({message: "User not found"});
    return res.status(200).json(user);
}

async function getUserFollower(req, res){
    // optional field: page -> defaults to page number 1, perpage -> defaults to 50
    var username = req.params.username;
    var page = req.query.page ? Math.max(1, Number(req.query.page)) : 1;
    var perpage = Number(req.query.perpage) || 50;
    if(!username)return res.status(400).json({message: "Required Fields Missing"});

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
    if(!user)return res.status(404).json({message: "User not found"});
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
    return res.status(200).json({message: "working"});
}

async function unfollowUser(req, res){
    return res.status(200).json({message: "working"});
}
 
async function passwordChange(req, res){
    return res.status(200).json({message: "working"});
}
 
async function passwordChangeRequest(req, res){
    return res.status(200).json({message: "working"});
}
 
async function verifyEmail(req, res){
    return res.status(200).json({message: "working"});
}
 
async function verifyEmailRequest(req, res){
    return res.status(200).json({message: "working"});
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