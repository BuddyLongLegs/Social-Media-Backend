const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    code:{
        type: String,
    },
    post:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Post"
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    text:{
        type:String,
        trim:true
    }
},{
    timestamps:true
});



const Comment = mongoose.model("Comment", commentSchema);
module.exports = Comment;