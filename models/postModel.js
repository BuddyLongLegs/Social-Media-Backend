const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const PostSchema = new mongoose.Schema({
    code:{
        type:String,
        unique:true
    },
    createdBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    images:[{
        type:String
    }],
    caption:{
        type:String,
        default:"",
        trim:true
    },
    likeCount:{
        type:Number,
        default:0
    },
    likes:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User"
    }],
    commentCount:{
        type:Number,
        default:0
    },
    comments:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Comment"
    }],
    location:{
        type:{type:String},
        coordinates:[]
    }
},
{
    timestamps: true
});

PostSchema.index({location:"2dsphere"});
PostSchema.plugin(mongoosePaginate);

const Post = mongoose.model("Post", PostSchema);
module.exports = Post;