const User = require('../models/userModel');
const Post = require('../models/postModel');


async function getPost(req, res){
    return res.status(200).json({message: "working"});
}

async function createPost(req, res){
    return res.status(200).json({message: "working"});
}

async function editPost(req, res){
    return res.status(200).json({message: "working"});
}

async function deletePost(req, res){
    return res.status(200).json({message: "working"});
}

async function likePost(req, res){
    return res.status(200).json({message: "working"});
}

async function getUserFeedPosts(req, res){
    return res.status(200).json({message: "working"});
}

async function getNearbyPosts(req, res){
    return res.status(200).json({message: "working"});
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