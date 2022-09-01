const Post = require('../models/postModel');
const Comment = require('../models/commentModel');

async function newComment(req, res){
    return res.status(200).json({message: "working"});
}

async function deleteComment(req, res){
    return res.status(200).json({message: "working"});
}

module.exports = {
    newComment: newComment,
    deleteComment: deleteComment
}