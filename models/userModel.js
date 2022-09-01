const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

// Username Criteria:
// The length must be between 3 and 30 characters.
// The accepted characters are like you said: a-z A-Z 0-9 dot(.) underline(_).
// It's not allowed to have two or more consecutive dots in a row.
// It's not allowed to start or end the username with a dot.

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        trim:true,
        text:true,
        unique:true,
        lowercase:true,
        match: [require('../config/constants').USERNAME_PATTERN, 'Username not according to syntax'],
        nullable: true,
        default: null
    },
    name:{
        type:String,
        required:[true, "name is required"],
        trim:true,
        text:true
    },
    email:{
        type:String,
        trim:true,
        lowercase: true,
        unique: true,
        required: [true,'Email address is required'],
        match: [require('../config/constants').EMAIL_PATTERN, 'Please fill a valid email address']
    },
    verified:{
        type:Boolean,
        default:false
    },
    hash:{
        type:String,
        nullable:true,
        default:null
    },
    salt:{
        type:String,
        nullable:true,
        default:null
    },
    postNum:{
        type:Number,
        default:0
    },
    post:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post"
    }],
    followerNum:{
        type: Number,
        default: 0
    },
    follower:[{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        followedAt:{
            type: Date,
            default: Date.now()
        }
    }],
    followingNum:{
        type:Number,
        default:0
    },
    following:[{
        user:{
            type: mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        followedAt:{
            type: Date,
            default: Date.now()
        }
    }],
    bio:{
        type:String,
        default:""
    },
    profile:{
        type:String,
        default:""
    },
    notify:{
        type:Boolean,
        default: false
    },
    verifyrequest:{
        code:{type: String},
        createdAt:{
            type:Date,
        }
    },
    passwordrequest:{
        code:{type: String},
        createdAt:{
            type:Date,
        }
    }
},
{
    timestamps: true
});

userSchema.plugin(mongoosePaginate);

const User = mongoose.model("User", userSchema);
module.exports=User;