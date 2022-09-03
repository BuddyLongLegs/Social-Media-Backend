const express = require('express');
const router = express.Router();

const {completedProfileWithLogin, completeAndMedia} = require('../controllers/middlewares');

const {
    getPost,
    createPost,
    editPost,
    deletePost,
    likePost,
    getNearbyPosts,
    getPostComments
} = require('../controllers/postController');

const {
    newComment,
    deleteComment
} = require('../controllers/commentController');

router.get('/nearby', getNearbyPosts);
router.post('/new', completeAndMedia, createPost);
router.get('/:code/comment', getPostComments);
router.post('/:code/like', completedProfileWithLogin, likePost);
router.delete('/:code/comment/:comment', completedProfileWithLogin, deleteComment);
router.post('/:code/comment', completedProfileWithLogin, newComment);
router.get('/:code', getPost);
router.patch('/:code', completedProfileWithLogin, editPost);
router.delete('/:code', completedProfileWithLogin, deletePost);

module.exports = router;