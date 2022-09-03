const User = require('../models/userModel');
const Post = require('../models/postModel');


async function getPost(req, res){
    // return res.status(200).json({message: "working"});
    var code = req.params.code;
    let post = await Post.findOne({code: code}).select("code createdBy images caption likeCount commentCount location createdAt").populate("createdBy", "username name profile");
    if(!post){
        return res.status(404).json({error: "Post not found"});
    }
    return res.status(200).json(post);
}

async function createPost(req, res){
    var images = req.files,
    caption = req.body.caption,
    location = req.body.location;
    if(images===undefined){
        return res.status(400).json({error:"No images to add to post"});
    }
    var code=Math.random().toString(36).replace('0.', ''),
    exists = await Post.exists({code: code});
    while(exists){
        code=Math.random().toString(36).replace('0.', '');
        exists = await Post.exists({code: code});
    }
    var npost = new Post({
        code: code,
        createdBy: req.user._id,
        images: images.map((f)=>{f.location}),
        caption: caption,
        location: (location.length>1)?{type: "Point", coordinates: [location['longitude'], location['latitude']]}:null
    });
    try{
        await npost.save();
        return res.status(201).json({
            code: npost.code,
            images: npost.images,
            caption: npost.caption,
            location: npost.location,
            likeCount: npost.likeCount,
            commentCount: npost.commentCount
        });
    }catch(err){
        return res.status(500).json({error: err});
    }
}

async function editPost(req, res){
    return res.status(200).json({message: "working"});
}

async function deletePost(req, res){
    return res.status(200).json({message: "working"});
}

async function likePost(req, res){
    let user = req.user
    let code = req.params.code;
    let post = await Post.findOne({code: code});
    if(!post){
        return res.status(404).json({error: "Post not found"});
    }
    if(post.likes.includes(user._id)){
        return res.status(400).json({error: "Already Liked"});
    }
    post.likeCount++;
    post.likes.push(user._id);
    try{
        await post.save();
        post.populate("createdBy", "username name profile");
        return res.status(200).json({
            message: "Post liked",
            post: {
                code: post.code,
                createdBy: post.createdBy,
                images: post.images,
                caption: post.caption,
                likeCount: post.likeCount,
                commentCount: post.commentCount,
                location: post.location
            }
        })
    }catch(err){
        return res.status(500).json({error: err});
    }
}

async function getUserFeedPosts(req, res){
    var page = req.query.page ? Math.max(1, Number(req.query.page)) : 1;
    var perpage = Number(req.query.perpage) || 50;
    var user = req.user;
    if(user.following.length === 0){
        return res.status(404).json({error: "No users followed"});
    }
    let query = {
        createdBy:{$in:user.following}
    };
    let options = {
        sort:{"createdAt": -1},
        page: page,
        limit: perpage,
        populate: {
            path:{
                path: "createdBy",
                select: "username name profile"
            }
        },
        select:"code createdBy images caption likeCount commentCount location createdAt"
    }
    let posts = await Post.paginate(query, options)
    return res.status(200).json(posts);
}

async function getNearbyPosts(req, res){
    var long, lat;
    var page = req.query.page ? Math.max(1, Number(req.query.page)) : 1;
    var perpage = Number(req.query.perpage) || 50;
    try{
        long = Number.parseFloat(req.query.longitude);
        lat = Number.parseFloat(req.query.latitude);
    }catch(err){
        return res.status(400).json({error:"Incoreect Location"});
    }
    let query = {
        location:{
            $near:{
                $maxDistance: 1000,
                $geometry: {
                type: "Point",
                coordinates: [long, lat]
                }
            }
        }
    };
    let options = {
        page: page,
        limit: perpage,
        populate: {
            path:{
                path: "createdBy",
                select: "username name profile"
            }
        },
        select:"code createdBy images caption likeCount commentCount location createdAt"
    }
    let posts = await Post.paginate(query, options)
    return res.status(200).json(posts);
}

async function getPostComments(req, res){
    return res.status(200).json({message: "working"});
}

module.exports = {
    getPost: getPost,
    createPost: createPost,
    editPost: editPost,
    deletePost: deletePost,
    likePost: likePost,
    getUserFeedPosts: getUserFeedPosts,
    getNearbyPosts: getNearbyPosts,
    getPostComments: getPostComments
}