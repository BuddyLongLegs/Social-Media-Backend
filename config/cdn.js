require('dotenv/config');
const multer = require('multer');
const multerS3 = require('multer-s3');
const { uuid } = require('uuidv4');
const { S3Client } = require('@aws-sdk/client-s3');

// Default Constants
const MAX_FILE_SIZE = 2*1024*1024;  //2MB
const POST_ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'video/mp4',
    'video/quicktime' //for .mov videos
];

const IMAGE_ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
]

const uploadMedia = multer({
    storage: multerS3({
        s3 : new S3Client({
            credentials: {
                accessKeyId : process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey : process.env.AWS_SECRET_ACCESS_KEY,
            }
        }),
        bucket : process.env.BUCKET_NAME,
        key: function(req, file, cb){
            let s = file.originalname.split('.');
            cb(null, uuid()+'.'+s[s.length -1]);
        }
    }),
    limits : {fileSize: MAX_FILE_SIZE},
    fileFilter:(req, file, cb)=>{
        let mimetype = file.mimetype;
        for(i=0; i<ALLOWED_MIME_TYPES.length; i++){
            if(mimetype === POST_ALLOWED_MIME_TYPES[i])return cb(null, true);
        }
        cb(null, false);
    }
});

const uploadImage = multer({
    storage: multerS3({
        s3 : new S3Client({
            credentials: {
                accessKeyId : process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey : process.env.AWS_SECRET_ACCESS_KEY,
            }
        }),
        bucket : process.env.BUCKET_NAME,
        key: function(req, file, cb){
            let s = file.originalname.split('.');
            cb(null, uuid()+'.'+s[s.length -1]);
        }
    }),
    limits : {fileSize: MAX_FILE_SIZE},
    fileFilter:(req, file, cb)=>{
        let mimetype = file.mimetype;
        for(i=0; i<ALLOWED_MIME_TYPES.length; i++){
            if(mimetype === IMAGE_ALLOWED_MIME_TYPES[i])return cb(null, true);
        }
        cb(null, false);
    }
});


module.exports.uploadMedia = uploadMedia;
module.exports.uploadImage = uploadImage;